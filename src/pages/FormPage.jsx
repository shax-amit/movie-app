import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function FormPage({ addMovie }) {
    // Use useLocalStorage for fake logged-in user
    const [user, setUser] = useLocalStorage('fake-user', null);

    const [formData, setFormData] = useState({
        title: '',
        rating: '',
        genre: 'Action',
        review: ''
    });

    const [errors, setErrors] = useState({});

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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validate()) {
            console.log('Form Submitted Successfully:', formData);
            if (addMovie) {
                addMovie({
                    title: formData.title,
                    rating: Number(formData.rating),
                    genre: formData.genre,
                    description: formData.review
                });
            }
            alert('Movie added! Check the console for details.');
            // Reset form
            setFormData({
                title: '',
                rating: '',
                genre: 'Action',
                review: ''
            });
            setErrors({});
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
                <h1>Add New Movie</h1>
            </div>
            <form onSubmit={handleSubmit} className="movie-form">
                <div className="form-group">
                    <label>Movie Title:</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={errors.title ? 'error' : ''}
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

                <button type="submit" className="submit-btn">Add Movie</button>
            </form>
        </div>
    );
}
