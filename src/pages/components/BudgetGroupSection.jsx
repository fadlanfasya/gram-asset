import { useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { budgetGroupsApi } from '../../utils/atsApi'
import './BudgetGroupSection.css'

const EMPTY_FORM = { name: '', capexOpex: '', investYear: '' }

export default function BudgetGroupSection({ groups, onRefresh }) {
    const [editingId, setEditingId] = useState(null)
    const [showNew, setShowNew] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [error, setError] = useState('')

    const reset = () => { setForm(EMPTY_FORM); setError('') }

    const save = async (id) => {
        if (!form.name.trim()) return setError('Name is required')
        const data = {
            name: form.name,
            capexOpex: form.capexOpex || null,
            investYear: form.investYear ? Number(form.investYear) : null,
        }
        try {
            setError('')
            if (id) {
                await budgetGroupsApi.update(id, data)
                setEditingId(null)
            } else {
                await budgetGroupsApi.create(data)
                setShowNew(false)
            }
            reset()
            onRefresh()
        } catch (err) {
            setError(err.message)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this budget group? Resources will be unlinked.')) return
        try {
            await budgetGroupsApi.remove(id)
            onRefresh()
        } catch (err) {
            setError(err.message)
        }
    }

    const startEdit = (g) => {
        setEditingId(g.id)
        setForm({ name: g.name, capexOpex: g.capexOpex || '', investYear: g.investYear?.toString() || '' })
    }

    return (
        <div className="bg-section">
            <div className="bg-top">
                <h3>Budget Groups</h3>
                <button className="ats-btn ats-btn--secondary bg-new-btn" onClick={() => { reset(); setShowNew(true) }}>
                    <Plus size={15} /> New Group
                </button>
            </div>

            {error && <div className="ats-error bg-error">{error}</div>}

            {showNew && (
                <div className="bg-form-card">
                    <BgFields form={form} onChange={setForm} />
                    <div className="bg-form-actions">
                        <button className="ats-btn ats-btn--secondary" onClick={() => { setShowNew(false); reset() }}>Cancel</button>
                        <button className="ats-btn ats-btn--primary" onClick={() => save(null)}>Create</button>
                    </div>
                </div>
            )}

            <div className="bg-grid">
                {groups.map((g) => (
                    <div key={g.id} className="bg-card">
                        {editingId === g.id ? (
                            <>
                                <BgFields form={form} onChange={setForm} />
                                <div className="bg-form-actions">
                                    <button className="ats-btn ats-btn--secondary" onClick={() => { setEditingId(null); reset() }}>Cancel</button>
                                    <button className="ats-btn ats-btn--primary" onClick={() => save(g.id)}>Save</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="bg-card-info">
                                    <span className="bg-card-name">{g.name}</span>
                                    <div className="bg-card-chips">
                                        {g.capexOpex && (
                                            <span className={`ats-badge ${g.capexOpex === 'capex' ? 'badge--blue' : 'badge--amber'}`}>
                                                {g.capexOpex.toUpperCase()}
                                            </span>
                                        )}
                                        {g.investYear && <span className="ats-chip">Inv. {g.investYear}</span>}
                                        <span className="ats-chip">{g.resources?.length ?? 0} resources</span>
                                    </div>
                                </div>
                                <div className="bg-card-actions">
                                    <button className="ats-action-btn" onClick={() => startEdit(g)}><Edit2 size={14} /></button>
                                    <button className="ats-action-btn ats-action-btn--danger" onClick={() => handleDelete(g.id)}><Trash2 size={14} /></button>
                                </div>
                            </>
                        )}
                    </div>
                ))}

                {groups.length === 0 && !showNew && (
                    <p className="bg-empty">No budget groups yet. Create one to categorize ATS resources.</p>
                )}
            </div>
        </div>
    )
}

function BgFields({ form, onChange }) {
    const set = (key, val) => onChange((prev) => ({ ...prev, [key]: val }))
    return (
        <div className="bg-fields">
            <label>
                Name *
                <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. ATS A01" />
            </label>
            <label>
                Capex / Opex
                <select value={form.capexOpex} onChange={(e) => set('capexOpex', e.target.value)}>
                    <option value="">Select</option>
                    <option value="capex">CAPEX</option>
                    <option value="opex">OPEX</option>
                </select>
            </label>
            <label>
                Invest Year
                <input
                    type="number"
                    value={form.investYear}
                    onChange={(e) => set('investYear', e.target.value)}
                    placeholder="e.g. 2020"
                    min="2000"
                    max="2040"
                />
            </label>
        </div>
    )
}
