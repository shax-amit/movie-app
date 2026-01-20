import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectFavoritesCount } from '../store/favoritesSlice';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function Navbar() {
  const favoritesCount = useSelector(selectFavoritesCount);
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <img src="/movie.svg" alt="Movie logo" className="nav-logo" />
        <span>Movie App</span>
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
        <button onClick={toggleTheme} className="theme-toggle" title="Toggle theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
}
