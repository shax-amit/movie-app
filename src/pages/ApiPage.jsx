import { useSelector, useDispatch } from 'react-redux';
import { toggleFavorite } from '../store/favoritesSlice';
import { useApi } from '../hooks/useApi';
import MovieCard from '../components/MovieCard';

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

    if (loading) return <div className="loading">Loading movies from API...</div>;
    if (error) return (
        <div className="page-container">
            <div className="error-display">Error: {error}</div>
            <button onClick={refetch} className="retry-btn">Retry</button>
        </div>
    );

    const movies = moviesData || [];

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>External Movie Database</h1>
                <button onClick={refetch} className="refetch-btn" title="Refresh movies">
                    🔄 Refresh
                </button>
            </div>
            <p className="api-note">Data fetched from Studio Ghibli public API</p>

            <div className="movies-grid">
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
                        />
                    );
                })}
            </div>
        </div>
    );
}
