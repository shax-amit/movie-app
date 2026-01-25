import mongoose from 'mongoose';
import Movie from './models/Movie.js';

let isConnected = false;

// Seed movies data - Empty as we migrated to TMDB
const SEED_MOVIES = [];

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

    // Run migrations and seed
    await runDatabaseMigrations();
    await seedDatabase();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Run necessary database migrations (indexes, cleanups)
 */
async function runDatabaseMigrations() {
  try {
    const collection = Movie.collection;
    const indexes = await collection.indexes();

    // 1. Handle legacy unique index
    const hasOldIndex = indexes.some(idx => idx.name === 'externalId_1_userId_1');
    if (hasOldIndex) {
      console.log('🔄 Dropping legacy movie unique index...');
      await collection.dropIndex('externalId_1_userId_1');
    }

    // 2. Ensure partial unique index exists
    const hasNewIndex = indexes.some(idx => idx.name === 'externalId_1_userId_1_partial');
    if (!hasNewIndex) {
      console.log('✨ Creating partial unique index for externalId + userId...');
      await collection.createIndex(
        { externalId: 1, userId: 1 },
        {
          unique: true,
          partialFilterExpression: { externalId: { $type: "string" } },
          name: 'externalId_1_userId_1_partial'
        }
      );
    }

    // 3. Cleanup existing nulls
    const result = await Movie.updateMany(
      { externalId: null },
      { $unset: { externalId: "" } }
    );
    if (result.modifiedCount > 0) {
      console.log(`🧹 Cleaned up ${result.modifiedCount} movies with null externalId`);
    }
  } catch (error) {
    console.warn('⚠️ Database migration warning:', error.message);
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

        // Filter by user ID if provided
        if (filters.userId) {
          query.userId = filters.userId;
        }

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

        /* if (movie.source === 'seed') {
          throw new Error('Cannot delete seed movies');
        } */

        await Movie.findByIdAndDelete(id);
        return true;
      } catch (error) {
        console.error('Error deleting movie:', error);
        throw error;
      }
    }
  };
}
