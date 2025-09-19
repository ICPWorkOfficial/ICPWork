'use client';

import { useState, useEffect } from 'react';

interface User {
  id?: string;
  email?: string;
  userType?: 'freelancer' | 'client' | string;
  sessionId?: string;
  expiresAt?: number;
  [key: string]: any;
}

interface LocalStorageAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => void;
}

export const useLocalStorageAuth = (): LocalStorageAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = () => {
    try {
      const storedUser = localStorage.getItem('ICP_USER');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.warn('Failed to parse stored user data:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    // Load user from localStorage on mount
    refreshUser();
    setIsLoading(false);

    // Listen for storage changes (e.g., from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ICP_USER') {
        refreshUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const isAuthenticated = user !== null && user.email !== undefined;

  return {
    user,
    isLoading,
    isAuthenticated,
    refreshUser
  };
};

export default useLocalStorageAuth;
