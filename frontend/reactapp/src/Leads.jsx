import React, { useState, useEffect } from 'react';
import useLeadStore from './stores/leadStore';
import useUserStore from './stores/userStore';
import useAdminStore from './stores/adminStore';
import { CRMRow } from './components/tables';
import { CRMModal } from './components/edit-modal';


const LeadsPage = () => {


    const { leads, loading, fetchLeads, addLead, updateLead, deleteLead } = useLeadStore();
    const { reactivateLead } = useAdminStore();
    const user = useUserStore((state) => state.user);


    const leadFields = [
        { name: 'title', label: 'Lead Title', type: 'text', col: 'col-12' },
        { name: 'description', label: 'Description', type: 'textarea', col: 'col-12' },
        {
            name: 'state',
            label: 'Pipeline State',
            type: 'select',
            options: [
                { value: 0, label: 'New' },
                { value: 1, label: 'Under Review' },
                { value: 2, label: 'Proposal Sent' },
                { value: 3, label: 'Archive' },
                { value: 4, label: 'Won' }
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
        if (window.confirm("Deactivate this lead?")) {
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

                    <h2 className="fw-bold">Leads Pipeline</h2>

                    <div className="d-flex gap-3">

                        <select
                            className="form-select w-auto"
                            value={filterState}
                            onChange={(e) => setFilterState(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="0">New</option>
                            <option value="1">Under Review</option>
                            <option value="2">Proposal Sent</option>
                            <option value="3">Archive</option>
                            <option value="4">Won</option>
                        </select>

                        <button className="btn btn-primary" style={{ backgroundColor: '#2D5A88' }} onClick={() => setShowModal(true)}>
                            + Add New Lead
                        </button>

                    </div>

                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-2">Loading Leads...</p>
                    </div>
                ) : (
                    <div className="card shadow-sm border-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Title</th>
                                        <th>Description</th>
                                        <th>State</th>
                                        <th>Creation Date</th>
                                        <th>Status</th>
                                        <th className="text-end">Actions</th>
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
                title={isEditing ? "Edit Lead" : "Add New Lead"}
                formData={leadData}
                setFormData={setLeadData}
                fields={leadFields}
            />

        </div>
    );
};

export default LeadsPage;