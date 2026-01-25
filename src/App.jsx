import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { loadFavorites } from './store/favoritesSlice';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FormPage from './pages/FormPage';
import ApiPage from './pages/ApiPage';
import MyListPage from './pages/MyListPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import { setUser } from './store/authSlice';

function App() {
  const dispatch = useDispatch();

  const { isAuthenticated, user, loading: authLoading } = useSelector((state) => state.auth);

  // Load session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token'); import { API_BASE_URL } from './config';
      if (token && !user) {
        try {
          console.log('App Auth Check - API URL:', `${API_BASE_URL}/auth/me`);
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const userData = await response.json();
            dispatch(setUser(userData));
          } else {
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error('Failed to verify token', err);
        }
      }
    };
    restoreSession();
  }, [dispatch, user]);

  // Handle Favorites Loading/Switching
  useEffect(() => {
    if (authLoading) return;

    try {
      const storageKey = isAuthenticated && user ? `movie-favorites_${user.id}` : 'movie-favorites';
      const storedFavorites = localStorage.getItem(storageKey);

      if (storedFavorites) {
        const parsed = JSON.parse(storedFavorites);
        if (Array.isArray(parsed)) {
          dispatch(loadFavorites(parsed));
        }
      } else {
        // If no user-specific storage, but we are logged in, 
        // MyListPage/Home hooks will fetch from DB and sync Redux anyway.
        // But for guests, we might want to keep it empty if nothing stored.
        if (!isAuthenticated) {
          // Guests shouldn't see favorites by default if they just logged out
          // or if we want private lists only.
          dispatch(loadFavorites([]));
        } else {
          dispatch(loadFavorites([]));
        }
      }
    } catch (err) {
      console.error('Failed to load favorites from storage', err);
    }
  }, [isAuthenticated, user, authLoading, dispatch]);

  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route path="/form" element={
              <ProtectedRoute>
                <FormPage />
              </ProtectedRoute>
            } />

            <Route path="/api" element={<ApiPage />} />

            <Route path="/my-list" element={
              <ProtectedRoute>
                <MyListPage />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
