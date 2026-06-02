import { useNavigate } from 'react-router-dom'
import useDefinitionStore from '../stores/useDefinitionStore'
import useAssetStore from '../stores/useAssetStore'
import useRelationshipStore from '../stores/useRelationshipStore'
import useAuthStore from '../stores/useAuthStore'
import { StatCard, StatusBadge } from '../components/shared/StatCard'
import './DashboardPage.css'

function formatRelativeTime(dateStr) {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 30) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function DashboardPage() {
    const navigate = useNavigate()
    const definitions = useDefinitionStore((s) => s.definitions)
    const assets = useAssetStore((s) => s.assets)
    const relationships = useRelationshipStore((s) => s.relationships)

    const maintenanceCount = assets.filter((a) => a.status === 'maintenance').length
    const activeCount = assets.filter((a) => a.status === 'active').length
    const recentAssets = [...assets]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5)

    // Health metrics
    const nodeAvailability = assets.length > 0
        ? Math.round((activeCount / assets.length) * 100)
        : 0
    const depMapping = assets.length > 0
        ? Math.round(
            (assets.filter((a) =>
                relationships.some((r) => r.sourceId === a.id || r.targetId === a.id)
            ).length / assets.length) * 100
        )
        : 0
    const maintenanceScore = assets.length > 0
        ? Math.round(((assets.length - maintenanceCount) / assets.length) * 100)
        : 0

    const getDefinition = useDefinitionStore((s) => s.getDefinition)
    const user = useAuthStore((s) => s.user)
    const isAdmin = user?.role === 'admin'

    return (
        <div className="dashboard">
            {/* Welcome */}
            <div className="dashboard__welcome">
                <h1 className="dashboard__title">Infrastructure Overview</h1>
                <p className="dashboard__subtitle">Manage and monitor complex IT asset dependencies.</p>
            </div>

            {/* Stat Cards */}
            <div className="dashboard__stats">
                <StatCard
                    icon="inventory_2"
                    iconColor="var(--color-primary)"
                    iconBg="var(--color-primary-10)"
                    label="Total Assets"
                    value={assets.length}
                    badge={`+${Math.round(assets.length * 0.045)}%`}
                    badgeColor="var(--color-green)"
                />
                <StatCard
                    icon="category"
                    iconColor="var(--color-accent-cyan)"
                    iconBg="var(--color-accent-cyan-10)"
                    label="Asset Types"
                    value={definitions.length}
                    badge="Static"
                    badgeColor="var(--text-muted)"
                />
                <StatCard
                    icon="share"
                    iconColor="var(--color-purple)"
                    iconBg="var(--color-purple-10)"
                    label="Dependencies"
                    value={relationships.length}
                    badge={`+${Math.min(relationships.length, 12)} new`}
                    badgeColor="var(--color-primary)"
                />
                <StatCard
                    icon="build"
                    iconColor="var(--color-amber)"
                    iconBg="var(--color-amber-10)"
                    label="Maintenance"
                    value={maintenanceCount}
                    badge="Action Req."
                    badgeColor="var(--color-amber)"
                    accentBorder="var(--color-amber)"
                />
            </div>

            {/* Main content row */}
            <div className="dashboard__main-row">
                {/* Recent Assets Table */}
                <div className="dashboard__recent glass-effect">
                    <div className="dashboard__recent-header">
                        <h2 className="dashboard__section-title">Recent Assets</h2>
                        <button
                            className="dashboard__view-all"
                            onClick={() => navigate('/assets')}
                        >
                            View All
                        </button>
                    </div>
                    <div className="dashboard__table-wrapper">
                        <table className="dashboard__table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Date Added</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentAssets.map((asset) => {
                                    const def = getDefinition(asset.definitionId)
                                    return (
                                        <tr
                                            key={asset.id}
                                            className="dashboard__table-row"
                                            onClick={() => navigate(`/assets/${asset.id}`)}
                                        >
                                            <td>
                                                <div className="dashboard__asset-name">
                                                    <div
                                                        className="dashboard__asset-icon"
                                                        style={{
                                                            background: def ? `${def.color}15` : 'var(--color-primary-10)',
                                                            color: def?.color || 'var(--color-primary)',
                                                        }}
                                                    >
                                                        <span className="material-icons text-sm">{def?.icon || 'devices'}</span>
                                                    </div>
                                                    <span className="dashboard__asset-label">{asset.name}</span>
                                                </div>
                                            </td>
                                            <td className="dashboard__cell-muted">{def?.name || 'Unknown'}</td>
                                            <td>
                                                <StatusBadge status={asset.status} />
                                            </td>
                                            <td className="dashboard__cell-muted">{formatRelativeTime(asset.updatedAt)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Side Panel */}
                <div className="dashboard__side">
                    {/* Quick Actions */}
                    <div className="dashboard__quick-actions glass-effect">
                        <h3 className="dashboard__side-title">Quick Actions</h3>
                        <div className="dashboard__action-buttons">
                            <button
                                className="dashboard__btn dashboard__btn--primary"
                                onClick={() => navigate('/assets/new')}
                            >
                                <span className="material-icons">add_circle</span>
                                New Asset
                            </button>
                            {isAdmin && (
                                <button
                                    className="dashboard__btn dashboard__btn--outline"
                                    onClick={() => navigate('/definitions/new')}
                                >
                                    <span className="material-icons">description</span>
                                    New Definition
                                </button>
                            )}
                            <button
                                className="dashboard__btn dashboard__btn--outline"
                                onClick={() => navigate('/relationships')}
                            >
                                <span className="material-icons">link</span>
                                New Relation
                            </button>
                        </div>
                    </div>

                    {/* Infrastructure Health */}
                    <div className="dashboard__health glass-effect">
                        <h3 className="dashboard__side-title">Infrastructure Health</h3>
                        <div className="dashboard__health-items">
                            <div className="dashboard__health-item">
                                <div className="dashboard__health-row">
                                    <span className="dashboard__health-label">Node Availability</span>
                                    <span className="dashboard__health-value" style={{ color: 'var(--color-primary)' }}>
                                        {nodeAvailability}%
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-bar__fill"
                                        style={{ width: `${nodeAvailability}%`, background: 'var(--color-primary)' }}
                                    ></div>
                                </div>
                            </div>
                            <div className="dashboard__health-item">
                                <div className="dashboard__health-row">
                                    <span className="dashboard__health-label">Dependency Mapping</span>
                                    <span className="dashboard__health-value" style={{ color: 'var(--color-accent-cyan)' }}>
                                        {depMapping}%
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-bar__fill"
                                        style={{ width: `${depMapping}%`, background: 'var(--color-accent-cyan)' }}
                                    ></div>
                                </div>
                            </div>
                            <div className="dashboard__health-item">
                                <div className="dashboard__health-row">
                                    <span className="dashboard__health-label">Maintenance Score</span>
                                    <span className="dashboard__health-value" style={{ color: 'var(--color-amber)' }}>
                                        {maintenanceScore}%
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-bar__fill"
                                        style={{ width: `${maintenanceScore}%`, background: 'var(--color-amber)' }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Network Topology Placeholder */}
            <div className="dashboard__topology glass-effect">
                <div className="dashboard__topology-content">
                    <div className="dashboard__topology-icon">
                        <span className="material-icons text-3xl">hub</span>
                    </div>
                    <h3 className="dashboard__topology-title">Network Topology</h3>
                    <p className="dashboard__topology-desc">
                        Interactive map of all current assets and their complex dependencies across regions.
                    </p>
                    <button
                        className="dashboard__topology-btn"
                        onClick={() => navigate('/relationships')}
                    >
                        Launch Explorer
                    </button>
                </div>
            </div>
        </div>
    )
}
