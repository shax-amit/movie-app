# 🚀 Deployment Guide

This application is designed for easy deployment across modern cloud platforms. Follow the instructions below to host the Movie Discovery & Collection App.

## 🔗 Live Implementation
The current production version is hosted at:
- **Frontend:** [https://movie-app-1-ityn.onrender.com](https://movie-app-1-ityn.onrender.com)
- **API Server:** [https://movie-app-api-b29s.onrender.com](https://movie-app-api-b29s.onrender.com)

## 📦 Deployment Process

### 1. Backend (Server)
The backend is a Node.js Express server.
- **Platform:** Render / Heroku / DigitalOcean.
- **Required Variables:**
  - `MONGODB_URI`: Connection string for MongoDB Atlas.
  - `JWT_SECRET`: Secure string for token signing.
  - `PORT`: Usually 10000 on Render.

### 2. Frontend (Client)
The frontend is a Vite-based React app.
- **Platform:** Vercel / Netlify / Render Static.
- **Required Variables:**
  - `VITE_API_URL`: The full URL of your deployed backend.
  - `VITE_TMDB_API_KEY`: Your TMDB API key.

## 🛠️ Maintenance & Monitoring
- **Database:** Managed via MongoDB Atlas console.
- **API Health:** Check `/api/health` endpoint for server status.
- **Client Logs:** Use browser developer tools to monitor frontend performance and API communication.
