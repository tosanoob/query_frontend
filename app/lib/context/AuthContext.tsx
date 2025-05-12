'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout, TokenResponse } from '@/app/lib/api/auth';

interface User {
  id: string;
  username: string;
  role: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Function to hash password with SHA-256
async function hashPassword(password: string): Promise<string> {
  // Convert the string to an ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  // Generate the hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert the ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for token in localStorage on initial load
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse user from localStorage', err);
        // Clear corrupt data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Hash the password with SHA-256 before sending to API
      const hashedPassword = await hashPassword(password);
      
      const response: TokenResponse = await apiLogin({ 
        username, 
        password: hashedPassword 
      });
      
      const userData: User = {
        id: response.user_id,
        username: response.username,
        role: response.role,
      };
      
      setUser(userData);
      setToken(response.access_token);
      
      // Store authentication data in localStorage
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      setError((err as Error).message || 'Login failed');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      if (token) {
        await apiLogout(token);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Always clear local state, even if API call fails
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoading(false);
    }
  };

  const isAuthenticated = !!user && !!token;
  const isAdmin = isAuthenticated && user?.role === 'admin';

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        isAuthenticated, 
        isAdmin,
        login, 
        logout, 
        isLoading, 
        error 
      }}
    >
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