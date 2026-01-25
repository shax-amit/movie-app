import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectFavoritesCount, clearFavorites } from '../store/favoritesSlice';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { logout } from '../store/authSlice';

export default function Navbar() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const favoritesCount = useSelector(selectFavoritesCount);
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearFavorites());
    navigate('/login');
  };

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
      <div className="nav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <img src="/movie.svg" alt="Movie logo" className="nav-logo" />
        <span>Movie App</span>
      </div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/api">Explore</Link>
        <Link to="/form">Add Movie</Link>

        {isAuthenticated ? (
          <>
            <Link to="/my-list" className="favorites-link">
              ❤️ My List ({favoritesCount})
            </Link>
            <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border)' }}>
              <span className="user-name" style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text)' }}>{user?.username}</span>
              <button onClick={handleLogout} className="delete-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="auth-links" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginLeft: '0.5rem' }}>
            <Link to="/login" style={{ fontWeight: '600' }}>Login</Link>
            <Link to="/signup" className="favorites-link" style={{ background: 'var(--primary)', color: 'white', padding: '0.6rem 1.2rem' }}>
              Sign Up
            </Link>
          </div>
        )}

        <button onClick={toggleTheme} className="theme-toggle" title="Toggle theme" style={{ marginLeft: '0.5rem' }}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
}
