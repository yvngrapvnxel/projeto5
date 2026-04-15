import React from 'react';
import useAdminStore from '../stores/adminStore';

export const CRMRow = (props) => {

    const { object, type, onEdit, onDelete, onReactivate, isAdmin } = props;
    const { deleteClient, deleteLead } = useAdminStore();

    const getLeadState = (state) => {
        const states = ["New", "Under Review", "Proposal Sent", "Archived", "Won"];
        return states[state] || "Unknown";
    };

    return (
        <tr>

            {type === 'lead' ? ( // leads
                <>
                    <td className="fw-semibold">{object.title}</td>
                    <td>{object.description}</td>
                    <td>{getLeadState(object.state)}</td>
                    <td>{object.creationDate ? object.creationDate : 'N/A'}</td>
                </>
            ) : ( // clientes
                <>
                    <td className="fw-semibold">{object.name}</td>
                    <td>{object.company}</td>
                    <td>{object.email}</td>
                </>
            )}
            <td>
                <span className={`badge ${object.active ? 'bg-light text-secondary' : 'bg-danger'}`}>
                    {object.active ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td className="text-end">
                {object.active ? (
                    <>
                        <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => onEdit(object)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(object.id)}>Delete</button>
                    </>
                ) : (
                    isAdmin && (
                        <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => onReactivate(object.id)}
                        >
                            Reactivate
                        </button>
                    )
                )}
                {isAdmin && (
                    <i
                        className="bi bi-trash3 text-danger ms-2"
                        style={{ cursor: 'pointer', fontSize: '0.85rem', opacity: '0.5' }}
                        onClick={() => {
                            const objectTitle = type === 'lead' ? object.title : object.name;
                            if (window.confirm(`PERMANENTLY DELETE ${objectTitle}? This cannot be undone.`)) {
                                type === 'lead' ?
                                    deleteLead(object.id, true)
                                    : deleteClient(object.id, true)
                            }
                        }}
                    ></i>
                )}
            </td>
        </tr>
    );
};