import React, { useState, useEffect } from 'react';
import useUserStore from './stores/userStore';
import useClientStore from './stores/clientStore';
import { CRMRow } from './components/tables';
import { CRMModal } from './components/edit-modal';
import useAdminStore from './stores/adminStore';


const ClientsPage = () => {

    const { clients, loading, fetchClients, saveClient, deleteClient } = useClientStore();
    const { reactivateClient } = useAdminStore();
    const user = useUserStore((state) => state.user);

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingClientID, setEditingClientID] = useState(null);
    const [clientData, setClientData] = useState({ name: '', company: '', email: '', phone: '', active: true });

    const clientFields = [
        { name: 'name', label: 'Full Name', type: 'text', col: 'col-md-6' },
        { name: 'company', label: 'Company', type: 'text', col: 'col-md-6' },
        { name: 'email', label: 'Email Address', type: 'email', col: 'col-md-6' },
        { name: 'phone', label: 'Phone Number', type: 'text', col: 'col-md-6' }
    ];


    const sortedClients = [...clients].sort((a, b) => {
        if (a.active !== b.active) return a.active ? -1 : 1;
        return (a.name || "").toLowerCase().localeCompare((b.name || "").toLowerCase());
    });


    useEffect(() => {
        fetchClients();
        document.body.classList.add('no-bg');
        return () => document.body.classList.remove('no-bg');
    }, [fetchClients]);


    const handleSave = async (e) => {
        e.preventDefault();
        const success = await saveClient(clientData, isEditing ? editingClientID : null);
        if (success) {
            fetchClients(true);
            closeModal();
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Deactivate this client?")) {
            await deleteClient(id);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setClientData({ name: '', company: '', email: '', phone: '', active: true });
    };

    return (
        <div className="dashboard-container">
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold">Client Directory</h2>
                    <button className="btn btn-primary" style={{ backgroundColor: '#2D5A88' }} onClick={() => { setIsEditing(false); setShowModal(true); }}>
                        + Add New Client
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-2">Loading Clients...</p>
                    </div>
                ) : (
                    <div className="card shadow-sm border-0">
                        <div className="table-responsive">
                            {loading ? (
                                <div className="spinner-border text-primary"></div>
                            ) : (
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Name</th>
                                            <th>Company</th>
                                            <th>Email</th>
                                            <th>Status</th>
                                            <th className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedClients.map((client) =>
                                            <CRMRow
                                                key={client.id}
                                                object={client}
                                                type="client"
                                                isAdmin={user?.admin}
                                                onEdit={(c) => {
                                                    setClientData(c);
                                                    setEditingClientID(c.id);
                                                    setIsEditing(true);
                                                    setShowModal(true);
                                                }}
                                                onDelete={handleDelete}
                                                onReactivate={async (id) => {
                                                    const success = await reactivateClient(id);
                                                    if (success) {
                                                        fetchClients(true);
                                                    }
                                                }}
                                            />
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <CRMModal
                show={showModal}
                onClose={closeModal}
                onSubmit={handleSave}
                title={isEditing ? "Edit Client" : "Add New Client"}
                formData={clientData}
                setFormData={setClientData}
                fields={clientFields}
            />

        </div>
    );
};

export default ClientsPage;