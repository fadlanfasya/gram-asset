import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const useAuthStore = create(
    persist(
        (set) => ({
            isAuthenticated: false,
            user: null,
            token: null,

            login: async (email, password) => {
                try {
                    const response = await fetch(`${API_BASE_URL}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                    });

                    if (!response.ok) {
                        return false;
                    }

                    const data = await response.json();
                    set({
                        isAuthenticated: true,
                        user: data.user,
                        token: data.token
                    });
                    localStorage.setItem('gram-token', data.token); // Also save token separately if needed, but persist handles state
                    return true;
                } catch (error) {
                    console.error('Login failed:', error);
                    return false;
                }
            },

            logout: () => {
                set({ isAuthenticated: false, user: null, token: null });
                localStorage.removeItem('gram-token');
            },
        }),
        {
            name: 'gram-auth-storage',
        }
    )
)

export default useAuthStore
