import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/MovieApp_DB';

async function fixIndexes() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        const collection = mongoose.connection.collection('movies');

        console.log('Checking indexes...');
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes.map(i => i.name));

        if (indexes.some(i => i.name === 'externalId_1')) {
            console.log('Dropping legacy index: externalId_1...');
            await collection.dropIndex('externalId_1');
            console.log('Legacy index dropped successfully!');
        } else {
            console.log('Legacy index externalId_1 not found. Nothing to drop.');
        }

        console.log('Done! You can now restart your server.');
        process.exit(0);
    } catch (err) {
        console.error('Error fixing indexes:', err);
        process.exit(1);
    }
}

fixIndexes();
