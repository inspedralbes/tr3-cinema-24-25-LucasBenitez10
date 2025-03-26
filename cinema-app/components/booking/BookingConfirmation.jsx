'use client';

import React, { useState, useEffect } from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { useMovieStore } from '@/store/moviesStore';
import { useRouter } from 'next/navigation';

const SimpleTicketQR = ({ ticketCode }) => {
  const [qrLoaded, setQrLoaded] = useState(false);
  const [qrError, setQrError] = useState(false);
  
  // Función para generar la URL del código QR usando qrserver.com
  const getQrCodeUrl = (code) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(code)}`;
  };
  
  // Manejar eventos de carga y error
  const handleImageLoad = () => {
    setQrLoaded(true);
    setQrError(false);
  };
  
  const handleImageError = () => {
    setQrError(true);
    console.error("Error al cargar el código QR");
  };
  
  if (!ticketCode) {
    return (
      <div className="w-48 h-48 bg-gray-800 flex items-center justify-center rounded">
        <p className="text-gray-400 text-sm">Código no disponible</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg inline-block">
      {/* QR Code */}
      <div className="relative w-[150px] h-[150px]">
        {!qrLoaded && !qrError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-10 h-10 border-4 border-gray-400 border-t-red-500 rounded-full animate-spin"></div>
          </div>
        )}
        
        {!qrError ? (
          <img 
            src={getQrCodeUrl(ticketCode)}
            alt={`Código QR: ${ticketCode}`}
            width={150}
            height={150}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`${qrLoaded ? 'block' : 'hidden'}`}
          />
        ) : (
          /* Fallback si falla la carga de imagen */
          <div className="w-[150px] h-[150px] bg-white flex flex-col items-center justify-center border">
            <div className="text-black text-xs text-center p-2">
              <span className="font-bold">CÓDIGO DE ENTRADA</span>
              <br/>
              <span className="text-red-600">Error al generar QR</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Ticket Code Text */}
      <p className="text-black text-xs mt-3 font-bold text-center break-all">
        {ticketCode}
      </p>
    </div>
  );
};

const BookingConfirmation = () => {
  const { selectedSeats, totalPrice, resetBooking, stopReservationTimeout } = useBookingStore();
  const { movieSelected } = useMovieStore();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    stopReservationTimeout();
    localStorage.removeItem('paymentInProgress');
    
    try {
      const savedTickets = localStorage.getItem('lastPurchasedTickets');
      console.log("Datos brutos de localStorage:", savedTickets);
      
      if (savedTickets) {
        let parsedTickets = JSON.parse(savedTickets);
        console.log("Tickets parseados inicialmente:", parsedTickets);
        
        // CORRECCIÓN: Manejar el formato especial [[{ticket1}], [{ticket2}], ...]
        if (Array.isArray(parsedTickets)) {
          // Verificar si tenemos un array de arrays
          if (parsedTickets.length > 0 && Array.isArray(parsedTickets[0])) {
            console.log("Detectada estructura especial de arrays anidados");
            
            // Nuevo array plano para contener todos los tickets
            const flattenedTickets = [];
            
            // Recorrer cada array interno y extraer los tickets
            parsedTickets.forEach(innerArray => {
              if (Array.isArray(innerArray) && innerArray.length > 0) {
                // Añadir cada ticket del array interno al array plano
                innerArray.forEach(ticket => {
                  flattenedTickets.push(ticket);
                });
              }
            });
            
            parsedTickets = flattenedTickets;
            console.log("Estructura aplanada correctamente:", parsedTickets);
          }
          
          // Si después del proceso tenemos tickets, guardarlos
          if (parsedTickets.length > 0) {
            setTickets(parsedTickets);
            console.log("Total de tickets procesados:", parsedTickets.length);
            
            // Registrar info detallada del primer ticket para depuración
            if (parsedTickets[0]) {
              console.log("Primer ticket:", parsedTickets[0]);
              console.log("Asientos del primer ticket:", parsedTickets[0]?.seats);
              console.log("Código QR del primer ticket:", parsedTickets[0]?.ticketCode);
            }
          } else {
            console.error("No se encontraron tickets válidos después del procesamiento");
          }
        } else {
          console.error("Los tickets parseados no son un array");
        }
      } else {
        console.warn("No se encontraron tickets en localStorage");
      }
    } catch (error) {
      console.error('Error al cargar tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [stopReservationTimeout]);

  const handleDownloadTickets = () => {
    alert('La funcionalidad de descarga de boletos estará disponible próximamente.');
  };

  const handleBackToCatalog = () => {
    resetBooking();
    router.push('/peliculas');
  };

  // Función para cambiar el ticket activo en el carousel
  const changeTicket = (direction) => {
    if (direction === 'next') {
      setCurrentTicketIndex((prev) => (prev + 1) % tickets.length);
    } else {
      setCurrentTicketIndex((prev) => (prev - 1 + tickets.length) % tickets.length);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-red-500 border-r-transparent"></div>
        <p className="mt-4 font-light">Cargando tus entradas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with minimalist confirmation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-light mb-2">Reserva Confirmada</h1>
          <p className="text-gray-400">
            Tu pago ha sido procesado y tus entradas están listas
          </p>
        </div>

        {/* Ticket Information */}
        {tickets && tickets.length > 0 ? (
          <div className="mb-12">
            {/* Movie and screening details */}
            <div className="mb-8">
              <h2 className="text-2xl font-medium text-red-500 mb-4">
                {movieSelected?.movie?.title || "Tu película"}
              </h2>
              
              <div className="flex items-center space-x-3 mb-6 text-lg">
                <span className="text-gray-400">{movieSelected?.date || "Fecha de tu función"}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span className="text-gray-200">{movieSelected?.startTime || "Hora"}h</span>
              </div>
              
              <div className="flex items-center space-x-8 text-sm text-gray-400">
                <div className="flex items-center">
                  <span>SALA</span>
                  <span className="ml-2 px-3 py-1 bg-gray-900 rounded text-white">
                    {movieSelected?.room?.name || "Tu sala"}
                  </span>
                </div>
                <div>
                  <span>{tickets.length} {tickets.length === 1 ? 'entrada' : 'entradas'}</span>
                </div>
                <div>
                  <span>#{tickets[0]?.ticketCode?.substring(0, 6) || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Divider with film reel design */}
            <div className="flex items-center my-6">
              <div className="flex-grow h-px bg-gray-800"></div>
              <div className="flex space-x-1 mx-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-gray-700"></div>
                ))}
              </div>
              <div className="flex-grow h-px bg-gray-800"></div>
            </div>

            {/* Seats listing */}
            <div className="mb-8">
              <h3 className="text-lg font-light mb-4 text-gray-300">Tus asientos</h3>
              <div className="grid grid-cols-2 gap-3">
                {tickets.map((ticket, index) => (
                  <div 
                    key={index} 
                    className={`px-4 py-3 bg-gray-900 rounded border ${index === currentTicketIndex ? 'border-red-500' : 'border-gray-800'} cursor-pointer hover:border-red-400 transition-colors`}
                    onClick={() => setCurrentTicketIndex(index)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-medium">
                        {ticket.seats?.row || "?"}{ticket.seats?.number || "?"}
                      </span>
                      <span className="text-sm text-gray-400 capitalize">
                        {ticket.ticketTypeCode || 'normal'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total price */}
            <div className="mt-6 pt-6 border-t border-gray-800 flex justify-between items-center">
              <span className="text-gray-400">Total pagado</span>
              <span className="text-2xl">€{typeof totalPrice === 'number' ? totalPrice.toFixed(2) : '0.00'}</span>
            </div>

            {/* Current ticket QR code with pagination if multiple tickets */}
            <div className="mt-10">
              {tickets.length > 1 && (
                <div className="flex justify-between items-center mb-4">
                  <button 
                    onClick={() => changeTicket('prev')}
                    className="p-2 bg-gray-900 hover:bg-gray-800 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <span className="text-gray-300">
                    Entrada {currentTicketIndex + 1} de {tickets.length}
                  </span>
                  
                  <button 
                    onClick={() => changeTicket('next')}
                    className="p-2 bg-gray-900 hover:bg-gray-800 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
              
              <div className="flex justify-center">
                <div className="text-center">
                  {tickets[currentTicketIndex]?.ticketCode ? (
                    <SimpleTicketQR ticketCode={tickets[currentTicketIndex].ticketCode} />
                  ) : (
                    <div className="w-48 h-48 bg-gray-800 flex items-center justify-center rounded">
                      <p className="text-gray-400">Código QR no disponible</p>
                    </div>
                  )}
                  <p className="mt-3 text-sm text-gray-400">Presenta este código en la entrada</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 bg-gray-900 rounded-lg text-center mb-8">
            <p className="text-gray-400">
              No se encontraron detalles de tus entradas. Si has completado una compra, contacta con atención al cliente.
            </p>
          </div>
        )}

        {/* Simple instructions */}
        <div className="mb-8 bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4 text-red-500">Información</h3>
          <ul className="space-y-4 text-gray-300 text-sm">
            <li className="flex items-start">
              <div className="mr-3 mt-0.5 text-red-500">•</div>
              <p>Llega 15 minutos antes del inicio de la película</p>
            </li>
            <li className="flex items-start">
              <div className="mr-3 mt-0.5 text-red-500">•</div>
              <p>Muestra este código QR o el email de confirmación en la entrada</p>
            </li>
            <li className="flex items-start">
              <div className="mr-3 mt-0.5 text-red-500">•</div>
              <p>Puedes descargar tus entradas para un acceso más rápido</p>
            </li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleDownloadTickets}
            className="w-full bg-red-600 hover:bg-red-700 py-3 px-6 rounded font-medium text-center"
          >
            Descargar entradas
          </button>

          <button
            onClick={handleBackToCatalog}
            className="w-full bg-transparent hover:bg-gray-900 text-white border border-gray-700 py-3 px-6 rounded font-medium text-center"
          >
            Volver al catálogo
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;