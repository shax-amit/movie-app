import { motion } from 'framer-motion';
import { useState } from 'react';
import TrailerModal from './TrailerModal';

export default function MovieCard({
    id,
    title,
    rating,
    genre,
    description,
    onDelete,
    onEdit,
    onFavoriteToggle,
    isFavorite,
    image,
    imdbLink,
    trailerId,
    variants
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fallback trailer ID if none provided (Interstellar theme / generic cinematic)
    const effectiveTrailerId = trailerId || 'zSWdZVtXT7E';

    return (
        <>
            <motion.div
                className="movie-card"
                variants={variants}
                whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.2 }
                }}
                layout
            >
                <div className="card-top">
                    <h3>{title}</h3>
                    <div className="card-actions">
                        {onFavoriteToggle && (
                            <button
                                type="button"
                                className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                                onClick={() => onFavoriteToggle()}
                                title={isFavorite ? 'Remove from My List' : 'Add to My List'}
                            >
                                {isFavorite ? '❤️' : '🤍'}
                            </button>
                        )}
                        {onEdit && (
                            <button
                                type="button"
                                className="edit-btn"
                                onClick={onEdit}
                                title="Edit"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    padding: '5px',
                                    color: '#4a90e2'
                                }}
                            >
                                ✎
                            </button>
                        )}
                        {onDelete && (
                            <button type="button" className="delete-btn" onClick={onDelete} title="Delete">
                                ✕
                            </button>
                        )}
                    </div>
                </div>
                <div className="movie-info">
                    <span className="rating">⭐ {rating}/10</span>
                    <span className="genre">{genre}</span>
                </div>
                {image && (
                    <img
                        src={image}
                        alt={`${title} poster`}
                        className="api-poster"
                        loading="lazy"
                    />
                )}
                {description && <p className="description">{description}</p>}

                <button
                    className="trailer-btn"
                    onClick={() => setIsModalOpen(true)}
                >
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    Watch Trailer
                </button>

                {imdbLink && (
                    <p className="api-link">
                        <a
                            href={imdbLink}
                            target="_blank"
                            rel="noreferrer"
                        >
                            View reviews on IMDb
                        </a>
                    </p>
                )}
            </motion.div>

            <TrailerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                movieTitle={title}
                trailerId={effectiveTrailerId}
            />
        </>
    );
}
