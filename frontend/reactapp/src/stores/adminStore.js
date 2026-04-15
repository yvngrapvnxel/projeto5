import { create } from 'zustand';
import { API_URL, handleAuthError } from '../config';


const admin_URL = `${API_URL}/admin`;


const useAdminStore = create((set, get) => ({

    users: [],
    selectedUserClients: [],
    selectedUserLeads: [],
    loading: false,


    // --- USERS
    fetchUsers: async () => {
        set({ loading: true });
        const response = await fetch(`${admin_URL}/users/all`, {
            headers: { 'token': localStorage.getItem('token') }
        });

        if (response.ok) {
            const data = await response.json();
            set({ users: data });
        }
        else {
            await handleAuthError(response);
        }
        set({ loading: false });
    },

    deleteUser: async (userId, permanent = false) => {
        const response = await fetch(`${admin_URL}/users/${userId}/delete?permanent=${permanent}`, {
            method: 'DELETE',
            headers: { 'token': localStorage.getItem('token') }
        });
        if (response.ok) {
            if (permanent) {
                set((state) => ({ users: state.users.filter(u => u.id !== userId) }));
            } else {
                set((state) => ({
                    users: state.users.map(u => u.id === userId ? { ...u, active: false } : u)
                }));
            }
        }
        else {
            await handleAuthError(response);
        }
    },

    reactivateUser: async (userId) => {
        const response = await fetch(`${admin_URL}/users/${userId}/reactivate`, {
            method: 'PATCH',
            headers: { 'token': localStorage.getItem('token') }
        });
        if (response.ok) {
            set((state) => ({
                users: state.users.map(u => u.id === userId ? { ...u, active: true } : u)
            }));
        }
        else {
            await handleAuthError(response);
        }
    },



    // --- CLIENTS E LEADS
    fetchUserSubData: async (userId) => {
        const token = localStorage.getItem('token');
        const [clientsRes, leadsRes] = await Promise.all([
            fetch(`${admin_URL}/users/${userId}/clients/all`, { headers: { token } }),
            fetch(`${admin_URL}/users/${userId}/leads/all`, { headers: { token } })
        ]);

        if (!clientsRes.ok) {
            await handleAuthError(clientsRes);
            return;
        }
        if (!leadsRes.ok) {
            await handleAuthError(leadsRes);
            return;
        }

        const clients = clientsRes.ok ? await clientsRes.json() : [];
        const leads = leadsRes.ok ? await leadsRes.json() : [];

        set({ selectedUserClients: clients, selectedUserLeads: leads });
    },

    editClient: async (clientId, newData) => {
        const response = await fetch(`${admin_URL}/users/clients/${clientId}/edit`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            },
            body: JSON.stringify(newData)
        });
        if (response.ok) {
            const updatedClient = await response.json();
            set((state) => ({
                selectedUserClients: state.selectedUserClients.map(c =>
                    c.id === clientId ? updatedClient : c
                )
            }));
            return true;
        }
        else {
            await handleAuthError(response);
        }
        return false;
    },

    editLead: async (leadId, newData) => {
        const response = await fetch(`${admin_URL}/leads/${leadId}/edit`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            },
            body: JSON.stringify(newData)
        });
        if (response.ok) {
            const updatedLead = await response.json();
            set((state) => ({
                selectedUserLeads: state.selectedUserLeads.map(l =>
                    l.id === leadId ? updatedLead : l
                )
            }));
            return true;
        }
        else {
            await handleAuthError(response);
        }
        return false;
    },

    reactivateClient: async (clientId) => {
        const response = await fetch(`${admin_URL}/users/clients/${clientId}/reactivate`, {
            method: 'PATCH',
            headers: { 'token': localStorage.getItem('token') }
        });
        if (response.ok) {
            set((state) => ({
                selectedUserClients: state.selectedUserClients.map(c =>
                    c.id === clientId ? { ...c, active: true } : c
                )
            }));
            return true;
        }
        else {
            await handleAuthError(response);
        }
        return false;
    },

    reactivateLead: async (leadId) => {
        const response = await fetch(`${admin_URL}/leads/${leadId}/reactivate`, {
            method: 'PATCH',
            headers: { 'token': localStorage.getItem('token') }
        });
        if (response.ok) {
            set((state) => ({
                selectedUserLeads: state.selectedUserLeads.map(l =>
                    l.id === leadId ? { ...l, active: true } : l
                )
            }));
            return true;
        }
        else {
            await handleAuthError(response);
        }
        return false;
    },

    deleteClient: async (clientId, permanent = false) => {
        const url = permanent ? `${admin_URL}/clients/${clientId}/delete?permanent=true` : `${admin_URL}/clients/${clientId}/delete`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: { 'token': localStorage.getItem('token') }
        });
        if (response.ok) {
            set((state) => ({
                selectedUserClients: permanent
                    ? state.selectedUserClients.filter(c => c.id !== clientId)
                    : state.selectedUserClients.map(c => c.id === clientId ? { ...c, active: false } : c)
            }));
        }
        else {
            await handleAuthError(response);
        }
    },

    deleteLead: async (leadId, permanent = false) => {
        const response = await fetch(`${admin_URL}/leads/${leadId}/delete?permanent=${permanent}`, {
            method: 'DELETE',
            headers: { 'token': localStorage.getItem('token') }
        });
        if (response.ok) {
            set((state) => ({
                selectedUserLeads: permanent
                    ? state.selectedUserLeads.filter(l => l.id !== leadId)
                    : state.selectedUserLeads.map(l => l.id === leadId ? { ...l, active: false } : l)
            }));
        }
        else {
            await handleAuthError(response);
        }
    }
}));

export default useAdminStore;