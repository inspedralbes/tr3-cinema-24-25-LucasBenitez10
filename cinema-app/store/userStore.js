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
        lastName: '', // Note: using lastName to match your BookingFormGues component
        email: '',
        phone: '',
      },
      isGuestCheckout: false, // Default to false
      
      setUser: (user) => set({ user, isGuestCheckout: false }), // When setting user, we're not in guest mode
      
      clearUser: () => set({ 
        user: { name: '', email: '', role: '' },
      }),
      
      setGuestUser: (guestData) => set({ 
        guestData,
        isGuestCheckout: true // When setting guest user, set isGuestCheckout to true
      }),
      
      updateGuestData: (data) => set((state) => ({
        guestData: { ...state.guestData, ...data },
        isGuestCheckout: true
      })),
      
      clearGuestData: () => set({
        guestData: {
          name: '',
          lastName: '',
          email: '',
          phone: '',
        }
      }),
      
      setGuestCheckout: (value) => set({ isGuestCheckout: value }),
    }),
    {
      name: 'user-storage', // Nombre de la clave en localStorage
      storage: createJSONStorage(() => localStorage), // Define el almacenamiento a utilizar
    }
  )
)