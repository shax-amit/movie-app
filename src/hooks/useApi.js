import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for API calls
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @returns {object} - { data, loading, error, refetch }
 */
export function useApi(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchOptions = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };

      // Check if URL is valid or if it contains 'undefined' (common TMDB issue)
      if (!url || url.includes('api_key=undefined')) {
        console.warn('API call skipped: URL is invalid or TMDB key is missing.');
        setLoading(false);
        return;
      }

      console.log('useApi fetching:', url);
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('API 401: Unauthorized. This is expected for some routes if not logged in.');
          setData(null);
          setLoading(false);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [url]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}
