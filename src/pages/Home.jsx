import { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectFavorites, removeFavorite, toggleFavorite } from '../store/favoritesSlice';
import { useApi } from '../hooks/useApi';
import { useDebounce } from '../hooks/useDebounce';
import { useMovies } from '../hooks/useMovies';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
    const { movies, loading: moviesLoading, error: moviesError, deleteMovie } = useMovies();
    const [filter, setFilter] = useState('');
    const debouncedFilter = useDebounce(filter, 500);
    const favorites = useSelector(selectFavorites);
    const dispatch = useDispatch();

    // Use useApi hook to fetch trending movie recommendations
    const { data: trendingData, loading: trendingLoading } = useApi(
        'https://ghibliapi.vercel.app/films?limit=3'
    );



    // Strictly follow user's request for case-insensitive comparison
    const searchQuery = (debouncedFilter || '').toLowerCase();

    // Log to help debugging in the browser console
    if (searchQuery) {
        console.log('Debounced search for:', searchQuery);
    }

    const filteredUserMovies = (movies || []).filter(m => m.source === 'user').filter(movie => {
        const title = (movie.title || '').toLowerCase();
        const genre = (movie.genre || '').toLowerCase();
        return title.includes(searchQuery) || genre.includes(searchQuery);
    });

    const filteredSeedMovies = (movies || []).filter(m => m.source === 'seed').filter(movie => {
        const title = (movie.title || '').toLowerCase();
        const genre = (movie.genre || '').toLowerCase();
        return title.includes(searchQuery) || genre.includes(searchQuery);
    });

    const filteredTrendingData = (trendingData || []).filter(movie => {
        const title = (movie.title || '').toLowerCase();
        const date = (movie.release_date || '').toLowerCase();
        return title.includes(searchQuery) || date.includes(searchQuery);
    });

    const handleToggleFavorite = (movie) => {
        dispatch(toggleFavorite(movie));
    };

    const isFavoriteMovie = (movieId) => {
        return favorites.some((fav) => fav.id === movieId);
    };

    const hasAnyResults = filteredUserMovies.length > 0 ||
        filteredSeedMovies.length > 0 ||
        filteredTrendingData.length > 0;

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

            {(filteredTrendingData.length > 0 || trendingLoading) && (
                <section className="section">
                    <div className="section-header">
                        <h2>🔥 Trending Now</h2>
                    </div>
                    {trendingLoading ? (
                        <div className="movies-grid">
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
                                {filteredTrendingData.map(movie => {
                                    const movieData = {
                                        id: movie.id,
                                        title: movie.title,
                                        rating: Math.round(movie.rt_score / 10),
                                        genre: movie.release_date,
                                        description: movie.description?.substring(0, 100) + '...',
                                        source: 'api'
                                    };
                                    return (
                                        <MovieCard
                                            key={`trend-${movie.id}`}
                                            id={movie.id}
                                            title={movie.title}
                                            rating={Math.round(movie.rt_score / 10)}
                                            genre={movie.release_date}
                                            description={movie.description?.substring(0, 100) + '...'}
                                            onFavoriteToggle={() => handleToggleFavorite(movieData)}
                                            isFavorite={isFavoriteMovie(movie.id)}
                                            variants={itemVariants}
                                        />
                                    );
                                })}
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
                                    key={`user-${movie.id}`}
                                    id={movie.id}
                                    title={movie.title}
                                    rating={movie.rating}
                                    genre={movie.genre}
                                    description={movie.description}
                                    onDelete={async () => {
                                        if (window.confirm(`Are you sure you want to delete "${movie.title}"?`)) {
                                            try {
                                                await deleteMovie(movie.id);
                                            } catch (err) {
                                                alert(`Failed to delete movie: ${err.message}`);
                                            }
                                        }
                                    }}
                                    onFavoriteToggle={() => handleToggleFavorite(movie)}
                                    isFavorite={isFavoriteMovie(movie.id)}
                                    trailerId={movie.trailerId}
                                    variants={itemVariants}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </section>
            )}

            {filteredSeedMovies.length > 0 && (
                <section className="section">
                    <div className="section-header">
                        <h2>Weekly Picks</h2>
                    </div>

                    <motion.div
                        className="movies-grid"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredSeedMovies.map(movie => (
                                <MovieCard
                                    key={`seed-${movie.id}`}
                                    id={movie.id}
                                    title={movie.title}
                                    rating={movie.rating}
                                    genre={movie.genre}
                                    description={movie.description}
                                    onFavoriteToggle={() => handleToggleFavorite(movie)}
                                    isFavorite={isFavoriteMovie(movie.id)}
                                    trailerId={movie.trailerId}
                                    variants={itemVariants}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </section>
            )}
        </div>
    );
}
