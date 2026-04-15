import React from 'react';

export const CRMModal = ({
    show,
    onClose,
    onSubmit,
    title,
    formData,
    setFormData,
    fields
}) => {

    if (!show) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        const val = name === 'state' ? parseInt(value) : value;
        setFormData({ ...formData, [name]: val });
    };



    return (

        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow">

                    <div className="modal-header" style={{ borderBottom: '2px solid #3C78B4' }}>

                        <h5 className="modal-title fw-bold">{title}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>

                    </div>

                    <form onSubmit={onSubmit}>

                        <div className="modal-body p-4">

                            {fields.map((field) => (
                                <div className="mb-3" key={field.name}>
                                    <label className="form-label fw-semibold">{field.label}</label>

                                    {field.type === 'select' ? (
                                        <select
                                            name={field.name}
                                            className="form-select"
                                            value={formData[field.name]}
                                            onChange={handleChange}
                                        >
                                            {field.options.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    ) : field.type === 'textarea' ? (
                                        <textarea
                                            name={field.name}
                                            className="form-control"
                                            rows="3"
                                            required
                                            value={formData[field.name]}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <input
                                            type={field.type || 'text'}
                                            name={field.name}
                                            className="form-control"
                                            required
                                            value={formData[field.name]}
                                            onChange={handleChange}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="modal-footer bg-light">

                            <button type="button" className="btn btn-light text-danger" onClick={onClose}>Cancel</button>

                            <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#2D5A88' }}>
                                Save
                            </button>

                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};