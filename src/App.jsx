import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FavoritesProvider } from './context/FavoritesContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FormPage from './pages/FormPage';
import ApiPage from './pages/ApiPage';
import NotFound from './pages/NotFound';

const STORAGE_KEY = 'user-movies';

const INITIAL_MOVIES = [
  {
    id: 1,
    title: 'Inception',
    rating: 9,
    genre: 'Sci-Fi',
    source: 'seed',
    description:
      'A thief who steals corporate secrets through the use of dream-sharing technology.'
  },
  {
    id: 2,
    title: 'The Dark Knight',
    rating: 10,
    genre: 'Action',
    source: 'seed',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham.'
  },
  {
    id: 3,
    title: 'Interstellar',
    rating: 8.5,
    genre: 'Sci-Fi',
    source: 'seed',
    description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."
  },
  {
    id: 4,
    title: 'Parasite',
    rating: 9.5,
    genre: 'Drama',
    source: 'seed',
    description:
      'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.'
  }
];

function App() {
  const [movies, setMovies] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const withSource = parsed.map((m) => ({ ...m, source: 'user' }));
          return [...INITIAL_MOVIES, ...withSource];
        }
      }
    } catch (err) {
      console.error('Failed to load movies from storage', err);
    }
    return INITIAL_MOVIES;
  });

  useEffect(() => {
    try {
      const userMovies = movies.filter((m) => m.source === 'user');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userMovies));
    } catch (err) {
      console.error('Failed to save movies to storage', err);
    }
  }, [movies]);

  const addMovie = (movie) => {
    setMovies((prev) => [
      ...prev,
      {
        ...movie,
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now(),
        source: 'user'
      }
    ]);
  };

  const deleteMovie = (id) => {
    setMovies((prev) => prev.filter((m) => !(m.id === id && m.source === 'user')));
  };

  return (
    <FavoritesProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home movies={movies} deleteMovie={deleteMovie} />} />
              <Route path="/form" element={<FormPage addMovie={addMovie} />} />
              <Route path="/api" element={<ApiPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </Router>
    </FavoritesProvider>
  );
}

export default App;
