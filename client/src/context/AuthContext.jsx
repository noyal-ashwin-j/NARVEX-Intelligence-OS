import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          setAuthToken(null);
        }
      } catch (err) {
        console.warn('Auth session check failed:', err.message);
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (username, password, totpCode) => {
    setError(null);
    try {
      const res = await api.login(username, password, totpCode);
      if (res.success) {
        setAuthToken(res.token);
        localStorage.setItem('narvex_session_id', res.sessionId);
        localStorage.setItem('narvex_refresh_token', res.refreshToken);
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    const sessionId = localStorage.getItem('narvex_session_id');
    try {
      if (sessionId) await api.logout(sessionId);
    } catch (err) {
      console.warn('Server logout failed:', err.message);
    }
    setAuthToken(null);
    localStorage.removeItem('narvex_session_id');
    localStorage.removeItem('narvex_refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
