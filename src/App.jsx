import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import PageShell from './components/layout/PageShell'
import DashboardPage from './pages/DashboardPage'
import DefinitionsPage from './pages/DefinitionsPage'
import CreateDefinitionPage from './pages/CreateDefinitionPage'
import AssetManagerPage from './pages/AssetManagerPage'
import CreateAssetPage from './pages/CreateAssetPage'
import AssetImportPage from './pages/AssetImportPage'
import AssetDetailPage from './pages/AssetDetailPage'
import RelationshipsPage from './pages/RelationshipsPage'
import CreateRelationshipPage from './pages/CreateRelationshipPage'
import AtsPage from './pages/AtsPage'
import UserManagementPage from './pages/UserManagementPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import useAuthStore from './stores/useAuthStore'
import useDefinitionStore from './stores/useDefinitionStore'
import useAssetStore from './stores/useAssetStore'
import useRelationshipStore from './stores/useRelationshipStore'
import useThemeStore from './stores/useThemeStore'

// Protected Route Wrapper
function RequireAuth({ children }) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
    const location = useLocation()

    const fetchDefinitions = useDefinitionStore((s) => s.fetchDefinitions)
    const fetchAssets = useAssetStore((s) => s.fetchAssets)
    const fetchRelationships = useRelationshipStore((s) => s.fetchRelationships)

    useEffect(() => {
        if (isAuthenticated) {
            fetchDefinitions()
            fetchAssets()
            fetchRelationships()
        }
    }, [isAuthenticated])

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}

// Role-gated Route Wrapper — pass allowedRoles array
function RequireRole({ children, allowedRoles }) {
    const user = useAuthStore((s) => s.user)
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
    const location = useLocation()

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (!allowedRoles.includes(user?.role)) {
        return <Navigate to="/" replace />
    }

    return children
}

export default function App() {
    const theme = useThemeStore((s) => s.theme)

    useEffect(() => {
        document.documentElement.className = theme === 'light' ? 'light-theme' : ''
    }, [theme])

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route
                path="/*"
                element={
                    <RequireAuth>
                        <PageShell>
                            <Routes>
                                <Route path="/" element={<DashboardPage />} />

                                {/* Definitions — asset_admin + admin */}
                                <Route
                                    path="/definitions"
                                    element={
                                        <RequireRole allowedRoles={['admin', 'asset_admin']}>
                                            <DefinitionsPage />
                                        </RequireRole>
                                    }
                                />
                                <Route
                                    path="/definitions/new"
                                    element={
                                        <RequireRole allowedRoles={['admin', 'asset_admin']}>
                                            <CreateDefinitionPage />
                                        </RequireRole>
                                    }
                                />
                                <Route
                                    path="/definitions/:id/edit"
                                    element={
                                        <RequireRole allowedRoles={['admin', 'asset_admin']}>
                                            <CreateDefinitionPage />
                                        </RequireRole>
                                    }
                                />

                                {/* Assets */}
                                <Route path="/assets" element={<AssetManagerPage />} />
                                <Route path="/assets/import" element={<AssetImportPage />} />
                                <Route path="/assets/new" element={<CreateAssetPage />} />
                                <Route path="/assets/:id/edit" element={<CreateAssetPage />} />
                                <Route path="/assets/:id" element={<AssetDetailPage />} />

                                {/* Relationships */}
                                <Route path="/relationships" element={<RelationshipsPage />} />
                                <Route path="/relationships/new" element={<CreateRelationshipPage />} />

                                {/* User Profile */}
                                <Route path="/profile" element={<ProfilePage />} />

                                {/* ATS Management — ats_admin + admin */}
                                <Route
                                    path="/ats"
                                    element={
                                        <RequireRole allowedRoles={['admin', 'ats_admin']}>
                                            <AtsPage />
                                        </RequireRole>
                                    }
                                />

                                {/* User Management — super admin only */}
                                <Route
                                    path="/users"
                                    element={
                                        <RequireRole allowedRoles={['admin']}>
                                            <UserManagementPage />
                                        </RequireRole>
                                    }
                                />
                            </Routes>
                        </PageShell>
                    </RequireAuth>
                }
            />
        </Routes>
    )
}
