import Sidebar from './Sidebar'
import Topbar from './Topbar'
import './PageShell.css'

export default function PageShell({ children }) {
    return (
        <div className="page-shell">
            <Sidebar />
            <main className="page-shell__main">
                <Topbar />
                <div className="page-shell__content">
                    {children}
                </div>
                <footer className="page-shell__footer">
                    <p>© 2026 GRAM Asset Management v1.0.0</p>
                    <div className="page-shell__footer-links">
                        <a href="#">Documentation</a>
                        <a href="#">API Keys</a>
                        <a href="#">Support</a>
                    </div>
                </footer>
            </main>
        </div>
    )
}
