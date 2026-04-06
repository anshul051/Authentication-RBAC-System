
import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios.js';

// Create the context
export const AuthContext = createContext(null);

// Provider component that wraps your app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start true (checking auth)

  // ─── Check if user is already logged in on page load ───
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Try to get profile (uses cookies automatically)
      const response = await api.get('/user/profile');
      setUser(response.data.data.user);
    } catch (error) {
      // Not logged in, that's fine
      console.log('Not authenticated:', error.message);
      setUser(null);
    } finally {
      setLoading(false); // Done checking
    }
  };

  // ─── Register ───────────────────────────────────────────
  const register = async (email, password, role) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      role,
    });
    return response.data;
  };

  // ─── Login ──────────────────────────────────────────────
  const login = async (email, password) => {

    const response = await api.post('/auth/login', {
      email,
      password,
    });

    // Set user data from login response
    setUser(response.data.data.user);
    return response.data;
  };

  // ─── Logout ─────────────────────────────────────────────
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null); // Clear user regardless
    }
  };

  // ─── Values available to all components ─────────────────
  const value = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user, // true if user exists
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};