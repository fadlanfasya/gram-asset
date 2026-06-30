import { useEffect, useState } from 'react'
import { costsApi } from '../../utils/atsApi'
import './CostModal.css'

export default function CostModal({ resource, onClose, onRefresh }) {
    const [costs, setCosts]       = useState([])
    const [loading, setLoading]   = useState(true)
    const [newYear, setNewYear]   = useState(new Date().getFullYear())
    const [newAmount, setNewAmount] = useState('')
    const [error, setError]       = useState('')

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
        if (!newAmount) return setError('Jumlah wajib diisi.')
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
            <div
                className="cost-modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="cost-modal-title"
            >
                <div className="ats-form-header">
                    <div>
                        <h2 id="cost-modal-title">Kelola Biaya</h2>
                        <p className="cost-modal-resource">{resource.name.split('\n')[0]}</p>
                    </div>
                    <button className="ats-close-btn" onClick={onClose} aria-label="Tutup">
                        <span className="material-icons" aria-hidden="true">close</span>
                    </button>
                </div>

                {error && (
                    <div className="cost-modal-error" role="alert">
                        <span className="material-icons" aria-hidden="true">error</span>
                        {error}
                    </div>
                )}

                <div className="cost-modal-body">
                    <table className="cost-table">
                        <thead>
                            <tr>
                                <th scope="col">Tahun</th>
                                <th scope="col">Jumlah (IDR)</th>
                                <th scope="col"><span className="cost-sr-only">Hapus</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="3" className="cost-empty">Memuat…</td></tr>
                            ) : costs.length === 0 ? (
                                <tr><td colSpan="3" className="cost-empty">Belum ada data biaya.</td></tr>
                            ) : costs.map((c) => (
                                <tr key={c.id}>
                                    <td className="cost-year">{c.year}</td>
                                    <td className="cost-amount">{Number(c.amount).toLocaleString('id-ID')}</td>
                                    <td>
                                        <button
                                            className="ats-action-btn ats-action-btn--danger"
                                            onClick={() => handleDelete(c.id)}
                                            aria-label={`Hapus biaya ${c.year}`}
                                        >
                                            <span className="material-icons" aria-hidden="true">delete</span>
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
                        <h3>Tambah Entri Biaya</h3>
                        <div className="cost-add-row">
                            <label>
                                Tahun
                                <input
                                    type="number"
                                    value={newYear}
                                    onChange={(e) => setNewYear(e.target.value)}
                                    min="2018"
                                    max="2040"
                                />
                            </label>
                            <label>
                                Jumlah (IDR)
                                <input
                                    type="number"
                                    value={newAmount}
                                    onChange={(e) => setNewAmount(e.target.value)}
                                    placeholder="0"
                                    min="0"
                                />
                            </label>
                            <button type="submit" className="ats-btn ats-btn--primary cost-add-btn">
                                <span className="material-icons" aria-hidden="true">add</span>
                                Tambah
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
