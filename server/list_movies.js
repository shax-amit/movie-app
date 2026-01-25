import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const movieSchema = new mongoose.Schema({
    title: String,
    source: String,
    isFavorite: Boolean
});

const Movie = mongoose.model('Movie', movieSchema);

async function listMovies() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/movie-app';
        console.log('Connecting to:', MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        const movies = await Movie.find({});
        console.log('--- MOVIE LIST ---');
        movies.forEach(m => {
            console.log(`ID: ${m._id}, Title: ${m.title}, Source: ${m.source}, isFavorite: ${m.isFavorite}`);
        });
        console.log('------------------');
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

listMovies();
