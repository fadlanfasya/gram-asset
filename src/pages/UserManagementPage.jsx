import { useState, useEffect } from 'react'
import { userApi } from '../utils/userApi'
import useAuthStore from '../stores/useAuthStore'
import { ROLE_LABELS, canManageUsers } from '../utils/roles'
import UserList from './components/UserList'
import UserForm from './components/UserForm'
import './UserManagementPage.css'

export default function UserManagementPage() {
    const user = useAuthStore((s) => s.user)
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const isAdmin = canManageUsers(user?.role)

    useEffect(() => {
        if (isAdmin) {
            fetchUsers()
        }
    }, [isAdmin])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await userApi.getAllUsers()
            setUsers(Array.isArray(data) ? data : data.users || [])
        } catch (err) {
            setError(err.message || 'Failed to load users')
            console.error('Error fetching users:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async (e) => {
        const query = e.target.value
        setSearchQuery(query)

        if (!query.trim()) {
            fetchUsers()
            return
        }

        try {
            setLoading(true)
            setError(null)
            const data = await userApi.searchUsers(query)
            setUsers(Array.isArray(data) ? data : data.users || [])
        } catch (err) {
            setError(err.message || 'Failed to search users')
        } finally {
            setLoading(false)
        }
    }

    const handleAddUser = () => {
        setEditingUser(null)
        setShowForm(true)
    }

    const handleEditUser = (userData) => {
        setEditingUser(userData)
        setShowForm(true)
    }

    const handleFormClose = () => {
        setShowForm(false)
        setEditingUser(null)
    }

    const handleFormSubmit = async (formData) => {
        try {
            setError(null)
            if (editingUser) {
                await userApi.updateUser(editingUser.id, formData)
                setSuccessMessage('User updated successfully!')
            } else {
                await userApi.createUser(formData)
                setSuccessMessage('User created successfully!')
            }
            fetchUsers()
            handleFormClose()
            setTimeout(() => setSuccessMessage(''), 3000)
        } catch (err) {
            setError(err.message || 'Failed to save user')
        }
    }

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return
        }

        try {
            setError(null)
            await userApi.deleteUser(userId)
            setSuccessMessage('User deleted successfully!')
            fetchUsers()
            setTimeout(() => setSuccessMessage(''), 3000)
        } catch (err) {
            setError(err.message || 'Failed to delete user')
        }
    }

    const handleChangeRole = async (userId, newRole) => {
        try {
            setError(null)
            await userApi.changeUserRole(userId, newRole)
            setSuccessMessage('User role updated successfully!')
            fetchUsers()
            setTimeout(() => setSuccessMessage(''), 3000)
        } catch (err) {
            setError(err.message || 'Failed to change user role')
        }
    }

    if (!isAdmin) {
        return (
            <div className="user-management-page">
                <div className="access-denied">
                    <h1>Access Denied</h1>
                    <p>Only administrators can access user management.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="user-management-page">
            <div className="page-header">
                <h1>User Management</h1>
                <button className="btn-primary" onClick={handleAddUser}>
                    + Add New User
                </button>
            </div>

            {successMessage && (
                <div className="success-message">
                    {successMessage}
                </div>
            )}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-input"
                />
            </div>

            {showForm && (
                <UserForm
                    user={editingUser}
                    onSubmit={handleFormSubmit}
                    onClose={handleFormClose}
                />
            )}

            {loading ? (
                <div className="loading">Loading users...</div>
            ) : users.length === 0 ? (
                <div className="empty-state">
                    <p>No users found.</p>
                </div>
            ) : (
                <UserList
                    users={users}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                    onChangeRole={handleChangeRole}
                    currentUserId={user?.id}
                />
            )}
        </div>
    )
}
