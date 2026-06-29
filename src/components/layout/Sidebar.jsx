import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../stores/useAuthStore'
import { canManageAssets, canManageAts, canManageUsers } from '../../utils/roles'
import './Sidebar.css'

const navItems = [
    { to: '/', icon: 'dashboard', label: 'Dashboard' },
    { to: '/assets', icon: 'inventory_2', label: 'Assets' },
    { to: '/relationships', icon: 'hub', label: 'Relationships' },
]

export default function Sidebar() {
    const logout = useAuthStore((s) => s.logout)
    const user = useAuthStore((s) => s.user)
    const navigate = useNavigate()
    const role = user?.role

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar__logo">
                <div className="sidebar__logo-icon">G</div>
                <span className="sidebar__logo-text">Gram</span>
            </div>

            {/* Navigation */}
            <nav className="sidebar__nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) =>
                            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                        }
                    >
                        <span className="material-icons">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}

                {canManageAssets(role) && (
                    <>
                        <div className="sidebar__divider"></div>
                        <div className="sidebar__section-label">Asset Admin</div>
                        <NavLink
                            to="/definitions"
                            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                        >
                            <span className="material-icons">account_tree</span>
                            Definitions
                        </NavLink>
                    </>
                )}

                {canManageAts(role) && (
                    <>
                        <div className="sidebar__divider"></div>
                        <div className="sidebar__section-label">ATS</div>
                        <NavLink
                            to="/ats"
                            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                        >
                            <span className="material-icons">support_agent</span>
                            ATS Management
                        </NavLink>
                    </>
                )}

                {canManageUsers(role) && (
                    <>
                        <div className="sidebar__divider"></div>
                        <div className="sidebar__section-label">Admin</div>
                        <NavLink
                            to="/users"
                            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                        >
                            <span className="material-icons">group</span>
                            User Management
                        </NavLink>
                    </>
                )}

                <button className="sidebar__link sidebar__logout-btn" onClick={handleLogout}>
                    <span className="material-icons">logout</span>
                    Logout
                </button>
            </nav>

            {/* System Status */}
            <div className="sidebar__footer">
                <div className="sidebar__status-card">
                    <p className="sidebar__status-label">System Status</p>
                    <div className="sidebar__status-row">
                        <span className="sidebar__status-dot"></span>
                        <span className="sidebar__status-text">All services operational</span>
                    </div>
                </div>
            </div>
        </aside>
    )
}
