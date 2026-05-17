import { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('ht_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  const _saveUser = (data) => {
    const userData = {
      id: data.id,
      name: data.name,
      email: data.email,
      profileComplete: data.profileComplete ?? true,
    };
    localStorage.setItem('ht_token', data.token);
    localStorage.setItem('ht_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials);
    // Regular login users always have complete profiles
    return _saveUser({ ...data, profileComplete: true });
  }, []);

  const loginWithGoogle = useCallback(async (idToken) => {
    const data = await authApi.googleLogin(idToken);
    return _saveUser(data);
  }, []);

  const register = useCallback(async (formData) => {
    await authApi.register(formData);
    const data = await authApi.login({ email: formData.email, password: formData.password });
    return _saveUser({ ...data, profileComplete: true });
  }, []);

  const markProfileComplete = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, profileComplete: true };
      localStorage.setItem('ht_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ht_token');
    localStorage.removeItem('ht_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithGoogle,
      register,
      logout,
      markProfileComplete,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
