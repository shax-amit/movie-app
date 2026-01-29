import { useState, useEffect, useRef } from 'react';
import { useMovies } from '../hooks/useMovies';
import { useNavigate, useLocation } from 'react-router-dom';

export default function FormPage() {
    const { addMovie, updateMovie } = useMovies();
    const navigate = useNavigate();
    const location = useLocation();
    const titleInputRef = useRef(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Check if we are in edit mode (movie data passed in location state)
    const editMovie = location.state?.movie;
    const isEditMode = !!editMovie;

    const [formData, setFormData] = useState({
        title: '',
        rating: '',
        genre: 'Action',
        review: ''
    });

    // Initialize form with movie data if in edit mode
    useEffect(() => {
        if (isEditMode) {
            setFormData({
                title: editMovie.title || '',
                rating: editMovie.rating || '',
                genre: editMovie.genre || 'Action',
                review: editMovie.description || ''
            });
        }
    }, [isEditMode, editMovie]);

    // Focus title input on mount
    useEffect(() => {
        if (titleInputRef.current) {
            titleInputRef.current.focus();
        }
    }, []);

    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const newErrors = {};

        if (formData.title.length < 3) {
            newErrors.title = 'Title must be at least 3 characters long';
        }

        const ratingNum = Number(formData.rating);
        if (!formData.rating || isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10) {
            newErrors.rating = 'Rating must be a number between 1 and 10';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);

        if (validate()) {
            setIsSubmitting(true);
            try {
                const movieData = {
                    title: formData.title,
                    rating: Number(formData.rating),
                    genre: formData.genre,
                    description: formData.review,
                    source: 'user',
                    isFavorite: false
                };

                if (isEditMode) {
                    await updateMovie(editMovie.id, movieData);
                } else {
                    await addMovie(movieData);
                }

                // Strictly follow HW1 requirements: log data on submit
                console.log('Form submitted successfully:', movieData);

                // Reset form on success
                setFormData({
                    title: '',
                    rating: '',
                    genre: 'Action',
                    review: ''
                });
                setErrors({});

                // Show success feedback
                setShowSuccess(true);

                // Briefly wait so user sees the success state
                setTimeout(() => {
                    navigate(-1);
                }, 1500);
            } catch (err) {
                setSubmitError(err.message || `Failed to ${isEditMode ? 'update' : 'add'} movie. Please try again.`);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="page-container">
            <div className="form-header">
                <h1>{isEditMode ? 'Edit Movie' : 'Add New Movie'}</h1>
            </div>
            <form onSubmit={handleSubmit} className="movie-form">
                <div className="form-group">
                    <label>Movie Title:</label>
                    <input
                        ref={titleInputRef}
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={errors.title ? 'error' : ''}
                        placeholder="Enter movie title..."
                    />
                    {errors.title && <span className="error-msg">{errors.title}</span>}
                </div>

                <div className="form-group">
                    <label>Rating (1-10):</label>
                    <input
                        type="number"
                        name="rating"
                        value={formData.rating}
                        onChange={handleChange}
                        className={errors.rating ? 'error' : ''}
                    />
                    {errors.rating && <span className="error-msg">{errors.rating}</span>}
                </div>

                <div className="form-group">
                    <label>Genre:</label>
                    <select name="genre" value={formData.genre} onChange={handleChange}>
                        <option value="Action">Action</option>
                        <option value="Comedy">Comedy</option>
                        <option value="Drama">Drama</option>
                        <option value="Sci-Fi">Sci-Fi</option>
                        <option value="Horror">Horror</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Review / Description:</label>
                    <textarea
                        name="review"
                        value={formData.review}
                        onChange={handleChange}
                        rows="4"
                    />
                </div>

                {submitError && (
                    <div className="error-message" style={{
                        padding: '1rem',
                        backgroundColor: '#fee',
                        color: '#c33',
                        borderRadius: '4px',
                        marginBottom: '1rem'
                    }}>
                        {submitError}
                    </div>
                )}

                {showSuccess && (
                    <div className="success-message" style={{
                        padding: '1rem',
                        backgroundColor: '#edfdf1',
                        color: '#2d7a43',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        textAlign: 'center',
                        fontWeight: '600',
                        border: '1px solid #c6f6d5'
                    }}>
                        {isEditMode ? '✨ Movie updated successfully!' : '🚀 Movie added to your collection!'}
                    </div>
                )}

                <div className="form-buttons" style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isSubmitting}
                        style={{ flex: 1 }}
                    >
                        {isSubmitting ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Movie' : 'Add Movie')}
                    </button>
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => navigate(-1)}
                        style={{
                            padding: '0.8rem 1.5rem',
                            backgroundColor: '#eee',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: '#666'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
