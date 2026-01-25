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
      const payload = action.payload;
      const id = typeof payload === 'string' || typeof payload === 'number' ? payload : payload.id;
      const title = typeof payload === 'object' ? payload.title : null;

      state.items = state.items.filter((fav) => {
        const idMatch = id && fav.id === id;
        const titleMatch = title && fav.title === title;
        return !(idMatch || titleMatch);
      });
      state.lastUpdated = new Date().toISOString();
    },
    toggleFavorite: (state, action) => {
      const movie = action.payload;
      const index = state.items.findIndex(
        (fav) => fav.id === movie.id || (movie.title && fav.title === movie.title)
      );

      if (index !== -1) {
        state.items.splice(index, 1);
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
