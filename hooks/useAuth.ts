import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { useLocalStorage } from './useLocalStorage';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

// Global variable for simple auth state without complex providers everywhere if not needed
// But a hook is better with Context if we wrap the app
let currentUserState: User | null = null;
let listeners: ((user: User | null) => void)[] = [];

function notifyListeners() {
  listeners.forEach(listener => listener(currentUserState));
}

export function useAuth() {
  const [user, setUser] = useLocalStorage<User | null>('kidsweb_user', null);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return { user, login, logout, setUser };
}
