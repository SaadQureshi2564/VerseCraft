// frontend/src/context/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import API from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const loadUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Assuming user data is stored in localStorage during login/signup
                const userData = JSON.parse(localStorage.getItem('user'));
                setUser(userData);
            } catch (error) {
                console.error(error);
                setUser(null);
            }
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    const login = (userData) => {
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
