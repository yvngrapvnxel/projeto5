import { create } from 'zustand';
import { API_URL, handleAuthError } from '../config';


const useLeadStore = create((set, get) => ({

    leads: [],
    loading: false,
    leadURL: `${API_URL}/leads`,

    fetchLeads: async (force = false) => {
        if (get().leads.length > 0 && !force) return;

        set({ loading: true });
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${get().leadURL}/all`, {
                method: 'GET',
                headers: { 'token': token }
            });
            if (response.ok) {
                const data = await response.json();
                set({ leads: data });
            }
            else {
                await handleAuthError(response);
            }
        } finally {
            set({ loading: false });
        }
    },

    addLead: async (leadData) => {
        const response = await fetch(`${get().leadURL}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            },
            body: JSON.stringify(leadData)
        });
        if (response.ok) {
            const newLead = await response.json();
            set((state) => ({ leads: [...state.leads, newLead] }));
        }
        else {
            await handleAuthError(response);
        }
    },

    updateLead: async (id, leadData) => {
        const response = await fetch(`${get().leadURL}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'token': localStorage.getItem('token')
            },
            body: JSON.stringify(leadData)
        });
        if (response.ok) {
            const updatedLead = await response.json();
            set((state) => ({
                leads: state.leads.map((l) => (l.id === id ? updatedLead : l))
            }));
        }
        else {
            await handleAuthError(response);
        }
    },

    deleteLead: async (id) => {
        const response = await fetch(`${get().leadURL}/${id}`, {
            method: 'DELETE',
            headers: { 'token': localStorage.getItem('token') }
        });
        if (response.ok) {
            set((state) => ({
                leads: state.leads.map((l) =>
                    l.id === id ? { ...l, active: false } : l
                )
            }));
        }
        else {
            await handleAuthError(response);
        }
    }
}));

export default useLeadStore;