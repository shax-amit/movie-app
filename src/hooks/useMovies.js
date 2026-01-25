import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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

      console.log('Fetching movies from:', `${API_BASE_URL}/movies`);
      const response = await fetch(`${API_BASE_URL}/movies`);

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`Failed to fetch movies: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received movies:', data.length, 'movies');
      setMovies(data);
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch movies';
      setError(errorMessage);
      console.error('Error fetching movies:', err);
      console.error('API URL was:', `${API_BASE_URL}/movies`);
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

      const response = await fetch(`${API_BASE_URL}/movies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

      const response = await fetch(`${API_BASE_URL}/movies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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

      const response = await fetch(`${API_BASE_URL}/movies/${id}`, {
        method: 'DELETE',
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
