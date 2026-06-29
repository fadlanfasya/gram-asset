import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAssetStore from '../stores/useAssetStore'
import useDefinitionStore from '../stores/useDefinitionStore'
import useAuthStore from '../stores/useAuthStore'
import { canManageAssets } from '../utils/roles'
import { StatusBadge } from '../components/shared/StatCard'
import './AssetManagerPage.css'

const categoryConfig = [
    {
        key: 'vm',
        title: 'VM',
        icon: 'desktop_windows',
        description: 'Virtual machines and cloud instances',
    },
    {
        key: 'hardware',
        title: 'Hardware',
        icon: 'devices',
        description: 'Physical servers, laptops, and network gear',
    },
    {
        key: 'software',
        title: 'Software',
        icon: 'apps',
        description: 'Applications, services, and digital platforms',
    },
]

const ITEMS_PER_PAGE = 8

function getAssetCategory(definition) {
    if (definition?.category) {
        return definition.category
    }

    const name = `${definition?.name || ''} ${definition?.description || ''}`.toLowerCase()

    if (name.includes('vm') || name.includes('virtual') || name.includes('instance')) {
        return 'vm'
    }

    if (name.includes('software') || name.includes('app') || name.includes('service') || name.includes('license') || name.includes('product')) {
        return 'software'
    }

    return 'hardware'
}

export default function AssetManagerPage() {
    const navigate = useNavigate()
    const assets = useAssetStore((s) => s.assets)
    const getDefinition = useDefinitionStore((s) => s.getDefinition)
    const definitions = useDefinitionStore((s) => s.definitions)
    const user = useAuthStore((s) => s.user)
    const canWrite = canManageAssets(user?.role)

    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedDefinitionId, setSelectedDefinitionId] = useState(null)
    const [expandedCategories, setExpandedCategories] = useState({ vm: true, hardware: true, software: true })
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        setCurrentPage(1)
    }, [selectedDefinitionId, search, typeFilter, statusFilter])

    const filteredAssets = useMemo(() => assets.filter((asset) => {
        const searchableText = `${asset.name} ${Array.isArray(asset.tags) ? asset.tags.join(' ') : ''}`.toLowerCase()
        const matchesSearch = searchableText.includes(search.toLowerCase())
        const matchesType = typeFilter === 'all' || asset.definitionId === typeFilter
        const matchesStatus = statusFilter === 'all' || asset.status === statusFilter

        return matchesSearch && matchesType && matchesStatus
    }), [assets, search, typeFilter, statusFilter])

    const treeGroups = useMemo(() => categoryConfig.map((category) => ({
        ...category,
        children: definitions
            .filter((definition) => getAssetCategory(definition) === category.key)
            .map((definition) => ({
                ...definition,
                assetCount: filteredAssets.filter((asset) => asset.definitionId === definition.id).length,
            }))
            .filter((group) => group.assetCount > 0 || group.id === selectedDefinitionId),
    })), [definitions, filteredAssets, selectedDefinitionId])

    const selectedDefinition = useMemo(() => {
        if (!selectedDefinitionId) return null
        return definitions.find((definition) => definition.id === selectedDefinitionId) || null
    }, [definitions, selectedDefinitionId])

    const selectedDefinitionAssets = useMemo(() => {
        if (!selectedDefinition) return []
        return filteredAssets.filter((asset) => asset.definitionId === selectedDefinition.id)
    }, [filteredAssets, selectedDefinition])

    const pageCount = Math.max(1, Math.ceil(selectedDefinitionAssets.length / ITEMS_PER_PAGE))
    const safePage = Math.min(currentPage, pageCount)
    const pagedAssets = selectedDefinitionAssets.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

    const getPaginationItems = () => {
        if (pageCount <= 7) {
            return Array.from({ length: pageCount }, (_, index) => index + 1)
        }

        if (safePage <= 4) {
            return [1, 2, 3, 4, 5, 'ellipsis', pageCount]
        }

        if (safePage >= pageCount - 3) {
            return [1, 'ellipsis', pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1, pageCount]
        }

        return [1, 'ellipsis', safePage - 1, safePage, safePage + 1, 'ellipsis', pageCount]
    }

    const paginationItems = getPaginationItems()

    const toggleCategory = (categoryKey) => {
        setExpandedCategories((current) => ({
            ...current,
            [categoryKey]: !current[categoryKey],
        }))
    }

    return (
        <div className="asset-page">
            <div className="asset-page__header">
                <div>
                    <h1 className="asset-page__title">Asset Manager</h1>
                    <p className="asset-page__subtitle">Browse assets through the definition tree and open a specific branch when you need to inspect it.</p>
                </div>
                {canWrite && (
                    <div className="asset-page__header-actions">
                        <button className="asset-page__import-btn" onClick={() => navigate('/assets/import')}>
                            <span className="material-icons">upload_file</span>
                            Import CSV
                        </button>
                        <button className="asset-page__create-btn" onClick={() => navigate('/assets/new')}>
                            <span className="material-icons">add</span>
                            Create Asset
                        </button>
                    </div>
                )}
            </div>

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
                    <div className="asset-page__select-wrapper">
                        <span className="material-icons asset-page__select-icon">category</span>
                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                            <option value="all">All Types</option>
                            {definitions.map((def) => (
                                <option key={def.id} value={def.id}>{def.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="asset-page__select-wrapper">
                        <span className="material-icons asset-page__select-icon">tune</span>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="decommissioned">Decommissioned</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="asset-page__tree-layout">
                <aside className="asset-page__tree-panel glass-effect">
                    <div className="asset-page__tree-panel-header">
                        <div>
                            <h2>Asset Tree</h2>
                            <p>Choose a definition branch</p>
                        </div>
                        <span className="material-icons">account_tree</span>
                    </div>

                    <div className="asset-tree">
                        {treeGroups.map((category) => (
                            <div key={category.key} className="asset-tree__group">
                                <button type="button" className="asset-tree__category" onClick={() => toggleCategory(category.key)}>
                                    <div className="asset-tree__category-title">
                                        <span className="material-icons asset-tree__category-icon">{category.icon}</span>
                                        <span>{category.title}</span>
                                    </div>
                                    <div className="asset-tree__category-meta">
                                        <span>{category.children.reduce((total, child) => total + child.assetCount, 0)} assets</span>
                                        <span className="material-icons">
                                            {expandedCategories[category.key] ? 'expand_less' : 'expand_more'}
                                        </span>
                                    </div>
                                </button>

                                {expandedCategories[category.key] && (
                                    <div className="asset-tree__children">
                                        {category.children.length === 0 ? (
                                            <div className="asset-tree__empty">No definitions mapped to this section.</div>
                                        ) : (
                                            category.children.map((definition) => (
                                                <button
                                                    key={definition.id}
                                                    type="button"
                                                    className={`asset-tree__item ${selectedDefinitionId === definition.id ? 'asset-tree__item--active' : ''}`}
                                                    onClick={() => setSelectedDefinitionId(definition.id)}
                                                >
                                                    <div className="asset-tree__item-icon" style={{ background: `${definition.color || 'var(--color-primary)'}15`, color: definition.color || 'var(--color-primary)' }}>
                                                        <span className="material-icons">{definition.icon || 'category'}</span>
                                                    </div>
                                                    <div className="asset-tree__item-content">
                                                        <span>{definition.name}</span>
                                                        <small>{definition.assetCount} assets</small>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </aside>

                <section className="asset-page__content-panel glass-effect">
                    <div className="asset-page__table-header">
                        <div>
                            <h2>{selectedDefinition ? selectedDefinition.name : 'Select a definition'}</h2>
                            <p>
                                {selectedDefinition
                                    ? `${selectedDefinitionAssets.length} matched assets`
                                    : 'Choose a definition from the tree menu to view its asset list.'}
                            </p>
                        </div>
                        {selectedDefinition && (
                            <button type="button" className="asset-page__back-btn" onClick={() => setSelectedDefinitionId(null)}>
                                <span className="material-icons">close</span>
                                Clear selection
                            </button>
                        )}
                    </div>

                    {!selectedDefinition ? (
                        <div className="asset-page__empty-state">
                            <span className="material-icons">account_tree</span>
                            <p>Choose a definition from the left tree to open its asset list.</p>
                        </div>
                    ) : selectedDefinitionAssets.length === 0 ? (
                        <div className="asset-page__empty-state">
                            <span className="material-icons">search_off</span>
                            <p>No assets available for this definition with the current filters.</p>
                        </div>
                    ) : (
                        <>
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
                                    {pagedAssets.map((asset) => {
                                        const definition = getDefinition(asset.definitionId)
                                        const tags = Array.isArray(asset.tags) ? asset.tags : []

                                        return (
                                            <tr key={asset.id} className="asset-table__row" onClick={() => navigate(`/assets/${asset.id}`)}>
                                                <td>
                                                    <div className="asset-table__name-cell">
                                                        <div
                                                            className="asset-table__icon"
                                                            style={{
                                                                background: definition ? `${definition.color}15` : 'var(--bg-hover)',
                                                                color: definition?.color || 'var(--text-muted)',
                                                            }}
                                                        >
                                                            <span className="material-icons">{definition?.icon || 'help_outline'}</span>
                                                        </div>
                                                        <span className="asset-table__name-text">{asset.name}</span>
                                                    </div>
                                                </td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{definition?.name || 'Unknown Type'}</td>
                                                <td>
                                                    <StatusBadge status={asset.status} />
                                                </td>
                                                <td>
                                                    <div className="asset-table__tags">
                                                        {tags.slice(0, 3).map((tag) => (
                                                            <span key={tag} className="asset-tag">{tag}</span>
                                                        ))}
                                                        {tags.length > 3 && (
                                                            <span className="asset-tag asset-tag--more">+{tags.length - 3}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                    {new Date(asset.updatedAt).toLocaleDateString()}
                                                </td>
                                                <td onClick={(e) => e.stopPropagation()}>
                                                    {canWrite && (
                                                        <button
                                                            className="asset-table__action-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                navigate(`/assets/${asset.id}/edit`)
                                                            }}
                                                        >
                                                            <span className="material-icons">edit</span>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>

                            {pageCount > 1 && (
                                <div className="asset-page__pagination">
                                    <button
                                        type="button"
                                        className="asset-page__pagination-btn asset-page__pagination-btn--nav"
                                        onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                                        disabled={safePage === 1}
                                    >
                                        <span className="material-icons">chevron_left</span>
                                        Prev
                                    </button>

                                    <div className="asset-page__pagination-pages">
                                        {paginationItems.map((item, index) =>
                                            item === 'ellipsis' ? (
                                                <span key={`ellipsis-${index}`} className="asset-page__pagination-ellipsis">…</span>
                                            ) : (
                                                <button
                                                    key={item}
                                                    type="button"
                                                    className={`asset-page__pagination-btn ${safePage === item ? 'asset-page__pagination-btn--active' : ''}`}
                                                    onClick={() => setCurrentPage(item)}
                                                >
                                                    {item}
                                                </button>
                                            )
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        className="asset-page__pagination-btn asset-page__pagination-btn--nav"
                                        onClick={() => setCurrentPage((value) => Math.min(pageCount, value + 1))}
                                        disabled={safePage === pageCount}
                                    >
                                        Next
                                        <span className="material-icons">chevron_right</span>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>

            <div className="asset-page__footer">
                <span>Showing <strong>{selectedDefinition ? selectedDefinitionAssets.length : filteredAssets.length}</strong> assets</span>
            </div>
        </div>
    )
}
