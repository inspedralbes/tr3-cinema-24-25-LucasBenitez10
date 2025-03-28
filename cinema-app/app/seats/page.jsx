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
    resetBooking 
  } = useBookingStore();
  
  const [showExpirationAlert, setShowExpirationAlert] = useState(false);
  const router = useRouter();

 
  useEffect(() => {
    if (isReservationExpired()) {
      handleExpiredReservation();
    }

    const checkInterval = setInterval(() => {
      if (isReservationExpired()) {
        handleExpiredReservation();
        clearInterval(checkInterval); 
      }
    }, 10000); 

    return () => clearInterval(checkInterval); 
  }, []);


  const handleExpiredReservation = () => {
    setShowExpirationAlert(true);
    
    resetBooking();
    
    
    setTimeout(() => {
      router.push('/'); 
    }, 5000);
  };


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
      {showExpirationAlert && (
        <div className="bg-red-600 text-white p-4 font-light text-center">
          <div className="max-w-md mx-auto py-2">
            ¡Tu tiempo de reserva ha expirado! Serás redirigido en unos segundos...
          </div>
        </div>
      )}

      
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