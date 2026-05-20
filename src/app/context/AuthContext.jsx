import { createContext, useContext, useState, useEffect } from 'react';
import connection from '../connected/connection.js';

// Stores JWT tokens in sessionStorage:
//   'authToken'    — access token (7 days)
//   'refreshToken' — refresh token (30 days, auto-used by Axios on 401)
//   'user'         — cached user profile

const AuthContext = createContext(undefined);

// Auth provider component
export function AuthProvider({ children }) {
  // Initialize state directly from storage to prevent premature redirects in new tabs
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    return !!(token && storedUser);
  });

  const [loading, setLoading] = useState(false); // No longer strictly needed for initial load, but kept for background refreshes

  // Setup cross-tab listener to keep tabs in sync
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (['authToken', 'user', 'refreshToken'].includes(e.key)) {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Re-verify profile in background if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      connection.auth.getCurrentUser()
        .then(profile => {
          if (profile.status && profile.status !== 'active') {
            logout();
            return;
          }
          
          const updatedProfile = {
            ...profile,
            firstName: profile.firstName || profile.first_name || '',
            lastName: profile.lastName || profile.last_name || '',
          };
          
          setUser(updatedProfile);
          // Always keep localStorage in sync for shared session behavior
          localStorage.setItem('user', JSON.stringify(updatedProfile));
        })
        .catch(err => {
          if (err.message.includes('401') || err.message.includes('403')) {
            logout();
          }
        });
    }
  }, [isAuthenticated]);

  // Login: saves access token, refresh token, and user profile
  const login = async (email, password, rememberMe = true) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();
    const res = await connection.auth.login(cleanEmail, cleanPassword);

    const token = res.access;
    const refresh = res.refresh;
    const rawUser = res.user;

    const profile = {
      ...rawUser,
      firstName: rawUser.first_name,
      lastName: rawUser.last_name,
    };

    // To implement "Session Persistence" as requested, we use localStorage
    // so that opening new tabs or copying links keeps the user logged in.
    localStorage.setItem('authToken', token);
    localStorage.setItem('refreshToken', refresh);
    localStorage.setItem('user', JSON.stringify(profile));
    
    // Also keep in sessionStorage for backwards compatibility or specific per-tab needs
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('refreshToken', refresh);
    sessionStorage.setItem('user', JSON.stringify(profile));

    setUser(profile);
    setIsAuthenticated(true);
    return profile;
  };

  // Logout: clears all tokens and user data from all storages
  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
      if (refresh) {
        await connection.auth.logout(refresh);
      }
    } catch (err) {
      console.error("Logout API call failed", err);
    } finally {
      // Clear EVERYTHING to ensure all tabs log out
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
      
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Updates user in state and storage
  const updateUser = (userData) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, updateUser }}>
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