import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { apiClient } from '@/lib/api-client';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'OWNER' | 'TENANT';
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      setToken: (token) => {
        set({ token });
        if (token) {
          apiClient.setAuthToken(token);
        } else {
          apiClient.clearAuthToken();
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post<{ user: User; token: string }>(
            '/auth/login',
            { email, password }
          );

          if (response.success && response.data) {
            const { user, token } = response.data;
            get().setUser(user);
            get().setToken(token);
          }
        } catch (error) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      signup: async (data) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post<{ user: User; token: string }>(
            '/auth/signup',
            data
          );

          if (response.success && response.data) {
            const { user, token } = response.data;
            get().setUser(user);
            get().setToken(token);
          }
        } catch (error) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        apiClient.clearAuthToken();
      },

      checkAuth: async () => {
        const token = get().token;
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const response = await apiClient.get<{ user: User }>('/auth/me');
          if (response.success && response.data) {
            get().setUser(response.data.user);
          }
        } catch (error) {
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
