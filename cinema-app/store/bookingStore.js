// bookingStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const RESERVATION_TIMEOUT = 5 * 60 * 1000;

export const useBookingStore = create(
  persist(
    (set, get) => ({
      // Estado de asientos
      selectedSeats: [],
      
      // Precio total
      totalPrice: 0,
      
      // Tiempo de inicio de la reserva
      reservationStartTime: null,
      
      // Paso actual del proceso de compra
      bookingStep: 'seat-selection',
      
      // NUEVA FUNCIÓN: Obtener cantidad de asientos seleccionados
      getSelectedSeatsCount: () => {
        return get().selectedSeats.length;
      },

      // NUEVA FUNCIÓN: Obtener los tipos de asientos y sus cantidades
      getSelectedSeatsByType: () => {
        const { selectedSeats } = get();
        
        // Inicializar contador para cada tipo de asiento
        const countByType = {
          normal: 0,
          menor: 0,
          joven: 0,
          mayor: 0,
          familia: 0
        };
        
        // Si los asientos tienen una propiedad 'type', usar esa información
        // De lo contrario, considerar todos como 'normal'
        selectedSeats.forEach(seat => {
          if (seat.type && countByType.hasOwnProperty(seat.type)) {
            countByType[seat.type] += 1;
          } else {
            countByType.normal += 1;
          }
        });
        
        return countByType;
      },
      
      // Asignar asientos seleccionados
      assignSeats: (seats) => {
        set({ 
          selectedSeats: seats,
          reservationStartTime: get().reservationStartTime || Date.now()
        });
      },
      clearSeats: () => set({ selectedSeats: [] }),
      
      // Asignar precio total
      assignTotal: (total) => {
        set({ totalPrice: total });
      },
      
      // Seleccionar un asiento individual
      selectSeat: (seat) => {
        const { selectedSeats } = get();
        
        // Evitar duplicados
        if (selectedSeats.some(s => s.id === seat.id)) {
          return false;
        }
        
        set(state => ({
          selectedSeats: [...state.selectedSeats, seat],
          reservationStartTime: state.reservationStartTime || Date.now(),
          totalPrice: state.totalPrice + (seat.price || 0)
        }));
        
        return true;
      },
      
      // Deseleccionar un asiento
      deselectSeat: (seatId) => {
        const { selectedSeats } = get();
        const seatToRemove = selectedSeats.find(s => s.id === seatId);
        
        if (!seatToRemove) return false;
        
        set(state => ({
          selectedSeats: state.selectedSeats.filter(s => s.id !== seatId),
          totalPrice: state.totalPrice - (seatToRemove.price || 0)
        }));
        
        // Si no quedan asientos, resetear el tiempo
        if (get().selectedSeats.length === 0) {
          set({ reservationStartTime: null });
        }
        
        return true;
      },
      
      // Avanzar al siguiente paso
      nextStep: () => {
        const { bookingStep } = get();
        const steps = ['seat-selection', 'user-data','type-seat', 'payment', 'confirmation'];
        const currentIndex = steps.indexOf(bookingStep);
        
        if (currentIndex < steps.length - 1) {
          set({ bookingStep: steps[currentIndex + 1] });
          return true;
        }
        
        return false;
      },
      
      // Verificar si se necesita confirmación para el paso anterior
      needsConfirmationForPreviousStep: () => {
        const { bookingStep, selectedSeats } = get();
        
        // Si estamos en datos de usuario y hay asientos seleccionados
        if (bookingStep === 'user-data' && selectedSeats.length > 0) {
          return {
            needsConfirmation: true,
            message: "¡Atención! Si vuelves atrás, perderás los lugares reservados y puede que ya no estén disponibles. ¿Estás seguro de que quieres volver?"
          };
        }
        
        return { needsConfirmation: false };
      },
      
      // Volver al paso anterior
      previousStep: () => {
        const { bookingStep } = get();
        const steps = ['seat-selection', 'user-data','type-seat', 'payment', 'confirmation'];
        const currentIndex = steps.indexOf(bookingStep);
        
        if (currentIndex > 0) {
          set({ bookingStep: steps[currentIndex - 1] });
          return true;
        }
        
        return false;
      },
      
      // Establecer el paso directamente
      setBookingStep: (step) => {
        if (['seat-selection', 'user-data', 'type-seat', 'payment', 'confirmation'].includes(step)) {
          set({ bookingStep: step });
          return true;
        }
        return false;
      },
      
      // Verificar si la reserva ha expirado
      isReservationExpired: () => {
        const { reservationStartTime } = get();
        if (!reservationStartTime) return false;
        
        return (Date.now() - reservationStartTime) > RESERVATION_TIMEOUT;
      },
      
      // Obtener tiempo restante en milisegundos
      getRemainingTime: () => {
        const { reservationStartTime } = get();
        if (!reservationStartTime) return 0;
        
        const elapsedTime = Date.now() - reservationStartTime;
        const remainingTime = Math.max(0, RESERVATION_TIMEOUT - elapsedTime);
        
        return remainingTime;
      },
      
      resetBooking: () => {
        set({
          selectedSeats: [],
          reservationStartTime: null,
          totalPrice: 0,
          bookingStep: 'seat-selection'
        });
      },
      
      // Verificar si podemos continuar al siguiente paso
      canProceedToNextStep: () => {
        const { bookingStep, selectedSeats } = get();
        
        switch (bookingStep) {
          case 'seat-selection':
            return selectedSeats.length > 0;
          
          case 'user-data':
            return true;

          case 'type-seat':
            return true
            
          case 'payment':
            return true;
          
          default:
            return false;
        }
      }
    }),
    {
      name: 'cinema-booking-storage',
      getStorage: () => localStorage
    }
  )
);