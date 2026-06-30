import { useState, useEffect } from 'react'
import { userApi } from '../utils/userApi'
import useAuthStore from '../stores/useAuthStore'
import { canManageUsers } from '../utils/roles'
import UserList from './components/UserList'
import UserForm from './components/UserForm'
import './UserManagementPage.css'

export default function UserManagementPage() {
    const user = useAuthStore((s) => s.user)
    const [users, setUsers]               = useState([])
    const [loading, setLoading]           = useState(true)
    const [error, setError]               = useState(null)
    const [showForm, setShowForm]         = useState(false)
    const [editingUser, setEditingUser]   = useState(null)
    const [searchQuery, setSearchQuery]   = useState('')
    const [successMessage, setSuccess]    = useState('')

    const isAdmin = canManageUsers(user?.role)

    useEffect(() => {
        if (isAdmin) fetchUsers()
    }, [isAdmin])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await userApi.getAllUsers()
            setUsers(Array.isArray(data) ? data : data.users || [])
        } catch (err) {
            setError(err.message || 'Gagal memuat data pengguna.')
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async (e) => {
        const query = e.target.value
        setSearchQuery(query)
        if (!query.trim()) { fetchUsers(); return }
        try {
            setLoading(true)
            setError(null)
            const data = await userApi.searchUsers(query)
            setUsers(Array.isArray(data) ? data : data.users || [])
        } catch (err) {
            setError(err.message || 'Gagal mencari pengguna.')
        } finally {
            setLoading(false)
        }
    }

    const showSuccess = (msg) => {
        setSuccess(msg)
        setTimeout(() => setSuccess(''), 3000)
    }

    const handleAddUser   = () => { setEditingUser(null); setShowForm(true) }
    const handleEditUser  = (u) => { setEditingUser(u);  setShowForm(true) }
    const handleFormClose = () => { setShowForm(false);  setEditingUser(null) }

    const handleFormSubmit = async (formData) => {
        try {
            setError(null)
            if (editingUser) {
                await userApi.updateUser(editingUser.id, formData)
                showSuccess('Pengguna berhasil diperbarui.')
            } else {
                await userApi.createUser(formData)
                showSuccess('Pengguna berhasil ditambahkan.')
            }
            fetchUsers()
            handleFormClose()
        } catch (err) {
            setError(err.message || 'Gagal menyimpan pengguna.')
        }
    }

    const handleDeleteUser = async (userId) => {
        try {
            setError(null)
            await userApi.deleteUser(userId)
            showSuccess('Pengguna berhasil dihapus.')
            fetchUsers()
        } catch (err) {
            setError(err.message || 'Gagal menghapus pengguna.')
        }
    }

    const handleChangeRole = async (userId, newRole) => {
        try {
            setError(null)
            await userApi.changeUserRole(userId, newRole)
            showSuccess('Peran pengguna berhasil diperbarui.')
            fetchUsers()
        } catch (err) {
            setError(err.message || 'Gagal mengubah peran pengguna.')
        }
    }

    if (!isAdmin) {
        return (
            <div className="um-page">
                <div className="um-access-denied">
                    <span className="material-icons um-access-denied__icon" aria-hidden="true">lock</span>
                    <h1 className="um-access-denied__title">Akses Ditolak</h1>
                    <p className="um-access-denied__desc">Hanya administrator yang dapat mengakses halaman ini.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="um-page">

            {/* ── Toolbar ── */}
            <div className="um-toolbar">
                <div className="um-toolbar__left">
                    <h1 className="um-title">Manajemen Pengguna</h1>
                    {!loading && (
                        <span className="um-count">{users.length} pengguna</span>
                    )}
                </div>
                <div className="um-toolbar__right">
                    <div className="um-search">
                        <span className="material-icons um-search__icon" aria-hidden="true">search</span>
                        <input
                            type="search"
                            className="um-search__input"
                            placeholder="Cari pengguna…"
                            value={searchQuery}
                            onChange={handleSearch}
                            aria-label="Cari pengguna"
                        />
                    </div>
                    <button className="um-btn-add" onClick={handleAddUser}>
                        <span className="material-icons" aria-hidden="true">person_add</span>
                        Tambah Pengguna
                    </button>
                </div>
            </div>

            {/* ── Feedback ── */}
            {successMessage && (
                <div className="um-banner um-banner--success" role="status" aria-live="polite">
                    <span className="material-icons" aria-hidden="true">check_circle</span>
                    {successMessage}
                </div>
            )}
            {error && (
                <div className="um-banner um-banner--error" role="alert">
                    <span className="material-icons" aria-hidden="true">error</span>
                    {error}
                </div>
            )}

            {/* ── Content ── */}
            {loading ? (
                <div className="um-loading" aria-live="polite">
                    <span className="material-icons um-spin" aria-hidden="true">sync</span>
                    Memuat pengguna…
                </div>
            ) : users.length === 0 ? (
                <div className="um-empty">
                    <span className="material-icons um-empty__icon" aria-hidden="true">group_off</span>
                    <p className="um-empty__msg">
                        {searchQuery ? 'Tidak ada hasil untuk pencarian ini.' : 'Belum ada pengguna.'}
                    </p>
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

            {/* ── Modal ── */}
            {showForm && (
                <UserForm
                    user={editingUser}
                    onSubmit={handleFormSubmit}
                    onClose={handleFormClose}
                />
            )}

        </div>
    )
}
