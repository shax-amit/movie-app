const GENRE_MAP = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Sci-Fi',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
};

/**
 * Converts TMDB genre IDs to a comma-separated string of names.
 * @param {Array<number>} genreIds - Array of genre IDs from TMDB
 * @returns {string} - Comma-separated genre names
 */
export const getGenreNames = (genreIds) => {
    if (!genreIds || !Array.isArray(genreIds)) return 'Movie';
    const names = genreIds
        .map(id => GENRE_MAP[id])
        .filter(Boolean);
    return names.length > 0 ? names.join(', ') : 'Movie';
};

/**
 * Gets a single genre name by ID.
 * @param {number} id - TMDB genre ID
 * @returns {string} - Genre name or 'Unknown'
 */
export const getGenreName = (id) => {
    return GENRE_MAP[id] || 'Unknown';
};

export default GENRE_MAP;
