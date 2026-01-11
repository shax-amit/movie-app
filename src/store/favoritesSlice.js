import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  lastUpdated: null,
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addFavorite: (state, action) => {
      const movie = action.payload;
      // Check if movie already exists (by id or title)
      const exists = state.items.some(
        (fav) => fav.id === movie.id || fav.title === movie.title
      );
      if (!exists) {
        state.items.push(movie);
        state.lastUpdated = new Date().toISOString();
      }
    },
    removeFavorite: (state, action) => {
      const movieId = action.payload;
      state.items = state.items.filter((fav) => fav.id !== movieId);
      state.lastUpdated = new Date().toISOString();
    },
    toggleFavorite: (state, action) => {
      const movie = action.payload;
      const exists = state.items.some((fav) => fav.id === movie.id);
      if (exists) {
        state.items = state.items.filter((fav) => fav.id !== movie.id);
      } else {
        state.items.push(movie);
      }
      state.lastUpdated = new Date().toISOString();
    },
    clearFavorites: (state) => {
      state.items = [];
      state.lastUpdated = new Date().toISOString();
    },
    loadFavorites: (state, action) => {
      state.items = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
  },
});

export const { addFavorite, removeFavorite, toggleFavorite, clearFavorites, loadFavorites } =
  favoritesSlice.actions;

// Selectors
export const selectFavorites = (state) => state.favorites.items;
export const selectFavoritesCount = (state) => state.favorites.items.length;
export const selectLastUpdated = (state) => state.favorites.lastUpdated;
export const selectIsFavorite = (movieId) => (state) =>
  state.favorites.items.some((fav) => fav.id === movieId);

export default favoritesSlice.reducer;
