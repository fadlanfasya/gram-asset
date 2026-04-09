import './Topbar.css'
import useThemeStore from '../../stores/useThemeStore'

export default function Topbar() {
    const { theme, toggleTheme } = useThemeStore()

    return (
        <header className="topbar">
            {/* Search */}
            <div className="topbar__search-wrapper">
                <div className="topbar__search">
                    <span className="material-icons topbar__search-icon">search</span>
                    <input
                        className="topbar__search-input"
                        type="text"
                        placeholder="Search infrastructure..."
                    />
                </div>
            </div>

            {/* Right side */}
            <div className="topbar__actions">
                <button
                    className="topbar__theme-toggle"
                    onClick={toggleTheme}
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                >
                    <span className="material-icons">
                        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                    </span>
                </button>

                <button className="topbar__notification-btn">
                    <span className="material-icons">notifications</span>
                    <span className="topbar__notification-dot"></span>
                </button>

                <div className="topbar__divider"></div>

                <div className="topbar__user">
                    <div className="topbar__user-info">
                        <p className="topbar__user-name">Admin User</p>
                        <p className="topbar__user-role">System Architect</p>
                    </div>
                    <div className="topbar__avatar">
                        <span className="material-icons">person</span>
                    </div>
                </div>
            </div>
        </header>
    )
}
