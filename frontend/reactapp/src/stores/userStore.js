import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set) => ({
      user: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        username: '',
        photoUrl: '',
        admin: 'false',
      },
      isAuthenticated: false,

      setUser: (userData) => set({ 
        user: userData, 
        isAuthenticated: true 
      }),

      logout: () => {
        localStorage.removeItem('token');
        set({ 
          user: { firstName: '', lastName: '', email: '', phone: '', username: '', photoUrl: '' }, 
          isAuthenticated: false 
        });
      },
    }),
    {
      name: 'dunder-mifflin-user',
    }
  )
);

export default useUserStore;