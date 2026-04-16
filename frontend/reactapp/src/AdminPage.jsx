import React, { useState, useEffect } from 'react';
import useUserStore from './stores/userStore';
import useAdminStore from './stores/adminStore';
import { CRMModal } from './components/edit-modal';


const AdminPage = () => {
    const { user: currentUser } = useUserStore();
    const {
        users, fetchUsers, deleteUser, reactivateUser,
        fetchUserSubData, selectedUserClients, selectedUserLeads,
        deleteClient, deleteLead, editClient, editLead,
        reactivateClient, reactivateLead
    } = useAdminStore();

    const [expandedUserId, setExpandedUserId] = useState(null);
    const [modalConfig, setModalConfig] = useState({ show: false, type: null, item: null });
    const [formData, setFormData] = useState({});
    const [leadFilter, setLeadFilter] = useState('all');

    useEffect(() => {
        if (currentUser.admin) fetchUsers();
    }, [currentUser, fetchUsers]);


    const toggleUserExpansion = (userId) => {
        if (expandedUserId === userId) {
            setExpandedUserId(null);
        } else {
            setLeadFilter('all');
            setExpandedUserId(userId);
            fetchUserSubData(userId);
        }
    };

    const openEditModal = (item, type) => {
        setFormData(item);
        setModalConfig({ show: true, type, item });
    };

    const handleModalClose = () => {
        setModalConfig({ show: false, type: null, item: null });
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        const { type, item } = modalConfig;
        let success = false;

        if (type === 'client') {
            success = await editClient(item.id, formData);
        }
        else if (type === 'lead') {
            success = await editLead(item.id, formData);
        }

        if (success) {
            handleModalClose();
            if (expandedUserId) {
                fetchUserSubData(expandedUserId);
            }
        }

        else alert("Failed to update " + type);
    };

    const getModalFields = () => {
        if (modalConfig.type === 'client') {
            return [
                { name: 'name', label: 'Name', type: 'text' },
                { name: 'company', label: 'Company', type: 'text' },
                { name: 'email', label: 'Email', type: 'email' }
            ];
        } else if (modalConfig.type === 'lead') {
            return [
                { name: 'title', label: 'Title', type: 'text' },
                { name: 'description', label: 'Description', type: 'textarea' },
                {
                    name: 'state',
                    label: 'State',
                    type: 'select',
                    options: [
                        { value: 0, label: 'New' },
                        { value: 1, label: 'Under Review' },
                        { value: 2, label: 'Proposal Sent' },
                        { value: 3, label: 'Archived' },
                        { value: 4, label: 'Won' }
                    ]
                }
            ];
        }
        return [];
    };


    const sortedUsers = [...users].sort((a, b) => {
        if (a.active !== b.active) {
            return a.active ? -1 : 1;
        }
        const nameA = (a.firstName || "").toLowerCase();
        const nameB = (b.firstName || "").toLowerCase();
        return nameA.localeCompare(nameB);
    });

    const sortedSelectedClients = [...selectedUserClients].sort((a, b) => {
        if (a.active !== b.active) return a.active ? -1 : 1;

        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        return nameA.localeCompare(nameB);
    });

    const filteredAndSortedLeads = selectedUserLeads
        .filter((lead) => {
            if (leadFilter === 'all') return true;
            return lead.state === parseInt(leadFilter);
        })
        .sort((a, b) => {
            if (a.active !== b.active) return a.active ? -1 : 1;
            if (a.state !== b.state) return a.state - b.state;
            return (a.title || "").toLowerCase().localeCompare((b.title || "").toLowerCase());
        });

    if (!currentUser.admin) {
        return (
            <div className="container-forbidden d-flex justify-content-center align-items-center">
                <h1 className="text-white fw-bold bg-danger p-3 rounded shadow-sm">403 - Forbidden</h1>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <h2 className="mb-4 text-primary fw-bold">System Administration</h2>

            <div className="card shadow-sm border-0">
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th className="border-0 px-4 py-3">User</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3 text-end px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedUsers.map(u => (
                                <React.Fragment key={u.id}>
                                    <tr
                                        onClick={() => toggleUserExpansion(u.id)}
                                        style={{
                                            cursor: 'pointer',
                                            backgroundColor: expandedUserId === u.id ? '#f1f5f9' : 'transparent',
                                            transition: 'background-color 0.2s ease'
                                        }}
                                        className={expandedUserId === u.id ? 'fw-bold' : ''}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={u.photoUrl || '/default-user.png'}
                                                    alt=""
                                                    className="rounded-circle me-3 border"
                                                    style={{ width: '35px', height: '35px', objectFit: 'cover' }}
                                                />
                                                <div className="d-flex flex-column">
                                                    <span className="small">{u.firstName} {u.lastName}</span>
                                                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>@{u.username}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <span className={`badge ${u.active ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '0.65rem' }}>
                                                {u.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-3 text-end px-4">
                                            <button
                                                className={`btn btn-sm ${u.active ? 'btn-outline-danger' : 'btn-outline-success'} d-inline-flex align-items-center justify-content-center me-2 p-0`}
                                                style={{ width: '110px', height: '32px', lineHeight: '1' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (u.active) {
                                                        if (window.confirm(`Deactivate ${u.firstName}?`)) deleteUser(u.id, false);
                                                    } else {
                                                        reactivateUser(u.id);
                                                    }
                                                }}
                                            >
                                                <span style={{ marginTop: '1px' }}>{u.active ? 'Deactivate' : 'Reactivate'}</span>
                                            </button>
                                        </td>
                                    </tr>

                                    {expandedUserId === u.id && (
                                        <tr>
                                            <td colSpan="3" className="p-0 border-0">
                                                <div className="p-4 border-bottom shadow-inner" style={{ backgroundColor: '#f8fafc' }}>

                                                    {/* user details */}

                                                    <div className="card border-0 shadow-sm mb-4">
                                                        <div className="card-header bg-white fw-bold text-secondary small uppercase pt-3 border-bottom-0">
                                                            <i className="bi bi-person-vcard me-2"></i> Account Details
                                                        </div>
                                                        <div className="card-body pt-0">
                                                            <table className="table table-sm table-hover mb-0">
                                                                <thead className="table-light">
                                                                    <tr className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                                        <th>Email</th>
                                                                        <th>Phone</th>
                                                                        <th>Role</th>
                                                                        <th>Status</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <tr style={{ fontSize: '0.85rem' }}>
                                                                        <td>{u.email}</td>
                                                                        <td>{u.phone || 'N/A'}</td>
                                                                        <td>{u.admin ? 'Administrator' : 'Standard User'}</td>
                                                                        <td>{u.active ? 'Active' : 'Deactivated'}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>

                                                    <div className="row g-4">

                                                        {/* clients */}

                                                        <div className="col-md-5">
                                                            <div className="card border-0 shadow-sm h-100">
                                                                <div className="card-header bg-white fw-bold border-bottom-0 pt-4" style={{ color: '#2D5A88' }}>User's Clients</div>
                                                                <div className="card-body pt-0">
                                                                    {sortedSelectedClients.length > 0 ? sortedSelectedClients.map(c => (
                                                                        <div key={c.id} className="border-bottom py-2 d-flex justify-content-between align-items-center">
                                                                            <span className={`small fw-semibold ${!c.active ? 'text-muted text-decoration-line-through' : ''}`}>
                                                                                {c.name}
                                                                            </span>
                                                                            <div className="d-flex align-items-center gap-2">
                                                                                <button className="btn btn-sm btn-link text-secondary p-0 text-decoration-none"
                                                                                    onClick={() => openEditModal(c, 'client')}>
                                                                                    Edit
                                                                                </button>

                                                                                <button
                                                                                    className={`btn btn-sm btn-link p-0 text-decoration-none ${c.active ? 'text-warning' : 'text-success'}`}
                                                                                    onClick={() => {
                                                                                        if (c.active) {
                                                                                            deleteClient(c.id, false);
                                                                                        } else {
                                                                                            reactivateClient(c.id);
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    {c.active ? 'Deactivate' : 'Reactivate'}
                                                                                </button>

                                                                                <i
                                                                                    className="bi bi-trash3 text-danger ms-1"
                                                                                    style={{ cursor: 'pointer', fontSize: '0.85rem', opacity: '0.5' }}
                                                                                    onClick={() => {
                                                                                        if (window.confirm(`PERMANENTLY DELETE "${c.name}"? This cannot be undone.`)) {
                                                                                            deleteClient(c.id, true);
                                                                                        }
                                                                                    }}
                                                                                ></i>
                                                                            </div>
                                                                        </div>
                                                                    )) : <p className="text-muted small mt-2">No clients found.</p>}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* leads */}

                                                        <div className="col-md-7">
                                                            <div className="card border-0 shadow-sm h-100">
                                                                <div className="card-header bg-white d-flex justify-content-between align-items-center border-bottom-0 pt-3">
                                                                    <span className="fw-bold" style={{ color: '#2D5A88' }}>User's Leads</span>
                                                                    {selectedUserLeads.length > 0 ?
                                                                        <select className="form-select form-select-sm w-auto" value={leadFilter} onChange={(e) => setLeadFilter(e.target.value)}>
                                                                            <option value="all">All</option>
                                                                            <option value="0">New</option>
                                                                            <option value="1">Under Review</option>
                                                                            <option value="2">Proposal Sent</option>
                                                                            <option value="3">Archive</option>
                                                                            <option value="4">Won</option>
                                                                        </select>
                                                                        : <></>}
                                                                </div>
                                                                <div className="card-body pt-0">
                                                                    {filteredAndSortedLeads.length > 0 ? filteredAndSortedLeads.map(l => (
                                                                        <div key={l.id} className="border-bottom py-2 d-flex align-items-center">
                                                                            <div className="text-start" style={{ flex: '0 0 45%' }}>
                                                                                <span className={`small fw-semibold ${!l.active ? 'text-muted text-decoration-line-through' : ''}`}>{l.title}</span>
                                                                            </div>
                                                                            <div style={{ flex: '0 0 30%' }} className="text-center">
                                                                                <span className="badge border text-muted fw-normal" style={{ fontSize: '0.65rem' }}>
                                                                                    {["New", "Under Review", "Proposal Sent", "Archive", "Won"][l.state]}
                                                                                </span>
                                                                            </div>
                                                                            <div className="text-end" style={{ flex: '0 0 25%' }}>
                                                                                <button className="btn btn-sm btn-link text-secondary p-0 me-2 text-decoration-none"
                                                                                    onClick={() => openEditModal(l, 'lead')}>
                                                                                    Edit
                                                                                </button>

                                                                                <button
                                                                                    className={`btn btn-sm btn-link p-0 text-decoration-none ${l.active ? 'text-warning' : 'text-success'}`}
                                                                                    onClick={() => {
                                                                                        if (l.active) {
                                                                                            deleteLead(l.id, false);
                                                                                        } else {
                                                                                            reactivateLead(l.id);
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    {l.active ? 'Deactivate' : 'Reactivate'}
                                                                                </button>

                                                                                <i
                                                                                    className="bi bi-trash3 text-danger ms-2"
                                                                                    style={{ cursor: 'pointer', fontSize: '0.85rem', opacity: '0.6' }}
                                                                                    title="Permanent Delete"
                                                                                    onClick={() => {
                                                                                        if (window.confirm(`PERMANENTLY DELETE "${l.title}"? This cannot be undone.`)) {
                                                                                            deleteLead(l.id, true);
                                                                                        }
                                                                                    }}
                                                                                ></i>
                                                                            </div>
                                                                        </div>
                                                                    )) : <p className="text-muted small mt-2">No leads found.</p>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <CRMModal
                show={modalConfig.show}
                onClose={handleModalClose}
                onSubmit={handleModalSubmit}
                title={modalConfig.type === 'client' ? 'Edit Client' : 'Edit Lead'}
                formData={formData}
                setFormData={setFormData}
                fields={getModalFields()}
            />
        </div>
    );
};

export default AdminPage;