import { create } from 'zustand';

const useNotificationStore = create((set) => ({
    notifications: [],

    // ADD THIS NEW METHOD:
    setNotifications: (offlineNotifs) => set({
        // We assume the backend will send them sorted, so we just replace the array
        notifications: offlineNotifs
    }),

    addNotification: (message) => set((state) => ({
        notifications: [
            { id: Date.now(), message: message, read: false },
            ...state.notifications
        ]
    })),

    markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
    })),

    clearNotifications: () => set({ notifications: [] })
}));

export default useNotificationStore;