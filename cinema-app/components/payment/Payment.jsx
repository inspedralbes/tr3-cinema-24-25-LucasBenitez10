'use client';

import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';
import { useBookingStore } from '@/store/bookingStore';

// Carga Stripe fuera del componente para evitar recargas innecesarias
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const Payment = () => {
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [stripeError, setStripeError] = useState(null);
  
  // Obtener datos del store
  const { 
    selectedSeats, 
    totalPrice, 
    isReservationExpired, 
    previousStep 
  } = useBookingStore();

  useEffect(() => {
    // Verificar que Stripe se haya cargado correctamente
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      setStripeError('La clave de Stripe no está configurada. Contacta al administrador.');
      return;
    }

    // Verificar que tenemos datos válidos para el pago
    if (!totalPrice || totalPrice <= 0) {
      console.warn('El precio total no es válido:', totalPrice);
      setStripeError('El monto a pagar no es válido. Vuelve al paso anterior.');
      return;
    }

    if (!selectedSeats || selectedSeats.length === 0) {
      console.warn('No hay asientos seleccionados');
      setStripeError('No hay asientos seleccionados. Vuelve al paso anterior.');
      return;
    }

    // Verificar si la reserva ha expirado
    if (isReservationExpired()) {
      setStripeError('Tu tiempo de reserva ha expirado. Por favor, inicia una nueva reserva.');
      return;
    }

    // Si todo está bien, marcar Stripe como cargado
    setStripeLoaded(true);
  }, [totalPrice, selectedSeats, isReservationExpired]);

  // Formatear el tiempo restante para mostrarlo
  const formatRemainingTime = () => {
    const remainingTimeMs = useBookingStore.getState().getRemainingTime();
    const minutes = Math.floor(remainingTimeMs / 60000);
    const seconds = Math.floor((remainingTimeMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (stripeError) {
    return (
      <div className="py-6 max-w-md mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{stripeError}</p>
        </div>
        <button
          onClick={previousStep}
          className="w-full py-3 px-4 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Volver al paso anterior
        </button>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Mostrar tiempo restante */}
      <div className="text-center mb-6">
        <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
          Tiempo restante: {formatRemainingTime()}
        </div>
        {totalPrice > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            Total a pagar: €{totalPrice.toFixed(2)} EUR
          </div>
        )}
      </div>

      {stripeLoaded ? (
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      ) : (
        <div className="text-center p-6">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4">Cargando formulario de pago...</p>
        </div>
      )}
    </div>
  );
};

export default Payment;