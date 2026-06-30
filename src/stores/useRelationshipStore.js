import { create } from 'zustand'
import useAuthStore from './useAuthStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_URL = `${API_BASE_URL}/relationships`

const getHeaders = () => {
    const token = useAuthStore.getState().token
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }
}

const useRelationshipStore = create((set, get) => ({
    relationships: [],

    fetchRelationships: async () => {
        try {
            const token = useAuthStore.getState().token
            const res = await fetch(API_URL, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                set({ relationships: data })
            }
        } catch (error) {
            console.error('Failed to fetch relationships:', error)
        }
    },

    getRelationship: (id) => get().relationships.find((r) => r.id === id),

    getRelationshipsByAsset: (assetId) =>
        get().relationships.filter(
            (r) => r.sourceId === assetId || r.targetId === assetId
        ),

    addRelationship: async (rel) => {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(rel),
            })
            if (res.ok) {
                const newRel = await res.json()
                set((state) => ({ relationships: [...state.relationships, newRel] }))
                return newRel
            }
        } catch (error) {
            console.error('Failed to add relationship:', error)
        }
    },

    deleteRelationship: async (id) => {
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            })
            if (res.ok) {
                set((state) => ({
                    relationships: state.relationships.filter((r) => r.id !== id),
                }))
            }
        } catch (error) {
            console.error('Failed to delete relationship:', error)
        }
    },
}))

export default useRelationshipStore
