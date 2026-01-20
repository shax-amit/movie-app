import { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { loadFavorites } from './store/favoritesSlice';
import { useLocalStorage } from './hooks/useLocalStorage';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FormPage from './pages/FormPage';
import ApiPage from './pages/ApiPage';
import MyListPage from './pages/MyListPage';
import NotFound from './pages/NotFound';

const STORAGE_KEY = 'user-movies';

const INITIAL_MOVIES = [
  {
    id: 1,
    title: 'Inception',
    rating: 9,
    genre: 'Sci-Fi',
    source: 'seed',
    trailerId: 'YoHD9XEInc0',
    description:
      'A thief who steals corporate secrets through the use of dream-sharing technology.'
  },
  {
    id: 2,
    title: 'The Dark Knight',
    rating: 10,
    genre: 'Action',
    source: 'seed',
    trailerId: 'EXeTwQWrcwY',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham.'
  },
  {
    id: 3,
    title: 'Interstellar',
    rating: 8.5,
    genre: 'Sci-Fi',
    source: 'seed',
    trailerId: 'zSWdZVtXT7E',
    description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."
  },
  {
    id: 4,
    title: 'Parasite',
    rating: 9.5,
    genre: 'Drama',
    source: 'seed',
    trailerId: '5xH0HfJHsaY',
    description:
      'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.'
  }
];

function App() {
  const dispatch = useDispatch();

  // Use useLocalStorage hook for user movies
  const [storedMovies, setStoredMovies] = useLocalStorage(STORAGE_KEY, []);

  // Combine seed movies with user movies
  const movies = useMemo(() => {
    const userMovies = storedMovies.map((m) => ({ ...m, source: 'user' }));
    return [...INITIAL_MOVIES, ...userMovies];
  }, [storedMovies]);

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

  const addMovie = (movie) => {
    const newMovie = {
      ...movie,
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now(),
      source: 'user'
    };
    setStoredMovies((prev) => [...prev, newMovie]);
  };

  const deleteMovie = (id) => {
    setStoredMovies((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home movies={movies} deleteMovie={deleteMovie} />} />
            <Route path="/form" element={<FormPage addMovie={addMovie} />} />
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
