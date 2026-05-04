import React, { useEffect, useState } from 'react';
import useUserStore from './stores/userStore';
import useAdminStore from './stores/adminStore';
import { CRMModal } from './components/edit-modal';
import { useTranslation } from 'react-i18next';


const AdminPage = () => {
    const { t } = useTranslation();
    const { user: currentUser } = useUserStore();
    const {
        users, fetchUsers, paginatedUsers, totalUsersCount, fetchUsersPaginated, deleteUser, reactivateUser,
        fetchUserSubData, selectedUserClients, selectedUserLeads,
        deleteClient, deleteLead, editClient, editLead,
        reactivateClient, reactivateLead, inviteUser
    } = useAdminStore();

    const [expandedUserId, setExpandedUserId] = useState(null);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [modalConfig, setModalConfig] = useState({ show: false, type: null, item: null });
    const [formData, setFormData] = useState({});
    const [leadFilter, setLeadFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    useEffect(() => {
        if (currentUser.admin) {
            fetchUsersPaginated(currentPage, itemsPerPage, userSearchTerm);
            document.body.classList.add('no-bg');
            return () => document.body.classList.remove('no-bg');
        }
    }, [currentUser, currentPage, userSearchTerm, fetchUsersPaginated]);


    const toggleUserExpansion = (userId) => {
        if (expandedUserId === userId) {
            setExpandedUserId(null);
        } else {
            setLeadFilter('all');
            setExpandedUserId(userId);
            fetchUserSubData(userId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
                { name: 'email', label: t('adminPage.emailAddress'), type: 'email' }
            ];
        } else if (modalConfig.type === 'client') {
            return [
                { name: 'name', label: t('adminPage.clientName'), type: 'text' },
                { name: 'company', label: t('adminPage.clientCompany'), type: 'text' },
                { name: 'email', label: t('adminPage.email'), type: 'email' }
            ];
        } else if (modalConfig.type === 'lead') {
            return [
                { name: 'title', label: t('adminPage.leadTitle'), type: 'text' },
                { name: 'description', label: t('adminPage.leadDescription'), type: 'textarea' },
                {
                    name: 'state',
                    label: t('adminPage.leadState'),
                    type: 'select',
                    options: [
                        { value: 0, label: t('adminPage.stateNew') },
                        { value: 1, label: t('adminPage.stateUnderReview') },
                        { value: 2, label: t('adminPage.stateProposalSent') },
                        { value: 3, label: t('adminPage.stateArchive') },
                        { value: 4, label: t('adminPage.stateWon') }
                    ]
                }
            ];
        }
        return [];
    };


    // The sortedUsers logic is no longer needed since it's paginated/sorted in backend
    // But we assign sortedUsers to paginatedUsers so we don't break the rendering below
    const sortedUsers = paginatedUsers || [];

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
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
                    <h2 className="page-header-themed mb-3 mb-md-0">{t('adminPage.title')}</h2>
                    
                    {!expandedUserId && (
                        <div className="flex-grow-1 mx-md-4 w-100 mb-3 mb-md-0" style={{ maxWidth: '400px' }}>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 border-secondary-subtle rounded-start-pill ps-3">
                                    <i className="bi bi-search text-muted"></i>
                                </span>
                                <input 
                                    type="text" 
                                    className="form-control border-start-0 border-secondary-subtle rounded-end-pill" 
                                    placeholder={t('adminPage.searchPlaceholder', 'Search users...')}
                                    value={userSearchTerm}
                                    onChange={(e) => {
                                        setUserSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    style={{ boxShadow: 'none' }}
                                />
                            </div>
                        </div>
                    )}

                    <button
                        className="modern-btn-primary"
                        onClick={() => {
                            setFormData({ email: '' });
                            setModalConfig({ show: true, type: 'invite', item: null });
                        }}
                    >
                        {t('adminPage.inviteUser')}
                    </button>
                </div>


                {!expandedUserId ? (
                    <>
                        <div className="row g-4 mt-2">
                            {sortedUsers.map(u => {
                                const isPending = !u.active && !u.phone;
                                const isInactive = !u.active && !!u.phone;
                                return (
                                    <div key={u.id} className="col-12 col-md-6 col-lg-4 col-xl-3">
                                        <div
                                            className="glass-card h-100 d-flex flex-column text-center p-4"
                                            style={{ cursor: isPending ? 'default' : 'pointer', transition: 'all 0.2s', border: '1px solid #e2e8f0', opacity: u.active ? 1 : (isPending ? 0.85 : 0.65) }}
                                            onClick={() => { if (!isPending) toggleUserExpansion(u.id); }}
                                            onMouseEnter={(e) => { 
                                                if (!isPending) {
                                                    e.currentTarget.style.transform = 'translateY(-5px)'; 
                                                    e.currentTarget.style.opacity = '1'; 
                                                }
                                            }}
                                            onMouseLeave={(e) => { 
                                                if (!isPending) {
                                                    e.currentTarget.style.transform = 'translateY(0)'; 
                                                    e.currentTarget.style.opacity = u.active ? '1' : '0.65'; 
                                                }
                                            }}
                                        >
                                            <div className="mb-3 position-relative d-inline-block mx-auto">
                                                <img
                                                    src={u.photoUrl || '/default-user.png'}
                                                    alt=""
                                                    className="rounded-circle border border-2 border-white shadow-sm"
                                                    style={{ width: '80px', height: '80px', objectFit: 'cover', filter: u.active ? 'none' : (isPending ? 'grayscale(50%)' : 'grayscale(100%)') }}
                                                />
                                            </div>

                                            <h5 className={`fw-bold mb-1 text-truncate ${isInactive ? 'text-muted text-decoration-line-through' : ''}`} style={{ color: u.active || isPending ? '#16264A' : '' }}>
                                                {u.firstName} {u.lastName}
                                            </h5>
                                            <p className="text-muted small mb-2 text-truncate">@{u.username}</p>

                                            <div className="mb-3 d-flex justify-content-center align-items-center">
                                                <span className="badge px-3 py-2 me-1" style={{ backgroundColor: u.admin ? '#2D5A88' : '#e2e8f0', color: u.admin ? 'white' : '#475569' }}>
                                                    {u.admin ? t('adminPage.roleAdmin') : t('adminPage.roleStandard')}
                                                </span>
                                                {isInactive && (
                                                    <span className="badge px-3 py-2 ms-1" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                                                        {t('adminPage.statusInactive')}
                                                    </span>
                                                )}
                                            </div>

                                            {!isPending ? (
                                                <div className="mt-auto pt-3 border-top">
                                                    <button
                                                        className={`btn btn-sm w-100 fw-semibold ${u.active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (u.active) {
                                                                if (window.confirm(t('adminPage.confirmDeactivateUser', { name: u.firstName }))) deleteUser(u.id, false);
                                                            } else {
                                                                reactivateUser(u.id);
                                                            }
                                                        }}
                                                    >
                                                        {u.active ? t('adminPage.actionDeactivate') : t('adminPage.actionReactivate')}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="mt-auto pt-3 border-top">
                                                    <button
                                                        className="btn btn-sm w-100 fw-semibold btn-outline-secondary disabled"
                                                        disabled
                                                        onClick={(e) => e.stopPropagation()}
                                                        style={{ opacity: 0.6 }}
                                                    >
                                                        {t('adminPage.awaitingConfirmation')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination Controls */}
                        {Math.ceil(totalUsersCount / itemsPerPage) > 1 && (
                            <div className="d-flex justify-content-center mt-4">
                                <nav>
                                    <ul className="pagination modern-pagination mb-0">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>&laquo;</button>
                                        </li>
                                        {[...Array(Math.ceil(totalUsersCount / itemsPerPage))].map((_, i) => (
                                            <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                                <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${currentPage === Math.ceil(totalUsersCount / itemsPerPage) ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalUsersCount / itemsPerPage), p + 1))}>&raquo;</button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="expanded-row-content">
                        <button className="btn btn-sm btn-outline-secondary mb-3" onClick={() => {
                            setExpandedUserId(null);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}>
                            <i className="bi bi-arrow-left me-1"></i> Back to Users
                        </button>

                        {(() => {
                            const u = users.find(user => user.id === expandedUserId);
                            if (!u) return null;
                            return (
                                <div>
                                    <div className="glass-card mb-4 border-0 overflow-hidden d-inline-block pe-md-5">
                                        <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start p-4" style={{ background: 'linear-gradient(to right, rgba(45, 90, 136, 0.05), rgba(255, 255, 255, 0.5))' }}>

                                            {/* Avatar & Identity Columns */}
                                            {(() => {
                                                const isPending = !u.active && !u.phone;
                                                const isInactive = !u.active && !!u.phone;
                                                return (
                                                    <>
                                                        <div className="position-relative me-md-5 mb-3 mb-md-0 flex-shrink-0">
                                                            <img
                                                                src={u.photoUrl || '/default-user.png'}
                                                                alt="User Profile"
                                                                className="rounded-circle border border-3 border-white shadow-sm"
                                                                style={{ width: '110px', height: '110px', objectFit: 'cover', filter: u.active ? 'none' : (isPending ? 'grayscale(50%)' : 'grayscale(100%)') }}
                                                            />
                                                        </div>

                                                        <div className="text-center text-md-start me-md-5 mb-3 mb-md-0 mt-md-2">
                                                            <h3 className={`fw-bold mb-1 ${isInactive ? 'text-muted text-decoration-line-through' : ''}`} style={{ color: u.active || isPending ? '#16264A' : '' }}>
                                                                {u.firstName || t('adminPage.pendingUser')} {u.lastName}
                                                            </h3>
                                                            <p className="text-muted mb-2">@{u.username}</p>
                                                            <div className="d-flex align-items-center justify-content-center justify-content-md-start mt-2">
                                                                <span className="badge px-3 py-2 me-1" style={{ backgroundColor: u.admin ? '#2D5A88' : '#e2e8f0', color: u.admin ? 'white' : '#475569' }}>
                                                                    {u.admin ? t('adminPage.roleAdmin') : t('adminPage.roleStandard')}
                                                                </span>
                                                                {isInactive && (
                                                                    <span className="badge px-3 py-2 ms-1" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                                                                        {t('adminPage.statusInactive')}
                                                                    </span>
                                                                )}
                                                                {isPending && (
                                                                    <span className="badge px-3 py-2 ms-1" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                                                                        {t('adminPage.statusPending')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })()}

                                            {/* Contact Column */}
                                            <div className="d-flex flex-column align-items-center align-items-md-start text-muted small mt-md-3 pt-md-1">
                                                <div className="d-flex align-items-center mb-2">
                                                    <i className="bi bi-envelope-fill me-2 text-secondary"></i>
                                                    <span className="fw-medium">{u.email}</span>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <i className="bi bi-telephone-fill me-2 text-secondary"></i>
                                                    <span className="fw-medium">{u.phone || 'N/A'}</span>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="row g-4">
                                        {/* clients */}
                                        <div className="col-md-6">
                                            <div className="glass-card h-100 border-0">
                                                <div
                                                    className="bg-transparent fw-bold border-bottom-0 pt-4 px-4 pb-2"
                                                    style={{ color: '#2D5A88' }}>{t('adminPage.usersClients')}
                                                </div>
                                                <div className="px-4 pb-4 pt-0">
                                                    {sortedSelectedClients.length > 0 ? sortedSelectedClients.map(c => (
                                                        <div key={c.id}
                                                            className="border-bottom py-3 d-flex justify-content-between align-items-center">
                                                            <div className="d-flex flex-column" style={{ flex: '1', minWidth: 0 }}>
                                                                <span className={`fw-semibold text-truncate ${!c.active ? 'text-muted text-decoration-line-through' : ''}`} title={c.name}>
                                                                    {c.name}
                                                                </span>
                                                                <div className="d-flex align-items-center mt-1 text-muted text-truncate" style={{ fontSize: '0.75rem' }}>
                                                                    {c.company && (
                                                                        <span className="me-3 text-truncate" title={c.company}>
                                                                            <i className="bi bi-building me-1"></i>{c.company}
                                                                        </span>
                                                                    )}
                                                                    {c.email && (
                                                                        <span className="text-truncate" title={c.email}>
                                                                            <i className="bi bi-envelope me-1"></i>{c.email}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="d-flex align-items-center gap-2">
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
                                                                    style={{ cursor: 'pointer', fontSize: '0.85rem', opacity: '0.5' }}
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
                                        <div className="col-md-6">
                                            <div className="glass-card h-100 border-0">
                                                <div
                                                    className="bg-transparent d-flex justify-content-between align-items-center border-bottom-0 pt-4 px-4 pb-2">
                                                    <span className="fw-bold" style={{ color: '#2D5A88' }}>{t('adminPage.usersLeads')}</span>
                                                    {selectedUserLeads.length > 0 && (
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
                                                    )}
                                                </div>
                                                <div className="px-4 pb-4 pt-0">
                                                    {filteredAndSortedLeads.length > 0 ? filteredAndSortedLeads.map(l => (
                                                        <div key={l.id} className="border-bottom py-3 d-flex align-items-center">
                                                            <div className="text-start d-flex flex-column pe-2" style={{ flex: '0 0 45%', minWidth: 0 }}>
                                                                <span className={`fw-semibold text-truncate ${!l.active ? 'text-muted text-decoration-line-through' : ''}`} title={l.title}>{l.title}</span>
                                                                <span className="text-muted text-truncate mt-1" style={{ fontSize: '0.75rem' }} title={l.description}>
                                                                    {l.description ? l.description : <i className="opacity-50">No description</i>}
                                                                </span>
                                                            </div>
                                                            <div style={{ flex: '0 0 30%' }} className="text-center">
                                                                <span className="badge border text-muted fw-normal" style={{ fontSize: '0.65rem' }}>
                                                                    {[t('adminPage.stateNew'), t('adminPage.stateUnderReview'), t('adminPage.stateProposalSent'), t('adminPage.stateArchive'), t('adminPage.stateWon')][l.state]}
                                                                </span>
                                                            </div>
                                                            <div className="text-end" style={{ flex: '0 0 25%' }}>
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
                                                                    style={{ cursor: 'pointer', fontSize: '0.85rem', opacity: '0.6' }}
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
                            );
                        })()}
                    </div>
                )}
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