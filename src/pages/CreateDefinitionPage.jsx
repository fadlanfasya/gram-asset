import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import useDefinitionStore from '../stores/useDefinitionStore'
import './CreateDefinitionPage.css'

const AVAILABLE_ICONS = [
    'computer', 'dns', 'storage', 'security', 'smartphone', 'devices',
    'print', 'monitor', 'list_alt', 'cloud', 'router', 'hub',
    'terminal', 'memory', 'sd_card', 'developer_board',
]

const ACCENT_COLORS = [
    '#3c83f6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#64748b', '#ec4899',
]

const FIELD_TYPES = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'select', label: 'Select' },
    { value: 'date', label: 'Date' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'url', label: 'URL' },
]

function emptyField() {
    return {
        id: crypto.randomUUID(),
        name: '',
        type: 'text',
        required: false,
        options: [],
    }
}

export default function CreateDefinitionPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const addDefinition = useDefinitionStore((s) => s.addDefinition)
    const updateDefinition = useDefinitionStore((s) => s.updateDefinition)
    const getDefinition = useDefinitionStore((s) => s.getDefinition)

    const isEdit = Boolean(id)
    const existing = isEdit ? getDefinition(id) : null

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [icon, setIcon] = useState('computer')
    const [color, setColor] = useState('#3c83f6')
    const [fields, setFields] = useState([emptyField()])
    const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
        if (existing) {
            setName(existing.name)
            setDescription(existing.description)
            setIcon(existing.icon)
            setColor(existing.color)
            setFields(existing.fields.length > 0 ? existing.fields : [emptyField()])
        }
    }, [existing])

    function markChanged() {
        setHasChanges(true)
    }

    function handleAddField() {
        setFields([...fields, emptyField()])
        markChanged()
    }

    function handleRemoveField(fieldId) {
        setFields(fields.filter((f) => f.id !== fieldId))
        markChanged()
    }

    function handleFieldChange(fieldId, key, value) {
        setFields(fields.map((f) => (f.id === fieldId ? { ...f, [key]: value } : f)))
        markChanged()
    }

    async function handleSave() {
        const validFields = fields.filter((f) => f.name.trim() !== '')
        const defData = {
            name: name.trim(),
            description: description.trim(),
            icon,
            color,
            fields: validFields,
        }

        if (isEdit) {
            await updateDefinition(id, defData)
        } else {
            await addDefinition(defData)
        }
        navigate('/definitions')
    }

    const canSave = name.trim().length > 0

    return (
        <div className="create-def">
            {/* Breadcrumb */}
            <nav className="create-def__breadcrumb">
                <Link to="/">Dashboard</Link>
                <span className="material-icons create-def__breadcrumb-sep">chevron_right</span>
                <Link to="/definitions">Definitions</Link>
                <span className="material-icons create-def__breadcrumb-sep">chevron_right</span>
                <span className="create-def__breadcrumb-current">
                    {isEdit ? 'Edit Definition' : 'New Definition'}
                </span>
            </nav>

            {/* Page Title */}
            <div className="create-def__page-header">
                <h1 className="create-def__page-title">
                    {isEdit ? 'Edit Asset Definition' : 'Create Asset Definition'}
                </h1>
                <p className="create-def__page-subtitle">
                    Define the schema and visual properties for a new category of IT assets.
                </p>
            </div>

            {/* Section: General Information */}
            <div className="create-def__section">
                <div className="create-def__section-header">
                    <span className="material-icons create-def__section-icon" style={{ color: 'var(--color-primary)' }}>info</span>
                    <h2 className="create-def__section-title">General Information</h2>
                </div>

                <div className="create-def__field-group">
                    <label className="create-def__label">Definition Name</label>
                    <input
                        type="text"
                        className="create-def__input"
                        placeholder="e.g. Virtual Machine"
                        value={name}
                        onChange={(e) => { setName(e.target.value); markChanged() }}
                    />
                </div>

                <div className="create-def__field-group">
                    <label className="create-def__label">Description</label>
                    <textarea
                        className="create-def__textarea"
                        placeholder="Standard configuration for cloud-based server instances."
                        rows={4}
                        value={description}
                        onChange={(e) => { setDescription(e.target.value); markChanged() }}
                    ></textarea>
                </div>
            </div>

            {/* Section: Visual Identity */}
            <div className="create-def__section">
                <div className="create-def__section-header">
                    <span className="material-icons create-def__section-icon" style={{ color: 'var(--color-accent-cyan)' }}>palette</span>
                    <h2 className="create-def__section-title">Visual Identity</h2>
                </div>

                <div className="create-def__visual-row">
                    {/* Icon Picker */}
                    <div className="create-def__picker-group">
                        <label className="create-def__label">Select Icon</label>
                        <div className="create-def__icon-grid">
                            {AVAILABLE_ICONS.map((ic) => (
                                <button
                                    key={ic}
                                    type="button"
                                    className={`create-def__icon-btn ${icon === ic ? 'create-def__icon-btn--active' : ''}`}
                                    style={icon === ic ? { background: color, color: '#fff' } : undefined}
                                    onClick={() => { setIcon(ic); markChanged() }}
                                >
                                    <span className="material-icons">{ic}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div className="create-def__picker-group">
                        <label className="create-def__label">Accent Color</label>
                        <div className="create-def__color-grid">
                            {ACCENT_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`create-def__color-btn ${color === c ? 'create-def__color-btn--active' : ''}`}
                                    style={{ background: c }}
                                    onClick={() => { setColor(c); markChanged() }}
                                >
                                    {color === c && <span className="material-icons" style={{ fontSize: 16, color: '#fff' }}>check</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="create-def__preview">
                    <div
                        className="create-def__preview-icon"
                        style={{ background: `${color}20`, color }}
                    >
                        <span className="material-icons">{icon}</span>
                    </div>
                    <div>
                        <span className="create-def__preview-label">Preview</span>
                        <span className="create-def__preview-name">{name || 'Definition Name'}</span>
                    </div>
                </div>
            </div>

            {/* Section: Custom Fields */}
            <div className="create-def__section">
                <div className="create-def__section-header">
                    <span className="material-icons create-def__section-icon" style={{ color: 'var(--color-primary)' }}>view_list</span>
                    <h2 className="create-def__section-title">Custom Fields</h2>
                    <span className="create-def__field-count">
                        {fields.filter((f) => f.name.trim()).length} Fields Defined
                    </span>
                </div>

                {/* Sticky Action Bar */}
                <div className="create-def__action-bar">
                    <div className="create-def__unsaved">
                        {hasChanges && (
                            <>
                                <span className="material-icons" style={{ fontSize: 16, color: 'var(--color-amber)' }}>auto_awesome</span>
                                <span>Unsaved changes will be lost if you leave.</span>
                            </>
                        )}
                    </div>
                    <div className="create-def__action-buttons">
                        <button
                            type="button"
                            className="create-def__cancel-btn"
                            onClick={() => navigate('/definitions')}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="create-def__save-btn"
                            disabled={!canSave}
                            onClick={handleSave}
                        >
                            <span className="material-icons" style={{ fontSize: 18 }}>save</span>
                            Save Definition
                        </button>
                    </div>
                </div>

                {/* Field Rows */}
                <div className="create-def__fields-list">
                    {fields.map((field, idx) => (
                        <div key={field.id} className="field-row">
                            {/* Drag handle */}
                            <div className="field-row__handle">
                                <span className="material-icons">drag_indicator</span>
                            </div>

                            {/* Field Name */}
                            <input
                                type="text"
                                className="field-row__name"
                                placeholder="Field name..."
                                value={field.name}
                                onChange={(e) => handleFieldChange(field.id, 'name', e.target.value)}
                            />

                            {/* Field Type */}
                            <div className="field-row__type-wrapper">
                                <select
                                    className="field-row__type"
                                    value={field.type}
                                    onChange={(e) => handleFieldChange(field.id, 'type', e.target.value)}
                                >
                                    {FIELD_TYPES.map((ft) => (
                                        <option key={ft.value} value={ft.value}>{ft.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Required Toggle */}
                            <label className="field-row__required">
                                <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => handleFieldChange(field.id, 'required', e.target.checked)}
                                />
                                <span className="field-row__checkbox"></span>
                            </label>

                            {/* Delete */}
                            <button
                                type="button"
                                className="field-row__delete"
                                onClick={() => handleRemoveField(field.id)}
                                disabled={fields.length <= 1}
                            >
                                <span className="material-icons">delete_outline</span>
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add Field */}
                <button
                    type="button"
                    className="create-def__add-field"
                    onClick={handleAddField}
                >
                    <span className="material-icons">add_circle_outline</span>
                    Add Field
                </button>
            </div>
        </div>
    )
}
