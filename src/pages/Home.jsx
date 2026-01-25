import { useMemo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectFavorites, removeFavorite, toggleFavorite, addFavorite, loadFavorites } from '../store/favoritesSlice';
import { useApi } from '../hooks/useApi';
import { useDebounce } from '../hooks/useDebounce';
import { useMovies } from '../hooks/useMovies';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { updateFavorite } from '../store/favoritesSlice';
import { getGenreNames } from '../utils/tmdbGenres';

export default function Home() {
    const { movies, loading: moviesLoading, error: moviesError, deleteMovie, addMovie, updateMovie } = useMovies();
    const [filter, setFilter] = useState('');
    const debouncedFilter = useDebounce(filter, 500);
    const favorites = useSelector(selectFavorites);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

    // Use useApi hook to fetch trending movie recommendations from TMDB
    const { data: trendingData, loading: trendingLoading } = useApi(
        `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`
    );

    // Use useApi hook to fetch weekly picks (Top Rated) from TMDB
    const { data: weeklyPicksData, loading: weeklyPicksLoading } = useApi(
        `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}`
    );

    const searchQuery = (debouncedFilter || '').toLowerCase();


    // Trending from TMDB
    const filteredTrending = (trendingData?.results || []).slice(0, 4).filter(movie => {
        const title = (movie.title || '').toLowerCase();
        return title.includes(searchQuery);
    });

    // User Added Movies (Explicitly from form)
    const filteredAddedMovies = (movies || []).filter(movie => {
        if (movie.source !== 'user') return false;
        const title = (movie.title || '').toLowerCase();
        const genre = (movie.genre || '').toLowerCase();
        return title.includes(searchQuery) || genre.includes(searchQuery);
    });

    // Weekly Picks from TMDB
    const filteredWeeklyPicks = (weeklyPicksData?.results || []).slice(0, 4).filter(movie => {
        const title = (movie.title || '').toLowerCase();
        return title.includes(searchQuery);
    });

    const handleToggleFavorite = async (movie, source) => {
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
                        isFavorite: true
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
        if (movies.length > 0 && favorites.length === 0) {
            const onlyFavorites = movies.filter(m => m.isFavorite);
            dispatch(loadFavorites(onlyFavorites));
        }
    }, [movies, favorites.length, dispatch]);

    const isFavoriteMovie = (movie) => {
        return favorites.some((fav) =>
            (movie.id && fav.id === movie.id) ||
            (movie.title && fav.title === movie.title)
        );
    };

    const hasAnyResults = filteredTrending.length > 0 ||
        filteredWeeklyPicks.length > 0 ||
        filteredAddedMovies.length > 0;

    // Animation Variants
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

    // Show error state
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
                    <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                        Make sure the server is running on http://localhost:3001
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '1rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Hero Section with Search */}
            <section className="hero-section">
                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="hero-title">Discover Your Next Favorite</h1>
                    <p className="hero-subtitle">Curate your personal collection of cinema masterpieces.</p>

                    <div className="search-wrapper">
                        <div className="search-container">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Search by title or genre..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="hero-search-input"
                                autoFocus
                            />
                        </div>
                    </div>
                </motion.div>
            </section>

            {filter && !hasAnyResults && (
                <motion.div
                    className="empty-state"
                    style={{ marginTop: '2rem' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <h3>No results found for "{filter}"</h3>
                    <p>Try searching for a different title or genre.</p>
                </motion.div>
            )}

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
                            <MovieSkeleton />
                            <MovieSkeleton />
                            <MovieSkeleton />
                            <MovieSkeleton />
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
                                        description={movie.overview?.substring(0, 100) + '...'}
                                        image={movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null}
                                        onFavoriteToggle={() => handleToggleFavorite(movie, 'tmdb')}
                                        onUpdateOpinion={(opinion) => handleUpdateOpinion(movie, opinion)}
                                        isFavorite={isFavoriteMovie(movie)}
                                        tmdbId={movie.id}
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
                            <MovieSkeleton />
                            <MovieSkeleton />
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
                                        description={movie.overview?.substring(0, 100) + '...'}
                                        image={movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null}
                                        onFavoriteToggle={() => handleToggleFavorite(movie, 'tmdb')}
                                        onUpdateOpinion={(opinion) => handleUpdateOpinion(movie, opinion)}
                                        isFavorite={isFavoriteMovie(movie)}
                                        tmdbId={movie.id}
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
        </div>
    );
}
