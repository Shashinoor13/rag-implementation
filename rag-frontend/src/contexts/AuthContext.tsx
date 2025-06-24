import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authActions } from '../actions';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  userId: string | null;
  login: (username: string, userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );
  const [username, setUsername] = useState<string | null>(
    localStorage.getItem('username')
  );
  const [userId, setUserId] = useState<string | null>(
    localStorage.getItem('user_id')
  );

  const login = (username: string, user_id: string) => {
    setIsAuthenticated(true);
    setUsername(username);
    setUserId(user_id);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('username', username);
    localStorage.setItem('user_id', user_id);
  };

  const logout = async () => {
    try {
      await authActions.logout();
      setIsAuthenticated(false);
      setUsername(null);
      setUserId(null);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('username');
      localStorage.removeItem('user_id');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
} 