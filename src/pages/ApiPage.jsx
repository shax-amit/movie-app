import { useSelector, useDispatch } from 'react-redux';
import { toggleFavorite } from '../store/favoritesSlice';
import { useApi } from '../hooks/useApi';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';
import { motion, AnimatePresence } from 'framer-motion';

export default function ApiPage() {
    const dispatch = useDispatch();
    const favorites = useSelector((state) => state.favorites.items);

    // Use useApi hook for fetching movies
    const { data: moviesData, loading, error, refetch } = useApi(
        'https://ghibliapi.vercel.app/films?limit=12'
    );

    const handleToggleFavorite = (movieData) => {
        dispatch(toggleFavorite(movieData));
    };

    const isFavorite = (movieId) => {
        return favorites.some((fav) => fav.id === movieId);
    };

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

    if (loading) return (
        <div className="page-container">
            <div className="page-header">
                <h1>External Movie Database</h1>
            </div>
            <div className="movies-grid">
                {[...Array(6)].map((_, i) => <MovieSkeleton key={i} />)}
            </div>
        </div>
    );

    if (error) return (
        <div className="page-container">
            <div className="error-display">
                <h2>Oops! Something went wrong</h2>
                <p>{error}</p>
            </div>
            <button onClick={refetch} className="refetch-btn" style={{ margin: '2rem auto' }}>
                🔄 Try Again
            </button>
        </div>
    );

    const movies = moviesData || [];

    return (
        <div className="page-container">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <h1>External Movie Database</h1>
                <button onClick={refetch} className="refetch-btn" title="Refresh movies">
                    🔄 Refresh
                </button>
            </motion.div>
            <p className="api-note">Data fetched from Studio Ghibli public API</p>

            <motion.div
                className="movies-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <AnimatePresence>
                    {movies.map(movie => {
                        const favorite = isFavorite(movie.id);
                        const movieData = {
                            id: movie.id,
                            title: movie.title,
                            rating: Math.round(movie.rt_score / 10),
                            genre: movie.release_date,
                            description: movie.description,
                            source: 'api'
                        };

                        return (
                            <MovieCard
                                key={movie.id}
                                id={movie.id}
                                title={movie.title}
                                rating={Math.round(movie.rt_score / 10)}
                                genre={movie.release_date}
                                description={movie.description}
                                image={movie.image}
                                imdbLink={`https://www.imdb.com/find/?q=${encodeURIComponent(movie.title)}&s=tt`}
                                onFavoriteToggle={() => handleToggleFavorite(movieData)}
                                isFavorite={favorite}
                                variants={itemVariants}
                            />
                        );
                    })}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
