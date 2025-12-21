import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';

export default function Navbar() {
  const { favoritesCount } = useFavorites();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <img src="/movie.svg" alt="Movie logo" className="nav-logo" />
        Movie App
      </div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/form">Add Movie</Link>
        <Link to="/api">External API</Link>
        {favoritesCount > 0 && (
          <Link to="/" className="favorites-link">
            ⭐ Favorites ({favoritesCount})
          </Link>
        )}
      </div>
    </nav>
  );
}
