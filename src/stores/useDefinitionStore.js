import { create } from 'zustand'
import useAuthStore from './useAuthStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_URL = `${API_BASE_URL}/definitions`

const getHeaders = () => {
    const token = useAuthStore.getState().token
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }
}

const useDefinitionStore = create((set, get) => ({
    definitions: [],

    fetchDefinitions: async () => {
        try {
            const token = useAuthStore.getState().token
            console.log('Fetching definitions with token:', token)
            const res = await fetch(API_URL, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                set({ definitions: data })
            } else {
                console.error('Fetch definitions failed:', res.status)
            }
        } catch (error) {
            console.error('Failed to fetch definitions:', error)
        }
    },

    getDefinition: (id) => get().definitions.find((d) => d.id === id),

    addDefinition: async (def) => {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(def),
            })
            if (res.ok) {
                const newDef = await res.json()
                set((state) => ({ definitions: [...state.definitions, newDef] }))
                return newDef
            }
        } catch (error) {
            console.error('Failed to add definition:', error)
        }
    },

    updateDefinition: async (id, updates) => {
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(updates),
            })
            if (res.ok) {
                const updatedDef = await res.json()
                set((state) => ({
                    definitions: state.definitions.map((d) =>
                        d.id === id ? updatedDef : d
                    ),
                }))
                return updatedDef
            }
        } catch (error) {
            console.error('Failed to update definition:', error)
        }
    },

    deleteDefinition: async (id) => {
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            })
            if (res.ok) {
                set((state) => ({
                    definitions: state.definitions.filter((d) => d.id !== id),
                }))
            }
        } catch (error) {
            console.error('Failed to delete definition:', error)
        }
    },
}))

export default useDefinitionStore
