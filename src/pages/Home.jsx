import { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectFavorites, removeFavorite, toggleFavorite } from '../store/favoritesSlice';
import { useApi } from '../hooks/useApi';
import MovieCard from '../components/MovieCard';

export default function Home({ movies, deleteMovie }) {
    const [filter, setFilter] = useState('');
    const favorites = useSelector(selectFavorites);
    const dispatch = useDispatch();

    // Use useApi hook to fetch trending movie recommendations
    const { data: trendingData, loading: trendingLoading } = useApi(
        'https://ghibliapi.vercel.app/films?limit=3'
    );

    const userMovies = useMemo(
        () => movies.filter((movie) => movie.source === 'user'),
        [movies]
    );

    const seedMovies = useMemo(
        () => movies.filter((movie) => movie.source === 'seed'),
        [movies]
    );

    const filteredUserMovies = userMovies.filter(movie =>
        movie.title.toLowerCase().includes(filter.toLowerCase()) ||
        movie.genre.toLowerCase().includes(filter.toLowerCase())
    );

    const handleToggleFavorite = (movie) => {
        dispatch(toggleFavorite(movie));
    };

    const isFavoriteMovie = (movieId) => {
        return favorites.some((fav) => fav.id === movieId);
    };

    return (
        <div className="page-container">
            <h1>My List</h1>

            {favorites.length > 0 && (
                <section className="section">
                    <div className="section-header">
                        <h2>⭐ My Favorites</h2>
                        <p className="section-subtitle">Your favorite movies</p>
                    </div>

                    <div className="movies-grid">
                        {favorites.map(movie => (
                            <MovieCard
                                key={movie.id}
                                id={movie.id}
                                title={movie.title}
                                rating={movie.rating}
                                genre={movie.genre}
                                description={movie.description}
                                onDelete={() => dispatch(removeFavorite(movie.id))}
                                onFavoriteToggle={() => handleToggleFavorite(movie)}
                                isFavorite={true}
                            />
                        ))}
                    </div>
                </section>
            )}

            {trendingData && trendingData.length > 0 && (
                <section className="section">
                    <div className="section-header">
                        <h2>🔥 Trending Now</h2>
                        <p className="section-subtitle">Popular recommendations</p>
                    </div>
                    {trendingLoading ? (
                        <div className="loading">Loading recommendations...</div>
                    ) : (
                        <div className="movies-grid">
                            {trendingData.map(movie => {
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
                                        key={movie.id}
                                        id={movie.id}
                                        title={movie.title}
                                        rating={Math.round(movie.rt_score / 10)}
                                        genre={movie.release_date}
                                        description={movie.description?.substring(0, 100) + '...'}
                                        onFavoriteToggle={() => handleToggleFavorite(movieData)}
                                        isFavorite={isFavoriteMovie(movie.id)}
                                    />
                                );
                            })}
                        </div>
                    )}
                </section>
            )}

            <section className="section">
                <div className="section-header">
                    <h2>My List</h2>
                    <p className="section-subtitle">Movies you add</p>
                </div>

                <div className="filter-container">
                    <input
                        type="text"
                        placeholder="Search by title or genre..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="movies-grid">
                    {filteredUserMovies.map(movie => (
                        <MovieCard
                            key={movie.id}
                            id={movie.id}
                            title={movie.title}
                            rating={movie.rating}
                            genre={movie.genre}
                            description={movie.description}
                            onDelete={() => deleteMovie?.(movie.id)}
                            onFavoriteToggle={() => handleToggleFavorite(movie)}
                            isFavorite={isFavoriteMovie(movie.id)}
                        />
                    ))}
                    {filteredUserMovies.length === 0 && (
                        <div className="empty-state">
                            {userMovies.length === 0
                                ? 'No movies added yet. Go to Add Movie to add your first one!'
                                : `No movies found matching "${filter}"`}
                        </div>
                    )}
                </div>
            </section>

            <section className="section">
                <div className="section-header">
                    <h2 className="section-subtitle">Weekly Picks</h2>
                </div>

                <div className="movies-grid">
                    {seedMovies.map(movie => (
                        <MovieCard
                            key={movie.id}
                            id={movie.id}
                            title={movie.title}
                            rating={movie.rating}
                            genre={movie.genre}
                            description={movie.description}
                            onFavoriteToggle={() => handleToggleFavorite(movie)}
                            isFavorite={isFavoriteMovie(movie.id)}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
