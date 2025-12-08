export default function MovieCard({ title, rating, genre, description, onDelete }) {
    return (
        <div className="movie-card">
            <div className="card-top">
                <h3>{title}</h3>
                {onDelete && (
                    <button type="button" className="delete-btn" onClick={onDelete}>
                        ✕
                    </button>
                )}
            </div>
            <div className="movie-info">
                <span className="rating">⭐ {rating}/10</span>
                <span className="genre">{genre}</span>
            </div>
            {description && <p className="description">{description}</p>}
        </div>
    );
}
