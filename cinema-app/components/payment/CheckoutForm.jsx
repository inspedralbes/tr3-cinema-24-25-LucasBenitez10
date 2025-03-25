import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useBookingStore } from '@/store/bookingStore';
import { useUserStore } from '@/store/userStore';
import { useMovieStore } from '@/store/moviesStore';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [clientSecret, setClientSecret] = useState('');

  const {
    guestData,
    user,
  } = useUserStore()

  const { movieSelected } = useMovieStore();

  // Obtener datos del store
  const {
    selectedSeats,
    totalPrice,
    previousStep,
    setBookingStep,
    nextStep
  } = useBookingStore();

  useEffect(() => {
    // Crear PaymentIntent al montar el componente
    const createPaymentIntent = async () => {
      try {
        // Verificar que tenemos datos para procesar
        if (!totalPrice || totalPrice <= 0) {
          console.warn('El precio total es 0 o no está definido. No se creará PaymentIntent.');
          return;
        }

        if (!selectedSeats || selectedSeats.length === 0) {
          console.warn('No hay asientos seleccionados. No se creará PaymentIntent.');
          return;
        }

        console.log('Asientos seleccionados para PaymentIntent:', selectedSeats);

        // Preparar los metadatos para Stripe
        // Aseguramos que el formato de asientos funcione con cualquier estructura
        const seatIds = selectedSeats.map(seat => {
          return typeof seat === 'string' ? seat : (seat.id || seat);
        }).join(',');

        const seatTypes = selectedSeats.map(seat => {
          return typeof seat === 'object' && seat.type ? seat.type : 'normal';
        }).join(',');

        console.log('Datos a enviar a Stripe:', { seatIds, seatTypes, totalSeats: selectedSeats.length });

        const response = await fetch('http://localhost:4000/api/payments/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalPrice,
            currency: 'eur',
            metadata: {
              seats: seatIds,
              seatTypes: seatTypes,
              totalSeats: selectedSeats.length
            }
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setClientSecret(data.clientSecret);
        } else {
          setError('Error al iniciar el proceso de pago: ' + (data.error || 'Error desconocido'));
        }
      } catch (err) {
        console.error('Error al crear PaymentIntent:', err);
        setError('Error al conectar con el servidor de pagos. Por favor, intenta de nuevo.');
      }
    };

    createPaymentIntent();
  }, [totalPrice, selectedSeats]);

  const handleChange = (event) => {
    // Escuchar cambios en CardElement
    setDisabled(event.empty);
    setError(event.error ? event.error.message : '');
  };


  //DATOS PARA EL TICKET
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe aún no ha cargado
      return;
    }

    setProcessing(true);

    try {
      const payload = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: guestData?.name || 'Cliente Cine', // Usar datos del usuario si disponibles
          },
        },
      });

      if (payload.error) {
        setError(`Error de pago: ${payload.error.message}`);
        setProcessing(false);
      } else {
        // Pago exitoso
        setError(null);
        setProcessing(false);
        setSucceeded(true);

        // Generar tickets después del pago exitoso
        try {
          console.log('Preparando datos para generar tickets, asientos:', selectedSeats);

          // Preparar los datos para la API de tickets
          const ticketData = {
            screeningId: movieSelected._id,
            customerInfo: {
              email: guestData.email,
              name: guestData.name,
              phone: guestData.phone
            },
            seats: selectedSeats.map(seat => {
              // Determinar el formato del asiento y extraer fila y número
              let seatStr;
              if (typeof seat === 'string') {
                seatStr = seat;
              } else if (seat && seat.id) {
                seatStr = seat.id;
              } else {
                console.warn('Formato de asiento desconocido:', seat);
                seatStr = String(seat); // Intentar convertir a string como fallback
              }

              const row = seatStr.charAt(0);
              const number = seatStr.substring(1);

              return { row, number };
            }),
            ticketType: "regular",
            paymentMethod: {
              type: "credit_card",
            }
          };

          console.log('Enviando datos para generar tickets:', ticketData);

          // Llamar a la API para generar los tickets
          const ticketResponse = await fetch('http://localhost:4000/api/tickets', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(ticketData)
          });

          if (!ticketResponse.ok) {
            const errorData = await ticketResponse.json().catch(() => ({}));
            console.error('Error del servidor al generar tickets:', errorData);
            throw new Error(`Error al generar los tickets: ${errorData.message || 'Error desconocido'}`);
          }

          const tickets = await ticketResponse.json();
          console.log('Tickets generados exitosamente:', tickets);

          // Marcar los asientos como ocupados
          try {
            // Preparar los IDs de los asientos en formato "A1", "B2", etc.
            const seatIds = selectedSeats.map(seat => {
              // Si seat es un string, usarlo directamente
              if (typeof seat === 'string') {
                return seat;
              }
              // Si seat es un objeto con propiedad id, usar esa propiedad
              if (seat && seat.id) {
                return seat.id;
              }
              // Si hay otra estructura, intentar extraer la información necesaria
              if (seat) {
                console.log("Formato de asiento inesperado:", seat);
                return seat.toString();
              }
              return null;
            }).filter(id => id !== null); // Eliminar cualquier null

            console.log("Asientos a marcar como ocupados:", seatIds);
            console.log("ID de la proyección:", movieSelected._id);

            if (seatIds.length > 0) {
              // Verificar que movieSelected._id es un ObjectId válido
              if (!movieSelected._id || typeof movieSelected._id !== 'string' || !movieSelected._id.match(/^[0-9a-fA-F]{24}$/)) {
                console.error('ID de proyección inválido:', movieSelected._id);
                throw new Error('ID de proyección inválido');
              }

              const updateResponse = await fetch('http://localhost:4000/api/seat-status/mark-occupied', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  screeningId: movieSelected._id,
                  seatIds: seatIds
                })
              });

              if (!updateResponse.ok) {
                const errorText = await updateResponse.text();
                console.error("Error al actualizar asientos, respuesta del servidor:", errorText);
                throw new Error(`Error al actualizar el estado de los asientos: ${errorText}`);
              }

              const updateResult = await updateResponse.json();
              console.log('Asientos marcados como ocupados:', updateResult);
            } else {
              console.warn("No hay asientos para marcar como ocupados");
            }
          } catch (seatUpdateError) {
            console.error('Error al actualizar estado de asientos:', seatUpdateError);
            // No interrumpimos el flujo ya que los tickets se generaron correctamente
          }

          // Guardar la información de los tickets en el estado o localStorage
          localStorage.setItem('lastPurchasedTickets', JSON.stringify(tickets));

          // Avanzar al siguiente paso
          setTimeout(() => {
            nextStep(); // Usar la función nextStep del store que avanzará a 'confirmation'
          }, 1000);
        } catch (ticketError) {
          console.error('Error al generar tickets:', ticketError);
          // Nota: No mostramos este error al usuario porque el pago ya se completó
          // El administrador debería conciliar los pagos sin tickets manualmente

          // A pesar del error, avanzamos al siguiente paso
          setTimeout(() => {
            nextStep();
          }, 1000);
        }
      }
    } catch (err) {
      console.error('Error al procesar el pago:', err);
      setError('Error inesperado al procesar el pago');
      setProcessing(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
        backgroundColor: '#1f2937',
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  // Generar un resumen de asientos por tipo
  const seatSummary = () => {
    const seatsByType = useBookingStore.getState().getSelectedSeatsByType();
    return Object.entries(seatsByType)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => `${count} ${type}${count !== 1 ? 's' : ''}`)
      .join(', ');
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-light text-center mb-8">Finaliza tu compra</h2>

        {/* Movie info if available */}
        {movieSelected?.movie && (
          <div className="mb-8 text-center">
            <h3 className="text-xl font-medium text-red-500">{movieSelected.movie.title}</h3>
            <p className="text-gray-400 mt-2">
              {movieSelected.room?.name && `Sala ${movieSelected.room.name}`}
            </p>
          </div>
        )}

        {/* Divider with film reel design */}
        <div className="flex items-center my-8">
          <div className="flex-grow h-px bg-gray-800"></div>
          <div className="flex space-x-1 mx-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-gray-700"></div>
            ))}
          </div>
          <div className="flex-grow h-px bg-gray-800"></div>
        </div>

        <form id="payment-form" onSubmit={handleSubmit}>
          {/* Resumen de compra */}
          <div className="mb-8 p-6 bg-gray-900 rounded-lg border border-gray-800">
            <h3 className="font-medium text-lg mb-4 text-red-500">Resumen de la compra</h3>
            <div className="flex justify-between mb-3 text-gray-300">
              <span>Asientos:</span>
              <span className="text-white">{selectedSeats.length} ({seatSummary()})</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-4 border-t border-gray-800">
              <span>Total a pagar:</span>
              <span className="text-xl">€{(totalPrice || 0).toFixed(2)}</span>
            </div>
          </div>

          <div className="mb-8">
            <label htmlFor="card-element" className="block text-sm font-light text-gray-300 mb-3">
              Datos de la tarjeta
            </label>
            <div className="border border-gray-700 rounded-md p-4 bg-gray-800">
              <CardElement id="card-element" options={cardStyle} onChange={handleChange} />
            </div>
          </div>

          {/* Mostrar errores */}
          {error && (
            <div className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded-md mb-6" role="alert">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Mostrar éxito */}
          {succeeded && (
            <div className="bg-green-900 border border-green-700 text-white px-4 py-3 rounded-md mb-6" role="alert">
              <p className="text-sm">¡Pago completado con éxito! Procesando tu reserva...</p>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4">
            <button
              type="button"
              onClick={previousStep}
              className="text-gray-300 hover:text-white flex items-center justify-center sm:justify-start"
            >
              <span className="mr-1">←</span> Volver atrás
            </button>

            <button
              disabled={processing || disabled || succeeded}
              className={`py-3 px-6 rounded-md font-medium text-white transition-colors flex-grow sm:flex-grow-0 sm:min-w-[200px] ${processing || disabled || succeeded
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
                }`}
            >
              {processing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : succeeded ? (
                'Pago completado'
              ) : (
                `Pagar €${(totalPrice || 0).toFixed(2)}`
              )}
            </button>
          </div>

          <div className="mt-8 text-sm text-gray-500 text-center">
            <p>Tu información de pago está segura y encriptada</p>
            <div className="flex justify-center space-x-4 mt-4">
              <div className="w-8 h-5 bg-gray-800 rounded"></div>
              <div className="w-8 h-5 bg-gray-800 rounded"></div>
              <div className="w-8 h-5 bg-gray-800 rounded"></div>
              <div className="w-8 h-5 bg-gray-800 rounded"></div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;