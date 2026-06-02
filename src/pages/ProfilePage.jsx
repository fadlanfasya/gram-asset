import { useEffect, useState } from 'react'
import useAuthStore from '../stores/useAuthStore'
import { userApi } from '../utils/userApi'
import './ProfilePage.css'

export default function ProfilePage() {
    const user = useAuthStore((s) => s.user)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: ''
            })
        }
    }, [user])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccessMessage('')

        if (!formData.name.trim()) {
            setError('Name is required')
            return
        }

        if (!formData.email.trim()) {
            setError('Email is required')
            return
        }

        if (formData.password && formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        const updateData = {
            name: formData.name,
            email: formData.email
        }

        if (formData.password) {
            updateData.password = formData.password
        }

        try {
            setLoading(true)
            const updatedUser = await userApi.updateUser(user.id, updateData)
            if (updatedUser) {
                useAuthStore.setState({ user: updatedUser })
            }
            setSuccessMessage('Profile updated successfully.')
            setFormData((prev) => ({ ...prev, password: '' }))
            setTimeout(() => setSuccessMessage(''), 3000)
        } catch (err) {
            setError(err.message || 'Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <h1>My Profile</h1>
                <p>Update your personal details and password here.</p>
            </div>

            <div className="profile-card">
                {successMessage && <div className="success-message">{successMessage}</div>}
                {error && <div className="error-message">{error}</div>}

                <form className="profile-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email address"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Leave blank to keep your current password"
                        />
                        <span className="field-note">Leave blank to keep your existing password.</span>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    )
}
