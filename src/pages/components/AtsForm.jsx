import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import './AtsForm.css'

const GROUP_OPTIONS = [
    { value: 'a',                  label: 'Group A' },
    { value: 'b',                  label: 'Group B' },
    { value: 'terpisah',           label: 'Terpisah' },
    { value: 'tidak diperpanjang', label: 'Tidak Diperpanjang' },
]

export default function ResourceForm({ resource, onClose, onSubmit }) {
    const [form, setForm] = useState({
        name: '',
        description: '',
        atsGroup: '',
        supportStart: '',
        supportEnd: '',
        needed: true,
    })
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (resource) {
            setForm({
                name: resource.name || '',
                description: resource.description || '',
                atsGroup: resource.atsGroup || '',
                supportStart: resource.supportStart?.split('T')[0] || '',
                supportEnd: resource.supportEnd?.split('T')[0] || '',
                needed: resource.needed !== undefined ? resource.needed : true,
            })
        }
    }, [resource])

    const set = (key, val) => {
        setForm((prev) => ({ ...prev, [key]: val }))
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
    }

    const validate = () => {
        const errs = {}
        if (!form.name.trim()) errs.name = 'Nama ATS wajib diisi'
        if (form.supportStart && form.supportEnd && new Date(form.supportEnd) <= new Date(form.supportStart)) {
            errs.supportEnd = 'Tanggal akhir harus setelah tanggal mulai'
        }
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return
        await onSubmit({
            name: form.name,
            description: form.description || null,
            atsGroup: form.atsGroup || null,
            supportStart: form.supportStart || null,
            supportEnd: form.supportEnd || null,
            needed: form.needed,
        })
    }

    return (
        <div className="ats-form-overlay" onClick={onClose}>
            <div className="ats-form-card" onClick={(e) => e.stopPropagation()}>
                <div className="ats-form-header">
                    <h2>{resource ? 'Edit ATS' : 'Tambah ATS'}</h2>
                    <button className="ats-close-btn" onClick={onClose} aria-label="Tutup">
                        <X size={22} />
                    </button>
                </div>

                <div className="ats-form-body">
                    <form className="ats-form" onSubmit={handleSubmit}>

                        <label className="ats-field">
                            Nama ATS *
                            <input
                                value={form.name}
                                onChange={(e) => set('name', e.target.value)}
                                placeholder="contoh: RedHat Enterprise Linux"
                            />
                            {errors.name && <span className="ats-error-text">{errors.name}</span>}
                        </label>

                        <label className="ats-field">
                            Keterangan / Description
                            <textarea
                                value={form.description}
                                onChange={(e) => set('description', e.target.value)}
                                placeholder="contoh: Dipakai di SOA, Prod server"
                                rows={3}
                            />
                        </label>

                        <div className="ats-form-row">
                            <label className="ats-field">
                                ATS Group
                                <select value={form.atsGroup} onChange={(e) => set('atsGroup', e.target.value)}>
                                    <option value="">Pilih group</option>
                                    {GROUP_OPTIONS.map((g) => (
                                        <option key={g.value} value={g.value}>{g.label}</option>
                                    ))}
                                </select>
                            </label>

                            <label className="ats-field ats-field--check">
                                <input
                                    type="checkbox"
                                    checked={form.needed}
                                    onChange={(e) => set('needed', e.target.checked)}
                                />
                                Butuh / Required
                            </label>
                        </div>

                        <div className="ats-form-row">
                            <label className="ats-field">
                                Tanggal Mulai ATS
                                <input
                                    type="date"
                                    value={form.supportStart}
                                    onChange={(e) => set('supportStart', e.target.value)}
                                />
                            </label>
                            <label className="ats-field">
                                Tanggal Berakhir ATS
                                <input
                                    type="date"
                                    value={form.supportEnd}
                                    onChange={(e) => set('supportEnd', e.target.value)}
                                />
                                {errors.supportEnd && <span className="ats-error-text">{errors.supportEnd}</span>}
                            </label>
                        </div>

                        <p className="ats-form-hint">
                            Setelah menyimpan, kamu bisa menambahkan biaya (cost) dan menghubungkan aset melalui tombol di tabel.
                        </p>

                        <div className="ats-form-actions">
                            <button type="button" className="ats-btn ats-btn--secondary" onClick={onClose}>
                                Batal
                            </button>
                            <button type="submit" className="ats-btn ats-btn--primary">
                                Simpan ATS
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
