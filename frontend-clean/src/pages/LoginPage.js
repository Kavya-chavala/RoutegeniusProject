// src/pages/LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/UserAuthContext';

function LoginPage() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        try {
            const response = await api.post('/auth/login', { identifier, password });
            login(response.data);
            setMessage({ text: 'Login successful!', type: 'success' });
            navigate('/');
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            setMessage({
                text: error.response?.data?.message || 'Login failed. Please check your credentials.',
                type: 'error'
            });
        }
    };

    return (
        <div className="container">
            <button onClick={() => navigate(-1)} className="back-button" style={{ alignSelf: 'flex-start' }}>&larr; Back</button>
            <h2>Login to RouteGenius</h2>
            <p style={{ color: '#8b949e', marginBottom: '30px' }}>Enter your credentials to access your dashboard.</p>
            <form onSubmit={handleSubmit}>
                <label htmlFor="identifier">Username or Email:</label>
                <input
                    type="text"
                    id="identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                />

                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">Login</button>
            </form>
            <p style={{ marginTop: '30px', color: '#8b949e' }}>Don't have an account? <Link to="/register">Register here</Link></p>
            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
        </div>
    );
}

export default LoginPage;