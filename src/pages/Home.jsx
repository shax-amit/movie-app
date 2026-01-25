import { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectFavorites, removeFavorite, toggleFavorite, addFavorite } from '../store/favoritesSlice';
import { useApi } from '../hooks/useApi';
import { useDebounce } from '../hooks/useDebounce';
import { useMovies } from '../hooks/useMovies';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const { movies, loading: moviesLoading, error: moviesError, deleteMovie, addMovie } = useMovies();
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

    // Movies from our MongoDB (Personal Collection)
    const filteredUserMovies = (movies || []).filter(movie => {
        const title = (movie.title || '').toLowerCase();
        const genre = (movie.genre || '').toLowerCase();
        return title.includes(searchQuery) || genre.includes(searchQuery);
    });

    // Trending from TMDB
    const filteredTrending = (trendingData?.results || []).slice(0, 4).filter(movie => {
        const title = (movie.title || '').toLowerCase();
        return title.includes(searchQuery);
    });

    // Weekly Picks from TMDB
    const filteredWeeklyPicks = (weeklyPicksData?.results || []).slice(0, 4).filter(movie => {
        const title = (movie.title || '').toLowerCase();
        return title.includes(searchQuery);
    });

    const handleToggleFavorite = async (movie, source) => {
        // If it's a TMDB movie, we first save it to our MongoDB
        if (source === 'tmdb') {
            try {
                // Check if already in our collection (by externalId)
                const alreadySaved = movies.find(m => m.externalId === movie.id.toString());

                if (alreadySaved) {
                    // Just toggle favorited state in Redux
                    dispatch(toggleFavorite(alreadySaved));
                } else {
                    // Map TMDB fields to our schema
                    const movieToSave = {
                        title: movie.title,
                        rating: Math.round(movie.vote_average),
                        genre: 'International', // TMDB doesn't give names directly without more calls
                        description: movie.overview,
                        posterPath: `${TMDB_IMAGE_BASE}${movie.poster_path}`,
                        externalId: movie.id.toString(),
                        source: 'tmdb'
                    };

                    const savedMovie = await addMovie(movieToSave);
                    dispatch(addFavorite(savedMovie));
                    alert(`"${movie.title}" added to your collection!`);
                }
            } catch (err) {
                console.error('Failed to save TMDB movie to DB', err);
                alert('Failed to save movie. Check if it already exists.');
            }
        } else {
            // Regular user/seed movie - just toggle Redux
            dispatch(toggleFavorite(movie));
        }
    };

    const isFavoriteMovie = (movieId, movieTitle) => {
        return favorites.some((fav) => fav.id === movieId || fav.title === movieTitle);
    };

    const hasAnyResults = filteredUserMovies.length > 0 ||
        filteredTrending.length > 0 ||
        filteredWeeklyPicks.length > 0;

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
                                        genre={movie.release_date?.split('-')[0] || 'Movie'}
                                        description={movie.overview?.substring(0, 100) + '...'}
                                        image={movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null}
                                        onFavoriteToggle={() => handleToggleFavorite(movie, 'tmdb')}
                                        isFavorite={isFavoriteMovie(null, movie.title)}
                                        variants={itemVariants}
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </section>
            )}

            {filteredUserMovies.length > 0 && (
                <section className="section" id="my-list">
                    <div className="section-header">
                        <h2>My Collection</h2>
                    </div>

                    <motion.div
                        className="movies-grid"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <AnimatePresence>
                            {filteredUserMovies.map(movie => (
                                <MovieCard
                                    key={movie.id}
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
                                    isFavorite={isFavoriteMovie(movie.id)}
                                    trailerId={movie.trailerId}
                                    variants={itemVariants}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
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
                                        genre={movie.release_date?.split('-')[0] || 'Top Rated'}
                                        description={movie.overview?.substring(0, 100) + '...'}
                                        image={movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null}
                                        onFavoriteToggle={() => handleToggleFavorite(movie, 'tmdb')}
                                        isFavorite={isFavoriteMovie(null, movie.title)}
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
