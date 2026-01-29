import { motion, AnimatePresence } from 'framer-motion';

export default function TrailerModal({ isOpen, onClose, trailerId, movieTitle }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="modal-content glass-effect"
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <h2>{movieTitle} - Trailer</h2>
                        <button className="close-modal" onClick={onClose}>✕</button>
                    </div>
                    <div className="video-container">
                        <iframe
                            src={`https://www.youtube.com/embed/${trailerId}?autoplay=1`}
                            title={`${movieTitle} Trailer`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
