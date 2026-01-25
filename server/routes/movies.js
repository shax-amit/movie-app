import express from 'express';
import { getDb } from '../database.js';
import { validateMovie, validateMovieUpdate } from '../validation.js';

const router = express.Router();

// GET /api/movies - Get all movies
router.get('/', async (req, res, next) => {
  try {
    console.log('GET /api/movies - Request received');
    const db = getDb();
    const { search, genre, source } = req.query;

    const filters = {};
    if (search) filters.search = search;
    if (genre) filters.genre = genre;
    if (source) filters.source = source;

    const movies = await db.getAll(filters);
    console.log(`Found ${movies.length} movies`);
    
    console.log('Sending response with', movies.length, 'movies');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(movies);
  } catch (error) {
    console.error('Error in GET /api/movies:', error);
    next(error);
  }
});

// GET /api/movies/:id - Get a single movie
router.get('/:id', async (req, res, next) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const movie = await db.getById(id);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(movie);
  } catch (error) {
    next(error);
  }
});

// POST /api/movies - Create a new movie
router.post('/', async (req, res, next) => {
  try {
    const db = getDb();
    const movieData = req.body;

    // Validate input
    const validation = validateMovie(movieData);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: validation.errors
      });
    }

    // Create movie
    const newMovie = await db.create({
      title: movieData.title.trim(),
      rating: movieData.rating,
      genre: movieData.genre.trim(),
      description: movieData.description?.trim() || null,
      trailerId: movieData.trailerId?.trim() || null,
      source: movieData.source || 'user'
    });

    res.status(201).json(newMovie);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    next(error);
  }
});

// PUT /api/movies/:id - Update a movie
router.put('/:id', async (req, res, next) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const movieData = req.body;

    // Check if movie exists
    const existing = await db.getById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Validate input (for updates, all fields are optional)
    const validation = validateMovieUpdate(movieData);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: validation.errors
      });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (movieData.title !== undefined) {
      updateData.title = movieData.title.trim();
    }
    if (movieData.rating !== undefined) {
      updateData.rating = movieData.rating;
    }
    if (movieData.genre !== undefined) {
      updateData.genre = movieData.genre.trim();
    }
    if (movieData.description !== undefined) {
      updateData.description = movieData.description?.trim() || null;
    }
    if (movieData.trailerId !== undefined) {
      updateData.trailerId = movieData.trailerId?.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Update movie
    const updatedMovie = await db.update(id, updateData);
    if (!updatedMovie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json(updatedMovie);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    next(error);
  }
});

// DELETE /api/movies/:id - Delete a movie
router.delete('/:id', async (req, res, next) => {
  try {
    const db = getDb();
    const { id } = req.params;

    // Check if movie exists
    const movie = await db.getById(id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Don't allow deleting seed movies
    if (movie.source === 'seed') {
      return res.status(403).json({ error: 'Cannot delete seed movies' });
    }

    // Delete movie
    const deleted = await db.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.status(204).send();
  } catch (error) {
    if (error.message === 'Cannot delete seed movies') {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
});

export default router;
