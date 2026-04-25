import { createContext, useContext, useState, useEffect } from 'react';
import connection from '../connected/connection.js';

// Stores JWT tokens in sessionStorage:
//   'authToken'    — access token (7 days)
//   'refreshToken' — refresh token (30 days, auto-used by Axios on 401)
//   'user'         — cached user profile

const AuthContext = createContext(undefined);

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // On mount: restore auth state from sessionStorage (persists per tab)
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const storedUser = sessionStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);

      // Re-fetch profile in background to get latest data
      connection.auth.getCurrentUser()
        .then(profile => {
          const updatedProfile = {
            ...profile,
            firstName: profile.firstName || profile.first_name || '',
            lastName: profile.lastName || profile.last_name || '',
          };
          setUser(updatedProfile);
          sessionStorage.setItem('user', JSON.stringify(updatedProfile));
        })
        .catch(err => console.error("Failed to refresh user profile", err));
    }
  }, []);

  // Login: saves access token (7d), refresh token (30d), and user profile
  const login = async (email, password) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();
    const res = await connection.auth.login(cleanEmail, cleanPassword);

    const token = res.access;    // access token — 7 days
    const refresh = res.refresh;  // refresh token — 30 days
    const rawUser = res.user;

    const profile = {
      ...rawUser,
      firstName: rawUser.first_name,
      lastName: rawUser.last_name,
    };

    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('refreshToken', refresh);
    sessionStorage.setItem('user', JSON.stringify(profile));

    setUser(profile);
    setIsAuthenticated(true);
    return profile;
  };

  // Logout: clears all tokens and user data from sessionStorage
  const logout = async () => {
    try {
      const refresh = sessionStorage.getItem('refreshToken');
      if (refresh) {
        await connection.auth.logout(refresh);
      }
    } catch (err) {
      console.error("Logout API call failed", err);
    } finally {
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Updates user in state and sessionStorage (e.g. after profile edit)
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