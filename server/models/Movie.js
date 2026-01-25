import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 200
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  genre: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: null
  },
  trailerId: {
    type: String,
    trim: true,
    maxlength: 50,
    default: null
  },
  source: {
    type: String,
    enum: ['seed', 'user'],
    default: 'user'
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better search performance
movieSchema.index({ title: 'text', description: 'text' });
movieSchema.index({ genre: 1 });
movieSchema.index({ source: 1 });

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;
