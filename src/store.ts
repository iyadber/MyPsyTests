import { create } from 'zustand';

export interface User {
  uid: string;
  displayName: string;
  email: string | null;
  role: 'user' | 'specialist' | 'psychologist' | 'admin';
  createdAt: number;
  age?: number;
  gender?: 'male' | 'female';
}

export interface Clinic {
  id: string;
  psychologistId: string;
  name: string;
  wilaya: string;
  address: string;
  phone?: string;
  bio?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  psychologistId: string;
  patientName: string;
  patientPhone: string;
  testId?: string;
  date?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: number;
  updatedAt?: number;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = localStorage.getItem('theme-preference') as 'light' | 'dark' | null;
  const theme = initialTheme || 'light';

  if (theme === 'dark') {
    document.documentElement.classList.add('dark-theme');
  }

  return {
    theme,
    toggleTheme: () => set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme-preference', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
      }
      return { theme: newTheme };
    }),
  };
});
