import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { loadFavorites } from './store/favoritesSlice';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FormPage from './pages/FormPage';
import ApiPage from './pages/ApiPage';
import MyListPage from './pages/MyListPage';
import NotFound from './pages/NotFound';

function App() {
  const dispatch = useDispatch();

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem('movie-favorites');
      if (storedFavorites) {
        const parsed = JSON.parse(storedFavorites);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch(loadFavorites(parsed));
        }
      }
    } catch (err) {
      console.error('Failed to load favorites from storage', err);
    }
  }, [dispatch]);

  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/form" element={<FormPage />} />
            <Route path="/api" element={<ApiPage />} />
            <Route path="/my-list" element={<MyListPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
