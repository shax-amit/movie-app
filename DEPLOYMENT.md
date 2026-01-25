# 🚀 Movie App - Deployment & Presentation Guide

This document contains everything you need to manage your live application and present it professionally.

## 🔗 Live URLs
- **Frontend (Website):** [https://movie-app-1-ityn.onrender.com](https://movie-app-1-ityn.onrender.com)
- **Backend (API):** [https://movie-app-41om.onrender.com](https://movie-app-41om.onrender.com)
- **API Health Check:** [https://movie-app-41om.onrender.com/api/health](https://movie-app-41om.onrender.com/api/health)

## 🛠️ Tech Stack
- **Frontend:** React (Vite), Redux Toolkit, Framer Motion, CSS3.
- **Backend:** Node.js, Express, MongoDB Atlas, JWT Authentication.
- **Data Source:** The Movie Database (TMDB) API.

## 🔑 Environment Variables (Production)
If you ever need to reset the service on Render, ensure these are set:

### Backend Service:
| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://amitisacks:Amitsa0503040@cluster0...` |
| `JWT_SECRET` | `my_super_secret_123!@#` |
| `PORT` | `3001` |

### Frontend (Static Site):
| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://movie-app-41om.onrender.com/api` |
| `VITE_TMDB_API_KEY` | `2113e4598524f047f949bf052f838e31` |

## 📁 Key Features to Present
1. **Full Auth System:** Demonstrate Registration and Login.
2. **Data Isolation:** Show how each user has their own private "My List".
3. **TMDB Integration:** Browse trending movies and search in real-time.
4. **Interactive UI:** Smooth animations using Framer Motion and responsive dark/light mode.
5. **Private Comments:** Each user can add their own "Personal Opinion" to movies in their list.

---
*Good luck with your presentation!* 🍿🏆
