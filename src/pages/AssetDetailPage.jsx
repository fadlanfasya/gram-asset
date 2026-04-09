import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import useAssetStore from '../stores/useAssetStore'
import useDefinitionStore from '../stores/useDefinitionStore'
import useRelationshipStore from '../stores/useRelationshipStore'
import { StatusBadge } from '../components/shared/StatCard'
import AssetGraph from '../components/relationships/AssetGraph'
import './AssetDetailPage.css'

export default function AssetDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    // Stores
    const getAsset = useAssetStore((s) => s.getAsset)
    const getDefinition = useDefinitionStore((s) => s.getDefinition)
    const deleteAsset = useAssetStore((s) => s.deleteAsset)
    const relationships = useRelationshipStore((s) => s.relationships)

    const [asset, setAsset] = useState(null)
    const [definition, setDefinition] = useState(null)
    const [activeTab, setActiveTab] = useState('overview')

    // Load data
    useEffect(() => {
        const foundAsset = getAsset(id)
        if (foundAsset) {
            setAsset(foundAsset)
            const def = getDefinition(foundAsset.definitionId)
            setDefinition(def)
        } else {
            // Asset not found redirects to list
            navigate('/assets')
        }
    }, [id, getAsset, getDefinition, navigate])

    if (!asset || !definition) return null

    // Find related assets for the bottom list
    const relatedAssetIds = relationships
        .filter(r => r.sourceId === asset.id || r.targetId === asset.id)
        .map(r => r.sourceId === asset.id ? r.targetId : r.sourceId)

    const relatedAssets = relatedAssetIds.slice(0, 3).map(id => getAsset(id)).filter(Boolean)

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this asset?')) {
            deleteAsset(asset.id)
            navigate('/assets')
        }
    }

    // Generate random compliance score for demo purposes
    const complianceScore = 100
    const lastScanned = "12m ago"

    return (
        <div className="asset-detail-page">
            {/* ── Breadcrumb ── */}
            <nav className="detail-breadcrumb">
                <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>GRAM</span>
                <span className="detail-breadcrumb__sep">|</span>
                <Link to="/assets">Assets</Link>
                <span className="detail-breadcrumb__icon">chevron_right</span>
                <span className="detail-breadcrumb__current">{asset.name}</span>
            </nav>

            {/* ── Header ── */}
            <header className="detail-header">
                <div className="detail-header__main">
                    <div className="detail-header__title-row">
                        <h1 className="detail-header__title">{asset.name}</h1>
                        <StatusBadge status={asset.status} />
                    </div>
                    <div className="detail-header__meta">
                        <span className="material-icons detail-header__meta-icon">{definition.icon}</span>
                        <span>{definition.name}</span>
                        <span className="detail-header__meta-sep">•</span>
                        <span>{asset.description || 'No description provided'}</span>
                    </div>
                </div>

                <div className="detail-header__actions">
                    {/* Delete */}
                    <button className="detail-btn detail-btn--secondary" onClick={handleDelete}>
                        <span className="material-icons">delete_outline</span>
                        Delete
                    </button>

                    {/* Edit */}
                    <button
                        className="detail-btn detail-btn--primary"
                        onClick={() => navigate(`/assets/${asset.id}/edit`)}
                    >
                        <span className="material-icons">edit</span>
                        Edit Asset
                    </button>
                </div>
            </header>

            {/* ── Tabs ── */}
            <div className="detail-tabs">
                <button
                    className={`detail-tab ${activeTab === 'overview' ? 'detail-tab--active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <span className="material-icons">dashboard</span>
                    Overview
                </button>
                <button
                    className={`detail-tab ${activeTab === 'relationships' ? 'detail-tab--active' : ''}`}
                    onClick={() => setActiveTab('relationships')}
                >
                    <span className="material-icons">hub</span>
                    Relationships
                </button>
                <button
                    className={`detail-tab ${activeTab === 'history' ? 'detail-tab--active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <span className="material-icons">history</span>
                    History
                </button>
            </div>

            {activeTab === 'overview' && (
                <div className="detail-content-grid">
                    {/* ── Left Column ── */}
                    <div className="detail-column-main">
                        {/* Specifications Card */}
                        <div className="detail-card">
                            <div className="detail-card__header">
                                <div className="detail-card__title-group">
                                    <span className="material-icons" style={{ color: definition.color }}>tune</span>
                                    <h3>{definition.name} Specifications</h3>
                                </div>
                                <span className="detail-card__meta">Last scanned: {lastScanned}</span>
                            </div>

                            <div className="detail-specs-grid">
                                {/* Dynamic Fields */}
                                {definition.fields.map(field => {
                                    const val = asset.fieldValues[field.name]
                                    return (
                                        <div key={field.id} className="detail-spec-item">
                                            <span className="detail-spec-label">{field.name}</span>
                                            <span className="detail-spec-value">
                                                {val !== undefined && val !== '' ? String(val) : '—'}
                                            </span>
                                        </div>
                                    )
                                })}

                                {/* If no fields, show empty state */}
                                {definition.fields.length === 0 && (
                                    <div className="detail-spec-empty">No specifications defined.</div>
                                )}
                            </div>
                        </div>

                        {/* Quick Link to Graph Banner - kept as shortcut */}
                        <div className="visualization-banner">
                            <div className="visualization-overlay">
                                <div className="visualization-content">
                                    <span className="material-icons visualization-icon">hub</span>
                                    <span className="visualization-text">VIEW DEPENDENCY GRAPH</span>
                                </div>
                                <button
                                    className="visualization-btn"
                                    onClick={() => setActiveTab('relationships')}
                                >
                                    OPEN TAB
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Right Column ── */}
                    <div className="detail-column-side">
                        {/* Metadata Card */}
                        <div className="detail-card">
                            <div className="detail-card__header">
                                <div className="detail-card__title-group">
                                    <span className="material-icons" style={{ color: 'var(--color-primary)' }}>info</span>
                                    <h3>Asset Metadata</h3>
                                </div>
                            </div>

                            <div className="metadata-grid">
                                <div className="metadata-item">
                                    <span className="metadata-label">CREATED DATE</span>
                                    <span className="metadata-value">{new Date(asset.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="metadata-item">
                                    <span className="metadata-label">LAST UPDATED</span>
                                    <span className="metadata-value">{new Date(asset.updatedAt).toLocaleTimeString()}</span>
                                </div>
                            </div>

                            <div className="metadata-tags-section">
                                <div className="metadata-tags-header">
                                    <span className="metadata-label">TAGS</span>
                                </div>
                                <div className="metadata-tags-list">
                                    {asset.tags.length > 0 ? (
                                        asset.tags.map(tag => (
                                            <span key={tag} className="metadata-tag">{tag.toUpperCase()}</span>
                                        ))
                                    ) : (
                                        <span className="metadata-empty">No tags</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Compliance Check */}
                        <div className="detail-card">
                            <div className="detail-card__header">
                                <div className="detail-card__title-group">
                                    <span className="material-icons" style={{ color: 'var(--color-primary)' }}>security</span>
                                    <h3>Compliance Check</h3>
                                </div>
                            </div>
                            <div className="compliance-body">
                                <p className="compliance-text">
                                    This asset is meeting {complianceScore}% of security compliance requirements.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'relationships' && (
                <div className="detail-tab-content">
                    <AssetGraph focusId={asset.id} />
                </div>
            )}

            {activeTab === 'history' && (
                <div className="detail-tab-content">
                    <div className="empty-tab-state">
                        <span className="material-icons">history</span>
                        <p>No history records found for this asset.</p>
                    </div>
                </div>
            )}

            {/* ── Simple Related List (Always visible at bottom for quick nav) ── */}
            {activeTab === 'overview' && (
                <div className="related-assets-section">
                    <div className="related-header">
                        <h3>Direct Relationships</h3>
                    </div>

                    <div className="related-grid">
                        {relatedAssets.length > 0 ? (
                            relatedAssets.map(rAsset => {
                                const rDef = getDefinition(rAsset.definitionId)
                                return (
                                    <div
                                        key={rAsset.id}
                                        className="related-card"
                                        onClick={() => navigate(`/assets/${rAsset.id}`)}
                                    >
                                        <div className="related-card__icon" style={{ background: `${rDef?.color || '#fff'}15` }}>
                                            <span className="material-icons" style={{ color: rDef?.color }}>{rDef?.icon || 'hub'}</span>
                                        </div>
                                        <div className="related-card__info">
                                            <span className="related-card__name">{rAsset.name}</span>
                                            <span className="related-card__type">{rDef?.name}</span>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="related-empty">
                                No direct dependencies found.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
