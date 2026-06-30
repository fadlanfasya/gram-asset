import { useRef, useState } from 'react'
import { importApi } from '../../utils/atsApi'
import './AtsImportModal.css'

export default function AtsImportModal({ onClose, onRefresh }) {
    const [file, setFile]       = useState(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult]   = useState(null)
    const [error, setError]     = useState('')
    const inputRef = useRef()

    const handleFile = (e) => {
        const f = e.target.files[0]
        if (f) { setFile(f); setResult(null); setError('') }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const f = e.dataTransfer.files[0]
        if (f) { setFile(f); setResult(null); setError('') }
    }

    const handleImport = async () => {
        if (!file) return
        try {
            setLoading(true)
            setError('')
            const data = await importApi.uploadCsv(file)
            setResult(data)
            onRefresh()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="ats-form-overlay" onClick={onClose}>
            <div
                className="ats-import-modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="ats-import-title"
            >

                <div className="ats-form-header">
                    <h2 id="ats-import-title">Import CSV</h2>
                    <button className="ats-close-btn" onClick={onClose} aria-label="Tutup">
                        <span className="material-icons" aria-hidden="true">close</span>
                    </button>
                </div>

                <div className="ats-import-body">
                    {!result && (
                        <>
                            <div className="ats-import-info">
                                <p>Upload file CSV dari Excel ATS. Kolom yang dibaca:</p>
                                <ul>
                                    <li><strong>Nama Aplikasi (ATS)</strong> → Nama ATS</li>
                                    <li><strong>Penjelasan</strong> → Keterangan</li>
                                    <li><strong>ATS 2025</strong> → Grup (a / b / terpisah)</li>
                                    <li><strong>Masa ATS</strong> → Periode support</li>
                                    <li><strong>Butuh</strong> → hanya baris TRUE yang diimport</li>
                                    <li><strong>Harga Per Item (2024/2025/2026)</strong> → Biaya</li>
                                </ul>
                            </div>

                            <div
                                className={`ats-import-drop${file ? ' ats-import-drop--selected' : ''}`}
                                onClick={() => inputRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                                role="button"
                                tabIndex={0}
                                aria-label="Klik atau drag file CSV ke sini"
                                onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
                            >
                                <span className="material-icons ats-drop-icon" aria-hidden="true">description</span>
                                <p>{file ? file.name : 'Klik atau drag & drop file CSV'}</p>
                                {file && <span className="ats-import-size">{(file.size / 1024).toFixed(1)} KB</span>}
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFile}
                                    style={{ display: 'none' }}
                                    aria-hidden="true"
                                />
                            </div>
                        </>
                    )}

                    {result && (
                        <div className="ats-import-result">
                            <div className="ats-import-stat ats-import-stat--ok">
                                <span className="material-icons ats-stat-icon" aria-hidden="true">check_circle</span>
                                <span><strong>{result.imported}</strong> ATS berhasil diimport</span>
                            </div>
                            {result.merged > 0 && (
                                <div className="ats-import-stat ats-import-stat--gray">
                                    <span>{result.merged} sub-komponen digabung ke induknya</span>
                                </div>
                            )}
                            <div className="ats-import-stat ats-import-stat--gray">
                                <span>{result.skipped} baris dilewati (Butuh=FALSE / header)</span>
                            </div>
                            {result.errors?.length > 0 && (
                                <div className="ats-import-errors">
                                    <p className="ats-import-stat ats-import-stat--err">
                                        <span className="material-icons ats-stat-icon" aria-hidden="true">error</span>
                                        {result.errors.length} error:
                                    </p>
                                    <ul>
                                        {result.errors.slice(0, 5).map((e, i) => (
                                            <li key={i}>{e.name}: {e.error}</li>
                                        ))}
                                        {result.errors.length > 5 && (
                                            <li className="ats-import-more">… dan {result.errors.length - 5} lainnya</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="ats-import-err-banner" role="alert">
                            <span className="material-icons ats-stat-icon" aria-hidden="true">error</span>
                            {error}
                        </div>
                    )}
                </div>

                <div className="ats-import-footer">
                    {result ? (
                        <button className="ats-btn ats-btn--primary" onClick={onClose}>Selesai</button>
                    ) : (
                        <>
                            <button className="ats-btn ats-btn--secondary" onClick={onClose}>Batal</button>
                            <button
                                className="ats-btn ats-btn--primary"
                                onClick={handleImport}
                                disabled={!file || loading}
                            >
                                {loading ? (
                                    'Mengimport…'
                                ) : (
                                    <><span className="material-icons" aria-hidden="true">upload</span>Import</>
                                )}
                            </button>
                        </>
                    )}
                </div>

            </div>
        </div>
    )
}
