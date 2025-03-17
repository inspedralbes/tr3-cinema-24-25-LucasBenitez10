import { create } from 'zustand'

export const useUserStore = create((set, get) => ({
    user: {
        name: '',
        email: '',
        role: '',
    },
    setUser: (user) => set({ user }),
    getUser: () => get().user,
    clearUser: () => set({ user: { name: '', email: '', role: '' } }), 
}))