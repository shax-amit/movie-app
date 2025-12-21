import { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('movie-favorites');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.error('Failed to load favorites from storage', err);
    }
    return [];
  });

  // Save to localStorage whenever favorites change
  useEffect(() => {
    try {
      localStorage.setItem('movie-favorites', JSON.stringify(favorites));
    } catch (err) {
      console.error('Failed to save favorites to storage', err);
    }
  }, [favorites]);

  const addFavorite = (movie) => {
    setFavorites((prev) => {
      // Check if movie already exists (by id or title)
      const exists = prev.some(
        (fav) => fav.id === movie.id || fav.title === movie.title
      );
      if (exists) {
        return prev;
      }
      return [...prev, movie];
    });
  };

  const removeFavorite = (movieId) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== movieId));
  };

  const isFavorite = (movieId) => {
    return favorites.some((fav) => fav.id === movieId);
  };

  const toggleFavorite = (movie) => {
    if (isFavorite(movie.id)) {
      removeFavorite(movie.id);
    } else {
      addFavorite(movie);
    }
  };

  const value = {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    favoritesCount: favorites.length
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

