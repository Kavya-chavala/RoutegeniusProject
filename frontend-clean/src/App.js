// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import HomePage from './pages/HomePage';
import { AuthProvider, useAuth } from './contexts/UserAuthContext';
import './index.css';

// PrivateRoute component to protect routes based on authentication and role
const PrivateRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="container">Loading application...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        alert('Access Denied. You do not have the required role.');
        if (user.role === 'ADMIN') {
            return <Navigate to="/admin-dashboard" replace />;
        } else if (user.role === 'USER') {
            return <Navigate to="/user-dashboard" replace />;
        }
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Main App component wrapping everything
function App() {
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && user) {
            const currentPath = window.location.pathname;
            if (currentPath === '/login' || currentPath === '/register' || currentPath === '/') {
                if (user.role === 'ADMIN') {
                    window.location.href = '/admin-dashboard';
                } else if (user.role === 'USER') {
                    window.location.href = '/user-dashboard';
                }
            }
        }
    }, [user, loading]);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route
                    path="/user-dashboard"
                    element={
                        <PrivateRoute roles={['USER', 'ADMIN']}>
                            <UserDashboardPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin-dashboard"
                    element={
                        <PrivateRoute roles={['ADMIN']}>
                            <AdminDashboardPage />
                        </PrivateRoute>
                    }
                />

                <Route path="*" element={<div className="container"><h2>404 - Page Not Found</h2><p><Link to="/">Go Home</Link></p></div>} />
            </Routes>
        </Router>
    );
}

function AppWrapper() {
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
}

export default AppWrapper;