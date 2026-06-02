import useAuthStore from '../stores/useAuthStore'

const API_BASE_URL = 'http://localhost:4000/api'

const getHeaders = () => {
    const token = useAuthStore.getState().token
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}

export const userApi = {
    // Create a new user
    createUser: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(userData)
        })
        if (!response.ok) throw new Error('Failed to create user')
        return response.json()
    },

    // Get all users
    getAllUsers: async () => {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'GET',
            headers: getHeaders()
        })
        if (!response.ok) throw new Error('Failed to fetch users')
        return response.json()
    },

    // Get user by ID
    getUserById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'GET',
            headers: getHeaders()
        })
        if (!response.ok) throw new Error('Failed to fetch user')
        return response.json()
    },

    // Update user
    updateUser: async (id, userData) => {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(userData)
        })
        if (!response.ok) throw new Error('Failed to update user')
        return response.json()
    },

    // Delete user
    deleteUser: async (id) => {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        })
        if (!response.ok) throw new Error('Failed to delete user')
        return response.json()
    },

    // Change user role
    changeUserRole: async (id, role) => {
        const response = await fetch(`${API_BASE_URL}/users/${id}/role`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ role })
        })
        if (!response.ok) throw new Error('Failed to change user role')
        return response.json()
    },

    // Search users
    searchUsers: async (query) => {
        const response = await fetch(`${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: getHeaders()
        })
        if (!response.ok) throw new Error('Failed to search users')
        return response.json()
    }
}
