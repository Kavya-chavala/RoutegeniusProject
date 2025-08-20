// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';


function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (formData.password !== formData.confirmPassword) {
            setMessage({ text: 'Passwords do not match.', type: 'error' });
            return;
        }

        try {
            const response = await api.post('/auth/register', {
                firstName: formData.firstName,
                lastName: formData.lastName,
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            setMessage({ text: response.data || 'Registration successful! You can now log in.', type: 'success' });
            setFormData({
                firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: ''
            });
        } catch (error) {
            console.error('Registration error:', error.response?.data || error.message);
            setMessage({
                text: error.response?.data || 'Registration failed. Please try again with different details.',
                type: 'error'
            });
        }
    };

    return (
        <div className="container">
            <button onClick={() => navigate(-1)} className="back-button" style={{ alignSelf: 'flex-start' }}>&larr; Back</button>
            <h2>Register for RouteGenius</h2>
            <p style={{ color: '#8b949e', marginBottom: '30px' }}>Create your new account.</p>
            <form onSubmit={handleSubmit}>
                <label htmlFor="firstName">First Name:</label>
                <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />

                <label htmlFor="lastName">Last Name:</label>
                <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />

                <label htmlFor="username">Username:</label>
                <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required />

                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />

                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />

                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />

                <button type="submit">Register</button>
            </form>
            <p style={{ marginTop: '30px', color: '#8b949e' }}>Already have an account? <Link to="/login">Login here</Link></p>
            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
        </div>
    );
}

export default RegisterPage;