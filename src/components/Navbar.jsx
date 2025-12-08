import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <img src="/movie.svg" alt="Movie logo" className="nav-logo" />
        Movie App
      </div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/form">Add Movie</Link>
        <Link to="/api">External API</Link>
      </div>
    </nav>
  );
}
