import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDatabase, getDb } from './database.js';
import moviesRouter from './routes/movies.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Add JSON content type header middleware
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Initialize database (async)
initDatabase().catch((error) => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('Root endpoint requested');
  try {
    const response = {
      message: 'Movie API Server',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        movies: '/api/movies',
        movieById: '/api/movies/:id'
      }
    };
    console.log('Sending root response:', response);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(response);
  } catch (error) {
    console.error('Error in root endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Routes
app.use('/api/movies', moviesRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  try {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const response = { status: 'ok', message: 'Server is running' };
    console.log('Sending health response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error in health endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint with HTML
app.get('/test', (req, res) => {
  console.log('Test endpoint requested');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Server Test</title></head>
    <body>
      <h1>Server is Working!</h1>
      <p>If you see this, the server is responding correctly.</p>
      <p><a href="/api/movies">Click here to see movies JSON</a></p>
      <p><a href="/api/health">Click here for health check</a></p>
    </body>
    </html>
  `);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/movies`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
