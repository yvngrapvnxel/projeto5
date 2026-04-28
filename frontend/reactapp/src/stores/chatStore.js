import { create } from 'zustand';

const useChatStore = create((set) => ({
    messages: [],

    addMessage: (msg) => set((state) => ({
        messages: [...state.messages, msg]
    })),

    setMessages: (history) => set({ messages: history }),

    clearMessages: () => set({ messages: [] }),

    // When the OTHER person reads YOUR messages (updates your checkmarks)
    markMessagesAsReadByReceiver: (readerId) => set((state) => ({
        messages: state.messages.map(msg =>
            msg.receiver == readerId ? { ...msg, isRead: true } : msg
        )
    })),

    // When YOU read the OTHER person's messages while the chat is open
    markMessagesAsReadByMe: (senderId) => set((state) => ({
        messages: state.messages.map(msg =>
            msg.sender == senderId ? { ...msg, isRead: true } : msg
        )
    }))
}));

export default useChatStore;