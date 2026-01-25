import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectFavorites, toggleFavorite, removeFavorite } from '../store/favoritesSlice';
import MovieCard from '../components/MovieCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function MyListPage() {
    const favorites = useSelector(selectFavorites);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    // ...

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
                                onFavoriteToggle={() => dispatch(toggleFavorite(movie))}
                                isFavorite={true}
                                onEdit={movie.source === 'user' ? () => navigate('/form', { state: { movie } }) : null}
                                trailerId={movie.trailerId}
                                variants={itemVariants}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
}
