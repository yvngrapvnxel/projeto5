import { create } from 'zustand';

const useNotificationStore = create((set) => ({
    notifications: [],

    addNotification: (message) => set((state) => ({
        notifications: [
            { id: Date.now(), message: message, read: false },
            ...state.notifications
        ] // novas primeiro
    })),

    markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
    })),

    clearNotifications: () => set({ notifications: [] })
}));

export default useNotificationStore;