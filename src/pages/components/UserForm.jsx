import { useState, useEffect } from 'react'
import { ROLE_LABELS } from '../../utils/roles'
import './UserForm.css'

export default function UserForm({ user, onSubmit, onClose }) {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'viewer' })
    const [errors, setErrors]     = useState({})
    const [loading, setLoading]   = useState(false)

    useEffect(() => {
        if (user) {
            setFormData({ name: user.name || '', email: user.email || '', password: '', role: user.role || 'viewer' })
        }
    }, [user])

    const validate = () => {
        const e = {}
        if (!formData.name.trim())  e.name = 'Nama wajib diisi.'
        if (!formData.email.trim()) e.email = 'Email wajib diisi.'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Format email tidak valid.'
        if (!user && !formData.password) e.password = 'Password wajib diisi untuk pengguna baru.'
        else if (formData.password && formData.password.length < 6) e.password = 'Password minimal 6 karakter.'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return
        try {
            setLoading(true)
            const submitData = { ...formData }
            if (user && !submitData.password) delete submitData.password
            await onSubmit(submitData)
        } catch (err) {
            setErrors({ submit: err.message || 'Gagal menyimpan pengguna.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="uf-overlay" onClick={onClose}>
            <div
                className="uf-modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="uf-title"
            >
                <div className="uf-header">
                    <h2 className="uf-title" id="uf-title">
                        {user ? 'Edit Pengguna' : 'Tambah Pengguna'}
                    </h2>
                    <button className="uf-close" onClick={onClose} aria-label="Tutup">
                        <span className="material-icons" aria-hidden="true">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="uf-form" noValidate>

                    <div className="uf-field">
                        <label htmlFor="uf-name">Nama Lengkap</label>
                        <input
                            type="text"
                            id="uf-name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Masukkan nama lengkap"
                            className={errors.name ? 'is-error' : ''}
                            autoComplete="name"
                            autoFocus
                        />
                        {errors.name && <span className="uf-error" role="alert">{errors.name}</span>}
                    </div>

                    <div className="uf-field">
                        <label htmlFor="uf-email">Email</label>
                        <input
                            type="email"
                            id="uf-email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Masukkan alamat email"
                            className={errors.email ? 'is-error' : ''}
                            disabled={!!user}
                            autoComplete="email"
                        />
                        {user && <span className="uf-note">Email tidak dapat diubah setelah akun dibuat.</span>}
                        {errors.email && <span className="uf-error" role="alert">{errors.email}</span>}
                    </div>

                    <div className="uf-field">
                        <label htmlFor="uf-password">
                            Password
                            {user && <span className="uf-optional"> — opsional</span>}
                        </label>
                        <input
                            type="password"
                            id="uf-password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder={user ? 'Kosongkan jika tidak ingin mengubah' : 'Minimal 6 karakter'}
                            className={errors.password ? 'is-error' : ''}
                            autoComplete="new-password"
                        />
                        {errors.password && <span className="uf-error" role="alert">{errors.password}</span>}
                    </div>

                    <div className="uf-field">
                        <label htmlFor="uf-role">Peran</label>
                        <select id="uf-role" name="role" value={formData.role} onChange={handleChange}>
                            {Object.entries(ROLE_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {errors.submit && (
                        <div className="uf-submit-error" role="alert">
                            <span className="material-icons" aria-hidden="true">error</span>
                            {errors.submit}
                        </div>
                    )}

                    <div className="uf-actions">
                        <button type="button" className="uf-btn uf-btn--cancel" onClick={onClose} disabled={loading}>
                            Batal
                        </button>
                        <button type="submit" className="uf-btn uf-btn--submit" disabled={loading}>
                            {loading && <span className="material-icons uf-spin" aria-hidden="true">sync</span>}
                            {loading ? 'Menyimpan…' : user ? 'Simpan Perubahan' : 'Tambah Pengguna'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}
