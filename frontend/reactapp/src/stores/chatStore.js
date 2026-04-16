import { create } from 'zustand';

const useChatStore = create((set) => ({
    messages: [],

    // Add a new message to the chat history
    addMessage: (msg) => set((state) => ({
        messages: [...state.messages, msg]
    })),

    // Clear chat (useful when switching users)
    clearMessages: () => set({ messages: [] })
}));

export default useChatStore;