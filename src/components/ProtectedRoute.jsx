import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useSelector((state) => state.auth);
    const location = useLocation();

    if (loading) {
        return <div className="loading">Checking authentication...</div>;
    }

    if (!isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to. This allows us to send them back to that page after they login.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
