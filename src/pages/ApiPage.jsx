import { useSelector, useDispatch } from 'react-redux';
import { toggleFavorite, addFavorite } from '../store/favoritesSlice';
import { useApi } from '../hooks/useApi';
import { useMovies } from '../hooks/useMovies';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';
import { motion, AnimatePresence } from 'framer-motion';

export default function ApiPage() {
    const dispatch = useDispatch();
    const favorites = useSelector((state) => state.favorites.items);
    const { movies, addMovie } = useMovies();

    const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

    // Use useApi hook for fetching movies from TMDB
    const { data: moviesData, loading, error, refetch } = useApi(
        `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=1`
    );

    const handleToggleFavorite = async (movie) => {
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
                    genre: 'International',
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
            alert('Failed to save movie.');
        }
    };

    const isFavorite = (movieTitle) => {
        return favorites.some((fav) => fav.title === movieTitle);
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
                <h1>Explore Trending</h1>
            </div>
            <div className="movies-grid">
                {[...Array(8)].map((_, i) => <MovieSkeleton key={i} />)}
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

    const moviesList = moviesData?.results || [];

    return (
        <div className="page-container">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <h1>Explore Trending & Popular</h1>
                <button onClick={refetch} className="refetch-btn" title="Refresh movies">
                    🔄 Refresh
                </button>
            </motion.div>
            <p className="api-note">Real-time data from The Movie Database (TMDB)</p>

            <motion.div
                className="movies-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <AnimatePresence>
                    {moviesList.map(movie => {
                        return (
                            <MovieCard
                                key={movie.id}
                                id={movie.id}
                                title={movie.title}
                                rating={Math.round(movie.vote_average)}
                                genre={movie.release_date?.split('-')[0] || 'Movie'}
                                description={movie.overview?.substring(0, 150) + '...'}
                                image={movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null}
                                imdbLink={`https://www.themoviedb.org/movie/${movie.id}`}
                                onFavoriteToggle={() => handleToggleFavorite(movie)}
                                isFavorite={isFavorite(movie.title)}
                                variants={itemVariants}
                            />
                        );
                    })}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
