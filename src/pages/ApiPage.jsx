import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addFavorite, loadFavorites, removeFavorite } from '../store/favoritesSlice';
import { useEffect, useMemo, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useDebounce } from '../hooks/useDebounce';
import { useMovies } from '../hooks/useMovies';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { getGenreNames } from '../utils/tmdbGenres';
import { updateFavorite } from '../store/favoritesSlice';
import { API_BASE_URL, TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE } from '../config';
import { useToast } from '../context/ToastContext';

export default function ApiPage() {
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const favorites = useSelector((state) => state.favorites.items);
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { movies, addMovie, deleteMovie, updateMovie } = useMovies();

    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const [activeQuery, setActiveQuery] = useState('');

    // Synchronize activeQuery with debounced search query
    useEffect(() => {
        setActiveQuery(debouncedSearchQuery);
    }, [debouncedSearchQuery]);


    // Construct the API URL based on whether there's an active search query
    const apiUrl = useMemo(() => {
        if (activeQuery) {
            return `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(activeQuery)}`;
        }
        return `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=1`;
    }, [activeQuery]);

    // Use useApi hook for fetching movies from TMDB
    const { data: moviesData, loading, error, refetch } = useApi(apiUrl, {}, [apiUrl]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // activeQuery is handled by debouncedSearchQuery effect
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setActiveQuery('');
    };

    // Bootstrap: Load favorites from collection on load
    useEffect(() => {
        if (isAuthenticated && movies.length > 0 && favorites.length === 0) {
            dispatch(loadFavorites(movies));
        }
    }, [movies, favorites.length, dispatch, isAuthenticated]);

    const handleToggleFavorite = async (movie) => {
        if (!isAuthenticated) {
            showToast('Please login to add movies!', 'error');
            navigate('/login');
            return;
        }
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
                    showToast('Removed from My List');
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
                    showToast(`"${movie.title}" added to My List`);
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
        if (!isAuthenticated) return false;
        return favorites.some((fav) =>
            (movie.id && fav.externalId === movie.id.toString()) ||
            (movie.id && fav.id === movie.id) ||
            (movie.title && fav.title === movie.title)
        );
    };


    // Bootstrap: Sync MongoDB collection to Redux favorites once loaded
    useEffect(() => {
        if (isAuthenticated && movies.length > 0 && favorites.length === 0) {
            const onlyFavorites = movies.filter(m => m.isFavorite);
            dispatch(loadFavorites(onlyFavorites));
        }
    }, [movies, favorites.length, dispatch, isAuthenticated]);

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
                <h1>{activeQuery ? `Results for "${activeQuery}"` : 'Explore Trending'}</h1>
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
                <div>
                    <h1>{activeQuery ? `Search Results: ${activeQuery}` : 'Explore Trending & Popular'}</h1>
                    <p className="api-note">Real-time data from The Movie Database (TMDB)</p>
                </div>

                <form className="api-search-form" onSubmit={handleSearchSubmit}>
                    <div className="search-input-wrapper">
                        <input
                            type="text"
                            placeholder="Search TMDB for movies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="api-search-input"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="clear-search-btn"
                                onClick={handleClearSearch}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    <button type="submit" className="api-search-btn">
                        🔍 Search
                    </button>
                </form>
            </motion.div>

            <motion.div
                className="movies-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <AnimatePresence>
                    {moviesList.length > 0 ? (
                        moviesList.map(movie => {
                            return (
                                <MovieCard
                                    key={movie.id}
                                    id={movie.id}
                                    title={movie.title}
                                    rating={Math.round(movie.vote_average)}
                                    genre={getGenreNames(movie.genre_ids)}
                                    description={movie.overview}
                                    image={movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null}
                                    imdbLink={`https://www.themoviedb.org/movie/${movie.id}`}
                                    onFavoriteToggle={() => handleToggleFavorite(movie)}
                                    onUpdateOpinion={(opinion) => handleUpdateOpinion(movie, opinion)}
                                    isFavorite={isFavorite(movie)}
                                    personalOpinion={movies.find(m =>
                                        (m.externalId && movie.id && m.externalId === movie.id.toString()) ||
                                        (m.title === movie.title)
                                    )?.personalOpinion}
                                    tmdbId={movie.id}
                                    year={movie.release_date?.split('-')[0]}
                                    variants={itemVariants}
                                    source="tmdb"
                                />
                            );
                        })
                    ) : (
                        <div className="empty-state" style={{ padding: '4rem 2rem', textAlign: 'center', gridColumn: '1/ -1', color: 'var(--muted)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                            <h3>No Results Found</h3>
                            <p>We couldn't find any movies matching "{activeQuery || searchQuery}"</p>
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
