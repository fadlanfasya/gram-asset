import { useState, useEffect } from 'react'
import { ROLE_LABELS } from '../../utils/roles'
import './UserList.css'

const ROLE_CFG = {
    admin:       { color: 'var(--color-primary)' },
    asset_admin: { color: 'var(--color-accent-cyan)' },
    ats_admin:   { color: 'var(--color-amber)' },
    viewer:      { color: 'var(--text-muted)' },
}

function getInitials(name = '') {
    return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?'
}

function fmtDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function UserList({ users, onEdit, onDelete, onChangeRole, currentUserId }) {
    const [confirmingId, setConfirmingId] = useState(null)

    useEffect(() => {
        if (!confirmingId) return
        const timer = setTimeout(() => setConfirmingId(null), 3000)
        return () => clearTimeout(timer)
    }, [confirmingId])

    const handleDeleteClick = (userId) => {
        if (confirmingId === userId) {
            onDelete(userId)
            setConfirmingId(null)
        } else {
            setConfirmingId(userId)
        }
    }

    const handleRoleChange = (userId, e) => {
        const newRole = e.target.value
        const current = users.find((u) => u.id === userId)?.role
        if (newRole !== current) onChangeRole(userId, newRole)
    }

    return (
        <div className="ul-wrap">
            <div className="ul-table-scroll">
                <table className="ul-table">
                    <thead>
                        <tr>
                            <th scope="col">Pengguna</th>
                            <th scope="col">Email</th>
                            <th scope="col">Peran</th>
                            <th scope="col">Bergabung</th>
                            <th scope="col"><span className="ul-sr-only">Aksi</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => {
                            const isSelf     = u.id === currentUserId
                            const roleCfg    = ROLE_CFG[u.role] || ROLE_CFG.viewer
                            const confirming = confirmingId === u.id

                            return (
                                <tr key={u.id} className={isSelf ? 'ul-row ul-row--self' : 'ul-row'}>
                                    <td>
                                        <div className="ul-user">
                                            <div className="ul-avatar" aria-hidden="true">
                                                {getInitials(u.name)}
                                            </div>
                                            <div className="ul-user-info">
                                                <span className="ul-user-name">
                                                    {u.name}
                                                    {isSelf && <span className="ul-self-badge">Anda</span>}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="ul-email">{u.email}</td>
                                    <td>
                                        <select
                                            className="ul-role-select"
                                            value={u.role || 'viewer'}
                                            onChange={(e) => handleRoleChange(u.id, e)}
                                            disabled={isSelf}
                                            aria-label={`Peran untuk ${u.name}`}
                                            style={{ color: roleCfg.color }}
                                            title={isSelf ? 'Tidak bisa mengubah peran sendiri' : undefined}
                                        >
                                            {Object.entries(ROLE_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="ul-date">{fmtDate(u.createdAt)}</td>
                                    <td>
                                        <div className="ul-actions">
                                            <button
                                                className="ul-btn ul-btn--edit"
                                                onClick={() => onEdit(u)}
                                                aria-label={`Edit ${u.name}`}
                                                title="Edit pengguna"
                                            >
                                                <span className="material-icons" aria-hidden="true">edit</span>
                                            </button>
                                            <button
                                                className={confirming ? 'ul-btn ul-btn--confirm' : 'ul-btn ul-btn--delete'}
                                                onClick={() => handleDeleteClick(u.id)}
                                                disabled={isSelf}
                                                aria-label={confirming ? `Konfirmasi hapus ${u.name}` : `Hapus ${u.name}`}
                                                title={isSelf ? 'Tidak bisa menghapus diri sendiri' : confirming ? 'Klik lagi untuk konfirmasi' : 'Hapus pengguna'}
                                            >
                                                <span className="material-icons" aria-hidden="true">
                                                    {confirming ? 'warning' : 'delete'}
                                                </span>
                                                {confirming && <span className="ul-confirm-label">Yakin?</span>}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
