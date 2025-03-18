import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useUserStore = create(
  persist(
    (set) => ({
      user: {
        name: '',
        email: '',
        role: '',
      },
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: { name: '', email: '', role: '' } }),
    }),
    {
      name: 'user-storage', // Nombre de la clave en localStorage
      storage: createJSONStorage(() => localStorage), // Define el almacenamiento a utilizar
    }
  )
)