import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;

/**
 * Custom hook for managing movies with CRUD operations
 * @returns {object} - { movies, loading, error, addMovie, updateMovie, deleteMovie, refetch }
 */
export function useMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      console.log('Fetching movies from:', `${API_BASE_URL_LOCAL}/movies`);
      const response = await fetch(`${API_BASE_URL_LOCAL}/movies`, { headers });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 401) {
          // Silently fail or handle unauthorized
          setMovies([]);
          return;
        }
        throw new Error(`Failed to fetch movies: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received movies:', data.length, 'movies');
      setMovies(data);
    } catch (err) {
      if (err.message.includes('401')) {
        console.warn('Silent auth failure in useMovies (expected for guests)');
        setMovies([]);
        setError(null);
      } else {
        const errorMessage = err.message || 'Failed to fetch movies';
        setError(errorMessage);
        console.error('Error fetching movies:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const addMovie = useCallback(async (movieData) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL_LOCAL}/movies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(movieData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to add movie: ${response.status}`);
      }

      const newMovie = await response.json();
      setMovies((prev) => [...prev, newMovie]);
      return newMovie;
    } catch (err) {
      setError(err.message || 'Failed to add movie');
      throw err;
    }
  }, []);

  const updateMovie = useCallback(async (id, movieData) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL_LOCAL}/movies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(movieData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update movie: ${response.status}`);
      }

      const updatedMovie = await response.json();
      setMovies((prev) =>
        prev.map((movie) => (movie.id === id ? updatedMovie : movie))
      );
      return updatedMovie;
    } catch (err) {
      setError(err.message || 'Failed to update movie');
      throw err;
    }
  }, []);

  const deleteMovie = useCallback(async (id) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL_LOCAL}/movies/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete movie: ${response.status}`);
      }

      setMovies((prev) => prev.filter((movie) => movie.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete movie');
      throw err;
    }
  }, []);

  return {
    movies,
    loading,
    error,
    addMovie,
    updateMovie,
    deleteMovie,
    refetch: fetchMovies,
  };
}
