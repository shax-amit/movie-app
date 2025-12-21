# Movie Website Project (HW1 & HW2)

This is a React application for managing and viewing movies, created as part of the "Methods in Web Development" course.

## Routing (React Router)

The application uses React Router for navigation between pages. All routes are defined in `src/App.jsx`:

- **`/`** → Home Page - Displays user's movie list and favorites
- **`/form`** → Form Page - Add new movies/reviews
- **`/api`** → API Page - Browse movies from Studio Ghibli API
- **`/*`** (any other path) → 404 Not Found Page - Shows error message for unknown routes

Navigation is handled through the `Navbar` component using React Router's `<Link>` components, which update the URL without page reload.

## Global State (React Context)

The application uses **FavoritesContext** to manage favorite movies globally across all components.

### Context Details

- **File:** `src/context/FavoritesContext.jsx`
- **What it stores:** An array of favorite movie objects
- **Storage:** Favorites are persisted in `localStorage` (key: `movie-favorites`)

### Context API

The context provides the following functions and data:

- `favorites` - Array of favorite movie objects
- `favoritesCount` - Number of favorites (for display)
- `addFavorite(movie)` - Add a movie to favorites
- `removeFavorite(movieId)` - Remove a movie from favorites
- `isFavorite(movieId)` - Check if a movie is already favorited
- `toggleFavorite(movie)` - Toggle favorite status (add/remove)

### Usage in Components

1. **API Page (`src/pages/ApiPage.jsx`):**
   - Each movie card has a star button (☆/⭐) to add/remove from favorites
   - Shows visual feedback when a movie is favorited
   - Uses `toggleFavorite()` and `isFavorite()` functions

2. **Home Page (`src/pages/Home.jsx`):**
   - Displays a "⭐ My Favorites" section at the top (when favorites exist)
   - Shows all favorited movies with ability to remove them
   - Uses `favorites` array and `removeFavorite()` function

3. **Navbar (`src/components/Navbar.jsx`):**
   - Displays favorites count badge: "⭐ Favorites (X)" when count > 0
   - Uses `favoritesCount` from context

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

3.  **API Page (External Data)**
    - **File:** `src/pages/ApiPage.jsx`
    - **Description:** Fetches and displays movie data from the Studio Ghibli public API.
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

1.  **Install Dependencies:**

    ```bash
    npm install
    ```

2.  **Start Development Server:**

    ```bash
    npm run dev
    ```

3.  **Open in Browser:**
    Navigate to the URL shown in the terminal (usually `http://localhost:5173`).

## Technologies Used

- React
- Vite
- React Router DOM (for routing)
- React Context API (for global state management)
- CSS (Custom styling)
- localStorage (for persisting favorites)
