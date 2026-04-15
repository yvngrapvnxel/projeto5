import { create } from 'zustand';
import { API_URL, handleAuthError } from '../config';


const useClientStore = create((set, get) => ({

    clients: [],
    loading: false,
    clientURL: `${API_URL}/clients`,
    

    fetchClients: async (force = false) => {
        if (get().clients.length > 0 && !force) return;

        set({ loading: true });
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${get().clientURL}/all`, {
                method: 'GET',
                headers: { 'token': token }
            });
            if (response.ok) {
                const data = await response.json();
                set({ clients: data });
            }
            else {
                await handleAuthError(response);
            }
        } finally {
            set({ loading: false });
        }
    },

    saveClient: async (clientData, id = null) => {
        const isEditing = !!id;
        const url = isEditing ? `${get().clientURL}/${id}` : `${get().clientURL}/add`;
        const method = isEditing ? 'PATCH' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            },
            body: JSON.stringify(clientData)
        });

        if (response.ok) {
            const updatedClient = await response.json();
            set((state) => ({
                clients: isEditing
                    ? state.clients.map(c => c.id === id ? updatedClient : c)
                    : [...state.clients, updatedClient]
            }));
            return true;
        }
        else {
            await handleAuthError(response);
        }
        return false;
    },

    deleteClient: async (id) => {
        const response = await fetch(`${get().clientURL}/${id}`, {
            method: 'DELETE',
            headers: { 'token': localStorage.getItem('token') }
        });
        if (response.ok) {
            set((state) => ({
                clients: state.clients.map((c) =>
                    c.id === id ? { ...c, active: false } : c
                )
            }));
        }
        else {
            await handleAuthError(response);
        }
    }
    
}));



export default useClientStore;