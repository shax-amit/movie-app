import { useState, useEffect } from 'react';

export default function ApiPage() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                {movies.map(movie => (
                    <div key={movie.id} className="movie-card api-card">
                        <h3>{movie.title}</h3>
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
                ))}
            </div>
        </div>
    );
}
