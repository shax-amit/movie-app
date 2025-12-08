# Movie Website Project (HW1)

This is a React application for managing and viewing movies, created as part of the "Methods in Web Development" course.

## Project Structure & Pages

The application consists of 3 main pages, corresponding to the assignment requirements:

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
- React Router DOM
- CSS (Custom styling)
