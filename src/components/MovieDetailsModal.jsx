import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

export default function MovieDetailsModal({ isOpen, onClose, movie }) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!movie) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.92)',
                        backdropFilter: 'blur(20px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        padding: '1.5rem'
                    }}
                >
                    <motion.div
                        className="details-modal-container"
                        initial={{ scale: 0.9, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 50 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '32px',
                            width: '100%',
                            maxWidth: '1000px',
                            maxHeight: '90vh',
                            display: 'grid',
                            gridTemplateColumns: 'minmax(300px, 400px) 1fr',
                            overflow: 'hidden',
                            boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.8)',
                            color: 'white',
                            position: 'relative'
                        }}
                    >
                        {/* Poster Section */}
                        <div className="details-modal-poster" style={{
                            position: 'relative',
                            height: '100%',
                            borderRight: '1px solid var(--border)'
                        }}>
                            <img
                                src={movie.image || movie.posterPath}
                                alt={movie.title}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(to top, var(--surface) 0%, transparent 40%)'
                            }} />
                        </div>

                        {/* Content Section */}
                        <div className="details-modal-content" style={{
                            padding: '3rem',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem',
                            position: 'relative'
                        }}>
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="modal-close-btn"
                                style={{
                                    position: 'absolute',
                                    top: '1.5rem',
                                    right: '1.5rem',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--surface-strong)',
                                    border: '1px solid var(--border)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 10,
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                ✕
                            </button>

                            <div className="details-header">
                                <h2 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-0.04em', lineHeight: '1.1', marginBottom: '0.5rem' }}>
                                    {movie.title}
                                </h2>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: 'var(--muted)', fontWeight: '600' }}>
                                    {movie.year && <span>{movie.year}</span>}
                                    <span>•</span>
                                    <span style={{ color: '#fbbf24' }}>⭐ {movie.rating}/10</span>
                                </div>
                            </div>

                            <div className="details-genres" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {movie.genre.split(',').map(g => (
                                    <span key={g} style={{
                                        padding: '0.4rem 1rem',
                                        borderRadius: '99px',
                                        fontSize: '0.85rem',
                                        fontWeight: '700',
                                        background: 'var(--primary-glow)',
                                        color: 'var(--primary)',
                                        textTransform: 'uppercase'
                                    }}>
                                        {g.trim()}
                                    </span>
                                ))}
                            </div>

                            <div className="details-overview">
                                <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Overview</h3>
                                <p style={{
                                    fontSize: '1.1rem',
                                    lineHeight: '1.7',
                                    color: 'rgba(255,255,255,0.9)',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {movie.description}
                                </p>
                            </div>

                            {movie.personalOpinion && (
                                <div className="details-personal-note" style={{
                                    marginTop: '1rem',
                                    padding: '2rem',
                                    backgroundColor: 'var(--surface-strong)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '24px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '4px',
                                        height: '100%',
                                        backgroundColor: 'var(--primary)'
                                    }} />
                                    <h4 style={{ fontSize: '0.8rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>My Thoughts</h4>
                                    <p style={{ fontStyle: 'italic', fontSize: '1.1rem', color: 'white', lineHeight: '1.6' }}>"{movie.personalOpinion}"</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
