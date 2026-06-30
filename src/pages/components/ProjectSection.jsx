import { useState } from 'react'
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, Link2, Unlink } from 'lucide-react'
import { projectsApi } from '../../utils/atsApi'
import './ProjectSection.css'

const EMPTY_FORM = { name: '', owner: '' }

export default function ProjectSection({ projects, resources, onRefresh }) {
    const [editingId, setEditingId] = useState(null)
    const [showNew, setShowNew] = useState(false)
    const [expandedId, setExpandedId] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [linkResourceId, setLinkResourceId] = useState('')
    const [linkQty, setLinkQty] = useState(1)
    const [error, setError] = useState('')

    const reset = () => { setForm(EMPTY_FORM); setError('') }

    const save = async (id) => {
        if (!form.name.trim()) return setError('Name is required')
        const data = { name: form.name, owner: form.owner || null }
        try {
            setError('')
            if (id) {
                await projectsApi.update(id, data)
                setEditingId(null)
            } else {
                await projectsApi.create(data)
                setShowNew(false)
            }
            reset()
            onRefresh()
        } catch (err) {
            setError(err.message)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this project?')) return
        try {
            await projectsApi.remove(id)
            if (expandedId === id) setExpandedId(null)
            onRefresh()
        } catch (err) {
            setError(err.message)
        }
    }

    const handleLink = async (projectId) => {
        if (!linkResourceId) return setError('Select a resource first')
        try {
            setError('')
            await projectsApi.addResource(projectId, { resourceId: linkResourceId, quantity: Number(linkQty) || 1 })
            setLinkResourceId('')
            setLinkQty(1)
            onRefresh()
        } catch (err) {
            setError(err.message)
        }
    }

    const handleUnlink = async (projectId, resourceId) => {
        try {
            await projectsApi.removeResource(projectId, resourceId)
            onRefresh()
        } catch (err) {
            setError(err.message)
        }
    }

    const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id))

    return (
        <div className="proj-section">
            <div className="bg-top">
                <h3>Projects</h3>
                <button className="ats-btn ats-btn--secondary bg-new-btn" onClick={() => { reset(); setShowNew(true) }}>
                    <Plus size={15} /> New Project
                </button>
            </div>

            {error && <div className="ats-error bg-error">{error}</div>}

            {showNew && (
                <div className="bg-form-card">
                    <ProjFields form={form} onChange={setForm} />
                    <div className="bg-form-actions">
                        <button className="ats-btn ats-btn--secondary" onClick={() => { setShowNew(false); reset() }}>Cancel</button>
                        <button className="ats-btn ats-btn--primary" onClick={() => save(null)}>Create</button>
                    </div>
                </div>
            )}

            <div className="proj-list">
                {projects.map((project) => {
                    const linked = project.resources || []
                    const linkedIds = linked.map((r) => r.resourceId)
                    const isExpanded = expandedId === project.id
                    const isEditing = editingId === project.id
                    const unlinkedResources = resources.filter((r) => !linkedIds.includes(r.id))

                    return (
                        <div key={project.id} className={`proj-card${isExpanded ? ' proj-card--open' : ''}`}>
                            <div className="proj-card-header">
                                {isEditing ? (
                                    <div className="proj-edit-area">
                                        <ProjFields form={form} onChange={setForm} />
                                        <div className="bg-form-actions">
                                            <button className="ats-btn ats-btn--secondary" onClick={() => { setEditingId(null); reset() }}>Cancel</button>
                                            <button className="ats-btn ats-btn--primary" onClick={() => save(project.id)}>Save</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <button className="proj-toggle" onClick={() => toggle(project.id)}>
                                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                            <span className="proj-name">{project.name}</span>
                                            {project.owner && <span className="proj-owner">({project.owner})</span>}
                                            <span className="ats-chip proj-count">{linked.length} resources</span>
                                        </button>
                                        <div className="bg-card-actions">
                                            <button className="ats-action-btn" onClick={() => { setEditingId(project.id); setForm({ name: project.name, owner: project.owner || '' }) }}>
                                                <Edit2 size={14} />
                                            </button>
                                            <button className="ats-action-btn ats-action-btn--danger" onClick={() => handleDelete(project.id)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {isExpanded && !isEditing && (
                                <div className="proj-detail">
                                    {linked.length === 0 ? (
                                        <p className="proj-no-resources">No resources linked yet.</p>
                                    ) : (
                                        <div className="proj-resources">
                                            {linked.map((r) => (
                                                <div key={r.resourceId} className="proj-resource-row">
                                                    <span className="proj-resource-name">{r.resource?.name}</span>
                                                    {r.resource?.type && (
                                                        <span className={`ats-badge ${r.resource.type === 'software' ? 'badge--blue' : 'badge--purple'}`}>
                                                            {r.resource.type}
                                                        </span>
                                                    )}
                                                    <span className="ats-chip">qty: {r.quantity}</span>
                                                    <button
                                                        className="ats-action-btn ats-action-btn--danger proj-unlink-btn"
                                                        onClick={() => handleUnlink(project.id, r.resourceId)}
                                                        title="Unlink"
                                                    >
                                                        <Unlink size={13} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {unlinkedResources.length > 0 && (
                                        <div className="proj-link-form">
                                            <select
                                                value={linkResourceId}
                                                onChange={(e) => setLinkResourceId(e.target.value)}
                                            >
                                                <option value="">Link a resource...</option>
                                                {unlinkedResources.map((r) => (
                                                    <option key={r.id} value={r.id}>{r.name}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                value={linkQty}
                                                onChange={(e) => setLinkQty(e.target.value)}
                                                min="1"
                                                placeholder="Qty"
                                                className="proj-qty"
                                            />
                                            <button className="ats-btn ats-btn--primary proj-link-btn" onClick={() => handleLink(project.id)}>
                                                <Link2 size={14} /> Link
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}

                {projects.length === 0 && !showNew && (
                    <div className="bg-empty">No projects yet. Create one to link resources to product lines.</div>
                )}
            </div>
        </div>
    )
}

function ProjFields({ form, onChange }) {
    const set = (key, val) => onChange((prev) => ({ ...prev, [key]: val }))
    return (
        <div className="bg-fields">
            <label>
                Project Name *
                <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. PERURI QR" />
            </label>
            <label>
                Owner
                <input value={form.owner} onChange={(e) => set('owner', e.target.value)} placeholder="e.g. Team Digital" />
            </label>
        </div>
    )
}
