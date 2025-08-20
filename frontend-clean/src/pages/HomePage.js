// src/pages/HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/UserAuthContext'; // Keeping this as per your file structure

function HomePage() {
    const navigate = useNavigate();
    const { user, isAuthenticated, loading } = useAuth(); // Assuming useAuth provides user object and isAuthenticated state

    // Determine if the user is already logged in to redirect them
    if (!loading && isAuthenticated) {
        if (user?.role === 'ADMIN') {
            navigate('/admin-dashboard');
        } else if (user?.role === 'USER') {
            navigate('/user-dashboard');
        }
    }

    const handleLogin = (role) => {
        // This will be handled by the login page, but we can pass the role as a query parameter if needed
        navigate(`/login?role=${role}`);
    };

    if (loading) {
        return <div className="loading-spinner">Loading...</div>; // A placeholder for loading state
    }

    return (
        <div className="container home-page">
            <h1 style={{ marginBottom: '10px' }}>Welcome to RouteGenius</h1>
            <p className="tagline">Efficient Logistics & Delivery Management Solution</p>

            <div className="role-selection">
                <div className="role-option" onClick={() => handleLogin('USER')}>
                    
                    <h3>User Login</h3>
                    <p>Access your personal dashboard and manage your profile.</p>
                    <button className="main-login-button">Continue as User</button>
                </div>

                <div className="role-option" onClick={() => handleLogin('ADMIN')}>
                    
                    <h3>Admin Login</h3>
                    <p>Manage users, roles, and system settings.</p>
                    <button className="main-login-button secondary-button">Continue as Admin</button>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
