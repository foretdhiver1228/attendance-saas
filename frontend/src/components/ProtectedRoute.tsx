import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../utils/jwt';

interface ProtectedRouteProps {
    children: JSX.Element;
    adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
    const { isLoggedIn, isAdmin } = useAuth();

    if (!isLoggedIn) {
        // If not logged in, redirect to the login page
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin) {
        // If the route is for admins only and the user is not an admin, redirect to home
        return <Navigate to="/" replace />;
    }

    return children; // If authorized, render the child component
};

export default ProtectedRoute;
