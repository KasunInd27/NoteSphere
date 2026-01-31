import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true, // initial check
    error: null,

    // Check if user is logged in (check cookie on load)
    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const response = await axios.get(`${API_URL}/api/auth/me`, { withCredentials: true });
            set({ user: response.data, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    // Login with Google credential
    loginWithGoogle: async (credential) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/api/auth/google`, { credential }, { withCredentials: true });
            set({ user: response.data, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
        }
    },

    // Logout
    logout: async () => {
        try {
            await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
            set({ user: null, isAuthenticated: false });
        } catch (error) {
            console.error('Logout failed', error);
        }
    },
}));

export default useAuthStore;
