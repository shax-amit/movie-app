# 🎬 Movie Discovery & Collection App

A full-stack React application for movie enthusiasts to discover, track, and manage their personal cinema collection. Built with modern web technologies, this platform integrates real-time data from TMDB and provides a seamless user experience for managing a private movie library.

## ✨ Features

- **Dynamic Discovery:** Explore trending and popular movies fetched directly from The Movie Database (TMDB) API.
- **Personal Collection (CRUD):** Add, edit, and remove movies from your personal list with full persistent storage.
- **Intelligent Search:** Real-time search with debouncing for a smooth exploration experience.
- **Smart Favorites:** "My List" functionality with heart-toggle persistence.
- **Responsive UI:** Fully responsive design using modern CSS and Framer Motion for elegant animations.
- **Theme Support:** Dark and Light mode options with automatic persistence.
- **Secure Architecture:** JWT-based authentication with protected routes for private collections.

## 🛠️ Technology Stack

### Frontend
- **React 19:** Functional components with Hooks.
- **Redux Toolkit:** Global state management for authentication and favorites.
- **React Router:** Sophisticated routing with protected access control.
- **Framer Motion:** High-performance UI animations and transitions.
- **Context API:** Dedicated Theme management.

### Backend
- **Node.js & Express:** Robust RESTful API architecture.
- **MongoDB & Mongoose:** Scalable NoSQL database with strict schema validation.
- **JWT & Bcrypt:** Secure user authentication and password hashing.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- TMDB API Key (Optional for Explore features)

### Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env` (refer to `.env.example`).
4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup
1. From the project root, install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📐 Architecture Highlights

- **Custom Hooks:** Clean separation of concerns using `useApi`, `useMovies`, `useLocalStorage`, and `useDebounce`.
- **Validation:** Multi-layer validation (Frontend forms + Backend Mongoose schemas).
- **Security:** Token-based authorization ensures users can only access their personal data.
- **Performance:** Efficient state updates and optimized API calls.

---
*Created as a final project for modern web development.*
