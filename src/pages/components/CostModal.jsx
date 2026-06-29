import { useEffect, useState } from 'react'
import { X, Trash2, Plus } from 'lucide-react'
import { costsApi } from '../../utils/atsApi'
import './CostModal.css'

export default function CostModal({ resource, onClose, onRefresh }) {
    const [costs, setCosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [newYear, setNewYear] = useState(new Date().getFullYear())
    const [newAmount, setNewAmount] = useState('')
    const [error, setError] = useState('')

    useEffect(() => { load() }, [resource.id])

    const load = async () => {
        try {
            setLoading(true)
            const data = await costsApi.getForResource(resource.id)
            setCosts(data.costs || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async (e) => {
        e.preventDefault()
        if (!newAmount) return setError('Amount is required')
        try {
            setError('')
            await costsApi.add(resource.id, { year: Number(newYear), amount: Number(newAmount) })
            setNewAmount('')
            await load()
            onRefresh()
        } catch (err) {
            setError(err.message)
        }
    }

    const handleDelete = async (id) => {
        try {
            setError('')
            await costsApi.remove(id)
            await load()
            onRefresh()
        } catch (err) {
            setError(err.message)
        }
    }

    const total = costs.reduce((sum, c) => sum + Number(c.amount), 0)

    return (
        <div className="ats-form-overlay" onClick={onClose}>
            <div className="cost-modal" onClick={(e) => e.stopPropagation()}>
                <div className="ats-form-header">
                    <div>
                        <h2>Cost Management</h2>
                        <p className="cost-modal-resource">{resource.name}</p>
                    </div>
                    <button className="ats-close-btn" onClick={onClose}><X size={22} /></button>
                </div>

                {error && <div className="cost-modal-error">{error}</div>}

                <div className="cost-modal-body">
                    <table className="cost-table">
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th>Amount (IDR)</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="3" className="cost-empty">Loading...</td></tr>
                            ) : costs.length === 0 ? (
                                <tr><td colSpan="3" className="cost-empty">No costs recorded yet.</td></tr>
                            ) : costs.map((c) => (
                                <tr key={c.id}>
                                    <td className="cost-year">{c.year}</td>
                                    <td className="cost-amount">{Number(c.amount).toLocaleString('id-ID')}</td>
                                    <td>
                                        <button className="ats-action-btn ats-action-btn--danger" onClick={() => handleDelete(c.id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {costs.length > 1 && (
                            <tfoot>
                                <tr>
                                    <td className="cost-total-label">Total</td>
                                    <td className="cost-total">{total.toLocaleString('id-ID')}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>

                    <form className="cost-add-form" onSubmit={handleAdd}>
                        <h3>Add Cost Entry</h3>
                        <div className="cost-add-row">
                            <label>
                                Year
                                <input
                                    type="number"
                                    value={newYear}
                                    onChange={(e) => setNewYear(e.target.value)}
                                    min="2018"
                                    max="2040"
                                />
                            </label>
                            <label>
                                Amount (IDR)
                                <input
                                    type="number"
                                    value={newAmount}
                                    onChange={(e) => setNewAmount(e.target.value)}
                                    placeholder="0"
                                    min="0"
                                />
                            </label>
                            <button type="submit" className="ats-btn ats-btn--primary cost-add-btn">
                                <Plus size={15} /> Add
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
