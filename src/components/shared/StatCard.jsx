import './shared.css'

export function StatCard({ icon, iconColor, iconBg, label, value, badge, badgeColor, accentBorder }) {
    return (
        <div
            className="stat-card glass-effect"
            style={accentBorder ? { borderLeft: `4px solid ${accentBorder}` } : undefined}
        >
            <div className="stat-card__header">
                <div className="stat-card__icon" style={{ background: iconBg, color: iconColor }}>
                    <span className="material-icons">{icon}</span>
                </div>
                {badge && (
                    <span className="stat-card__badge" style={{ color: badgeColor }}>
                        {badge}
                    </span>
                )}
            </div>
            <p className="stat-card__label">{label}</p>
            <p className="stat-card__value">{value}</p>
        </div>
    )
}

export function StatusBadge({ status }) {
    const map = {
        active: 'Active',
        maintenance: 'Maintenance',
        decommissioned: 'Retired',
    }
    return (
        <span className={`status-badge status-badge--${status === 'decommissioned' ? 'retired' : status}`}>
            {map[status] || status}
        </span>
    )
}
