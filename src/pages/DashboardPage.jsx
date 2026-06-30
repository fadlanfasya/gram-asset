import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import useDefinitionStore from '../stores/useDefinitionStore'
import useAssetStore from '../stores/useAssetStore'
import useRelationshipStore from '../stores/useRelationshipStore'
import useAuthStore from '../stores/useAuthStore'
import './DashboardPage.css'

const STATUS_CFG = {
    active:      { label: 'Active',      color: 'var(--color-green)',  bg: 'var(--color-green-10)' },
    maintenance: { label: 'Maintenance', color: 'var(--color-amber)',  bg: 'var(--color-amber-10)' },
    inactive:    { label: 'Inactive',    color: 'var(--text-muted)',   bg: 'var(--bg-hover)' },
    retired:     { label: 'Retired',     color: 'var(--color-red)',    bg: 'var(--color-red-10)' },
}

function fmtAge(d) {
    const diff = Date.now() - new Date(d)
    const m   = Math.floor(diff / 60000)
    const h   = Math.floor(diff / 3600000)
    const day = Math.floor(diff / 86400000)
    if (m < 60)  return `${m}m lalu`
    if (h < 24)  return `${h}j lalu`
    if (day < 7) return `${day}h lalu`
    return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function colorTint(hex) {
    return `color-mix(in srgb, ${hex} 20%, transparent)`
}

const handleRowKey = (fn) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn() }
}

export default function DashboardPage() {
    const navigate      = useNavigate()
    const definitions   = useDefinitionStore((s) => s.definitions)
    const getDefinition = useDefinitionStore((s) => s.getDefinition)
    const assets        = useAssetStore((s) => s.assets)
    const loading       = useAssetStore((s) => s.loading)
    const relationships = useRelationshipStore((s) => s.relationships)
    const user          = useAuthStore((s) => s.user)
    const isAdmin       = user?.role === 'admin'

    const { active, maintenance, inactive } = useMemo(() => ({
        active:      assets.filter((a) => a.status === 'active').length,
        maintenance: assets.filter((a) => a.status === 'maintenance').length,
        inactive:    assets.filter((a) => a.status !== 'active' && a.status !== 'maintenance').length,
    }), [assets])

    const byType = useMemo(() =>
        definitions
            .map((def) => ({ ...def, count: assets.filter((a) => a.definitionId === def.id).length }))
            .filter((d) => d.count > 0)
            .sort((a, b) => b.count - a.count),
        [definitions, assets]
    )

    const recent = useMemo(() =>
        [...assets]
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 8),
        [assets]
    )

    const maxCount = byType[0]?.count || 1
    const total    = assets.length

    return (
        <div className="db-page">

            {/* ── Header ── */}
            <div className="db-header">
                <h1 className="db-title">Dashboard</h1>
                <p className="db-subtitle">
                    {user?.name ? `Selamat datang, ${user.name}. ` : ''}
                    Ringkasan kondisi aset infrastruktur saat ini.
                </p>
            </div>

            {/* ── Stat strip ── */}
            <div className="db-stats" aria-busy={loading}>
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="db-stat" aria-hidden="true">
                            <div className="db-skeleton db-skeleton--icon" />
                            <div style={{ flex: 1 }}>
                                <div className="db-skeleton db-skeleton--val" />
                                <div className="db-skeleton db-skeleton--lbl" />
                            </div>
                        </div>
                    ))
                ) : (
                    <>
                        <div className="db-stat">
                            <span className="db-stat__icon material-icons" aria-hidden="true" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-10)' }}>inventory_2</span>
                            <div>
                                <div className="db-stat__val">{total}</div>
                                <div className="db-stat__lbl">Total Aset</div>
                            </div>
                        </div>

                        <div className="db-stat">
                            <span className="db-stat__icon material-icons" aria-hidden="true" style={{ color: 'var(--color-green)', background: 'var(--color-green-10)' }}>check_circle</span>
                            <div>
                                <div className="db-stat__val" style={{ color: 'var(--color-green)' }}>{active}</div>
                                <div className="db-stat__lbl">Active</div>
                                {total > 0 && <div className="db-stat__sub" style={{ color: 'var(--color-green)' }}>{Math.round(active / total * 100)}% dari total</div>}
                            </div>
                        </div>

                        <div className="db-stat">
                            <span className="db-stat__icon material-icons" aria-hidden="true" style={{ color: 'var(--color-amber)', background: 'var(--color-amber-10)' }}>build</span>
                            <div>
                                <div className="db-stat__val" style={{ color: maintenance > 0 ? 'var(--color-amber)' : undefined }}>{maintenance}</div>
                                <div className="db-stat__lbl">Maintenance</div>
                                {maintenance > 0 && <div className="db-stat__sub" style={{ color: 'var(--color-amber)' }}>Perlu perhatian</div>}
                            </div>
                        </div>

                        <div className="db-stat">
                            <span className="db-stat__icon material-icons" aria-hidden="true" style={{ color: 'var(--text-muted)', background: 'var(--bg-hover)' }}>remove_circle_outline</span>
                            <div>
                                <div className="db-stat__val">{inactive}</div>
                                <div className="db-stat__lbl">Inactive / Retired</div>
                            </div>
                        </div>

                        <div className="db-stat">
                            <span className="db-stat__icon material-icons" aria-hidden="true" style={{ color: 'var(--color-purple)', background: 'var(--color-purple-10)' }}>share</span>
                            <div>
                                <div className="db-stat__val">{relationships.length}</div>
                                <div className="db-stat__lbl">Relasi Aset</div>
                            </div>
                        </div>

                        <div className="db-stat">
                            <span className="db-stat__icon material-icons" aria-hidden="true" style={{ color: 'var(--color-accent-cyan)', background: 'var(--color-accent-cyan-10)' }}>category</span>
                            <div>
                                <div className="db-stat__val">{definitions.length}</div>
                                <div className="db-stat__lbl">Tipe Aset</div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ── Main row ── */}
            <div className="db-main">

                {/* Recent assets */}
                <div className="db-card" aria-busy={loading}>
                    <div className="db-card__head">
                        <h2 className="db-card__title">Aset Terbaru Diperbarui</h2>
                        <button className="db-link" onClick={() => navigate('/assets')}>Lihat Semua →</button>
                    </div>

                    {loading ? (
                        <div className="db-table-wrap">
                            <table className="db-table" aria-label="Aset terbaru" aria-hidden="true">
                                <thead>
                                    <tr>
                                        <th scope="col">Nama</th>
                                        <th scope="col">Tipe</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Diperbarui</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            <td><div className="db-skeleton db-skeleton--row-name" /></td>
                                            <td><div className="db-skeleton db-skeleton--row-meta" /></td>
                                            <td><div className="db-skeleton db-skeleton--row-badge" /></td>
                                            <td><div className="db-skeleton db-skeleton--row-meta" /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : recent.length === 0 ? (
                        <p className="db-empty">Belum ada aset.{' '}
                            <button className="db-link" onClick={() => navigate('/assets/new')}>Tambah sekarang →</button>
                        </p>
                    ) : (
                        <div className="db-table-wrap">
                            <table className="db-table" aria-label="Aset terbaru diperbarui">
                                <thead>
                                    <tr>
                                        <th scope="col">Nama</th>
                                        <th scope="col">Tipe</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Diperbarui</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent.map((a) => {
                                        const def = getDefinition(a.definitionId)
                                        const s   = STATUS_CFG[a.status] || STATUS_CFG.inactive
                                        return (
                                            <tr
                                                key={a.id}
                                                className="db-row"
                                                onClick={() => navigate(`/assets/${a.id}`)}
                                                onKeyDown={handleRowKey(() => navigate(`/assets/${a.id}`))}
                                                tabIndex={0}
                                                role="link"
                                                aria-label={a.name}
                                            >
                                                <td>
                                                    <div className="db-asset-name">
                                                        <span
                                                            className="db-asset-icon material-icons"
                                                            aria-hidden="true"
                                                            style={{
                                                                color: def?.color || 'var(--color-primary)',
                                                                background: def ? colorTint(def.color) : 'var(--color-primary-10)',
                                                            }}
                                                        >{def?.icon || 'devices'}</span>
                                                        <span className="db-asset-label">{a.name}</span>
                                                    </div>
                                                </td>
                                                <td className="db-muted">{def?.name || '—'}</td>
                                                <td>
                                                    <span className="db-badge" style={{ color: s.color, background: s.bg }}>{s.label}</span>
                                                </td>
                                                <td className="db-muted db-nowrap">{fmtAge(a.updatedAt)}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Side */}
                <div className="db-side">

                    {/* Type distribution */}
                    <div className="db-card">
                        <div className="db-card__head">
                            <h2 className="db-card__title">Distribusi Tipe Aset</h2>
                        </div>
                        {loading ? (
                            <div className="db-type-list" aria-hidden="true" style={{ pointerEvents: 'none' }}>
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="db-type-row">
                                        <div className="db-type-info">
                                            <div className="db-skeleton db-skeleton--type-icon" />
                                            <div className="db-skeleton db-skeleton--type-name" />
                                            <div className="db-skeleton db-skeleton--type-count" />
                                        </div>
                                        <div className="db-bar-wrap">
                                            <div className="db-skeleton" style={{ height: '100%', width: `${85 - i * 18}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : byType.length === 0 ? (
                            <p className="db-empty">Belum ada data.</p>
                        ) : (
                            <div className="db-type-list">
                                {byType.map((t) => (
                                    <div
                                        key={t.id}
                                        className="db-type-row"
                                        onClick={() => navigate('/assets')}
                                        onKeyDown={handleRowKey(() => navigate('/assets'))}
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`${t.name}: ${t.count} aset`}
                                    >
                                        <div className="db-type-info">
                                            <span
                                                className="db-type-icon material-icons"
                                                aria-hidden="true"
                                                style={{ color: t.color, background: colorTint(t.color) }}
                                            >{t.icon}</span>
                                            <span className="db-type-name">{t.name}</span>
                                            <span className="db-type-count">{t.count}</span>
                                        </div>
                                        <div className="db-bar-wrap">
                                            <div className="db-bar-fill" style={{ transform: `scaleX(${t.count / maxCount})`, background: t.color }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick nav */}
                    <div className="db-card">
                        <div className="db-card__head">
                            <h2 className="db-card__title">Navigasi Cepat</h2>
                        </div>
                        <div className="db-nav-grid">
                            <button className="db-nav-btn" style={{ '--nav-icon-color': 'var(--color-primary)' }} onClick={() => navigate('/assets/new')}>
                                <span className="material-icons" aria-hidden="true">add_circle</span>
                                <span>Tambah Aset</span>
                            </button>
                            <button className="db-nav-btn" style={{ '--nav-icon-color': 'var(--color-green)' }} onClick={() => navigate('/assets')}>
                                <span className="material-icons" aria-hidden="true">inventory_2</span>
                                <span>Semua Aset</span>
                            </button>
                            <button className="db-nav-btn" style={{ '--nav-icon-color': 'var(--color-purple)' }} onClick={() => navigate('/relationships')}>
                                <span className="material-icons" aria-hidden="true">share</span>
                                <span>Relasi</span>
                            </button>
                            <button className="db-nav-btn" style={{ '--nav-icon-color': 'var(--color-amber)' }} onClick={() => navigate('/ats')}>
                                <span className="material-icons" aria-hidden="true">assignment</span>
                                <span>ATS</span>
                            </button>
                            {isAdmin && (
                                <button className="db-nav-btn" style={{ '--nav-icon-color': 'var(--color-accent-cyan)' }} onClick={() => navigate('/definitions')}>
                                    <span className="material-icons" aria-hidden="true">description</span>
                                    <span>Definisi</span>
                                </button>
                            )}
                            {isAdmin && (
                                <button className="db-nav-btn" style={{ '--nav-icon-color': 'var(--text-muted)' }} onClick={() => navigate('/users')}>
                                    <span className="material-icons" aria-hidden="true">manage_accounts</span>
                                    <span>Pengguna</span>
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
