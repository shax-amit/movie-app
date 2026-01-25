import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
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
    onUpdateOpinion,
    isFavorite,
    image,
    posterPath,
    imdbLink,
    trailerId,
    personalOpinion,
    variants
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentOpinion, setCurrentOpinion] = useState(personalOpinion || '');

    // Sync state when prop changes
    useEffect(() => {
        setCurrentOpinion(personalOpinion || '');
    }, [personalOpinion]);

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
                {(image || posterPath) && (
                    <img
                        src={image || posterPath}
                        alt={`${title} poster`}
                        className="movie-poster"
                        loading="lazy"
                        style={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: '300px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            marginBottom: '1rem'
                        }}
                    />
                )}
                {description && <p className="description">{description}</p>}

                {isFavorite && (
                    <div className="opinion-section" style={{
                        marginTop: '1.5rem',
                        padding: '1.25rem',
                        backgroundColor: '#ffffff',
                        borderLeft: '4px solid #4a90e2',
                        borderRadius: '0 12px 12px 0',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                        fontSize: '0.9rem',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        overflow: 'hidden',
                        maxWidth: '100%'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4a90e2' }}>My Note</span>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#4a90e2',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        padding: '4px'
                                    }}
                                    title="Edit Note"
                                >
                                    ✎
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <textarea
                                    value={currentOpinion}
                                    onChange={(e) => setCurrentOpinion(e.target.value)}
                                    placeholder="Add your thoughts..."
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        minHeight: '80px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #4a90e2',
                                        borderRadius: '8px',
                                        padding: '0.75rem',
                                        color: '#000000',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        resize: 'vertical'
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setCurrentOpinion(personalOpinion || '');
                                        }}
                                        style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px', background: 'rgba(0,0,0,0.1)', border: 'none', color: '#000', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            onUpdateOpinion(currentOpinion);
                                            setIsEditing(false);
                                        }}
                                        style={{ fontSize: '0.8rem', padding: '4px 12px', borderRadius: '4px', background: '#4a90e2', border: 'none', color: 'white', fontWeight: '600', cursor: 'pointer' }}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p style={{
                                margin: 0,
                                fontStyle: personalOpinion ? 'italic' : 'normal',
                                color: personalOpinion ? '#000000' : 'rgba(0,0,0,0.5)',
                                overflowWrap: 'break-word',
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {personalOpinion ? `"${personalOpinion}"` : "No note added yet click edit to add one."}
                            </p>
                        )}
                    </div>
                )}

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
