import { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectFavorites, removeFavorite, toggleFavorite } from '../store/favoritesSlice';
import { useApi } from '../hooks/useApi';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';

export default function Home({ movies, deleteMovie }) {
    const [filter, setFilter] = useState('');
    const favorites = useSelector(selectFavorites);
    const dispatch = useDispatch();

    // Use useApi hook to fetch trending movie recommendations
    const { data: trendingData, loading: trendingLoading } = useApi(
        'https://ghibliapi.vercel.app/films?limit=3'
    );



    // Strictly follow user's request for case-insensitive comparison
    const searchQuery = (filter || '').toLowerCase();

    // Log to help debugging in the browser console
    console.log('Searching for:', searchQuery);

    // Filter data directly in render for maximum reliability
    const filteredFavorites = favorites.filter(movie => {
        const title = (movie.title || '').toLowerCase();
        const genre = (movie.genre || movie.release_date || '').toLowerCase();
        return title.includes(searchQuery) || genre.includes(searchQuery);
    });

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

    const hasAnyResults = filteredFavorites.length > 0 ||
        filteredUserMovies.length > 0 ||
        filteredSeedMovies.length > 0 ||
        filteredTrendingData.length > 0;

    return (
        <div className="page-container">
            {/* Hero Section with Search */}
            <section className="hero-section">
                <div className="hero-content">
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
                </div>
            </section>

            {filter && !hasAnyResults && (
                <div className="empty-state" style={{ marginTop: '2rem' }}>
                    <h3>No results found for "{filter}"</h3>
                    <p>Try searching for a different title or genre.</p>
                </div>
            )}

            {filteredFavorites.length > 0 && (
                <section className="section">
                    <div className="section-header">
                        <h2>⭐ My Favorites</h2>
                    </div>

                    <div className="movies-grid">
                        {filteredFavorites.map(movie => (
                            <MovieCard
                                key={movie.id}
                                id={movie.id}
                                title={movie.title}
                                rating={movie.rating}
                                genre={movie.genre || movie.release_date || 'Favorite'}
                                description={movie.description}
                                onDelete={() => dispatch(removeFavorite(movie.id))}
                                onFavoriteToggle={() => handleToggleFavorite(movie)}
                                isFavorite={true}
                            />
                        ))}
                    </div>
                </section>
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
                        <div className="movies-grid">
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

            {filteredUserMovies.length > 0 && (
                <section className="section" id="my-list">
                    <div className="section-header">
                        <h2>My Collection</h2>
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
                    </div>
                </section>
            )}

            {filteredSeedMovies.length > 0 && (
                <section className="section">
                    <div className="section-header">
                        <h2>Weekly Picks</h2>
                    </div>

                    <div className="movies-grid">
                        {filteredSeedMovies.map(movie => (
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
            )}
        </div>
    );
}
