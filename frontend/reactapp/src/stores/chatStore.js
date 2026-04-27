import { create } from 'zustand';

const useChatStore = create((set) => ({
    messages: [],

    // add new message to chat history
    addMessage: (msg) => set((state) => ({
        messages: [...state.messages, msg]
    })),

    // load full history from DB
    setMessages: (history) => set({ messages: history }),

    // clear chat
    clearMessages: () => set({ messages: [] })
}));

export default useChatStore;