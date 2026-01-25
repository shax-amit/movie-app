import { useSelector, useDispatch } from 'react-redux';
import { toggleFavorite, addFavorite, loadFavorites, removeFavorite } from '../store/favoritesSlice';
import { useEffect, useMemo } from 'react';
import { useApi } from '../hooks/useApi';
import { useMovies } from '../hooks/useMovies';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { updateFavorite } from '../store/favoritesSlice';

export default function ApiPage() {
    const dispatch = useDispatch();
    const favorites = useSelector((state) => state.favorites.items);
    const { movies, addMovie, deleteMovie, updateMovie } = useMovies();

    const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

    // Use useApi hook for fetching movies from TMDB
    const { data: moviesData, loading, error, refetch } = useApi(
        `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=1`
    );

    // Bootstrap: Load favorites from collection on load
    useEffect(() => {
        if (movies.length > 0 && favorites.length === 0) {
            dispatch(loadFavorites(movies));
        }
    }, [movies, favorites.length, dispatch]);

    const handleToggleFavorite = async (movie) => {
        const favorited = isFavorite(movie);

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
                        await deleteMovie(dbMovie.id);
                    } else {
                        await updateMovie(dbMovie.id, { isFavorite: false });
                    }
                    dispatch(removeFavorite(dbMovie.id));
                } else {
                    dispatch(removeFavorite({ title: movie.title }));
                }
            } else {
                // FAVORITE
                if (dbMovie) {
                    await updateMovie(dbMovie.id, { isFavorite: true });
                    dispatch(addFavorite({ ...dbMovie, isFavorite: true }));
                } else {
                    // TMDB: add to DB
                    const movieToSave = {
                        title: movie.title,
                        rating: Math.round(movie.vote_average),
                        genre: 'International',
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

    const isFavorite = (movie) => {
        return favorites.some((fav) =>
            (movie.id && fav.id === movie.id) ||
            (movie.title && fav.title === movie.title)
        );
    };

    const isAddedInCollection = (movie) => {
        return movies.some((m) =>
            (m.externalId && movie.id && m.externalId === movie.id.toString()) ||
            (m.title === movie.title)
        );
    };

    // Bootstrap: Sync MongoDB collection to Redux favorites once loaded
    useEffect(() => {
        if (movies.length > 0 && favorites.length === 0) {
            const onlyFavorites = movies.filter(m => m.isFavorite);
            dispatch(loadFavorites(onlyFavorites));
        }
    }, [movies, favorites.length, dispatch]);

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
                                onUpdateOpinion={(opinion) => handleUpdateOpinion(movie, opinion)}
                                isFavorite={isFavorite(movie)}
                                personalOpinion={movies.find(m =>
                                    (m.externalId && movie.id && m.externalId === movie.id.toString()) ||
                                    (m.title === movie.title)
                                )?.personalOpinion}
                                variants={itemVariants}
                                source="tmdb"
                            />
                        );
                    })}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
