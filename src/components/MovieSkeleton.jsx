export default function MovieSkeleton() {
    return (
        <div className="movie-card skeleton">
            <div className="card-top">
                <div className="skeleton-title"></div>
                <div className="card-actions">
                    <div className="skeleton-btn"></div>
                </div>
            </div>
            <div className="movie-info">
                <div className="skeleton-rating"></div>
                <div className="skeleton-genre"></div>
            </div>
            <div className="skeleton-image"></div>
            <div className="skeleton-description"></div>
            <div className="skeleton-description short"></div>
        </div>
    );
}
