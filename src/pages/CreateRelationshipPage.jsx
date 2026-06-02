import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAssetStore from '../stores/useAssetStore'
import useDefinitionStore from '../stores/useDefinitionStore'
import useRelationshipStore from '../stores/useRelationshipStore'
import './CreateRelationshipPage.css'

const RELATIONSHIP_TYPES = [
    { value: 'depends_on', label: 'Depends On', icon: 'subdirectory_arrow_right' },
    { value: 'hosted_on', label: 'Hosted On', icon: 'dns' },
    { value: 'connects_to', label: 'Connects To', icon: 'cable' },
    { value: 'manages', label: 'Manages', icon: 'settings_remote' },
    { value: 'backup_to', label: 'Backed Up To', icon: 'save' },
]

export default function CreateRelationshipPage() {
    const navigate = useNavigate()
    const assets = useAssetStore((s) => s.assets)
    const definitions = useDefinitionStore((s) => s.definitions)
    const addRelationship = useRelationshipStore((s) => s.addRelationship)
    const relationships = useRelationshipStore((s) => s.relationships)

    const [sourceId, setSourceId] = useState('')
    const [targetId, setTargetId] = useState('')
    const [sourceDefId, setSourceDefId] = useState('')
    const [targetDefId, setTargetDefId] = useState('')
    const [type, setType] = useState('depends_on')
    const [error, setError] = useState('')
    const [sourceSearch, setSourceSearch] = useState('')
    const [targetSearch, setTargetSearch] = useState('')
    const [sourceOpen, setSourceOpen] = useState(false)
    const [targetOpen, setTargetOpen] = useState(false)

    const availableTargets = assets.filter(a => a.id !== sourceId)
    const sourceOptions = assets
        .filter(a => !sourceDefId || a.definitionId === sourceDefId)
        .filter(a => a.name.toLowerCase().includes(sourceSearch.toLowerCase()))
    const targetOptions = availableTargets
        .filter(a => !targetDefId || a.definitionId === targetDefId)
        .filter(a => a.name.toLowerCase().includes(targetSearch.toLowerCase()))

    const handleSelectSource = (asset) => {
        setSourceId(asset.id)
        setSourceSearch(asset.name)
        setSourceOpen(false)
        setTargetId('')
        setTargetSearch('')
    }

    const handleSelectTarget = (asset) => {
        setTargetId(asset.id)
        setTargetSearch(asset.name)
        setTargetOpen(false)
    }

    const handleSourceSearchChange = (value) => {
        setSourceSearch(value)
        setSourceOpen(true)
        if (assets.find(a => a.name === value)?.id !== sourceId) {
            setSourceId('')
            setTargetId('')
            setTargetSearch('')
        }
    }

    const handleTargetSearchChange = (value) => {
        setTargetSearch(value)
        setTargetOpen(true)
        if (availableTargets.find(a => a.name === value)?.id !== targetId) {
            setTargetId('')
        }
    }

    const handleSourceDefChange = (value) => {
        setSourceDefId(value)
        setSourceId('')
        setSourceSearch('')
        setTargetId('')
        setTargetSearch('')
    }

    const handleTargetDefChange = (value) => {
        setTargetDefId(value)
        setTargetId('')
        setTargetSearch('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!sourceId || !targetId) {
            setError('Please select both source and target assets.')
            return
        }

        // Check if relationship already exists
        const exists = relationships.some(r =>
            r.sourceId === sourceId && r.targetId === targetId && r.type === type
        )

        if (exists) {
            setError('This relationship already exists.')
            return
        }

        await addRelationship({
            sourceId,
            targetId,
            type
        })

        navigate('/relationships')
    }

    const selectedSource = assets.find(a => a.id === sourceId)
    const selectedTarget = assets.find(a => a.id === targetId)

    return (
        <div className="create-rel-page">
            <nav className="breadcrumb">
                <span className="material-icons breadcrumb-icon">hub</span>
                <span>Relationships</span>
                <span className="material-icons">chevron_right</span>
                <span>Add New Relationship</span>
            </nav>

            <div className="rel-form-container glass-effect">
                <div className="rel-form-header">
                    <h1>Define Dependency</h1>
                    <p>Create a logical link between two IT assets.</p>
                </div>

                <form onSubmit={handleSubmit} className="rel-form">
                    <div className="rel-form-row">
                        {/* Source */}
                        <div className="rel-input-group">
                            <label>Source Definition</label>
                            <div className="select-wrapper">
                                <select
                                    value={sourceDefId}
                                    onChange={(e) => handleSourceDefChange(e.target.value)}
                                    className={!sourceDefId ? 'is-placeholder' : ''}
                                >
                                    <option value="">Select definition...</option>
                                    {definitions.map(def => (
                                        <option key={def.id} value={def.id}>{def.name}</option>
                                    ))}
                                </select>
                                <span className="material-icons select-caret">expand_more</span>
                            </div>
                        </div>

                        <div className="rel-input-group">
                            <label>Source Asset</label>
                            <div className="select-wrapper search-dropdown">
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder={sourceDefId ? 'Search source asset...' : 'Select definition first'}
                                    value={sourceSearch}
                                    onChange={(e) => handleSourceSearchChange(e.target.value)}
                                    onFocus={() => setSourceOpen(true)}
                                    disabled={!sourceDefId}
                                />
                                <span className="material-icons select-caret">search</span>
                                {sourceOpen && sourceDefId && (
                                    <div className="search-list">
                                        {sourceOptions.length > 0 ? (
                                            sourceOptions.map(asset => (
                                                <button
                                                    key={asset.id}
                                                    type="button"
                                                    className={`search-list-item ${asset.id === sourceId ? 'search-list-item--active' : ''}`}
                                                    onClick={() => handleSelectSource(asset)}
                                                >
                                                    {asset.name}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="search-list-empty">No source assets found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {selectedSource && (
                                <div className="asset-preview">
                                    <span className="material-icons">info</span>
                                    {selectedSource.name} ({selectedSource.status})
                                </div>
                            )}
                        </div>

                        {/* Type */}
                        <div className="rel-type-picker">
                            <label>Relationship Type</label>
                            <div className="type-grid">
                                {RELATIONSHIP_TYPES.map(t => (
                                    <button
                                        key={t.value}
                                        type="button"
                                        className={`type-btn ${type === t.value ? 'type-btn--active' : ''}`}
                                        onClick={() => setType(t.value)}
                                    >
                                        <span className="material-icons">{t.icon}</span>
                                        <span>{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Target */}
                        <div className="rel-input-group">
                            <label>Target Definition</label>
                            <div className="select-wrapper">
                                <select
                                    value={targetDefId}
                                    onChange={(e) => handleTargetDefChange(e.target.value)}
                                    className={!targetDefId ? 'is-placeholder' : ''}
                                >
                                    <option value="">Select definition...</option>
                                    {definitions.map(def => (
                                        <option key={def.id} value={def.id}>{def.name}</option>
                                    ))}
                                </select>
                                <span className="material-icons select-caret">expand_more</span>
                            </div>
                        </div>

                        <div className="rel-input-group">
                            <label>Target Asset</label>
                            <div className="select-wrapper search-dropdown">
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder={targetDefId ? 'Search target asset...' : 'Select definition first'}
                                    value={targetSearch}
                                    onChange={(e) => handleTargetSearchChange(e.target.value)}
                                    onFocus={() => setTargetOpen(true)}
                                    disabled={!targetDefId}
                                />
                                <span className="material-icons select-caret">search</span>
                                {targetOpen && targetDefId && (
                                    <div className="search-list">
                                        {targetOptions.length > 0 ? (
                                            targetOptions.map(asset => (
                                                <button
                                                    key={asset.id}
                                                    type="button"
                                                    className={`search-list-item ${asset.id === targetId ? 'search-list-item--active' : ''}`}
                                                    onClick={() => handleSelectTarget(asset)}
                                                >
                                                    {asset.name}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="search-list-empty">No target assets found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {selectedTarget && (
                                <div className="asset-preview">
                                    <span className="material-icons">info</span>
                                    {selectedTarget.name} ({selectedTarget.status})
                                </div>
                            )}
                        </div>
                    </div>

                    {error && <div className="form-error-msg">{error}</div>}

                    <div className="rel-form-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => navigate('/relationships')}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn-save">
                            <span className="material-icons">link</span>
                            Create Link
                        </button>
                    </div>
                </form>
            </div>

            {/* Visual Preview */}
            <div className="rel-visual-preview">
                <div className={`preview-node ${sourceId ? 'preview-node--active' : ''}`}>
                    <div className="preview-icon">
                        <span className="material-icons">source</span>
                    </div>
                    <span>Source</span>
                </div>

                <div className="preview-line">
                    <span className="preview-label">{RELATIONSHIP_TYPES.find(t => t.value === type)?.label}</span>
                    <div className="line-dashed"></div>
                    <span className="material-icons line-arrow">arrow_forward</span>
                </div>

                <div className={`preview-node ${targetId ? 'preview-node--active' : ''}`}>
                    <div className="preview-icon">
                        <span className="material-icons">gps_fixed</span>
                    </div>
                    <span>Target</span>
                </div>
            </div>
        </div>
    )
}
