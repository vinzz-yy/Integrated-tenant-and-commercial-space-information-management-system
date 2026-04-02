import { createContext, useContext, useState, useEffect } from 'react';
import connection from '../connected/connection.js';

const AuthContext = createContext(undefined);

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check stored auth on mount
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const storedUser = sessionStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Login user
  const login = async (email, password) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();
    const res = await connection.auth.login(cleanEmail, cleanPassword);
    const token = res.access;
    const rawUser = res.user;
    const profile = {
      ...rawUser,
      firstName: rawUser.first_name,
      lastName: rawUser.last_name,
    };
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('user', JSON.stringify(profile));
    setUser(profile);
    setIsAuthenticated(true);
    return profile;
  };

  // Logout user
  const logout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user data
  const updateUser = (userData) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Use auth hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}