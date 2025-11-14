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
  name: string;
  email: string;
  password: string;
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
          const response = await apiClient.login(email, password);
          
          if (response.user && response.token) {
            get().setUser(response.user);
            get().setToken(response.token);
          }
        } catch (error) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      signup: async (data: SignupData) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.register(data);

          if (response.user && response.token) {
            get().setUser(response.user);
            get().setToken(response.token);
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
          const user = await apiClient.getMe();
          if (user) {
            get().setUser(user);
          } else {
            get().logout();
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