import React, { useState, useEffect } from 'react';
import useLeadStore from './stores/leadStore';
import useUserStore from './stores/userStore';
import useAdminStore from './stores/adminStore';
import { CRMRow } from './components/tables';
import { CRMModal } from './components/edit-modal';
import { useTranslation } from 'react-i18next';


const LeadsPage = () => {


    const { leads, loading, fetchLeads, addLead, updateLead, deleteLead } = useLeadStore();
    const { reactivateLead } = useAdminStore();
    const user = useUserStore((state) => state.user);
    const { t } = useTranslation();


    const leadFields = [
        { name: 'title', label: t('leadsPage.leadTitle'), type: 'text', col: 'col-12' },
        { name: 'description', label: t('leadsPage.tableDescription'), type: 'textarea', col: 'col-12' },
        {
            name: 'state',
            label: t('leadsPage.pipelineState'),
            type: 'select',
            options: [
                { value: 0, label: t('leadsPage.new') },
                { value: 1, label: t('leadsPage.underReview') },
                { value: 2, label: t('leadsPage.proposalSent') },
                { value: 3, label: t('leadsPage.archive') },
                { value: 4, label: t('leadsPage.won') }
            ],
            col: 'col-12'
        },
    ];

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingID, setEditingID] = useState(null);
    const [leadData, setLeadData] = useState({ title: '', description: '', creationDate: '', state: 0, active: true });
    const [filterState, setFilterState] = useState('all');

    const filteredAndSortedLeads = leads
        .filter((lead) => {
            if (filterState === 'all') return true;
            return lead.state === parseInt(filterState);
        })
        .sort((a, b) => {
            if (a.active !== b.active) return a.active ? -1 : 1;
            if (a.state !== b.state) return a.state - b.state;
            return (a.title || "").toLowerCase().localeCompare((b.title || "").toLowerCase());
        });


    useEffect(() => {
        fetchLeads();
        document.body.classList.add('no-bg');
        return () => document.body.classList.remove('no-bg');
    }, [fetchLeads]);


    const handleSave = async (e) => {
        e.preventDefault();
        if (isEditing) {
            await updateLead(editingID, leadData);
        } else {
            const { creationDate, ...newPayload } = leadData;
            await addLead(newPayload);
        }
        closeModal();
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('leadsPage.confirmDeactivate'))) {
            await deleteLead(id);
        }
    };


    const closeModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setLeadData({ title: '', description: '', creationDate: new Date().toISOString(), state: 0, active: true });
    };

    return (
        <div className="dashboard-container">
            <div className="container py-4">
                <div className="d-flex justify-content-between mb-4">

                    <h2 className="page-header-themed mb-0">{t('leadsPage.title')}</h2>

                    <div className="d-flex gap-3">

                        <select
                            className="form-select w-auto"
                            value={filterState}
                            onChange={(e) => setFilterState(e.target.value)}
                        >
                            <option value="all">{t('leadsPage.all')}</option>
                            <option value="0">{t('leadsPage.new')}</option>
                            <option value="1">{t('leadsPage.underReview')}</option>
                            <option value="2">{t('leadsPage.proposalSent')}</option>
                            <option value="3">{t('leadsPage.archive')}</option>
                            <option value="4">{t('leadsPage.won')}</option>
                        </select>

                        <button className="modern-btn-primary" onClick={() => setShowModal(true)}>
                            {t('leadsPage.addNew')}
                        </button>

                    </div>

                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-2">{t('leadsPage.loading')}</p>
                    </div>
                ) : (
                    <div className="glass-card mt-2">
                        <div className="table-responsive border-0">
                            <table className="modern-table mb-0">
                                <thead>
                                    <tr>
                                        <th>{t('leadsPage.tableTitle')}</th>
                                        <th>{t('leadsPage.tableDescription')}</th>
                                        <th>{t('leadsPage.tableState')}</th>
                                        <th>{t('leadsPage.tableCreationDate')}</th>
                                        <th>{t('leadsPage.tableStatus')}</th>
                                        <th className="text-end">{t('leadsPage.tableActions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAndSortedLeads.map((l) =>
                                        <CRMRow
                                            key={l.id}
                                            object={l}
                                            type="lead"
                                            isAdmin={user?.admin}
                                            onEdit={(item) => {
                                                setLeadData(item);
                                                setEditingID(item.id);
                                                setIsEditing(true);
                                                setShowModal(true);
                                            }}
                                            onDelete={handleDelete}
                                            onReactivate={async (id) => {
                                                    const success = await reactivateLead(id);
                                                    if (success) {
                                                        fetchLeads(true);
                                                    }
                                                }}
                                        />
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <CRMModal
                show={showModal}
                onClose={closeModal}
                onSubmit={handleSave}
                title={isEditing ? t('leadsPage.editLead') : t('leadsPage.addLead')}
                formData={leadData}
                setFormData={setLeadData}
                fields={leadFields}
            />

        </div>
    );
};

export default LeadsPage;