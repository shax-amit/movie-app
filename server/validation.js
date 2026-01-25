/**
 * Server-side validation for movies
 * This ensures data integrity and security
 */

export function validateMovie(movie) {
  const errors = {};

  // Title validation
  if (!movie.title || typeof movie.title !== 'string') {
    errors.title = 'Title is required and must be a string';
  } else {
    const trimmedTitle = movie.title.trim();
    if (trimmedTitle.length < 3) {
      errors.title = 'Title must be at least 3 characters long';
    }
    if (trimmedTitle.length > 200) {
      errors.title = 'Title must be less than 200 characters';
    }
  }

  // Rating validation
  if (movie.rating === undefined || movie.rating === null) {
    errors.rating = 'Rating is required';
  } else {
    const rating = Number(movie.rating);
    if (isNaN(rating)) {
      errors.rating = 'Rating must be a number';
    } else if (rating < 1 || rating > 10) {
      errors.rating = 'Rating must be between 1 and 10';
    }
  }

  // Genre validation
  if (!movie.genre || typeof movie.genre !== 'string') {
    errors.genre = 'Genre is required and must be a string';
  } else {
    const trimmedGenre = movie.genre.trim();
    if (trimmedGenre.length < 2) {
      errors.genre = 'Genre must be at least 2 characters long';
    }
    if (trimmedGenre.length > 50) {
      errors.genre = 'Genre must be less than 50 characters';
    }
  }

  // Description validation (optional)
  if (movie.description !== undefined && movie.description !== null) {
    if (typeof movie.description !== 'string') {
      errors.description = 'Description must be a string';
    } else if (movie.description.length > 2000) {
      errors.description = 'Description must be less than 2000 characters';
    }
  }

  // ExternalId validation (optional)
  if (movie.externalId !== undefined && movie.externalId !== null) {
    if (typeof movie.externalId !== 'string' && typeof movie.externalId !== 'number') {
      errors.externalId = 'External ID must be a string or number';
    }
  }

  // PosterPath validation (optional)
  if (movie.posterPath !== undefined && movie.posterPath !== null) {
    if (typeof movie.posterPath !== 'string') {
      errors.posterPath = 'Poster path must be a string';
    }
  }

  // TrailerId validation (optional)
  if (movie.trailerId !== undefined && movie.trailerId !== null) {
    if (typeof movie.trailerId !== 'string') {
      errors.trailerId = 'Trailer ID must be a string';
    } else if (movie.trailerId.trim().length > 50) {
      errors.trailerId = 'Trailer ID must be less than 50 characters';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateMovieUpdate(movie) {
  const errors = {};

  // For updates, all fields are optional, but if provided, they must be valid

  if (movie.title !== undefined) {
    if (typeof movie.title !== 'string') {
      errors.title = 'Title must be a string';
    } else {
      const trimmedTitle = movie.title.trim();
      if (trimmedTitle.length < 3) {
        errors.title = 'Title must be at least 3 characters long';
      }
      if (trimmedTitle.length > 200) {
        errors.title = 'Title must be less than 200 characters';
      }
    }
  }

  if (movie.rating !== undefined) {
    const rating = Number(movie.rating);
    if (isNaN(rating)) {
      errors.rating = 'Rating must be a number';
    } else if (rating < 1 || rating > 10) {
      errors.rating = 'Rating must be between 1 and 10';
    }
  }

  if (movie.genre !== undefined) {
    if (typeof movie.genre !== 'string') {
      errors.genre = 'Genre must be a string';
    } else {
      const trimmedGenre = movie.genre.trim();
      if (trimmedGenre.length < 2) {
        errors.genre = 'Genre must be at least 2 characters long';
      }
      if (trimmedGenre.length > 50) {
        errors.genre = 'Genre must be less than 50 characters';
      }
    }
  }

  if (movie.description !== undefined && movie.description !== null) {
    if (typeof movie.description !== 'string') {
      errors.description = 'Description must be a string';
    } else if (movie.description.length > 2000) {
      errors.description = 'Description must be less than 2000 characters';
    }
  }

  if (movie.externalId !== undefined && movie.externalId !== null) {
    if (typeof movie.externalId !== 'string' && typeof movie.externalId !== 'number') {
      errors.externalId = 'External ID must be a string or number';
    }
  }

  if (movie.posterPath !== undefined && movie.posterPath !== null) {
    if (typeof movie.posterPath !== 'string') {
      errors.posterPath = 'Poster path must be a string';
    }
  }

  if (movie.trailerId !== undefined && movie.trailerId !== null) {
    if (typeof movie.trailerId !== 'string') {
      errors.trailerId = 'Trailer ID must be a string';
    } else if (movie.trailerId.trim().length > 50) {
      errors.trailerId = 'Trailer ID must be less than 50 characters';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
