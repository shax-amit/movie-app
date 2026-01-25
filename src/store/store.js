import { configureStore } from '@reduxjs/toolkit';
import favoritesReducer from './favoritesSlice';
import authReducer from './authSlice';

// Middleware to save favorites to localStorage
const localStorageMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  // Save favorites to localStorage whenever favorites state changes
  if (action.type.startsWith('favorites/')) {
    const state = store.getState();
    const { isAuthenticated, user } = state.auth;
    const favorites = state.favorites.items;

    try {
      // For logged in users, we can use a per-user key or just rely on MongoDB
      // For now, let's keep it simple: guests use 'movie-favorites', 
      // logged in users use 'movie-favorites_USERID'
      const storageKey = isAuthenticated && user ? `movie-favorites_${user.id}` : 'movie-favorites';
      localStorage.setItem(storageKey, JSON.stringify(favorites));
    } catch (err) {
      console.error('Failed to save favorites to localStorage', err);
    }
  }

  return result;
};

export const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});

export default store;
