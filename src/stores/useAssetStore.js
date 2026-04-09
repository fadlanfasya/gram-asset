import { create } from 'zustand'
import useAuthStore from './useAuthStore'

const API_URL = 'http://localhost:4000/api/assets'

const getHeaders = () => {
    const token = useAuthStore.getState().token
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }
}

const useAssetStore = create((set, get) => ({
    assets: [],

    fetchAssets: async () => {
        try {
            const token = useAuthStore.getState().token
            const res = await fetch(API_URL, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                set({ assets: data })
            }
        } catch (error) {
            console.error('Failed to fetch assets:', error)
        }
    },

    getAsset: (id) => get().assets.find((a) => a.id === id),

    getAssetsByDefinition: (defId) =>
        get().assets.filter((a) => a.definitionId === defId),

    getAssetsByStatus: (status) =>
        get().assets.filter((a) => a.status === status),

    addAsset: async (asset) => {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(asset),
            })
            if (res.ok) {
                const newAsset = await res.json()
                set((state) => ({ assets: [...state.assets, newAsset] }))
                return newAsset
            }
        } catch (error) {
            console.error('Failed to add asset:', error)
        }
    },

    updateAsset: async (id, updates) => {
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(updates),
            })
            if (res.ok) {
                const updatedAsset = await res.json()
                set((state) => ({
                    assets: state.assets.map((a) =>
                        a.id === id ? updatedAsset : a
                    ),
                }))
                return updatedAsset
            }
        } catch (error) {
            console.error('Failed to update asset:', error)
        }
    },

    deleteAsset: async (id) => {
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            })
            if (res.ok) {
                set((state) => ({
                    assets: state.assets.filter((a) => a.id !== id),
                }))
            }
        } catch (error) {
            console.error('Failed to delete asset:', error)
        }
    },
}))

export default useAssetStore
