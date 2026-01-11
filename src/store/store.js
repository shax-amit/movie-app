import { configureStore } from '@reduxjs/toolkit';
import favoritesReducer from './favoritesSlice';

// Middleware to save favorites to localStorage
const localStorageMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Save favorites to localStorage whenever favorites state changes
  if (action.type.startsWith('favorites/')) {
    const favorites = store.getState().favorites.items;
    try {
      localStorage.setItem('movie-favorites', JSON.stringify(favorites));
    } catch (err) {
      console.error('Failed to save favorites to localStorage', err);
    }
  }
  
  return result;
};

export const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});

export default store;
