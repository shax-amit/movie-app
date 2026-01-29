import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFavorite, loadFavorites } from '../store/favoritesSlice';
import { useMovies } from '../hooks/useMovies';
import MovieCard from '../components/MovieCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { updateFavorite } from '../store/favoritesSlice';

export default function MyListPage() {
    const { movies, loading, deleteMovie, updateMovie } = useMovies();
    const favorites = useSelector((state) => state.favorites.items);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const handleUpdateOpinion = async (movie, opinion) => {
        try {
            await updateMovie(movie.id, { personalOpinion: opinion });
            dispatch(updateFavorite({ id: movie.id, updates: { personalOpinion: opinion } }));
        } catch (err) {
            console.error('Failed to update opinion', err);
        }
    };

    // Bootstrap: Sync MongoDB collection to Redux favorites once loaded
    useEffect(() => {
        if (!loading && movies) {
            const dbFavorites = movies.filter(m => m.isFavorite);
            dispatch(loadFavorites(dbFavorites));
        }
    }, [movies, loading, dispatch]);

    // Data Enrichment: Fetch missing years for TMDB movies
    useEffect(() => {
        const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
        if (!TMDB_API_KEY) return;

        const enrichMovies = async () => {
            // Only target movies that don't have a year AND have an externalId
            const moviesToEnrich = favorites.filter(m =>
                m.source === 'tmdb' &&
                !m.year &&
                m.externalId &&
                !m.enrichmentStarted // Custom flag to avoid double requests in one session
            );

            if (moviesToEnrich.length === 0) return;

            // Mark them as processing in local state
            moviesToEnrich.forEach(m => m.enrichmentStarted = true);

            for (const movie of moviesToEnrich) {
                try {
                    console.log(`Enriching data for: ${movie.title}...`);
                    const response = await fetch(
                        `https://api.themoviedb.org/3/movie/${movie.externalId}?api_key=${TMDB_API_KEY}`
                    );
                    const data = await response.json();
                    if (data.release_date) {
                        const year = data.release_date.split('-')[0];
                        // Update DB
                        await updateMovie(movie.id, { year });
                        // Update local Redux state
                        dispatch(updateFavorite({ id: movie.id, updates: { year } }));
                    }
                } catch (err) {
                    console.error(`Failed to enrich movie ${movie.title}:`, err);
                }
            }
        };

        if (favorites.length > 0) {
            enrichMovies();
        }
    }, [favorites, updateMovie, dispatch]);

    const filteredFavorites = favorites.filter(movie => {
        const query = search.toLowerCase();
        return (movie.title || '').toLowerCase().includes(query) ||
            (movie.genre || movie.release_date || '').toLowerCase().includes(query);
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
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

    return (
        <div className="page-container">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1> ❤️ My List</h1>
                <p>Your personal collection of saved movies.</p>
            </motion.div>

            <div className="search-wrapper" style={{ margin: '2rem 0' }}>
                <div className="search-container">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search your list..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="hero-search-input"
                    />
                </div>
            </div>

            {favorites.length === 0 ? (
                <motion.div
                    className="empty-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <h3>Your list is empty</h3>
                    <p>Start adding movies you love by clicking the heart icon!</p>
                </motion.div>
            ) : filteredFavorites.length === 0 ? (
                <div className="empty-state">
                    <h3>No results found for "{search}"</h3>
                </div>
            ) : (
                <motion.div
                    className="movies-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <AnimatePresence>
                        {filteredFavorites.map(movie => (
                            <MovieCard
                                key={movie.id}
                                id={movie.id}
                                title={movie.title}
                                rating={movie.rating}
                                genre={movie.genre || movie.release_date || 'Favorite'}
                                description={movie.description}
                                image={movie.posterPath}
                                onFavoriteToggle={async () => {
                                    if (window.confirm(`Remove "${movie.title}" from your list?`)) {
                                        try {
                                            if (movie.source === 'tmdb') {
                                                await deleteMovie(movie.id);
                                            } else {
                                                await updateMovie(movie.id, { isFavorite: false });
                                            }
                                            dispatch(removeFavorite(movie.id));
                                        } catch (err) {
                                            console.error('Failed to remove from list', err);
                                        }
                                    }
                                }}
                                isFavorite={true}
                                onEdit={movie.source === 'user' ? () => navigate('/form', { state: { movie } }) : null}
                                onUpdateOpinion={(opinion) => handleUpdateOpinion(movie, opinion)}
                                personalOpinion={movie.personalOpinion}
                                trailerId={movie.trailerId}
                                tmdbId={movie.externalId}
                                year={movie.year || movie.release_date?.split('-')[0]}
                                variants={itemVariants}
                                source={movie.source}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
}
