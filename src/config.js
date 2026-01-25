const getApiBase = () => {
    const envUrl = import.meta.env.VITE_API_URL;

    if (!envUrl) {
        return 'http://localhost:3001/api';
    }

    // Ensure it doesn't end with a slash for consistency
    const cleanUrl = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;

    // If the URL already ends with /api, use it as is
    if (cleanUrl.endsWith('/api')) {
        return cleanUrl;
    }

    // Otherwise, append /api
    return `${cleanUrl}/api`;
};

export const API_BASE_URL = getApiBase();

export const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '2113e4598524f047f949bf052f838e31';
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
