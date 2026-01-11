export default function MovieCard({ 
    id,
    title, 
    rating, 
    genre, 
    description, 
    onDelete,
    onFavoriteToggle,
    isFavorite,
    image,
    imdbLink
}) {
    return (
        <div className="movie-card">
            <div className="card-top">
                <h3>{title}</h3>
                <div className="card-actions">
                    {onFavoriteToggle && (
                        <button
                            type="button"
                            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                            onClick={() => onFavoriteToggle()}
                            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                            {isFavorite ? '⭐' : '☆'}
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
        </div>
    );
}
