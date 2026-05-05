import { create } from 'zustand';

const useChatStore = create((set) => ({
    messages: [],

    addMessage: (msg) => set((state) => ({
        messages: [...state.messages, msg]
    })),

    setMessages: (history) => set({ messages: history }),

    clearMessages: () => set({ messages: [] }),

    // Updates checkmarks on YOUR messages when the other person reads them
    markMessagesAsReadByReceiver: (readerId) => set((state) => ({
        messages: state.messages.map(msg =>
            msg.receiver == readerId ? { ...msg, isRead: true } : msg
        )
    })),

    // Updates read status on THEIR messages while you have the chat window open
    markMessagesAsReadByMe: (senderId) => set((state) => ({
        messages: state.messages.map(msg =>
            msg.sender == senderId ? { ...msg, isRead: true } : msg
        )
    }))
}));

export default useChatStore;