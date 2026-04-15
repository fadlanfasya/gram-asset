import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAssetStore from '../stores/useAssetStore'
import useDefinitionStore from '../stores/useDefinitionStore'
import { StatusBadge } from '../components/shared/StatCard'
import './AssetManagerPage.css'

export default function AssetManagerPage() {
    const navigate = useNavigate()
    const assets = useAssetStore((s) => s.assets)
    const getDefinition = useDefinitionStore((s) => s.getDefinition)
    const definitions = useDefinitionStore((s) => s.definitions)

    const fetchAssets = useAssetStore((state) => state.fetchAssets);

    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')

    // Filter logic
    const filteredAssets = assets.filter((asset) => {
        const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase()) ||
            asset.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
        const matchesType = typeFilter === 'all' || asset.definitionId === typeFilter
        const matchesStatus = statusFilter === 'all' || asset.status === statusFilter

        return matchesSearch && matchesType && matchesStatus
    })

    return (
        <div className="asset-page">
            {/* Header */}
            <div className="asset-page__header">
                <div>
                    <h1 className="asset-page__title">Asset Manager</h1>
                    <p className="asset-page__subtitle">Track and manage your entire IT infrastructure inventory.</p>
                </div>
                <div className="asset-page__header-actions">
                    <button
                        className="asset-page__import-btn"
                        onClick={() => navigate('/assets/import')}
                    >
                        <span className="material-icons">upload_file</span>
                        Import CSV
                    </button>

                    <button
                        className="asset-page__create-btn"
                        onClick={() => navigate('/assets/new')}
                    >
                        <span className="material-icons">add</span>
                        Create Asset
                    </button>
                </div>
            </div>

            {/* Filters Toolbar */}
            <div className="asset-page__toolbar glass-effect">
                <div className="asset-page__search">
                    <span className="material-icons">search</span>
                    <input
                        type="text"
                        placeholder="Search assets or tags..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="asset-page__filters">
                    {/* Type Filter */}
                    <div className="asset-page__select-wrapper">
                        <span className="material-icons asset-page__select-icon">category</span>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            {definitions.map(def => (
                                <option key={def.id} value={def.id}>{def.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="asset-page__select-wrapper">
                        <span className="material-icons asset-page__select-icon">tune</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="decommissioned">Decommissioned</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Assets Table */}
            <div className="asset-page__table-container glass-effect">
                <table className="asset-table">
                    <thead>
                        <tr>
                            <th>Asset Name</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Tags</th>
                            <th>Last Updated</th>
                            <th style={{ width: 80 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssets.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="asset-table__empty">
                                    <div className="asset-table__empty-state">
                                        <span className="material-icons">search_off</span>
                                        <p>No assets found matching your filters.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredAssets.map((asset) => {
                                const def = getDefinition(asset.definitionId)
                                return (
                                    <tr
                                        key={asset.id}
                                        className="asset-table__row"
                                        onClick={() => navigate(`/assets/${asset.id}`)}
                                    >
                                        <td>
                                            <div className="asset-table__name-cell">
                                                <div
                                                    className="asset-table__icon"
                                                    style={{
                                                        background: def ? `${def.color}15` : 'var(--bg-hover)',
                                                        color: def?.color || 'var(--text-muted)'
                                                    }}
                                                >
                                                    <span className="material-icons">{def?.icon || 'help_outline'}</span>
                                                </div>
                                                <span className="asset-table__name-text">{asset.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>
                                            {def?.name || 'Unknown Type'}
                                        </td>
                                        <td>
                                            <StatusBadge status={asset.status} />
                                        </td>
                                        <td>
                                            <div className="asset-table__tags">
                                                {asset.tags.slice(0, 3).map(tag => (
                                                    <span key={tag} className="asset-tag">{tag}</span>
                                                ))}
                                                {asset.tags.length > 3 && (
                                                    <span className="asset-tag asset-tag--more">+{asset.tags.length - 3}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            {new Date(asset.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <button
                                                className="asset-table__action-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    navigate(`/assets/${asset.id}/edit`)
                                                }}
                                            >
                                                <span className="material-icons">edit</span>
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>

                <div className="asset-page__footer">
                    <span>Showing <strong>{filteredAssets.length}</strong> assets</span>
                </div>
            </div>
        </div>
    )
}
