import { useState } from 'react'
import { resourcesApi } from '../../utils/atsApi'
import './AssetLinkModal.css'

export default function AssetLinkModal({ resource, allAssets, onClose, onRefresh }) {
    const [linkedIds, setLinkedIds] = useState(resource.assets?.map((a) => a.id) || [])
    const [search, setSearch]       = useState('')
    const [saving, setSaving]       = useState(false)
    const [error, setError]         = useState('')

    const toggle = (id) => {
        setLinkedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        )
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            setError('')
            await resourcesApi.updateAssets(resource.id, linkedIds)
            onRefresh()
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    const filtered      = allAssets.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
    const linkedAssets  = allAssets.filter((a) => linkedIds.includes(a.id))
    const unlinkedAssets = filtered.filter((a) => !linkedIds.includes(a.id))

    return (
        <div className="ats-form-overlay" onClick={onClose}>
            <div
                className="asset-link-modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="asset-link-title"
            >
                <div className="ats-form-header">
                    <div>
                        <h2 id="asset-link-title">Hubungkan Aset</h2>
                        <p className="asset-link-subtitle">{resource.name.split('\n')[0]}</p>
                    </div>
                    <button className="ats-close-btn" onClick={onClose} aria-label="Tutup">
                        <span className="material-icons" aria-hidden="true">close</span>
                    </button>
                </div>

                {error && (
                    <div className="asset-link-error" role="alert">
                        <span className="material-icons" aria-hidden="true">error</span>
                        {error}
                    </div>
                )}

                <div className="asset-link-body">
                    {linkedAssets.length > 0 && (
                        <div className="asset-link-section">
                            <p className="asset-link-label">Aset terhubung ({linkedAssets.length})</p>
                            <div className="asset-link-chips">
                                {linkedAssets.map((a) => (
                                    <button
                                        key={a.id}
                                        type="button"
                                        className="asset-chip asset-chip--linked"
                                        onClick={() => toggle(a.id)}
                                        title="Klik untuk melepas"
                                        aria-label={`Lepas ${a.name}`}
                                    >
                                        {a.name}
                                        <span className="material-icons asset-chip__unlink" aria-hidden="true">link_off</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="asset-link-section">
                        <p className="asset-link-label">Tambah aset</p>
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari aset…"
                            className="asset-link-search"
                            aria-label="Cari aset"
                        />
                        <div className="asset-link-list">
                            {unlinkedAssets.length === 0 ? (
                                <p className="asset-link-empty">
                                    {search ? 'Tidak ada hasil.' : 'Semua aset sudah terhubung.'}
                                </p>
                            ) : unlinkedAssets.map((a) => (
                                <button
                                    key={a.id}
                                    type="button"
                                    className="asset-link-item"
                                    onClick={() => toggle(a.id)}
                                    aria-label={`Tambah ${a.name}`}
                                >
                                    {a.name}
                                    {a.status && a.status !== 'active' && (
                                        <span className="asset-link-status">{a.status}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="asset-link-footer">
                    <button className="ats-btn ats-btn--secondary" onClick={onClose}>Batal</button>
                    <button className="ats-btn ats-btn--primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Menyimpan…' : 'Simpan'}
                    </button>
                </div>
            </div>
        </div>
    )
}
