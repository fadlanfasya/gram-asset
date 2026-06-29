import { useEffect, useState } from 'react'
import useAssetStore from '../stores/useAssetStore'
import useAuthStore from '../stores/useAuthStore'
import { canManageAts } from '../utils/roles'
import { resourcesApi } from '../utils/atsApi'
import ResourceList from './components/AtsList'
import ResourceForm from './components/AtsForm'
import AtsImportModal from './components/AtsImportModal'
import AtsDashboard from './components/AtsDashboard'
import './AtsPage.css'

export default function AtsPage() {
    const user = useAuthStore((s) => s.user)
    const assets = useAssetStore((s) => s.assets)

    const [resources, setResources] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('dashboard')
    const [showForm, setShowForm] = useState(false)
    const [showImport, setShowImport] = useState(false)
    const [editingResource, setEditingResource] = useState(null)
    const [search, setSearch] = useState('')
    const [groupFilter, setGroupFilter] = useState('')

    const isAdmin = canManageAts(user?.role)

    useEffect(() => { fetchResources() }, [])

    const fetchResources = async () => {
        try {
            setLoading(true)
            setError('')
            const data = await resourcesApi.getAll()
            setResources(data.resources || [])
        } catch (err) {
            setError(err.message || 'Failed to load ATS data')
        } finally {
            setLoading(false)
        }
    }

    const filtered = resources.filter((r) => {
        const q = search.toLowerCase().trim()
        const matchSearch = !q || r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
        const matchGroup = !groupFilter || r.atsGroup === groupFilter
        return matchSearch && matchGroup
    })

    const handleSave = async (data) => {
        try {
            setError('')
            if (editingResource) {
                await resourcesApi.update(editingResource.id, data)
            } else {
                await resourcesApi.create(data)
            }
            setShowForm(false)
            setEditingResource(null)
            await fetchResources()
        } catch (err) {
            setError(err.message || 'Failed to save')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this ATS record? All costs will also be removed.')) return
        try {
            setError('')
            await resourcesApi.remove(id)
            setResources((prev) => prev.filter((r) => r.id !== id))
        } catch (err) {
            setError(err.message || 'Failed to delete')
        }
    }

    if (!isAdmin) {
        return (
            <div className="ats-page">
                <div className="ats-access-denied">
                    <h1>Access Denied</h1>
                    <p>Only administrators can manage ATS records.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="ats-page">
            <div className="ats-header">
                <div>
                    <h1>ATS Management</h1>
                    <p>Annual Technical Support contracts for infrastructure resources.</p>
                </div>
                {activeTab === 'resources' && (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="btn-secondary" onClick={() => setShowImport(true)}>
                            <span className="material-icons">upload_file</span>
                            Import CSV
                        </button>
                        <button className="btn-primary" onClick={() => { setEditingResource(null); setShowForm(true) }}>
                            <span className="material-icons">add_circle</span>
                            Add ATS
                        </button>
                    </div>
                )}
            </div>

            {/* ── Tab switcher ── */}
            <div className="ats-tabs">
                <button
                    className={`ats-tab${activeTab === 'dashboard' ? ' ats-tab--active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    <span className="material-icons">dashboard</span>
                    Dashboard
                </button>
                <button
                    className={`ats-tab${activeTab === 'resources' ? ' ats-tab--active' : ''}`}
                    onClick={() => setActiveTab('resources')}
                >
                    <span className="material-icons">list_alt</span>
                    Resources
                </button>
            </div>

            {error && <div className="ats-error">{error}</div>}

            {loading ? (
                <div className="ats-loading">Loading...</div>
            ) : activeTab === 'dashboard' ? (
                <AtsDashboard resources={resources} />
            ) : (
                <>
                    <div className="ats-toolbar">
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or description..."
                        />
                        <select
                            value={groupFilter}
                            onChange={(e) => setGroupFilter(e.target.value)}
                            className="ats-toolbar-select"
                        >
                            <option value="">All Groups</option>
                            <option value="a">Group A</option>
                            <option value="b">Group B</option>
                            <option value="terpisah">Terpisah</option>
                            <option value="tidak diperpanjang">Tidak Diperpanjang</option>
                        </select>
                    </div>
                    <ResourceList
                        items={filtered}
                        assets={assets}
                        onEdit={(item) => { setEditingResource(item); setShowForm(true) }}
                        onDelete={handleDelete}
                        onRefresh={fetchResources}
                    />
                    <div className="ats-footer">
                        <p>Showing {filtered.length} of {resources.length} records.</p>
                    </div>
                </>
            )}

            {showForm && (
                <ResourceForm
                    resource={editingResource}
                    onClose={() => { setShowForm(false); setEditingResource(null) }}
                    onSubmit={handleSave}
                />
            )}

            {showImport && (
                <AtsImportModal
                    onClose={() => setShowImport(false)}
                    onRefresh={fetchResources}
                />
            )}
        </div>
    )
}
