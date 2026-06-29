import { useState } from 'react'
import { Edit2, Trash2, DollarSign, Paperclip } from 'lucide-react'
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
    if (diff < 0) return 'expired'
    if (diff < 30 * msDay) return 'soon'
    return 'ok'
}

function fmtDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ResourceList({ items, assets, onEdit, onDelete, onRefresh }) {
    const [costResource, setCostResource] = useState(null)
    const [assetResource, setAssetResource] = useState(null)

    return (
        <>
            <div className="ats-list">
                <table className="ats-table">
                    <thead>
                        <tr>
                            <th>Nama ATS</th>
                            <th>Group</th>
                            <th>Keterangan</th>
                            <th>Periode ATS</th>
                            <th>Butuh</th>
                            <th>Biaya</th>
                            <th>Aset</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="ats-empty">Belum ada data ATS.</td>
                            </tr>
                        ) : items.map((item) => {
                            const exp = expiryState(item.supportEnd)
                            const badge = item.atsGroup ? GROUP_BADGE[item.atsGroup] : null

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
                                                    {exp === 'expired' && ' ⚠'}
                                                    {exp === 'soon' && ' ⏰'}
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
                                            {item.costs?.length === 0 && <span className="ats-dim">—</span>}
                                            {item.costs?.map((c) => (
                                                <span key={c.id} className="ats-cost-chip">
                                                    {c.year}: {Number(c.amount).toLocaleString('id-ID')}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="ats-asset-chips">
                                            {item.assets?.length === 0 && <span className="ats-dim">—</span>}
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
                                            <button className="ats-action-btn" title="Edit" onClick={() => onEdit(item)}>
                                                <Edit2 size={15} />
                                            </button>
                                            <button className="ats-action-btn ats-action-btn--cost" title="Kelola Biaya" onClick={() => setCostResource(item)}>
                                                <DollarSign size={15} />
                                            </button>
                                            <button className="ats-action-btn ats-action-btn--asset" title="Hubungkan Aset" onClick={() => setAssetResource(item)}>
                                                <Paperclip size={15} />
                                            </button>
                                            <button className="ats-action-btn ats-action-btn--danger" title="Hapus" onClick={() => onDelete(item.id)}>
                                                <Trash2 size={15} />
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
