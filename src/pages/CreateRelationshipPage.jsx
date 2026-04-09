import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAssetStore from '../stores/useAssetStore'
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
    const addRelationship = useRelationshipStore((s) => s.addRelationship)
    const relationships = useRelationshipStore((s) => s.relationships)

    const [sourceId, setSourceId] = useState('')
    const [targetId, setTargetId] = useState('')
    const [type, setType] = useState('depends_on')
    const [error, setError] = useState('')

    // Filter available targets to avoid self-reference or duplicates (optional)
    const availableTargets = assets.filter(a => a.id !== sourceId)

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
    const selectedTarget = assets.find(a => a.id === availableTargets.find(t => t.id === targetId)?.id)

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
                            <label>Source Asset</label>
                            <div className="select-wrapper">
                                <select
                                    value={sourceId}
                                    onChange={(e) => setSourceId(e.target.value)}
                                    className={!sourceId ? 'is-placeholder' : ''}
                                >
                                    <option value="" disabled>Select Source...</option>
                                    {assets.map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                                <span className="material-icons select-caret">expand_more</span>
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
                            <label>Target Asset</label>
                            <div className="select-wrapper">
                                <select
                                    value={targetId}
                                    onChange={(e) => setTargetId(e.target.value)}
                                    className={!targetId ? 'is-placeholder' : ''}
                                    disabled={!sourceId}
                                >
                                    <option value="" disabled>Select Target...</option>
                                    {availableTargets.map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                                <span className="material-icons select-caret">expand_more</span>
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
