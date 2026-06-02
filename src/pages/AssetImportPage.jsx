import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useDefinitionStore from '../stores/useDefinitionStore'
import useAssetStore from '../stores/useAssetStore'
import './AssetImportPage.css'

function parseCsv(text) {
  const rows = text.trim().split(/\r?\n/)
  if (!rows.length) return { headers: [], rows: [] }

  const parseLine = (line) => {
    const values = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i]
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i += 1
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current)
        current = ''
      } else {
        current += char
      }
    }
    values.push(current)
    return values
  }

  const headers = parseLine(rows[0]).map((header) => header.trim())
  const dataRows = rows.slice(1).map(parseLine).filter((row) => row.some((value) => value.trim() !== ''))
  const rowObjects = dataRows.map((row) => {
    const entry = {}
    headers.forEach((header, index) => {
      entry[header] = row[index] ?? ''
    })
    return entry
  })

  return { headers, rows: rowObjects }
}

function buildAssetPayload(row, mapping, definitionId) {
  const fieldValues = {}
  Object.keys(mapping).forEach((targetKey) => {
    const sourceHeader = mapping[targetKey]
    if (!sourceHeader) return
    const value = row[sourceHeader] ?? ''

    if (targetKey === 'name') return
    if (targetKey === 'description') return
    if (targetKey === 'status') return
    if (targetKey === 'tags') return

    fieldValues[targetKey] = value
  })

  return {
    name: row[mapping.name] || '',
    definitionId,
    status: (row[mapping.status] || 'active').toLowerCase(),
    description: row[mapping.description] || '',
    tags: row[mapping.tags]
      ? row[mapping.tags].split(/[,;]+/).map((tag) => tag.trim()).filter(Boolean)
      : [],
    fieldValues,
  }
}

export default function AssetImportPage() {
  const navigate = useNavigate()
  const definitions = useDefinitionStore((s) => s.definitions)
  const fetchDefinitions = useDefinitionStore((s) => s.fetchDefinitions)
  const addAsset = useAssetStore((s) => s.addAsset)
  const fetchAssets = useAssetStore((s) => s.fetchAssets)
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState(null)
  const [csvHeaders, setCsvHeaders] = useState([])
  const [csvRows, setCsvRows] = useState([])
  const [parseError, setParseError] = useState('')
  const [definitionId, setDefinitionId] = useState('')
  const [mapping, setMapping] = useState({
    name: '',
    status: '',
    description: '',
    tags: '',
  })
  const [importError, setImportError] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (definitions.length && !definitionId) {
      setDefinitionId(definitions[0].id)
    }
  }, [definitions, definitionId])

  useEffect(() => {
    fetchDefinitions()
  }, [])

  const activeDefinition = useMemo(
    () => definitions.find((def) => def.id === definitionId) || null,
    [definitions, definitionId]
  )

  const availableHeaders = csvHeaders.length ? [''].concat(csvHeaders) : ['']

  const dynamicFieldKeys = useMemo(() => {
    if (!activeDefinition) return []
    return activeDefinition.fields.map((field) => ({
      name: field.name,
      label:
        field.type === 'relationship'
          ? `${field.name} (links to ${definitions.find((def) => def.id === field.targetDefinitionId)?.name || 'another type'})`
          : field.name,
    }))
  }, [activeDefinition, definitions])

  const handleSelectFile = async (event) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return
    setParseError('')
    setFile(selectedFile)
    setCsvHeaders([])
    setCsvRows([])
    setMapping({ name: '', status: '', description: '', tags: '' })

    try {
      const text = await selectedFile.text()
      const parsed = parseCsv(text)
      if (parsed.headers.length === 0) {
        setParseError('CSV does not contain a valid header row.')
        return
      }
      if (parsed.rows.length === 0) {
        setParseError('CSV contains no data rows.')
        return
      }
      setCsvHeaders(parsed.headers)
      setCsvRows(parsed.rows)
      setMapping((prev) => ({ ...prev, name: parsed.headers[0] ?? '' }))
    } catch (error) {
      console.error(error)
      setParseError('Failed to read the file. Please upload a valid CSV file.')
    }
  }

  const handleMappingChange = (fieldKey, value) => {
    setMapping((prev) => ({ ...prev, [fieldKey]: value }))
  }

  const handleImport = async () => {
    setImportError('')
    if (!file || csvRows.length === 0) {
      setImportError('Please upload a valid CSV file first.')
      return
    }
    if (!definitionId) {
      setImportError('Please select an asset type for import.')
      return
    }
    if (!mapping.name) {
      setImportError('Please map the Name field to a CSV column.')
      return
    }

    setIsImporting(true)
    try {
      const rowsToImport = csvRows.map((row) => buildAssetPayload(row, mapping, definitionId))
      const imported = []
      const failed = []
      for (const assetData of rowsToImport) {
        if (!assetData.name.trim()) {
          failed.push({ assetData, reason: 'Missing name' })
          continue
        }
        try {
          await addAsset(assetData)
          imported.push(assetData)
        } catch (error) {
          console.error('Import row failed', error)
          failed.push({ assetData, reason: 'Failed to save' })
        }
      }
      await fetchAssets()
      alert(`Import complete. ${imported.length} imported, ${failed.length} failed.`)
      navigate('/assets')
    } catch (error) {
      console.error(error)
      setImportError('Import failed. Please try again.')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="import-page">
      <nav className="breadcrumb">
        <Link to="/assets">Assets</Link>
        <span className="material-icons">chevron_right</span>
        <span>Import from CSV</span>
      </nav>

      <div className="page-header">
        <h1 className="page-title">Import Assets from CSV</h1>
        <p className="page-subtitle">
          Upload a CSV file, map its columns to asset fields, and import them into your inventory.
        </p>
      </div>

      <div className="import-controls">
        <div className="import-card">
          <h2>Step 1: Upload CSV</h2>
          <p className="import-note">Supported files must include a header row. Use commas as separators.</p>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleSelectFile}
            className="file-input"
          />
          {file && <p className="import-file-name">Selected file: {file.name}</p>}
          {parseError && <p className="form-error">{parseError}</p>}
        </div>

        <div className="import-card">
          <h2>Step 2: Select Asset Type</h2>
          <div className="form-group">
            <label className="form-label">Asset Definition</label>
            <div className="select-wrapper">
              <select
                value={definitionId}
                onChange={(e) => setDefinitionId(e.target.value)}
                className="form-input"
              >
                {definitions.map((def) => (
                  <option key={def.id} value={def.id}>{def.name}</option>
                ))}
              </select>
              <span className="material-icons select-arrow">expand_more</span>
            </div>
          </div>

          <div className="import-summary">
            <span className="import-summary-label">CSV rows ready:</span>
            <strong>{csvRows.length}</strong>
          </div>
        </div>
      </div>

      <div className="import-card import-mapping-card">
        <h2>Step 3: Map CSV columns to fields</h2>
        <p className="import-note">Select the CSV header that matches each asset field.</p>
        <div className="mapping-grid">
          <div className="mapping-row">
            <label>Name *</label>
            <select value={mapping.name} onChange={(e) => handleMappingChange('name', e.target.value)}>
              {availableHeaders.map((header) => (
                <option key={header} value={header}>{header || '-- Choose column --'}</option>
              ))}
            </select>
          </div>
          <div className="mapping-row">
            <label>Description</label>
            <select value={mapping.description} onChange={(e) => handleMappingChange('description', e.target.value)}>
              {availableHeaders.map((header) => (
                <option key={header} value={header}>{header || '-- Skip --'}</option>
              ))}
            </select>
          </div>
          <div className="mapping-row">
            <label>Status</label>
            <select value={mapping.status} onChange={(e) => handleMappingChange('status', e.target.value)}>
              {availableHeaders.map((header) => (
                <option key={header} value={header}>{header || '-- Skip --'}</option>
              ))}
            </select>
          </div>
          <div className="mapping-row">
            <label>Tags</label>
            <select value={mapping.tags} onChange={(e) => handleMappingChange('tags', e.target.value)}>
              {availableHeaders.map((header) => (
                <option key={header} value={header}>{header || '-- Skip --'}</option>
              ))}
            </select>
          </div>
          {dynamicFieldKeys.map((field) => (
            <div className="mapping-row" key={field.name}>
              <label>{field.label}</label>
              <select
                value={mapping[field.name] || ''}
                onChange={(e) => handleMappingChange(field.name, e.target.value)}
              >
                {availableHeaders.map((header) => (
                  <option key={header} value={header}>{header || '-- Skip --'}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="preview-section">
          <h3>Preview</h3>
          {csvRows.length > 0 ? (
            <div className="preview-table-wrapper">
              <table className="preview-table">
                <thead>
                  <tr>
                    {csvHeaders.slice(0, 5).map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvRows.slice(0, 3).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {csvHeaders.slice(0, 5).map((header) => (
                        <td key={header}>{row[header]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="import-note">Upload a CSV file to preview rows.</p>
          )}
        </div>

        {importError && <p className="form-error">{importError}</p>}

        <div className="import-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate('/assets')}>
            Cancel
          </button>
          <button type="button" className="btn-save" onClick={handleImport} disabled={isImporting || !csvRows.length}>
            <span className="material-icons">upload_file</span>
            {isImporting ? 'Importing...' : 'Import Assets'}
          </button>
        </div>
      </div>
    </div>
  )
}
