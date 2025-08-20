// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api'; // Your backend API base URL

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add JWT token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwtToken'); // Get token from local storage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;