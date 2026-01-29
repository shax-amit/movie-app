import { connectDatabase } from './database.js';
import Movie from './models/Movie.js';
import 'dotenv/config';

async function cleanup() {
    try {
        await connectDatabase();
        const titlesToDelete = ['Inception', 'The Dark Knight', 'Interstellar', 'Parasite'];

        console.log('🗑️ Deleting legacy movies:', titlesToDelete.join(', '));

        const result = await Movie.deleteMany({
            title: { $in: titlesToDelete },
            source: 'seed'
        });

        console.log(`✅ Deleted ${result.deletedCount} movies.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during cleanup:', err);
        process.exit(1);
    }
}

cleanup();
