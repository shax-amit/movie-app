import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectFavorites, removeFavorite, addFavorite, loadFavorites } from '../store/favoritesSlice';
import { useApi } from '../hooks/useApi';
import { useMovies } from '../hooks/useMovies';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { updateFavorite } from '../store/favoritesSlice';
import { getGenreNames } from '../utils/tmdbGenres';
import { API_BASE_URL, TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE } from '../config';

export default function Home() {
    const { movies, loading: moviesLoading, error: moviesError, deleteMovie, addMovie, updateMovie } = useMovies();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const favorites = useSelector(selectFavorites);
    const dispatch = useDispatch();
    const navigate = useNavigate();


    // Use useApi hook to fetch trending movie recommendations from TMDB (Daily trends)
    const { data: trendingData, loading: trendingLoading } = useApi(
        `${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`
    );

    // Use useApi hook to fetch weekly picks (Now Playing) from TMDB
    const { data: weeklyPicksData, loading: weeklyPicksLoading } = useApi(
        `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}`
    );

    // Trending from TMDB (Top 6)
    const filteredTrending = (trendingData?.results || []).slice(0, 6);

    // User Added Movies (Explicitly from form)
    const filteredAddedMovies = (movies || []).filter(movie => movie.source === 'user');

    // Weekly Picks from TMDB (Top 6 unique from Trending)
    const trendingIds = new Set(filteredTrending.map(m => m.id));
    const filteredWeeklyPicks = (weeklyPicksData?.results || [])
        .filter(movie => !trendingIds.has(movie.id))
        .slice(0, 6);

    const handleToggleFavorite = async (movie, source) => {
        if (!isAuthenticated) {
            alert('Please login to add movies to your list!');
            navigate('/login');
            return;
        }
        const favorited = isFavoriteMovie(movie);

        try {
            const dbMovie = movies.find(m =>
                (m.externalId && movie.id && m.externalId.toString() === movie.id.toString()) ||
                (m.id && movie.id && m.id.toString() === movie.id.toString()) ||
                (m.title === movie.title)
            );

            if (favorited) {
                // UN-FAVORITE
                if (dbMovie) {
                    if (dbMovie.source === 'tmdb') {
                        // TMDB: delete entirely if not on My List
                        await deleteMovie(dbMovie.id);
                    } else {
                        // USER ADDED: just toggle the flag
                        await updateMovie(dbMovie.id, { isFavorite: false });
                    }
                    dispatch(removeFavorite(dbMovie.id));
                } else {
                    dispatch(removeFavorite({ title: movie.title }));
                }
            } else {
                // FAVORITE
                if (dbMovie) {
                    // Movie is already in DB (e.g. user movie)
                    await updateMovie(dbMovie.id, { isFavorite: true });
                    dispatch(addFavorite({ ...dbMovie, isFavorite: true }));
                } else if (source === 'tmdb') {
                    // TMDB: add to DB
                    const movieToSave = {
                        title: movie.title,
                        rating: Math.round(movie.vote_average),
                        genre: getGenreNames(movie.genre_ids),
                        description: movie.overview,
                        posterPath: `${TMDB_IMAGE_BASE}${movie.poster_path}`,
                        externalId: movie.id.toString(),
                        source: 'tmdb',
                        isFavorite: true,
                        year: movie.release_date?.split('-')[0]
                    };
                    const savedMovie = await addMovie(movieToSave);
                    dispatch(addFavorite(savedMovie));
                }
            }
        } catch (err) {
            console.error('Failed to toggle favorite', err);
        }
    };

    const handleUpdateOpinion = async (movie, opinion) => {
        try {
            // Find the movie in our local MongoDB collection state
            const dbMovie = movies.find(m =>
                (m.externalId && movie.id && m.externalId.toString() === movie.id.toString()) ||
                (m.id && movie.id && m.id.toString() === movie.id.toString()) ||
                (m.title && movie.title && m.title.toLowerCase() === movie.title.toLowerCase())
            );

            if (dbMovie) {
                await updateMovie(dbMovie.id, { personalOpinion: opinion });
                dispatch(updateFavorite({ id: dbMovie.id, updates: { personalOpinion: opinion } }));
            } else {
                console.warn('Could not find movie in collection to update opinion', movie.title);
            }
        } catch (err) {
            console.error('Failed to update opinion', err);
        }
    };

    // Bootstrap: Sync MongoDB collection to Redux favorites once loaded
    useEffect(() => {
        if (isAuthenticated && movies.length > 0 && favorites.length === 0) {
            const onlyFavorites = movies.filter(m => m.isFavorite);
            dispatch(loadFavorites(onlyFavorites));
        }
    }, [movies, favorites.length, dispatch, isAuthenticated]);

    const isFavoriteMovie = (movie) => {
        if (!isAuthenticated) return false;
        return favorites.some((fav) =>
            (movie.id && fav.externalId === movie.id.toString()) ||
            (movie.id && fav.id === movie.id) ||
            (movie.title && fav.title === movie.title)
        );
    };

    const hasAnyResults = filteredTrending.length > 0 ||
        filteredWeeklyPicks.length > 0 ||
        filteredAddedMovies.length > 0;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    // Show loading state
    if (moviesLoading && !movies.length) {
        return (
            <div className="page-container">
                <div className="movies-grid">
                    <MovieSkeleton />
                    <MovieSkeleton />
                    <MovieSkeleton />
                </div>
            </div>
        );
    }

    if (moviesError && !movies.length) {
        return (
            <div className="page-container">
                <div className="error-state" style={{
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: '#fee',
                    color: '#c33',
                    borderRadius: '8px',
                    margin: '2rem 0'
                }}>
                    <h2>⚠️ Error Loading Movies</h2>
                    <p>{moviesError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="api-search-btn"
                        style={{ marginTop: '1rem' }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Hero Section */}
            <section className="hero-section">
                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="hero-title">Discover Your Next Favorite</h1>
                    <p className="hero-subtitle">Curate your personal collection of cinema masterpieces.</p>
                </motion.div>
            </section>

            {filteredAddedMovies.length > 0 && (
                <section className="section">
                    <div className="section-header">
                        <h2>✍️ Movies You Added</h2>
                    </div>
                    <motion.div
                        className="movies-grid"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <AnimatePresence>
                            {filteredAddedMovies.map(movie => (
                                <MovieCard
                                    key={`added-${movie.id}`}
                                    id={movie.id}
                                    title={movie.title}
                                    rating={movie.rating}
                                    genre={movie.genre}
                                    description={movie.description}
                                    image={movie.posterPath}
                                    onDelete={async () => {
                                        if (window.confirm(`Are you sure you want to delete "${movie.title}"?`)) {
                                            try {
                                                await deleteMovie(movie.id);
                                            } catch (err) {
                                                alert(`Failed to delete movie: ${err.message}`);
                                            }
                                        }
                                    }}
                                    onEdit={() => navigate('/form', { state: { movie } })}
                                    onFavoriteToggle={() => handleToggleFavorite(movie, 'user')}
                                    onUpdateOpinion={(opinion) => handleUpdateOpinion(movie, opinion)}
                                    isFavorite={isFavoriteMovie(movie)}
                                    personalOpinion={movie.personalOpinion}
                                    trailerId={movie.trailerId}
                                    year={movie.year}
                                    variants={itemVariants}
                                    source={movie.source}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </section>
            )}

            {(filteredTrending.length > 0 || trendingLoading) && (
                <section className="section">
                    <div className="section-header">
                        <h2>🔥 Trending Now</h2>
                    </div>
                    {trendingLoading ? (
                        <div className="movies-grid">
                            {[...Array(6)].map((_, i) => <MovieSkeleton key={i} />)}
                        </div>
                    ) : (
                        <motion.div
                            className="movies-grid"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <AnimatePresence>
                                {filteredTrending.map(movie => (
                                    <MovieCard
                                        key={`trend-${movie.id}`}
                                        id={movie.id}
                                        title={movie.title}
                                        rating={Math.round(movie.vote_average)}
                                        genre={getGenreNames(movie.genre_ids)}
                                        description={movie.overview}
                                        image={movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null}
                                        onFavoriteToggle={() => handleToggleFavorite(movie, 'tmdb')}
                                        onUpdateOpinion={(opinion) => handleUpdateOpinion(movie, opinion)}
                                        isFavorite={isFavoriteMovie(movie)}
                                        tmdbId={movie.id}
                                        year={movie.release_date?.split('-')[0]}
                                        personalOpinion={movies.find(m =>
                                            (m.externalId && movie.id && m.externalId === movie.id.toString()) ||
                                            (m.title === movie.title)
                                        )?.personalOpinion}
                                        variants={itemVariants}
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </section>
            )}





            {(filteredWeeklyPicks.length > 0 || weeklyPicksLoading) && (
                <section className="section">
                    <div className="section-header">
                        <h2>🌟 Weekly Picks</h2>
                    </div>
                    {weeklyPicksLoading ? (
                        <div className="movies-grid">
                            {[...Array(6)].map((_, i) => <MovieSkeleton key={i} />)}
                        </div>
                    ) : (
                        <motion.div
                            className="movies-grid"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredWeeklyPicks.map(movie => (
                                    <MovieCard
                                        key={`weekly-${movie.id}`}
                                        id={movie.id}
                                        title={movie.title}
                                        rating={Math.round(movie.vote_average)}
                                        genre={getGenreNames(movie.genre_ids)}
                                        description={movie.overview}
                                        image={movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null}
                                        onFavoriteToggle={() => handleToggleFavorite(movie, 'tmdb')}
                                        onUpdateOpinion={(opinion) => handleUpdateOpinion(movie, opinion)}
                                        isFavorite={isFavoriteMovie(movie)}
                                        tmdbId={movie.id}
                                        year={movie.release_date?.split('-')[0]}
                                        personalOpinion={movies.find(m =>
                                            (m.externalId && movie.id && m.externalId === movie.id.toString()) ||
                                            (m.title === movie.title)
                                        )?.personalOpinion}
                                        variants={itemVariants}
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </section>
            )}

            {!hasAnyResults && !moviesLoading && !trendingLoading && !weeklyPicksLoading && (
                <div className="empty-state-container" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎬</div>
                    <h2>Your Movie Universe is Waiting</h2>
                    <p style={{ color: 'var(--muted)', maxWidth: '500px', margin: '0 auto 2rem' }}>
                        Start by adding your own movies or exploring trending titles from TMDB.
                    </p>
                    <button onClick={() => navigate('/api')} className="submit-btn" style={{ padding: '0.8rem 2rem' }}>
                        Explore Movies
                    </button>
                </div>
            )}
        </div>
    );
}
