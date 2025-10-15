import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        // If no token is found, redirect to the login page
        return <Navigate to="/login" replace />;
    }

    return children; // If token is found, render the child component
};

export default ProtectedRoute;
