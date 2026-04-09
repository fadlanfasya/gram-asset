import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import useAssetStore from '../stores/useAssetStore'
import useDefinitionStore from '../stores/useDefinitionStore'
import DynamicFieldRenderer from '../components/assets/DynamicFieldRenderer'
import './CreateAssetPage.css'

export default function CreateAssetPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEdit = Boolean(id)

    // Stores
    const assets = useAssetStore((s) => s.assets)
    const addAsset = useAssetStore((s) => s.addAsset)
    const updateAsset = useAssetStore((s) => s.updateAsset)
    const getAsset = useAssetStore((s) => s.getAsset)
    const definitions = useDefinitionStore((s) => s.definitions)

    // State
    const [definitionId, setDefinitionId] = useState('')
    const [name, setName] = useState('')
    const [status, setStatus] = useState('active')
    const [description, setDescription] = useState('')
    const [tags, setTags] = useState([])
    const [tagInput, setTagInput] = useState('')

    // Dynamic fields state: { "IP Address": "192.168.1.1", ... }
    const [fieldValues, setFieldValues] = useState({})

    // Validation errors
    const [errors, setErrors] = useState({})

    // If editing, load data
    useEffect(() => {
        if (isEdit) {
            const asset = getAsset(id)
            if (asset) {
                setDefinitionId(asset.definitionId)
                setName(asset.name)
                setStatus(asset.status)
                setDescription(asset.description)
                setTags(asset.tags)
                setFieldValues(asset.fieldValues || {})
            }
        } else if (definitions.length > 0 && !definitionId) {
            // Set default definition to first one if new
            setDefinitionId(definitions[0].id)
        }
    }, [id, isEdit, assets, definitions])

    // Get active definition object to know expected fields
    const activeDefinition = definitions.find(d => d.id === definitionId)

    // Handlers
    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault()
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()])
            }
            setTagInput('')
        }
    }

    const removeTag = (tag) => {
        setTags(tags.filter(t => t !== tag))
    }

    const handleDynamicChange = (fieldName, val) => {
        setFieldValues(prev => ({
            ...prev,
            [fieldName]: val
        }))

        // Clear error for this field if exists
        if (errors[fieldName]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[fieldName]
                return newErrors
            })
        }
    }

    const validate = () => {
        const newErrors = {}
        if (!name.trim()) newErrors.name = 'Asset name is required'

        // Validate required dynamic fields
        if (activeDefinition) {
            activeDefinition.fields.forEach(field => {
                if (field.required) {
                    const val = fieldValues[field.name]
                    if (val === undefined || val === null || val === '') {
                        newErrors[field.name] = `${field.name} is required`
                    }
                }
            })
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        const assetData = {
            name,
            definitionId,
            status,
            description,
            tags,
            fieldValues
        }

        if (isEdit) {
            await updateAsset(id, assetData)
        } else {
            await addAsset(assetData)
        }
        navigate('/assets')
    }

    return (
        <div className="create-asset">
            {/* Breadcrumb */}
            <nav className="breadcrumb">
                <Link to="/assets">Assets</Link>
                <span className="material-icons">chevron_right</span>
                <span>{isEdit ? 'Edit Asset' : 'Create New Asset'}</span>
            </nav>

            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">{isEdit ? 'Edit Asset' : 'Register New Asset'}</h1>
                <p className="page-subtitle">Fill in the details below to add a new item to your inventory.</p>
            </div>

            <form onSubmit={handleSubmit} className="asset-form-layout">
                {/* Left Column: Basic Info */}
                <div className="form-section">
                    <div className="form-section__header">
                        <span className="material-icons form-section__icon">info</span>
                        <h3>Basic Information</h3>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Asset Name <span className="form-required">*</span></label>
                        <input
                            type="text"
                            className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                            placeholder="e.g. PROD-WEB-01"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        {errors.name && <span className="form-error">{errors.name}</span>}
                    </div>

                    {!isEdit && (
                        <div className="form-group">
                            <label className="form-label">Asset Type <span className="form-required">*</span></label>
                            <div className="select-wrapper">
                                <select
                                    value={definitionId}
                                    onChange={(e) => {
                                        setDefinitionId(e.target.value)
                                        setFieldValues({}) // Reset fields on type change
                                        setErrors({})
                                    }}
                                    className="form-input"
                                >
                                    {definitions.map(def => (
                                        <option key={def.id} value={def.id}>{def.name}</option>
                                    ))}
                                </select>
                                <span className="material-icons select-arrow">expand_more</span>
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <div className="status-selector">
                            {['active', 'maintenance', 'decommissioned'].map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    className={`status-btn ${status === s ? `status-btn--${s}` : ''}`}
                                    onClick={() => setStatus(s)}
                                >
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Tags</label>
                        <div className="tag-input-container">
                            {tags.map(tag => (
                                <span key={tag} className="tag-chip">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)}>×</button>
                                </span>
                            ))}
                            <input
                                type="text"
                                className="tag-input"
                                placeholder="Add tags..."
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                            />
                        </div>
                        <span className="form-hint">Press Enter to add tags</span>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-textarea"
                            rows="3"
                            placeholder="Brief description of the asset..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>
                </div>

                {/* Right Column: Dynamic Fields */}
                <div className="form-section">
                    <div className="form-section__header">
                        <span className="material-icons form-section__icon" style={{ color: activeDefinition?.color }}>
                            {activeDefinition?.icon || 'tune'}
                        </span>
                        <h3>{activeDefinition?.name || 'Asset'} Specifications</h3>
                    </div>

                    {activeDefinition?.fields.length === 0 ? (
                        <div className="empty-fields-msg">
                            No custom fields defined for this asset type.
                        </div>
                    ) : (
                        <div className="dynamic-fields-grid">
                            {activeDefinition?.fields.map(field => (
                                <DynamicFieldRenderer
                                    key={field.id}
                                    field={field}
                                    value={fieldValues[field.name]}
                                    onChange={handleDynamicChange}
                                    error={errors[field.name]}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="form-actions glass-effect">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => navigate('/assets')}
                    >
                        Cancel
                    </button>
                    <button type="submit" className="btn-save">
                        <span className="material-icons">save</span>
                        Save Asset
                    </button>
                </div>
            </form>
        </div>
    )
}
