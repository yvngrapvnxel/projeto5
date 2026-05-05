import { create } from 'zustand';

const useNotificationStore = create((set) => ({
    notifications: [],

    // Hydrates the store with unread notifications fetched from the REST API on login
    setNotifications: (offlineNotifs) => set({
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