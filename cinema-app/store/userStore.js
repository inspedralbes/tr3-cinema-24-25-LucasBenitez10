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
      guestData: {
        name: '',
        email: '',
        phone: '',
      },
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: { name: '', email: '', role: '' } }),
      setGuestUser: (guestData) => set({guestData}),
      updateGuestData: (data) => set((state) => ({
        guestData: { ...state.guestData, ...data }
      })),
      clearGuestData: () => set({
        guestData: {
          name: '',
          email: '',
          phone: '',
        }
      }),
      isGuestCheckout: true,
      setGuestCheckout: (value) => set({ isGuestCheckout: value }),
    })
    ,

    {
      name: 'user-storage', // Nombre de la clave en localStorage
      storage: createJSONStorage(() => localStorage), // Define el almacenamiento a utilizar
    }
  )
)