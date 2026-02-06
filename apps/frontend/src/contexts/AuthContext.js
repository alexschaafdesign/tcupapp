// src/contexts/AuthContext.js
import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      const response = await fetch('/auth/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'XF-Api-Key': 'p3vmEGOs9kD-WpvBG_7R1N0Zhy1T715f'
        },
        body: JSON.stringify({ login: email, password }),
        credentials: 'include'
      });
      const data = await response.json();
      setUser(data);
      return data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;