import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// DJANGO BACKEND INTEGRATION POINT
// This context manages authentication state and JWT tokens
// Backend API Endpoints needed:
// - POST /api/auth/login/ - Returns: { access_token: string, refresh_token: string, user: User }
// - POST /api/auth/logout/ - Returns: { message: string }
// - POST /api/auth/refresh/ - Returns: { access_token: string }
// - GET /api/auth/me/ - Returns: User object

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'staff' | 'tenant';
  avatar?: string;
  phone?: string;
  unitNumber?: string; // For tenants
  department?: string; // For staff
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored auth token on mount
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      // DJANGO BACKEND INTEGRATION POINT
      // Verify token validity with backend
      // API Call: GET /api/auth/me/
      // Headers: { Authorization: `Bearer ${token}` }
      // On success: setUser(response.data) and setIsAuthenticated(true)
      // On failure: clear localStorage and redirect to login
      
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // DJANGO BACKEND INTEGRATION POINT
    // API Call: POST /api/auth/login/
    // Request body: { email: string, password: string }
    // Response: { access_token: string, refresh_token: string, user: User }
    // Store tokens in localStorage
    // Django JWT authentication using djangorestframework-simplejwt
    
    try {
      // Mock implementation - Replace with actual API call
      const mockUsers = {
        'admin@skymall.com': {
          id: '1',
          email: 'admin@skymall.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin' as const,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
        },
        'staff@skymall.com': {
          id: '2',
          email: 'staff@skymall.com',
          firstName: 'Staff',
          lastName: 'Member',
          role: 'staff' as const,
          department: 'Operations',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Staff',
        },
        'tenant@skymall.com': {
          id: '3',
          email: 'tenant@skymall.com',
          firstName: 'John',
          lastName: 'Tenant',
          role: 'tenant' as const,
          unitNumber: 'A-105',
          phone: '+1 (555) 123-4567',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tenant',
        },
      };

      const mockUser = mockUsers[email as keyof typeof mockUsers];
      
      if (mockUser && password === 'password') {
        const mockToken = 'mock-jwt-token-' + Date.now();
        localStorage.setItem('authToken', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        setIsAuthenticated(true);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // DJANGO BACKEND INTEGRATION POINT
    // API Call: POST /api/auth/logout/
    // Headers: { Authorization: `Bearer ${token}` }
    // Clear tokens from localStorage
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // DJANGO BACKEND INTEGRATION POINT
      // API Call: PATCH /api/users/{user.id}/
      // Request body: userData (partial User object)
      // Headers: { Authorization: `Bearer ${token}` }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
