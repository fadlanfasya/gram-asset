import { useMemo } from 'react'
import './AtsDashboard.css'

const msDay = 86400000

function fmtRp(n) {
    const v = Number(n)
    if (v >= 1e12) return `${(v / 1e12).toFixed(2)} T`
    if (v >= 1e9)  return `${(v / 1e9).toFixed(2)} M`
    if (v >= 1e6)  return `${(v / 1e6).toFixed(1)} Jt`
    return new Intl.NumberFormat('id-ID').format(v)
}

function fmtDate(d) {
    return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysLeft(d) {
    return Math.ceil((new Date(d) - Date.now()) / msDay)
}

const GROUP_CFG = {
    a:                    { label: 'Group A',            color: 'var(--color-green)',  bg: 'var(--color-green-10)' },
    b:                    { label: 'Group B',            color: 'var(--color-amber)',  bg: 'var(--color-amber-10)' },
    terpisah:             { label: 'Terpisah',           color: 'var(--text-muted)',   bg: 'var(--border-color)' },
    'tidak diperpanjang': { label: 'Tidak Diperpanjang', color: 'var(--color-red)',    bg: 'var(--color-red-10)' },
}

export default function AtsDashboard({ resources }) {
    const s = useMemo(() => {
        const now    = Date.now()
        const needed = resources.filter((r) => r.needed).length
        const expired = resources.filter((r) => r.supportEnd && new Date(r.supportEnd) < now)

        const soonList = resources
            .filter((r) => {
                if (!r.supportEnd) return false
                const diff = new Date(r.supportEnd) - now
                return diff > 0 && diff <= 60 * msDay
            })
            .sort((a, b) => new Date(a.supportEnd) - new Date(b.supportEnd))

        const byGroup = Object.keys(GROUP_CFG).map((key) => ({
            key,
            count: resources.filter((r) => r.atsGroup === key).length,
        }))
        const noGroup = resources.filter((r) => !r.atsGroup).length

        const costByYear = {}
        resources.forEach((r) => {
            r.costs?.forEach((c) => {
                costByYear[c.year] = (costByYear[c.year] || 0) + Number(c.amount)
            })
        })
        const years    = Object.keys(costByYear).sort()
        const maxCost  = Math.max(...Object.values(costByYear), 1)
        const maxGroup = Math.max(...byGroup.map((g) => g.count), noGroup, 1)

        return { needed, notNeeded: resources.length - needed, expired: expired.length, soonList, byGroup, noGroup, costByYear, years, maxCost, maxGroup }
    }, [resources])

    return (
        <div className="ats-dash">

            {/* ── Summary strip ── */}
            <div className="ats-dash-stats">
                <div className="ats-dash-stat">
                    <div className="ats-dash-stat__val">{resources.length}</div>
                    <div className="ats-dash-stat__lbl">Total ATS</div>
                </div>
                <div className="ats-dash-stat">
                    <div className="ats-dash-stat__val" style={{ color: 'var(--color-green)' }}>{s.needed}</div>
                    <div className="ats-dash-stat__lbl">Dibutuhkan</div>
                </div>
                <div className="ats-dash-stat">
                    <div className="ats-dash-stat__val">{s.notNeeded}</div>
                    <div className="ats-dash-stat__lbl">Tidak Dibutuhkan</div>
                </div>
                <div className="ats-dash-stat">
                    <div className="ats-dash-stat__val" style={{ color: s.soonList.length > 0 ? 'var(--color-amber)' : undefined }}>
                        {s.soonList.length}
                    </div>
                    <div className="ats-dash-stat__lbl">Habis ≤ 60 Hari</div>
                </div>
                <div className="ats-dash-stat">
                    <div className="ats-dash-stat__val" style={{ color: s.expired > 0 ? 'var(--color-red)' : undefined }}>
                        {s.expired}
                    </div>
                    <div className="ats-dash-stat__lbl">Sudah Habis</div>
                </div>
            </div>

            {/* ── Main row ── */}
            <div className="ats-dash-main">

                {/* Cost per year */}
                <div className="ats-dash-card">
                    <div className="ats-dash-card__head">Estimasi Biaya per Tahun</div>
                    {s.years.length === 0 ? (
                        <p className="ats-dash-empty">Belum ada data biaya.</p>
                    ) : (
                        <div className="ats-dash-cost-list">
                            {s.years.map((yr) => (
                                <div key={yr} className="ats-dash-cost-row">
                                    <span className="ats-dash-cost-yr">{yr}</span>
                                    <div className="ats-dash-bar-wrap">
                                        <div
                                            className="ats-dash-bar"
                                            style={{
                                                transform: `scaleX(${s.costByYear[yr] / s.maxCost})`,
                                                background: 'var(--color-primary)',
                                            }}
                                        />
                                    </div>
                                    <span className="ats-dash-cost-val">Rp {fmtRp(s.costByYear[yr])}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Group distribution */}
                <div className="ats-dash-card">
                    <div className="ats-dash-card__head">Distribusi Grup</div>
                    <div className="ats-dash-group-list">
                        {s.byGroup.map(({ key, count }) => {
                            const cfg = GROUP_CFG[key]
                            return (
                                <div key={key} className="ats-dash-group-row">
                                    <span
                                        className="ats-dash-group-badge"
                                        style={{ color: cfg.color, background: cfg.bg }}
                                    >{cfg.label}</span>
                                    <div className="ats-dash-bar-wrap">
                                        <div
                                            className="ats-dash-bar"
                                            style={{ transform: `scaleX(${count / s.maxGroup})`, background: cfg.color, opacity: 0.75 }}
                                        />
                                    </div>
                                    <span className="ats-dash-group-n">{count}</span>
                                </div>
                            )
                        })}
                        {s.noGroup > 0 && (
                            <div className="ats-dash-group-row">
                                <span className="ats-dash-group-badge" style={{ color: 'var(--text-dim)', background: 'var(--bg-hover)' }}>
                                    Tanpa Grup
                                </span>
                                <div className="ats-dash-bar-wrap">
                                    <div className="ats-dash-bar" style={{ transform: `scaleX(${s.noGroup / s.maxGroup})`, background: 'var(--text-dim)', opacity: 0.5 }} />
                                </div>
                                <span className="ats-dash-group-n">{s.noGroup}</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* ── Expiring soon ── */}
            {s.soonList.length > 0 && (
                <div className="ats-dash-card ats-dash-expiring">
                    <div className="ats-dash-card__head ats-dash-card__head--amber">
                        <span className="material-icons ats-dash-head-icon" aria-hidden="true">schedule</span>
                        Kontrak Akan Berakhir dalam 60 Hari
                    </div>
                    <table className="ats-dash-exp-table">
                        <thead>
                            <tr>
                                <th scope="col">Nama ATS</th>
                                <th scope="col">Grup</th>
                                <th scope="col">Tanggal Berakhir</th>
                                <th scope="col">Sisa Hari</th>
                            </tr>
                        </thead>
                        <tbody>
                            {s.soonList.slice(0, 10).map((r) => {
                                const days = daysLeft(r.supportEnd)
                                const cfg  = r.atsGroup ? GROUP_CFG[r.atsGroup] : null
                                return (
                                    <tr key={r.id}>
                                        <td className="ats-dash-exp-name">{r.name.split('\n')[0]}</td>
                                        <td>
                                            {cfg
                                                ? <span className="ats-dash-group-badge" style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                                                : <span className="ats-dim">—</span>
                                            }
                                        </td>
                                        <td className="ats-dim">{fmtDate(r.supportEnd)}</td>
                                        <td>
                                            <span
                                                className="ats-dash-days"
                                                style={{ color: days <= 14 ? 'var(--color-red)' : 'var(--color-amber)' }}
                                            >{days} hari</span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Expired notice ── */}
            {s.expired > 0 && (
                <div className="ats-dash-card ats-dash-expired-banner">
                    <div className="ats-dash-card__head ats-dash-card__head--red">
                        <span className="material-icons ats-dash-head-icon" aria-hidden="true">error_outline</span>
                        {s.expired} Kontrak Sudah Habis
                    </div>
                    <p className="ats-dash-empty" style={{ textAlign: 'left' }}>
                        Terdapat <strong>{s.expired}</strong> kontrak ATS yang sudah melewati tanggal berakhir. Segera tinjau dan perbarui.
                    </p>
                </div>
            )}

        </div>
    )
}
