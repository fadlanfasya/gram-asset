import { useState, useEffect } from 'react'
import CostModal from './CostModal'
import AssetLinkModal from './AssetLinkModal'
import './AtsList.css'

function NameCell({ name }) {
    const lines = (name || '').split('\n').filter((s) => s.trim())
    const [main, ...subs] = lines
    const shown = subs.slice(0, 3)
    const extra = subs.length - shown.length
    return (
        <div className="ats-name-wrap">
            <span className="ats-name-main">{main}</span>
            {shown.map((s, i) => <span key={i} className="ats-name-sub">{s}</span>)}
            {extra > 0 && <span className="ats-name-more">+{extra} lainnya</span>}
        </div>
    )
}

const GROUP_BADGE = {
    a:                   { cls: 'badge--green',  label: 'Group A' },
    b:                   { cls: 'badge--amber',  label: 'Group B' },
    terpisah:            { cls: 'badge--gray',   label: 'Terpisah' },
    'tidak diperpanjang':{ cls: 'badge--red',    label: 'Tidak Diperpanjang' },
}

const msDay = 86400000

function expiryState(dateStr) {
    if (!dateStr) return null
    const diff = new Date(dateStr) - Date.now()
    if (diff < 0)              return 'expired'
    if (diff < 30 * msDay)    return 'soon'
    return 'ok'
}

function fmtDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ResourceList({ items, assets, onEdit, onDelete, onRefresh }) {
    const [costResource, setCostResource]   = useState(null)
    const [assetResource, setAssetResource] = useState(null)
    const [confirmingId, setConfirmingId]   = useState(null)

    useEffect(() => {
        if (!confirmingId) return
        const timer = setTimeout(() => setConfirmingId(null), 3000)
        return () => clearTimeout(timer)
    }, [confirmingId])

    const handleDeleteClick = (id) => {
        if (confirmingId === id) {
            onDelete(id)
            setConfirmingId(null)
        } else {
            setConfirmingId(id)
        }
    }

    return (
        <>
            <div className="ats-list">
                <table className="ats-table">
                    <thead>
                        <tr>
                            <th scope="col">Nama ATS</th>
                            <th scope="col">Grup</th>
                            <th scope="col">Keterangan</th>
                            <th scope="col">Periode ATS</th>
                            <th scope="col">Butuh</th>
                            <th scope="col">Biaya</th>
                            <th scope="col">Aset</th>
                            <th scope="col">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="ats-empty">Belum ada data ATS.</td>
                            </tr>
                        ) : items.map((item) => {
                            const exp   = expiryState(item.supportEnd)
                            const badge = item.atsGroup ? GROUP_BADGE[item.atsGroup] : null
                            const isConfirming = confirmingId === item.id

                            return (
                                <tr key={item.id}>
                                    <td className="ats-name-cell"><NameCell name={item.name} /></td>
                                    <td>
                                        {badge && (
                                            <span className={`ats-badge ${badge.cls}`}>{badge.label}</span>
                                        )}
                                    </td>
                                    <td className="ats-desc-cell">
                                        {item.description || <span className="ats-dim">—</span>}
                                    </td>
                                    <td>
                                        <div className="ats-period">
                                            {item.supportStart && (
                                                <span className="ats-period-start">{fmtDate(item.supportStart)}</span>
                                            )}
                                            {item.supportEnd && (
                                                <span className={`ats-period-end ats-period--${exp}`}>
                                                    → {fmtDate(item.supportEnd)}
                                                </span>
                                            )}
                                            {!item.supportStart && !item.supportEnd && (
                                                <span className="ats-dim">—</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`ats-badge ${item.needed ? 'badge--green' : 'badge--gray'}`}>
                                            {item.needed ? 'Ya' : 'Tidak'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="ats-cost-chips">
                                            {(!item.costs || item.costs.length === 0) && <span className="ats-dim">—</span>}
                                            {item.costs?.map((c) => (
                                                <span key={c.id} className="ats-cost-chip">
                                                    {c.year}: {Number(c.amount).toLocaleString('id-ID')}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="ats-asset-chips">
                                            {(!item.assets || item.assets.length === 0) && <span className="ats-dim">—</span>}
                                            {item.assets?.slice(0, 2).map((a) => (
                                                <span key={a.id} className="ats-chip">{a.name}</span>
                                            ))}
                                            {(item.assets?.length ?? 0) > 2 && (
                                                <span className="ats-chip ats-chip--more">+{item.assets.length - 2}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="ats-actions">
                                            <button
                                                className="ats-action-btn"
                                                title="Edit"
                                                aria-label="Edit"
                                                onClick={() => onEdit(item)}
                                            >
                                                <span className="material-icons" aria-hidden="true">edit</span>
                                            </button>
                                            <button
                                                className="ats-action-btn ats-action-btn--cost"
                                                title="Kelola Biaya"
                                                aria-label="Kelola Biaya"
                                                onClick={() => setCostResource(item)}
                                            >
                                                <span className="material-icons" aria-hidden="true">payments</span>
                                            </button>
                                            <button
                                                className="ats-action-btn ats-action-btn--asset"
                                                title="Hubungkan Aset"
                                                aria-label="Hubungkan Aset"
                                                onClick={() => setAssetResource(item)}
                                            >
                                                <span className="material-icons" aria-hidden="true">link</span>
                                            </button>
                                            <button
                                                className={`ats-action-btn${isConfirming ? ' ats-action-btn--confirm' : ' ats-action-btn--danger'}`}
                                                title={isConfirming ? 'Klik lagi untuk konfirmasi' : 'Hapus'}
                                                aria-label={isConfirming ? 'Konfirmasi hapus' : 'Hapus'}
                                                onClick={() => handleDeleteClick(item.id)}
                                            >
                                                <span className="material-icons" aria-hidden="true">
                                                    {isConfirming ? 'warning' : 'delete'}
                                                </span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {costResource && (
                <CostModal
                    resource={costResource}
                    onClose={() => setCostResource(null)}
                    onRefresh={onRefresh}
                />
            )}

            {assetResource && (
                <AssetLinkModal
                    resource={assetResource}
                    allAssets={assets}
                    onClose={() => setAssetResource(null)}
                    onRefresh={onRefresh}
                />
            )}
        </>
    )
}
