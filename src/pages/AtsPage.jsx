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
    const user   = useAuthStore((s) => s.user)
    const assets = useAssetStore((s) => s.assets)

    const [resources, setResources]           = useState([])
    const [loading, setLoading]               = useState(true)
    const [error, setError]                   = useState('')
    const [activeTab, setActiveTab]           = useState('dashboard')
    const [showForm, setShowForm]             = useState(false)
    const [showImport, setShowImport]         = useState(false)
    const [editingResource, setEditingResource] = useState(null)
    const [search, setSearch]                 = useState('')
    const [groupFilter, setGroupFilter]       = useState('')

    const isAdmin = canManageAts(user?.role)

    useEffect(() => { fetchResources() }, [])

    const fetchResources = async () => {
        try {
            setLoading(true)
            setError('')
            const data = await resourcesApi.getAll()
            setResources(data.resources || [])
        } catch (err) {
            setError(err.message || 'Gagal memuat data ATS.')
        } finally {
            setLoading(false)
        }
    }

    const filtered = resources.filter((r) => {
        const q           = search.toLowerCase().trim()
        const matchSearch = !q || r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
        const matchGroup  = !groupFilter || r.atsGroup === groupFilter
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
            setError(err.message || 'Gagal menyimpan data ATS.')
        }
    }

    const handleDelete = async (id) => {
        try {
            setError('')
            await resourcesApi.remove(id)
            setResources((prev) => prev.filter((r) => r.id !== id))
        } catch (err) {
            setError(err.message || 'Gagal menghapus data ATS.')
        }
    }

    if (!isAdmin) {
        return (
            <div className="ats-page">
                <div className="ats-access-denied">
                    <span className="material-icons ats-access-denied__icon" aria-hidden="true">lock</span>
                    <h1>Akses Ditolak</h1>
                    <p>Hanya administrator yang dapat mengakses halaman ini.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="ats-page">

            {/* ── Header ── */}
            <div className="ats-header">
                <div>
                    <h1>Manajemen ATS</h1>
                    <p>Kontrak Annual Technical Support untuk sumber daya infrastruktur.</p>
                </div>
                {activeTab === 'resources' && (
                    <div className="ats-header-actions">
                        <button className="ats-btn ats-btn--secondary" onClick={() => setShowImport(true)}>
                            <span className="material-icons" aria-hidden="true">upload_file</span>
                            Import CSV
                        </button>
                        <button className="ats-btn ats-btn--primary" onClick={() => { setEditingResource(null); setShowForm(true) }}>
                            <span className="material-icons" aria-hidden="true">add_circle</span>
                            Tambah ATS
                        </button>
                    </div>
                )}
            </div>

            {/* ── Tabs ── */}
            <div className="ats-tabs">
                <button
                    className={`ats-tab${activeTab === 'dashboard' ? ' ats-tab--active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    <span className="material-icons" aria-hidden="true">dashboard</span>
                    Dashboard
                </button>
                <button
                    className={`ats-tab${activeTab === 'resources' ? ' ats-tab--active' : ''}`}
                    onClick={() => setActiveTab('resources')}
                >
                    <span className="material-icons" aria-hidden="true">list_alt</span>
                    Sumber Daya
                </button>
            </div>

            {/* ── Error ── */}
            {error && (
                <div className="ats-error" role="alert">
                    <span className="material-icons" aria-hidden="true">error</span>
                    {error}
                </div>
            )}

            {/* ── Content ── */}
            {loading ? (
                <div className="ats-loading" aria-live="polite">
                    <span className="material-icons ats-spin" aria-hidden="true">sync</span>
                    Memuat data ATS…
                </div>
            ) : activeTab === 'dashboard' ? (
                <AtsDashboard resources={resources} />
            ) : (
                <>
                    <div className="ats-toolbar">
                        <div className="ats-search">
                            <span className="material-icons ats-search__icon" aria-hidden="true">search</span>
                            <input
                                type="search"
                                className="ats-search__input"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama atau keterangan…"
                                aria-label="Cari ATS"
                            />
                        </div>
                        <select
                            value={groupFilter}
                            onChange={(e) => setGroupFilter(e.target.value)}
                            className="ats-toolbar-select"
                            aria-label="Filter grup"
                        >
                            <option value="">Semua Grup</option>
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
                        <p>Menampilkan {filtered.length} dari {resources.length} data.</p>
                    </div>
                </>
            )}

            {/* ── Modals ── */}
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
