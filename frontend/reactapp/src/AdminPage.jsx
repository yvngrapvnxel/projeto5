import React, {useEffect, useState} from 'react';
import useUserStore from './stores/userStore';
import useAdminStore from './stores/adminStore';
import {CRMModal} from './components/edit-modal';
import { useTranslation } from 'react-i18next';


const AdminPage = () => {
    const { t } = useTranslation();
    const {user: currentUser} = useUserStore();
    const {
        users, fetchUsers, deleteUser, reactivateUser,
        fetchUserSubData, selectedUserClients, selectedUserLeads,
        deleteClient, deleteLead, editClient, editLead,
        reactivateClient, reactivateLead, inviteUser
    } = useAdminStore();

    const [expandedUserId, setExpandedUserId] = useState(null);
    const [modalConfig, setModalConfig] = useState({show: false, type: null, item: null});
    const [formData, setFormData] = useState({});
    const [leadFilter, setLeadFilter] = useState('all');

    useEffect(() => {
        if (currentUser.admin) {
            fetchUsers();
        }
        document.body.classList.add('no-bg');
        return () => document.body.classList.remove('no-bg');
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
        setModalConfig({show: true, type, item});
    };

    const handleModalClose = () => {
        setModalConfig({show: false, type: null, item: null});
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        const {type, item} = modalConfig;
        let success = false;

        if (type === 'invite') {
            success = await inviteUser(formData.email);
            if (success) {
                alert(t('adminPage.inviteSuccess') + formData.email);
                handleModalClose();
                await fetchUsers(); // Refresh the list to show the new inactive user
            } else {
                alert(t('adminPage.inviteFailed'));
            }
            return;
        } else if (type === 'client') {
            success = await editClient(item.id, formData);
        } else if (type === 'lead') {
            success = await editLead(item.id, formData);
        }

        if (success) {
            handleModalClose();
            if (expandedUserId) {
                fetchUserSubData(expandedUserId);
            }
        } else {
            alert(t('adminPage.updateFailed') + type);
        }
    };

    const getModalFields = () => {
        if (modalConfig.type === 'invite') {
            return [
                {name: 'email', label: t('adminPage.emailAddress'), type: 'email'}
            ];
        } else if (modalConfig.type === 'client') {
            return [
                {name: 'name', label: t('adminPage.clientName'), type: 'text'},
                {name: 'company', label: t('adminPage.clientCompany'), type: 'text'},
                {name: 'email', label: t('adminPage.email'), type: 'email'}
            ];
        } else if (modalConfig.type === 'lead') {
            return [
                {name: 'title', label: t('adminPage.leadTitle'), type: 'text'},
                {name: 'description', label: t('adminPage.leadDescription'), type: 'textarea'},
                {
                    name: 'state',
                    label: t('adminPage.leadState'),
                    type: 'select',
                    options: [
                        {value: 0, label: t('adminPage.stateNew')},
                        {value: 1, label: t('adminPage.stateUnderReview')},
                        {value: 2, label: t('adminPage.stateProposalSent')},
                        {value: 3, label: t('adminPage.stateArchive')},
                        {value: 4, label: t('adminPage.stateWon')}
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
                <h1 className="text-white fw-bold bg-danger p-3 rounded shadow-sm">{t('adminPage.forbidden')}</h1>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold mb-0">{t('adminPage.title')}</h2>
                    <button
                        className="btn btn-primary"
                        style={{backgroundColor: '#2D5A88'}}
                        onClick={() => {
                            setFormData({email: ''});
                            setModalConfig({show: true, type: 'invite', item: null});
                        }}
                    >
                        {t('adminPage.inviteUser')}
                    </button>
                </div>

                <div className="card shadow-sm border-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle">
                            <thead className="table-light">
                            <tr>
                                <th className="border-0 px-4 py-3">{t('adminPage.tableUser')}</th>
                                <th className="border-0 py-3">{t('adminPage.tableStatus')}</th>
                                <th className="border-0 py-3 text-end px-4">{t('adminPage.tableActions')}</th>
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
                                                    style={{width: '35px', height: '35px', objectFit: 'cover'}}
                                                />
                                                <div className="d-flex flex-column">
                                                    <span className="small">{u.firstName} {u.lastName}</span>
                                                    <span className="text-muted"
                                                          style={{fontSize: '0.7rem'}}>@{u.username}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <span className={`badge ${u.active ? 'bg-success' : 'bg-danger'}`}
                                                  style={{fontSize: '0.65rem'}}>
                                                {u.active ? t('adminPage.statusActive') : t('adminPage.statusInactive')}
                                            </span>
                                        </td>
                                        <td className="py-3 text-end px-4">
                                            <button
                                                className={`btn btn-sm ${u.active ? 'btn-outline-danger' : 'btn-outline-success'} d-inline-flex align-items-center justify-content-center me-2 p-0`}
                                                style={{width: '110px', height: '32px', lineHeight: '1'}}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (u.active) {
                                                        if (window.confirm(t('adminPage.confirmDeactivateUser', { name: u.firstName }))) deleteUser(u.id, false);
                                                    } else {
                                                        reactivateUser(u.id);
                                                    }
                                                }}
                                            >
                                                <span
                                                    style={{marginTop: '1px'}}>{u.active ? t('adminPage.actionDeactivate') : t('adminPage.actionReactivate')}</span>
                                            </button>
                                        </td>
                                    </tr>

                                    {expandedUserId === u.id && (
                                        <tr>
                                            <td colSpan="3" className="p-0 border-0">
                                                <div className="p-4 border-bottom shadow-inner"
                                                     style={{backgroundColor: '#f8fafc'}}>

                                                    {/* user details */}

                                                    <div className="card border-0 shadow-sm mb-4">
                                                        <div
                                                            className="card-header bg-white fw-bold text-secondary small uppercase pt-3 border-bottom-0">
                                                            <i className="bi bi-person-vcard me-2"></i> {t('adminPage.accountDetails')}
                                                        </div>
                                                        <div className="card-body pt-0">
                                                            <table className="table table-sm table-hover mb-0">
                                                                <thead className="table-light">
                                                                <tr className="text-muted" style={{fontSize: '0.7rem'}}>
                                                                    <th>{t('adminPage.email')}</th>
                                                                    <th>{t('adminPage.phone')}</th>
                                                                    <th>{t('adminPage.role')}</th>
                                                                    <th>{t('adminPage.tableStatus')}</th>
                                                                </tr>
                                                                </thead>
                                                                <tbody>
                                                                <tr style={{fontSize: '0.85rem'}}>
                                                                    <td>{u.email}</td>
                                                                    <td>{u.phone || 'N/A'}</td>
                                                                    <td>{u.admin ? t('adminPage.roleAdmin') : t('adminPage.roleStandard')}</td>
                                                                    <td>{u.active ? t('adminPage.statusActive') : t('adminPage.statusDeactivated')}</td>
                                                                </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>

                                                    <div className="row g-4">

                                                        {/* clients */}

                                                        <div className="col-md-5">
                                                            <div className="card border-0 shadow-sm h-100">
                                                                <div
                                                                    className="card-header bg-white fw-bold border-bottom-0 pt-4"
                                                                    style={{color: '#2D5A88'}}>{t('adminPage.usersClients')}
                                                                </div>
                                                                <div className="card-body pt-0">
                                                                    {sortedSelectedClients.length > 0 ? sortedSelectedClients.map(c => (
                                                                        <div key={c.id}
                                                                             className="border-bottom py-2 d-flex justify-content-between align-items-center">
                                                                            <span
                                                                                className={`small fw-semibold ${!c.active ? 'text-muted text-decoration-line-through' : ''}`}>
                                                                                {c.name}
                                                                            </span>
                                                                            <div
                                                                                className="d-flex align-items-center gap-2">
                                                                                <button
                                                                                    className="btn btn-sm btn-link text-secondary p-0 text-decoration-none"
                                                                                    onClick={() => openEditModal(c, 'client')}>
                                                                                    {t('adminPage.actionEdit')}
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
                                                                                    {c.active ? t('adminPage.actionDeactivate') : t('adminPage.actionReactivate')}
                                                                                </button>

                                                                                <i
                                                                                    className="bi bi-trash3 text-danger ms-1"
                                                                                    style={{
                                                                                        cursor: 'pointer',
                                                                                        fontSize: '0.85rem',
                                                                                        opacity: '0.5'
                                                                                    }}
                                                                                    onClick={() => {
                                                                                        if (window.confirm(t('adminPage.permanentlyDelete', { name: c.name }))) {
                                                                                            deleteClient(c.id, true);
                                                                                        }
                                                                                    }}
                                                                                ></i>
                                                                            </div>
                                                                        </div>
                                                                    )) : <p className="text-muted small mt-2">{t('adminPage.noClientsFound')}</p>}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* leads */}

                                                        <div className="col-md-7">
                                                            <div className="card border-0 shadow-sm h-100">
                                                                <div
                                                                    className="card-header bg-white d-flex justify-content-between align-items-center border-bottom-0 pt-3">
                                                                    <span className="fw-bold"
                                                                          style={{color: '#2D5A88'}}>{t('adminPage.usersLeads')}</span>
                                                                    {selectedUserLeads.length > 0 ?
                                                                        <select
                                                                            className="form-select form-select-sm w-auto"
                                                                            value={leadFilter}
                                                                            onChange={(e) => setLeadFilter(e.target.value)}>
                                                                            <option value="all">{t('adminPage.filterAll')}</option>
                                                                            <option value="0">{t('adminPage.stateNew')}</option>
                                                                            <option value="1">{t('adminPage.stateUnderReview')}</option>
                                                                            <option value="2">{t('adminPage.stateProposalSent')}</option>
                                                                            <option value="3">{t('adminPage.stateArchive')}</option>
                                                                            <option value="4">{t('adminPage.stateWon')}</option>
                                                                        </select>
                                                                        : <></>}
                                                                </div>
                                                                <div className="card-body pt-0">
                                                                    {filteredAndSortedLeads.length > 0 ? filteredAndSortedLeads.map(l => (
                                                                        <div key={l.id}
                                                                             className="border-bottom py-2 d-flex align-items-center">
                                                                            <div className="text-start"
                                                                                 style={{flex: '0 0 45%'}}>
                                                                                <span
                                                                                    className={`small fw-semibold ${!l.active ? 'text-muted text-decoration-line-through' : ''}`}>{l.title}</span>
                                                                            </div>
                                                                            <div style={{flex: '0 0 30%'}}
                                                                                 className="text-center">
                                                                                <span
                                                                                    className="badge border text-muted fw-normal"
                                                                                    style={{fontSize: '0.65rem'}}>
                                                                                    {[t('adminPage.stateNew'), t('adminPage.stateUnderReview'), t('adminPage.stateProposalSent'), t('adminPage.stateArchive'), t('adminPage.stateWon')][l.state]}
                                                                                </span>
                                                                            </div>
                                                                            <div className="text-end"
                                                                                 style={{flex: '0 0 25%'}}>
                                                                                <button
                                                                                    className="btn btn-sm btn-link text-secondary p-0 me-2 text-decoration-none"
                                                                                    onClick={() => openEditModal(l, 'lead')}>
                                                                                    {t('adminPage.actionEdit')}
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
                                                                                    {l.active ? t('adminPage.actionDeactivate') : t('adminPage.actionReactivate')}
                                                                                </button>

                                                                                <i
                                                                                    className="bi bi-trash3 text-danger ms-2"
                                                                                    style={{
                                                                                        cursor: 'pointer',
                                                                                        fontSize: '0.85rem',
                                                                                        opacity: '0.6'
                                                                                    }}
                                                                                    title="Permanent Delete"
                                                                                    onClick={() => {
                                                                                        if (window.confirm(t('adminPage.permanentlyDelete', { name: l.title }))) {
                                                                                            deleteLead(l.id, true);
                                                                                        }
                                                                                    }}
                                                                                ></i>
                                                                            </div>
                                                                        </div>
                                                                    )) : <p className="text-muted small mt-2">{t('adminPage.noLeadsFound')}</p>}
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
                    title={
                        modalConfig.type === 'invite' ? t('adminPage.inviteTitle') :
                            modalConfig.type === 'client' ? t('adminPage.editClientTitle') : t('adminPage.editLeadTitle')
                    }
                    formData={formData}
                    setFormData={setFormData}
                    fields={getModalFields()}
                />
            </div>
        </div>
    );
};

export default AdminPage;