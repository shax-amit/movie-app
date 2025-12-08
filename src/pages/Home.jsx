import { useMemo, useState } from 'react';
import MovieCard from '../components/MovieCard';

export default function Home({ movies, deleteMovie }) {
    const [filter, setFilter] = useState('');

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

    return (
        <div className="page-container">
            <h1>My List</h1>

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
                            title={movie.title}
                            rating={movie.rating}
                            genre={movie.genre}
                            description={movie.description}
                            onDelete={() => deleteMovie?.(movie.id)}
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
                            title={movie.title}
                            rating={movie.rating}
                            genre={movie.genre}
                            description={movie.description}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
