// src/contexts/UserAuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');
        const email = localStorage.getItem('email');
        const role = localStorage.getItem('role');
        const firstName = localStorage.getItem('firstName');
        const lastName = localStorage.getItem('lastName');

        if (token && userId && username && email && role) {
            setUser({ id: userId, username, email, role, token, firstName, lastName });
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        localStorage.setItem('jwtToken', userData.jwt);
        localStorage.setItem('userId', userData.userId);
        localStorage.setItem('username', userData.username);
        localStorage.setItem('email', userData.email);
        localStorage.setItem('role', userData.role);
        localStorage.setItem('firstName', userData.firstName || '');
        localStorage.setItem('lastName', userData.lastName || '');

        setUser({
            id: userData.userId,
            username: userData.username,
            email: userData.email,
            role: userData.role,
            token: userData.jwt,
            firstName: userData.firstName || '',
            lastName: userData.lastName || ''
        });
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    const updateUserContext = (updatedUserData) => {
        if (user) {
            const newUser = { ...user, ...updatedUserData };
            localStorage.setItem('username', newUser.username);
            localStorage.setItem('email', newUser.email);
            localStorage.setItem('firstName', newUser.firstName || '');
            localStorage.setItem('lastName', newUser.lastName || '');
            setUser(newUser);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUserContext }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);