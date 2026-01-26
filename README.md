# Movie Website Project (HW1 & HW2)

This is a React application for managing and viewing movies, created as part of the "Methods in Web Development" course.

## Routing (React Router)

The application uses React Router for navigation between pages. All routes are defined in `src/App.jsx`:

- **`/`** → Home Page - Displays movie collections and trending movies.
- **`/form`** → Add Movie Page - Add new movies to your collection.
- **`/api`** → Explore Page - Browse and search for movies from the TMDB API.
- **`/my-list`** → My List Page - Displays your favorited movies (Require Login).
- **`/login` / `/signup`** → Authentication pages.
- **`/*`** (any other path) → 404 Not Found Page - Shows a themed error message for unknown routes.

Navigation is handled through the `Navbar` component using React Router's `<Link>` and `<NavLink>` components.

## Global State

The application uses a combination of **Redux Toolkit** and the **React Context API** for state management.

### React Context API (HW2 Requirement)

- **ThemeContext:** Located in `src/context/ThemeContext.jsx`. It manages the application's visual theme (Light/Dark mode) and persists the choice in `localStorage`.
- **Usage:** Used in `Navbar.jsx` (to toggle) and `ThemeContext.jsx` itself (to apply the theme to the document root).

### Redux Toolkit (Advanced State)

- **Favorites Slice:** Manages the user's favorite movies list.
- **Auth Slice:** Manages user authentication state and session.
- **Persistence:** Favorites and auth tokens are persisted in `localStorage`.

## Project Structure & Pages

The application consists of 4 main pages:

1.  **Home Page (Movie List)**

    - **File:** `src/pages/Home.jsx`
    - **Description:** Displays a list of movies. Includes a search bar to filter movies by title or genre. Uses `useState` for state management and renders a list using `.map()`.
    - **Child Component:** Uses `src/components/MovieCard.jsx` to display individual movie details via props.

2.  **Form Page (Add Movie)**

    - **File:** `src/pages/FormPage.jsx`
    - **Description:** A form to add a new movie/review. Includes inputs for Title, Rating, Genre, and Review.
    - **Features:**
      - Controlled components using `useState`.
      - Validation: Title must be at least 3 characters, Rating must be a number between 1-10.
      - Displays error messages for invalid inputs.
      - Logs data to the console on successful submission.

3.  **Explore Page (External Data)**
    - **File:** `src/pages/ApiPage.jsx`
    - **Description:** Fetches and displays real-time movie data from **The Movie Database (TMDB) API**.
    - **Features:**
      - Handles Loading and Error states.
      - Renders fetched data in a grid layout.
      - **Add to Favorites:** Each movie has a star button to add/remove from favorites (uses Context).

4.  **Not Found Page (404)**
    - **File:** `src/pages/NotFound.jsx`
    - **Description:** Displays a 404 error page for unknown routes.
    - **Features:**
      - Shows friendly error message.
      - Link to return to home page.

## How to Run

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

### Backend Server Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install MongoDB:**
   - **Option 1: Local MongoDB**
     - Download and install from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
     - Start MongoDB service (usually runs automatically on Windows)
   - **Option 2: MongoDB Atlas (Cloud - Free)**
     - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
     - Create a free cluster
     - Get your connection string

3. **Install server dependencies:**
   ```bash
   cd server
   npm install
   ```

4. **Configure environment variables:**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=3001
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/movie-app
   ```
   For MongoDB Atlas, use your connection string:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/movie-app
   ```

5. **Start the server:**
   ```bash
   npm start
   # Or for development with auto-reload:
   npm run dev
   ```

   The server will run on `http://localhost:3001` by default.

4. **Database Setup (MongoDB):**
   - Install MongoDB locally or use MongoDB Atlas (cloud)
   - Create a `.env` file in the `server` directory:
     ```env
     MONGODB_URI=mongodb://localhost:27017/movie-app
     ```
   - Or for MongoDB Atlas:
     ```env
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/movie-app
     ```
   - The database will be created automatically on first run
   - Initial seed data (4 movies) will be added automatically if database is empty

### Frontend Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set Environment Variables (Optional):**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

4. **Open in Browser:**
   Navigate to the URL shown in the terminal (usually `http://localhost:5173`).

### Running Both Servers

You need to run both the backend server and frontend dev server simultaneously:

**Terminal 1 (Backend):**
```bash
cd server
npm start
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

## API Endpoints

The server provides the following REST API endpoints:

- `GET /api/movies` - Get all movies (supports query params: `?search=term&genre=Action&source=user`)
- `GET /api/movies/:id` - Get a single movie by ID
- `POST /api/movies` - Create a new movie
- `PUT /api/movies/:id` - Update a movie
- `DELETE /api/movies/:id` - Delete a movie (cannot delete seed movies)
- `GET /api/health` - Health check endpoint

### Example API Request

```javascript
// Create a movie
POST http://localhost:3001/api/movies
Content-Type: application/json

{
  "title": "The Matrix",
  "rating": 9.5,
  "genre": "Sci-Fi",
  "description": "A computer hacker learns about the true nature of reality."
}
```

## Database Schema

MongoDB stores movies in a `movies` collection with the following schema:

- `id` (TEXT, PRIMARY KEY) - Unique identifier
- `title` (TEXT, NOT NULL) - Movie title
- `rating` (REAL, NOT NULL) - Rating between 1-10
- `genre` (TEXT, NOT NULL) - Movie genre
- `description` (TEXT) - Movie description
- `trailerId` (TEXT) - YouTube trailer ID
- `source` (TEXT) - 'seed' or 'user'
- `createdAt` (DATETIME) - Creation timestamp
- `updatedAt` (DATETIME) - Last update timestamp

## Technologies Used

### Frontend
- React 19
- Vite (build tool)
- React Router DOM (for routing)
- Redux Toolkit (for state management)
- React Context API (for favorites)
- Framer Motion (for animations)
- Custom Hooks (useApi, useDebounce, useLocalStorage, useMovies)

### Backend
- Node.js
- Express.js (web framework)
- MongoDB with Mongoose (database)
- CORS (for cross-origin requests)
- dotenv (for environment variables)

### Features
- **React Portals (L6):** Modals are rendered outside the main app hierarchy for better accessibility and styling.
- **useRef (L6):** Professional focus management in forms and modals.
- **Unit Testing (L10):** Logic verification with automated tests (see `src/utils/tmdbGenres.test.js`).
- Server-side validation
- Full CRUD operations (Create, Read, Update, Delete)
- Global State with Redux Toolkit
- Custom Hooks (useApi, useMovies, etc.)
- Rich UI with Framer Motion animations
- Dark/Light mode support
- Responsive design
