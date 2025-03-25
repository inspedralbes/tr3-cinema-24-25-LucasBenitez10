'use client';
import BookingSeats from '@/components/booking/BookingSeats';
import React, { useState, useEffect } from 'react';
import { useBookingStore } from '@/store/bookingStore';
import BookingUserData from '@/components/booking/BookingUserData';
import BookingSeatType from '@/components/booking/BookingSeatType';
import PaymentComponent from '@/components/payment/Payment';
import { useRouter } from 'next/navigation';
import BookingConfirmation from '@/components/booking/BookingConfirmation'


function Seats() {
  const {
    bookingStep,
    isReservationExpired,
    resetBooking // Asumiendo que tienes una función para reiniciar la reserva
  } = useBookingStore();
  
  const [showExpirationAlert, setShowExpirationAlert] = useState(false);
  const router = useRouter();

  // Efecto para verificar la expiración de la reserva
  useEffect(() => {
    // Verificar inmediatamente al cargar
    if (isReservationExpired()) {
      handleExpiredReservation();
    }

    // Configurar un intervalo para verificar periódicamente
    const checkInterval = setInterval(() => {
      if (isReservationExpired()) {
        handleExpiredReservation();
        clearInterval(checkInterval); // Limpiar el intervalo una vez que expire
      }
    }, 10000); // Verificar cada 10 segundos

    return () => clearInterval(checkInterval); // Limpiar al desmontar
  }, []);

  // Función para manejar la reserva expirada
  const handleExpiredReservation = () => {
    setShowExpirationAlert(true);
    // Opcional: reiniciar el estado de la reserva
    resetBooking();
    
    // Opcional: redirigir después de un tiempo
    setTimeout(() => {
      router.push('/peliculas'); // O a donde prefieras redirigir
    }, 5000);
  };

  // Progress marker component for steps
  const ProgressMarker = () => {
    const steps = ['seat-selection', 'user-data', 'type-seat', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(bookingStep);
    
    return (
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-2">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <div 
                className={`w-3 h-3 rounded-full ${index <= currentIndex ? 'bg-red-500' : 'bg-gray-700'}`}
              ></div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-px ${index < currentIndex ? 'bg-red-500' : 'bg-gray-700'}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black min-h-screen">
      {/* Alerta de expiración */}
      {showExpirationAlert && (
        <div className="bg-red-600 text-white p-4 font-light text-center">
          <div className="max-w-md mx-auto py-2">
            ¡Tu tiempo de reserva ha expirado! Serás redirigido en unos segundos...
          </div>
        </div>
      )}

      {/* Progress indicators (only show for steps before confirmation) */}
      {bookingStep !== 'confirmation' && <ProgressMarker />}

      {bookingStep === 'seat-selection' && <BookingSeats />}
      
      {bookingStep === 'user-data' && <BookingUserData />}
      
      {bookingStep === 'type-seat' && <BookingSeatType />}

      {bookingStep === 'payment' && <PaymentComponent/>}

      {bookingStep === 'confirmation' && <BookingConfirmation/>}
    </div>
  );
}

export default Seats;