
export default function DynamicFieldRenderer({ field, value, onChange, error }) {
    const handleChange = (e) => {
        // For checkbox, use 'checked', otherwise 'value'
        const val = field.type === 'boolean' ? e.target.checked : e.target.value
        onChange(field.name, val)
    }

    // Common props for inputs
    const commonProps = {
        id: field.id,
        name: field.name,
        className: `form-input ${error ? 'form-input--error' : ''}`,
        disabled: false, // Could be passed as prop if needed
        'aria-invalid': !!error,
    }

    // Label component
    const Label = () => (
        <label htmlFor={field.id} className="form-label">
            {field.name}
            {field.required && <span className="form-required">*</span>}
        </label>
    )

    // Render logic based on type
    let inputElement = null

    switch (field.type) {
        case 'text':
        case 'url':
        case 'email':
            inputElement = (
                <input
                    type={field.type === 'url' ? 'url' : 'text'}
                    value={value || ''}
                    placeholder={`Enter ${field.name}`}
                    onChange={handleChange}
                    {...commonProps}
                />
            )
            break

        case 'number':
            inputElement = (
                <input
                    type="number"
                    value={value || ''}
                    placeholder="0"
                    onChange={handleChange}
                    {...commonProps}
                />
            )
            break

        case 'select':
            inputElement = (
                <div className="select-wrapper">
                    <select
                        value={value || ''}
                        onChange={handleChange}
                        {...commonProps}
                    >
                        <option value="" disabled>Select an option</option>
                        {field.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                    <span className="material-icons select-arrow">expand_more</span>
                </div>
            )
            break

        case 'boolean':
            return (
                <div className="form-group form-group--checkbox">
                    <label className="checkbox-container">
                        <input
                            type="checkbox"
                            checked={!!value}
                            onChange={handleChange}
                            id={field.id}
                        />
                        <span className="checkmark"></span>
                        <span className="checkbox-label">{field.name}</span>
                    </label>
                    {error && <span className="form-error">{error}</span>}
                </div>
            )

        case 'date':
            inputElement = (
                <input
                    type="date"
                    value={value || ''}
                    onChange={handleChange}
                    className={commonProps.className} // date usage
                />
            )
            break

        default:
            inputElement = <input type="text" {...commonProps} />
    }

    return (
        <div className="form-group">
            <Label />
            {inputElement}
            {error && <span className="form-error">{error}</span>}
        </div>
    )
}
