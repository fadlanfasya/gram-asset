import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useDefinitionStore from '../stores/useDefinitionStore'
import useAssetStore from '../stores/useAssetStore'
import './DefinitionsPage.css'

export default function DefinitionsPage() {
    const navigate = useNavigate()
    const definitions = useDefinitionStore((s) => s.definitions)
    const assets = useAssetStore((s) => s.assets)

    const [search, setSearch] = useState('')

    const filtered = definitions.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.description.toLowerCase().includes(search.toLowerCase())
    )

    function getAssetCount(defId) {
        return assets.filter((a) => a.definitionId === defId).length
    }

    function getFieldCount(def) {
        return def.fields ? def.fields.length : 0
    }

    return (
        <div className="definitions-page">
            {/* Header */}
            <div className="definitions-page__header">
                <div>
                    <h1 className="definitions-page__title">Asset Definitions</h1>
                    <p className="definitions-page__subtitle">Manage and configure your IT resource schemas</p>
                </div>
                <div className="definitions-page__actions">
                    <div className="definitions-page__search">
                        <span className="material-icons definitions-page__search-icon">search</span>
                        <input
                            type="text"
                            className="definitions-page__search-input"
                            placeholder="Search definitions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        className="definitions-page__create-btn"
                        onClick={() => navigate('/definitions/new')}
                    >
                        <span className="material-icons">settings</span>
                        Create New
                    </button>
                </div>
            </div>

            {/* Definition Cards Grid */}
            <div className="definitions-page__grid">
                {filtered.map((def) => (
                    <div
                        key={def.id}
                        className="def-card"
                        onClick={() => navigate(`/definitions/${def.id}/edit`)}
                    >
                        {/* Top accent bar */}
                        <div
                            className="def-card__accent"
                            style={{ background: `linear-gradient(90deg, ${def.color}, ${def.color}88)` }}
                        ></div>

                        <div className="def-card__body">
                            {/* Icon */}
                            <div
                                className="def-card__icon"
                                style={{ background: `${def.color}18`, color: def.color }}
                            >
                                <span className="material-icons">{def.icon || 'devices'}</span>
                            </div>

                            {/* Info */}
                            <h3 className="def-card__name">{def.name}</h3>
                            <p className="def-card__desc">{def.description}</p>

                            {/* Stats */}
                            <div className="def-card__stats">
                                <div className="def-card__stat">
                                    <span className="def-card__stat-label">Fields</span>
                                    <span className="def-card__stat-value" style={{ color: def.color }}>
                                        {getFieldCount(def)}
                                    </span>
                                </div>
                                <div className="def-card__stat">
                                    <span className="def-card__stat-label">Assets</span>
                                    <span className="def-card__stat-value" style={{ color: def.color }}>
                                        {getAssetCount(def.id)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* New Definition Card */}
                <div
                    className="def-card def-card--new"
                    onClick={() => navigate('/definitions/new')}
                >
                    <div className="def-card__new-content">
                        <div className="def-card__new-icon">
                            <span className="material-icons">add</span>
                        </div>
                        <span className="def-card__new-label">New Definition</span>
                    </div>
                </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="definitions-page__status-bar">
                <div className="definitions-page__status-left">
                    <span className="definitions-page__status-dot"></span>
                    <span>System Online</span>
                    <span className="definitions-page__status-divider">·</span>
                    <span>Total Definitions: <strong>{definitions.length}</strong></span>
                    <span className="definitions-page__status-divider">·</span>
                    <span>Last Updated: just now</span>
                </div>
                <div className="definitions-page__status-right">
                    <a href="#">Documentation</a>
                    <a href="#">Support</a>
                </div>
            </div>
        </div>
    )
}
