import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../stores/useAuthStore'
import useThemeStore from '../stores/useThemeStore'
import './LoginPage.css'

export default function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const login = useAuthStore((s) => s.login)
    const { theme, toggleTheme } = useThemeStore()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const success = await login(email, password)
            if (success) {
                const from = location.state?.from?.pathname || '/'
                navigate(from, { replace: true })
            } else {
                setError('Invalid credentials. Please try again.')
            }
        } catch (err) {
            setError('An error occurred during login.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-background"></div>
            <div className="login-shapes">
                <div className="login-shape login-shape-1"></div>
                <div className="login-shape login-shape-2"></div>
            </div>

            <div className="login-card glass-effect">
                <div className="login-header">
                    <button
                        className="login-theme-toggle"
                        onClick={toggleTheme}
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                    >
                        <span className="material-icons">
                            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>
                    <div className="login-logo">
                        <span className="material-icons">hub</span>
                    </div>
                    <h1 className="login-title">Welcome to GRAM</h1>
                    <p className="login-subtitle">IT Asset & Relationship Management</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-input-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-with-icon">
                            <span className="material-icons">email</span>
                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="login-input-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-with-icon">
                            <span className="material-icons">lock</span>
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && <div className="login-error">{error}</div>}

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? <span className="material-icons spin">refresh</span> : 'Sign In'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Don't have an account? <a href="#">Contact Admin</a></p>
                    <p className="login-version">GRAM v1.0.0</p>
                </div>
            </div>
        </div>
    )
}
