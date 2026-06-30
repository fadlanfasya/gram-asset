import { useEffect, useState } from 'react'
import useAuthStore from '../stores/useAuthStore'
import { userApi } from '../utils/userApi'
import './ProfilePage.css'

const ROLE_CFG = {
    admin:       { label: 'Admin',       color: 'var(--color-primary)',      bg: 'var(--color-primary-10)' },
    asset_admin: { label: 'Asset Admin', color: 'var(--color-accent-cyan)',  bg: 'var(--color-accent-cyan-10)' },
    ats_admin:   { label: 'ATS Admin',   color: 'var(--color-amber)',        bg: 'var(--color-amber-10)' },
}
const DEFAULT_ROLE = { label: 'User', color: 'var(--text-muted)', bg: 'var(--bg-hover)' }

function getInitials(name = '') {
    return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?'
}

export default function ProfilePage() {
    const user = useAuthStore((s) => s.user)

    const [formData, setFormData]       = useState({ name: '', email: '', password: '' })
    const [loading, setLoading]         = useState(false)
    const [successMessage, setSuccess]  = useState('')
    const [error, setError]             = useState('')
    const [showPw, setShowPw]           = useState(false)
    const [pwVisible, setPwVisible]     = useState(false)

    useEffect(() => {
        if (user) setFormData({ name: user.name || '', email: user.email || '', password: '' })
    }, [user])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (!formData.name.trim())  { setError('Nama wajib diisi.'); return }
        if (!formData.email.trim()) { setError('Email wajib diisi.'); return }
        if (formData.password && formData.password.length < 6) {
            setError('Password minimal 6 karakter.')
            return
        }

        const updateData = { name: formData.name, email: formData.email }
        if (formData.password) updateData.password = formData.password

        try {
            setLoading(true)
            const updatedUser = await userApi.updateUser(user.id, updateData)
            if (updatedUser) useAuthStore.setState({ user: updatedUser })
            setSuccess('Profil berhasil diperbarui.')
            setFormData((prev) => ({ ...prev, password: '' }))
            setShowPw(false)
            setPwVisible(false)
            setTimeout(() => setSuccess(''), 3000)
        } catch (err) {
            setError(err.message || 'Gagal memperbarui profil.')
        } finally {
            setLoading(false)
        }
    }

    const roleCfg = ROLE_CFG[user?.role] || DEFAULT_ROLE

    return (
        <div className="pf-page">

            <div className="pf-header">
                <h1 className="pf-title">Profil Saya</h1>
                <p className="pf-subtitle">Perbarui informasi akun dan keamanan Anda.</p>
            </div>

            <div className="pf-card">

                {/* ── Identity block ── */}
                <div className="pf-identity">
                    <div className="pf-avatar" aria-hidden="true">
                        {getInitials(user?.name)}
                    </div>
                    <div className="pf-identity-info">
                        <p className="pf-identity-name">{user?.name || '—'}</p>
                        <span
                            className="pf-role-badge"
                            style={{ color: roleCfg.color, background: roleCfg.bg }}
                        >
                            <span className="material-icons" aria-hidden="true">shield</span>
                            {roleCfg.label}
                        </span>
                    </div>
                </div>

                {/* ── Feedback banners ── */}
                {successMessage && (
                    <div className="pf-banner pf-banner--success" role="status" aria-live="polite">
                        <span className="material-icons" aria-hidden="true">check_circle</span>
                        {successMessage}
                    </div>
                )}
                {error && (
                    <div className="pf-banner pf-banner--error" role="alert">
                        <span className="material-icons" aria-hidden="true">error</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>

                    {/* ── Informasi Akun ── */}
                    <div className="pf-section">
                        <p className="pf-section-label">Informasi Akun</p>
                        <div className="pf-fields">
                            <div className="pf-field">
                                <label htmlFor="name">Nama Lengkap</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Masukkan nama lengkap"
                                    autoComplete="name"
                                />
                            </div>
                            <div className="pf-field">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Masukkan alamat email"
                                    autoComplete="email"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Keamanan ── */}
                    <div className="pf-section">
                        <p className="pf-section-label">Keamanan</p>
                        <button
                            type="button"
                            className="pf-pw-trigger"
                            onClick={() => { setShowPw((v) => !v); setPwVisible(false) }}
                            aria-expanded={showPw}
                        >
                            <span className="material-icons" aria-hidden="true">
                                {showPw ? 'lock_open' : 'lock'}
                            </span>
                            {showPw ? 'Batal ubah password' : 'Ubah password'}
                        </button>

                        {showPw && (
                            <div className="pf-pw-expand">
                                <div className="pf-field">
                                    <label htmlFor="password">Password Baru</label>
                                    <div className="pf-pw-wrap">
                                        <input
                                            type={pwVisible ? 'text' : 'password'}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Minimal 6 karakter"
                                            autoComplete="new-password"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            className="pf-pw-toggle"
                                            onClick={() => setPwVisible((v) => !v)}
                                            aria-label={pwVisible ? 'Sembunyikan password' : 'Tampilkan password'}
                                        >
                                            <span className="material-icons" aria-hidden="true">
                                                {pwVisible ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </button>
                                    </div>
                                    <span className="pf-field-note">Kosongkan jika tidak ingin mengubah password.</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Actions ── */}
                    <div className="pf-actions">
                        <button type="submit" className="pf-submit" disabled={loading}>
                            {loading && (
                                <span className="material-icons pf-spin" aria-hidden="true">sync</span>
                            )}
                            {loading ? 'Menyimpan…' : 'Simpan Perubahan'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}
