import mongoose from 'mongoose';
import Movie from './models/Movie.js';

let isConnected = false;

// Seed movies data
const SEED_MOVIES = [
  {
    title: 'Inception',
    rating: 9,
    genre: 'Sci-Fi',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
    trailerId: 'YoHD9XEInc0',
    source: 'seed'
  },
  {
    title: 'The Dark Knight',
    rating: 10,
    genre: 'Action',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham.',
    trailerId: 'EXeTwQWrcwY',
    source: 'seed'
  },
  {
    title: 'Interstellar',
    rating: 8.5,
    genre: 'Sci-Fi',
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    trailerId: 'zSWdZVtXT7E',
    source: 'seed'
  },
  {
    title: 'Parasite',
    rating: 9.5,
    genre: 'Drama',
    description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    trailerId: '5xH0HfJHsaY',
    source: 'seed'
  }
];

/**
 * Connect to MongoDB
 */
export async function connectDatabase() {
  if (isConnected) {
    console.log('✅ Already connected to MongoDB');
    return;
  }

  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-app';
    
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('✅ Connected to MongoDB');
    
    // Seed database if empty
    await seedDatabase();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Seed database with initial movies if empty
 */
async function seedDatabase() {
  try {
    const count = await Movie.countDocuments();
    
    if (count === 0) {
      console.log('📦 Seeding database with initial movies...');
      await Movie.insertMany(SEED_MOVIES);
      console.log('✅ Database seeded with', SEED_MOVIES.length, 'movies');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

/**
 * Initialize database connection
 */
export async function initDatabase() {
  await connectDatabase();
  console.log('✅ Database initialized');
}

/**
 * Get database operations object
 */
export function getDb() {
  if (!isConnected) {
    throw new Error('Database not connected. Call initDatabase() first.');
  }

  return {
    // Get all movies with optional filters
    getAll: async (filters = {}) => {
      try {
        const query = {};

        // Search filter (title or description)
        if (filters.search) {
          query.$or = [
            { title: { $regex: filters.search, $options: 'i' } },
            { description: { $regex: filters.search, $options: 'i' } }
          ];
        }

        // Genre filter
        if (filters.genre) {
          query.genre = filters.genre;
        }

        // Source filter
        if (filters.source) {
          query.source = filters.source;
        }

        const movies = await Movie.find(query).sort({ createdAt: -1 });
        return movies;
      } catch (error) {
        console.error('Error getting movies:', error);
        throw error;
      }
    },

    // Get movie by ID
    getById: async (id) => {
      try {
        const movie = await Movie.findById(id);
        return movie;
      } catch (error) {
        console.error('Error getting movie by ID:', error);
        return null;
      }
    },

    // Create new movie
    create: async (movieData) => {
      try {
        const movie = new Movie(movieData);
        await movie.save();
        return movie;
      } catch (error) {
        console.error('Error creating movie:', error);
        throw error;
      }
    },

    // Update movie
    update: async (id, movieData) => {
      try {
        const movie = await Movie.findByIdAndUpdate(
          id,
          { ...movieData, updatedAt: new Date() },
          { new: true, runValidators: true }
        );
        return movie;
      } catch (error) {
        console.error('Error updating movie:', error);
        throw error;
      }
    },

    // Delete movie
    delete: async (id) => {
      try {
        // Check if movie exists and is not a seed movie
        const movie = await Movie.findById(id);
        if (!movie) {
          return false;
        }

        if (movie.source === 'seed') {
          throw new Error('Cannot delete seed movies');
        }

        await Movie.findByIdAndDelete(id);
        return true;
      } catch (error) {
        console.error('Error deleting movie:', error);
        throw error;
      }
    }
  };
}
