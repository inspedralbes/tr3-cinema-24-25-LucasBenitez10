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
  const [ticketTypeData, setTicketTypeData] = useState({});
  const [allTickets, setAllTickets] = useState([]);

  const {
    guestData,
    user,
  } = useUserStore();

  const { movieSelected } = useMovieStore();

  // Obtener datos del store
  const {
    selectedSeats,
    totalPrice,
    previousStep,
    setBookingStep,
    nextStep,
    stopReservationTimeout,
    ticketTypes 
  } = useBookingStore();

  // Función para generar código de ticket único
  const generateTicketCode = () => {
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    const datePart = Date.now().toString(36).substring(4).toUpperCase();
    return `TK-${randomPart}-${datePart}`;
  };

  // Cargar información de tipos de tickets desde el servidor
  useEffect(() => {
    const fetchTicketTypeData = async () => {
      try {
        if (movieSelected && movieSelected._id) {
          // Obtener tipos de tickets específicos para esta película
          const response = await fetch(`http://localhost:4000/api/ticket-types/movie/${movieSelected._id}`);
          if (!response.ok) {
            throw new Error('Error al cargar tipos de tickets');
          }
          const data = await response.json();

          // Convertir a un objeto para fácil acceso por código
          const typeMap = {};
          data.forEach(type => {
            typeMap[type.code] = type;
          });

          setTicketTypeData(typeMap);
          
        }
      } catch (err) {
        console.error('Error al cargar datos de tipos de tickets:', err);
      }
    };

    fetchTicketTypeData();
  }, [movieSelected]);


  useEffect(() => {
  
    const handleBeforeUnload = () => {

      if (!succeeded) {
        localStorage.setItem('paymentInProgress', 'true');
      } else {
        stopReservationTimeout();
        localStorage.removeItem('paymentInProgress');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    const paymentInProgress = localStorage.getItem('paymentInProgress');
    if (!paymentInProgress) {
   
      stopReservationTimeout();
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [stopReservationTimeout, succeeded]);

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

    

    
        const seatIds = selectedSeats.map(seat => {
          return typeof seat === 'string' ? seat : (seat.id || seat);
        }).join(',');

        let ticketTypeInfo = [];
        if (ticketTypes && ticketTypes.length > 0) {
          ticketTypeInfo = ticketTypes.map(type =>
            `${type.code}:${type.quantity}`
          ).join(',');
        } else {
   
          const seatTypes = selectedSeats.map(seat => {
            return typeof seat === 'object' && seat.type ? seat.type : 'normal';
          }).join(',');
          ticketTypeInfo = seatTypes;
        }

       

        const response = await fetch('http://localhost:4000/api/payments/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalPrice,
            currency: 'eur',
            metadata: {
              seats: seatIds,
              ticketTypes: ticketTypeInfo,
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
  }, [totalPrice, selectedSeats, ticketTypes]);

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

        // Detener el timeout de reserva inmediatamente al completar el pago
        stopReservationTimeout();
        localStorage.removeItem('paymentInProgress');

        // Generar tickets después del pago exitoso
        try {
          // Comprobamos que tenemos toda la información necesaria
          if (!movieSelected || !movieSelected._id) {
            throw new Error('No hay una proyección seleccionada válida');
          }

          if (Object.keys(ticketTypeData).length === 0) {
            throw new Error('No se pudieron cargar los datos de tipos de tickets');
          }

          // Enfoque alternativo: crear UN SOLO ticket para todos los asientos
          // Esto puede ser más compatible con el backend si está esperando una estructura específica
          const allSeats = [];
          let totalSeats = 0;

          // Preparar información de todos los asientos
          if (ticketTypes && ticketTypes.length > 0) {
            let seatIndex = 0;

            for (const ticketType of ticketTypes) {
              for (let i = 0; i < ticketType.quantity; i++) {
                if (seatIndex < selectedSeats.length) {
                  const seat = selectedSeats[seatIndex];

                  // Determinar fila y número
                  let seatStr;
                  if (typeof seat === 'string') {
                    seatStr = seat;
                  } else if (seat && seat.id) {
                    seatStr = seat.id;
                  } else {
                    seatStr = String(seat);
                  }

                  const row = seatStr.charAt(0);
                  const number = seatStr.substring(1);

                  // Obtener el tipo de ticket
                  const typeInfo = ticketTypeData[ticketType.code];

                  if (!typeInfo || !typeInfo._id) {
                    console.error(`No se encontró información para el tipo: ${ticketType.code}`);
                    continue;
                  }

                  // Añadir información del asiento
                  allSeats.push({
                    row: row,
                    number: number,
                    type: ticketType.code,
                    price: ticketType.price
                  });

                  totalSeats++;
                  seatIndex++;
                }
              }
            }
          } else {
            // Fallback
            for (const seat of selectedSeats) {
              let seatStr;
              if (typeof seat === 'string') {
                seatStr = seat;
              } else if (seat && seat.id) {
                seatStr = seat.id;
              } else {
                seatStr = String(seat);
              }

              const row = seatStr.charAt(0);
              const number = seatStr.substring(1);

              allSeats.push({
                row: row,
                number: number,
                type: 'normal',
                price: ticketTypeData['normal']?.price || 10.40
              });

              totalSeats++;
            }
          }


          // Generar un código base para todos los tickets
          const baseTicketCode = generateTicketCode();

          // Ahora vamos a crear tickets individuales para cada asiento
          const tickets = [];

          for (const seat of allSeats) {
            // Obtener el tipo de ticket correspondiente al código
            const typeInfo = ticketTypeData[seat.type];

            if (!typeInfo || !typeInfo._id) {
              console.error(`No se encontró información para el tipo: ${seat.type}`);
              continue;
            }

            // Generar código único para este ticket basado en el asiento
            const seatIdentifier = `${seat.row}${seat.number}`;
            const uniqueTicketCode = `${baseTicketCode}-${seatIdentifier}`;

            // Crear el ticket para este asiento
            const ticketData = {
              ticketCode: uniqueTicketCode, // Importante: añadir el código del ticket
              screening: movieSelected._id,
              ticketType: typeInfo._id,
              ticketTypeCode: seat.type,
              pricePaid: seat.price,
              seats: {
                row: seat.row,
                number: seat.number
              },
              customerInfo: {
                email: guestData?.email || user?.email || 'cliente@ejemplo.com',
                name: guestData?.name || user?.name || 'Cliente Cine',
                phone: guestData?.phone || user?.phone || ''
              },
              status: 'active', // Estado predeterminado
              paymentMethod: 'credit_card'
            };

            if (user && user._id) {
              ticketData.user = user._id;
            }


            try {
              const response = await fetch('http://localhost:4000/api/tickets', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(ticketData)
              });

              if (!response.ok) {
                const errorData = await response.json();
                console.error('Error al crear ticket:', errorData);
                throw new Error(`Error al crear ticket: ${JSON.stringify(errorData)}`);
              }

              const ticketResult = await response.json();
              tickets.push(ticketResult);
            } catch (ticketError) {
              console.error(`Error al crear ticket para asiento ${seat.row}${seat.number}:`, ticketError);
              // Continuamos con el siguiente asiento incluso si hay error
            }
          }

          if (tickets.length > 0) {
            setAllTickets(tickets);

            // Asegurarnos de guardar un array plano, no anidado
            // Guardar tickets como un array plano sin envolverlo en otro array

            try {
              localStorage.setItem('lastPurchasedTickets', JSON.stringify(tickets));

              // Verificar que se guardó correctamente
              const savedData = localStorage.getItem('lastPurchasedTickets');
              const parsedData = JSON.parse(savedData);

              if (Array.isArray(parsedData) && parsedData.length === tickets.length) {
                console.log("Tickets guardados correctamente en localStorage");
              } else {
                console.error("Error: El formato de los tickets guardados no es el esperado");
              }
            } catch (storageError) {
              console.error("Error al guardar tickets en localStorage:", storageError);
            }

            // Marcar asientos como ocupados (código existente para marcar asientos)
            try {
              const seatIds = selectedSeats.map(seat => {
                if (typeof seat === 'string') return seat;
                if (seat && seat.id) return seat.id;
                return String(seat);
              }).filter(Boolean);

              if (seatIds.length > 0) {
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
                  console.error('Error al marcar asientos como ocupados');
                } else {
                  console.log('Asientos marcados como ocupados correctamente');
                }
              }
            } catch (seatError) {
              console.error('Error al actualizar el estado de los asientos:', seatError);
            }

            // Avanzar al siguiente paso
            setTimeout(() => {
              nextStep();
            }, 1000);
          } else {
            throw new Error('No se pudo crear ningún ticket');
          }
        } catch (ticketError) {
          console.error('Error al generar tickets:', ticketError);

          // A pesar del error, si el pago se realizó, avanzamos
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
    if (ticketTypes && ticketTypes.length > 0) {
      return ticketTypes
        .filter(type => type.quantity > 0)
        .map(type => `${type.quantity} ${type.name}${type.quantity !== 1 ? 's' : ''}`)
        .join(', ');
    }

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