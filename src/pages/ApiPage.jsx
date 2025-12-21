import { useState, useEffect } from 'react';
import { useFavorites } from '../context/FavoritesContext';

export default function ApiPage() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { toggleFavorite, isFavorite } = useFavorites();

    useEffect(() => {
        const controller = new AbortController();

        async function loadMovies() {
            try {
                setLoading(true);
                setError(null);

                // Studio Ghibli public API (no auth)
                const res = await fetch('https://ghibliapi.vercel.app/films?limit=12', {
                    signal: controller.signal
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch movies');
                }

                const data = await res.json();
                setMovies(data);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(err.message || 'Something went wrong');
                }
            } finally {
                setLoading(false);
            }
        }

        loadMovies();
        return () => controller.abort();
    }, []);

    if (loading) return <div className="loading">Loading movies from API...</div>;
    if (error) return <div className="error-display">Error: {error}</div>;

    return (
        <div className="page-container">
            <h1>External Movie Database</h1>
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
                        <div key={movie.id} className="movie-card api-card">
                            <div className="card-top">
                                <h3>{movie.title}</h3>
                                <button
                                    type="button"
                                    className={`favorite-btn ${favorite ? 'active' : ''}`}
                                    onClick={() => toggleFavorite(movieData)}
                                    title={favorite ? 'Remove from favorites' : 'Add to favorites'}
                                >
                                    {favorite ? '⭐' : '☆'}
                                </button>
                            </div>
                            <div className="movie-info">
                                <span className="rating">⭐ {movie.rt_score}/100</span>
                                <span className="genre">{movie.release_date}</span>
                            </div>
                            {movie.image && (
                                <img
                                    src={movie.image}
                                    alt={`${movie.title} poster`}
                                    className="api-poster"
                                    loading="lazy"
                                />
                            )}
                            <p className="description">{movie.description}</p>
                            <p className="api-link">
                                <a
                                    href={`https://www.imdb.com/find/?q=${encodeURIComponent(movie.title)}&s=tt`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    View reviews on IMDb
                                </a>
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
