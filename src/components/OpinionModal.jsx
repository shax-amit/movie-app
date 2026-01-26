import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * OpinionModal Component (L6 Enhancement: Portals & useRef)
 * Uses createPortal to render the modal at the document body level.
 * Uses useRef to provide auto-focus on the textarea for better UX.
 */
export default function OpinionModal({ isOpen, onClose, onSave, initialOpinion = '', movieTitle }) {
    const [opinion, setOpinion] = useState(initialOpinion);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setOpinion(initialOpinion);
            // L6 Enhancement: Use useRef to focus the textarea when modal opens
            // Small timeout ensures the animation has started and element is interactable
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                }
            }, 100);
        }
    }, [isOpen, initialOpinion]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(opinion);
    };

    // L6 Enhancement: Wrap in createPortal to render outside the regular DOM hierarchy
    return createPortal(
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
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}
                >
                    <motion.div
                        className="modal-content"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '24px',
                            padding: '2.5rem',
                            width: '100%',
                            maxWidth: '500px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            color: 'white'
                        }}
                    >
                        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: '700' }}>Your Thoughts</h2>
                        <p style={{ marginBottom: '2rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                            What did you think of <strong>{movieTitle}</strong>?
                        </p>

                        <form onSubmit={handleSubmit}>
                            <textarea
                                ref={textareaRef}
                                value={opinion}
                                onChange={(e) => setOpinion(e.target.value)}
                                placeholder="Write your review or personal note here..."
                                style={{
                                    width: '100%',
                                    height: '150px',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '16px',
                                    padding: '1.25rem',
                                    color: 'white',
                                    fontSize: '1rem',
                                    lineHeight: '1.6',
                                    outline: 'none',
                                    resize: 'none',
                                    marginBottom: '2rem',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => e.target.style.border = '1px solid #4a90e2'}
                                onBlur={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
                            />

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '12px',
                                        backgroundColor: 'transparent',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '0.75rem 2rem',
                                        borderRadius: '12px',
                                        backgroundColor: '#4a90e2',
                                        border: 'none',
                                        color: 'white',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)'
                                    }}
                                >
                                    Save Record
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
