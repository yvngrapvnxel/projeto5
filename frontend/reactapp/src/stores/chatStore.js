import { create } from 'zustand';

const useChatStore = create((set) => ({
    messages: [],

    addMessage: (msg) => set((state) => ({
        messages: [...state.messages, msg]
    })),

    setMessages: (history) => set({ messages: history }),

    clearMessages: () => set({ messages: [] }),

    // NEW: Function to mark messages as read in the UI
    markMessagesAsReadByReceiver: (readerId) => set((state) => ({
        messages: state.messages.map(msg =>
            msg.receiver === readerId ? { ...msg, isRead: true } : msg
        )
    }))
}));

export default useChatStore;