'use client';

import React, { useState, useEffect } from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { useMovieStore } from '@/store/moviesStore';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Users, Tag, Download, ArrowLeft, ArrowRight, Ticket, AlertTriangle } from 'lucide-react';

const SimpleTicketQR = ({ ticketCode }) => {
  const [qrLoaded, setQrLoaded] = useState(false);
  const [qrError, setQrError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const getQrCodeUrl = (code) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(code)}`;
  };

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
      <div className="w-48 h-48 bg-gray-800 rounded-lg flex items-center justify-center shadow-inner">
        <p className="text-gray-400 text-sm">Código no disponible</p>
      </div>
    );
  }

  return (
    <div 
      className={`bg-gradient-to-b from-white to-gray-100 p-4 rounded-lg inline-block shadow-lg transition-all duration-300 ${isHovered ? 'shadow-red-500/20 scale-[1.02]' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-[220px] h-[220px]">
        {!qrLoaded && !qrError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
          </div>
        )}
        
        {!qrError ? (
          <img 
            src={getQrCodeUrl(ticketCode)}
            alt={`Código QR: ${ticketCode}`}
            width={220}
            height={220}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`${qrLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 rounded-md`}
          />
        ) : (
          <div className="w-[220px] h-[220px] bg-white flex flex-col items-center justify-center border border-red-200 rounded-md">
            <AlertTriangle size={32} className="text-red-500 mb-3" />
            <div className="text-black text-xs text-center p-2">
              <span className="font-bold">CÓDIGO DE ENTRADA</span>
              <br/>
              <span className="text-red-600">Error al generar QR</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-3 bg-gray-900 px-3 py-2 rounded text-white text-xs text-center break-all font-mono">
        {ticketCode}
      </div>
    </div>
  );
};

const BookingConfirmation = () => {
  const { selectedSeats, totalPrice, resetBooking, stopReservationTimeout } = useBookingStore();
  const { movieSelected } = useMovieStore();
  const { clearGuestData, isGuestCheckout } = useUserStore();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState('next');
  const router = useRouter();

  // Función más robusta para recuperar los tickets
  const getSavedTickets = () => {
    try {
      if (typeof window === 'undefined') return [];
      
      const savedTickets = localStorage.getItem('lastPurchasedTickets');
      if (!savedTickets) return [];
      
      const parsedData = JSON.parse(savedTickets);
      
      // Normalizar los datos
      if (!Array.isArray(parsedData)) return [];
      
      // Manejar caso de array anidado
      if (parsedData.length > 0 && Array.isArray(parsedData[0])) {
        return parsedData.flatMap(innerArray => 
          Array.isArray(innerArray) ? innerArray : []
        );
      }
      
      return parsedData;
    } catch (error) {
      console.error('Error al procesar tickets:', error);
      return [];
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleInit = async () => {
      try {
        if (typeof stopReservationTimeout === 'function') {
          stopReservationTimeout();
        }
        
        localStorage.removeItem('paymentInProgress');
        
        if (isGuestCheckout && typeof clearGuestData === 'function') {
          clearGuestData();
        }
        
        const savedTickets = getSavedTickets();
        
        if (savedTickets.length > 0) {
          setTickets(savedTickets);
        }
      } catch (error) {
        console.error('Error al inicializar página de confirmación:', error);
      } finally {
        setLoading(false);
      }
    };
    
    handleInit();
  }, [stopReservationTimeout, clearGuestData, isGuestCheckout]);

  const handleDownloadTickets = () => {
    if (!tickets || tickets.length === 0 || currentTicketIndex >= tickets.length) {
      alert('No hay entradas disponibles para descargar.');
      return;
    }

    const currentTicket = tickets[currentTicketIndex];
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentTicket.ticketCode || 'nocode')}`;
    
    // Fecha formateada
    const formatDate = (dateString) => {
      if (!dateString) return 'Fecha no disponible';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { 
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    };
    
    // Crear contenido HTML para el ticket
    const ticketHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Entrada Cinema Barcelona</title>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #f1f1f1;
          }
          .ticket-container {
            max-width: 800px;
            margin: 40px auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            position: relative;
          }
          .ticket-header {
            background: linear-gradient(to right, #1a1a1a, #333);
            color: white;
            padding: 25px 30px;
            position: relative;
          }
          .ticket-title {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
          }
          .ticket-subtitle {
            margin: 5px 0 0;
            font-size: 14px;
            color: rgba(255,255,255,0.7);
          }
          .corner-design {
            position: absolute;
            bottom: -20px;
            left: 0;
            width: 100%;
            height: 20px;
            overflow: hidden;
          }
          .corner-design::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: white;
            border-radius: 50% 50% 0 0;
          }
          .ticket-body {
            padding: 30px;
            display: flex;
          }
          .ticket-qr {
            flex: 0 0 auto;
            margin-right: 40px;
            text-align: center;
          }
          .ticket-qr img {
            max-width: 180px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .ticket-info {
            flex: 1;
          }
          .movie-title {
            font-size: 24px;
            font-weight: 500;
            margin: 0 0 20px 0;
            color: #e50914;
          }
          .ticket-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .ticket-detail {
            margin-bottom: 5px;
          }
          .ticket-label {
            font-size: 12px;
            color: #777;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .ticket-value {
            font-size: 16px;
            color: #333;
            font-weight: 500;
          }
          .ticket-footer {
            padding: 20px 30px;
            background: #f8f8f8;
            text-align: center;
            font-size: 13px;
            color: #777;
            border-top: 1px dashed #e5e5e5;
          }
          .ticket-code {
            font-family: monospace;
            font-size: 12px;
            color: #666;
            margin-top: 10px;
            padding: 6px;
            background: #f1f1f1;
            border-radius: 4px;
            word-break: break-all;
          }
          .divider {
            display: flex;
            align-items: center;
            margin: 15px 0;
          }
          .divider-line {
            flex-grow: 1;
            height: 1px;
            background-color: #e5e5e5;
          }
          .divider-circle {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background-color: #e50914;
            margin: 0 4px;
          }
          @media print {
            body {
              background: white;
            }
            .ticket-container {
              box-shadow: none;
              margin: 0;
              width: 100%;
              max-width: none;
            }
            .no-print {
              display: none;
            }
          }
          @media (max-width: 600px) {
            .ticket-body {
              flex-direction: column;
            }
            .ticket-qr {
              margin-right: 0;
              margin-bottom: 30px;
            }
            .ticket-details {
              grid-template-columns: 1fr;
            }
          }
        </style>
      </head>
      <body>
        <div class="ticket-container">
          <div class="ticket-header">
            <h1 class="ticket-title">Cinema Barcelona</h1>
            <p class="ticket-subtitle">Tu entrada de cine</p>
            <div class="corner-design"></div>
          </div>
          
          <div class="ticket-body">
            <div class="ticket-qr">
              <img src="${qrCodeUrl}" alt="Código QR de entrada">
              <div class="ticket-code">${currentTicket.ticketCode || 'N/A'}</div>
            </div>
            
            <div class="ticket-info">
              <h2 class="movie-title">${movieSelected?.movie?.title || currentTicket.screening?.movie?.title || 'Película'}</h2>
              
              <div class="ticket-details">
                <div class="ticket-detail">
                  <div class="ticket-label">FECHA</div>
                  <div class="ticket-value">${currentTicket.screening?.date ? formatDate(currentTicket.screening.date) : 'No disponible'}</div>
                </div>
                
                <div class="ticket-detail">
                  <div class="ticket-label">HORA</div>
                  <div class="ticket-value">${currentTicket.screening?.startTime || movieSelected?.startTime || 'No disponible'} h</div>
                </div>
                
                <div class="ticket-detail">
                  <div class="ticket-label">SALA</div>
                  <div class="ticket-value">${currentTicket.screening?.room?.name || movieSelected?.room?.name || 'No disponible'}</div>
                </div>
                
                <div class="ticket-detail">
                  <div class="ticket-label">ASIENTO</div>
                  <div class="ticket-value">Fila ${currentTicket.seats?.row || '?'}, Asiento ${currentTicket.seats?.number || '?'}</div>
                </div>
                
                <div class="ticket-detail">
                  <div class="ticket-label">TIPO</div>
                  <div class="ticket-value">${currentTicket.ticketTypeCode || 'Normal'}</div>
                </div>
                
                <div class="ticket-detail">
                  <div class="ticket-label">PRECIO</div>
                  <div class="ticket-value">${currentTicket.price ? `€${currentTicket.price.toFixed(2)}` : 'No disponible'}</div>
                </div>
              </div>

              <div class="divider">
                <div class="divider-line"></div>
                <div class="divider-circle"></div>
                <div class="divider-circle"></div>
                <div class="divider-circle"></div>
                <div class="divider-circle"></div>
                <div class="divider-circle"></div>
                <div class="divider-line"></div>
              </div>
              
              <p>Esta entrada contiene un código QR único que deberá ser escaneado en la entrada del cine. No compartas esta entrada con terceros, ya que solo puede ser utilizada una vez.</p>
            </div>
          </div>
          
          <div class="ticket-footer">
            <p>Cinema Barcelona - Avenida Diagonal 123, Barcelona - Tel: 932 123 456</p>
            <p>Entrada válida únicamente para la fecha y hora indicadas. No se permiten devoluciones.</p>
          </div>
        </div>
        
        <div class="no-print" style="text-align: center; margin: 30px auto;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #e50914; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: 500;">Imprimir Entrada</button>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;
    
    // Abrir una nueva ventana con el HTML del ticket
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(ticketHtml);
      printWindow.document.close();
    } else {
      alert('Por favor, permite ventanas emergentes para descargar tu entrada.');
    }
  };

  const handleBackToCatalog = () => {
    if (typeof resetBooking === 'function') {
      resetBooking();
    }
    router.push('/');
  };

  const changeTicket = (direction) => {
    if (tickets.length <= 1 || isAnimating) return;
    
    setIsAnimating(true);
    setAnimationDirection(direction);
    
    setTimeout(() => {
      if (direction === 'next') {
        setCurrentTicketIndex((prev) => (prev + 1) % tickets.length);
      } else {
        setCurrentTicketIndex((prev) => (prev - 1 + tickets.length) % tickets.length);
      }
      
      // Resetear la animación después de cambiar
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }, 200);
  };

  // Formatear fecha para mostrar de manera amigable
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha por confirmar';

    const date = new Date(dateString);
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-600 border-t-red-500"></div>
        <p className="mt-6 font-light text-xl">Cargando tus entradas...</p>
      </div>
    );
  }

  // Verificar si hay tickets disponibles
  const hasTickets = tickets && tickets.length > 0;
  const currentTicket = hasTickets ? tickets[currentTicketIndex] : null;
  
  // Asegurarse de que currentTicketIndex es válido
  if (hasTickets && (currentTicketIndex < 0 || currentTicketIndex >= tickets.length)) {
    setCurrentTicketIndex(0);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white pb-16">
      {/* Decoración superior */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-red-800/20 to-transparent"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-12 relative z-10">
        {/* Cabecera y confirmación */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center justify-center mb-6 bg-gradient-to-br from-red-500 to-red-700 w-20 h-20 rounded-full shadow-lg shadow-red-500/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-light mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Reserva Confirmada</h1>
          <p className="text-gray-400 text-lg">
            Tu pago ha sido procesado y tus entradas están listas
          </p>
        </div>

        {hasTickets ? (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
            {/* Información de la película y función */}
            <div className="bg-gradient-to-r from-gray-900 to-black p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-light text-red-500 mb-4">
                {movieSelected?.movie?.title || currentTicket?.screening?.movie?.title || "Tu película"}
              </h2>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-gray-300 text-sm bg-gray-800/80 px-3 py-1.5 rounded-full">
                  <Calendar size={15} className="mr-2 text-red-500" />
                  <span>{currentTicket?.screening?.date ? formatDate(currentTicket.screening.date) : 'Fecha no disponible'}</span>
                </div>
                {(movieSelected?.startTime || currentTicket?.screening?.startTime) && (
                  <div className="flex items-center text-gray-300 text-sm bg-gray-800/80 px-3 py-1.5 rounded-full">
                    <Clock size={15} className="mr-2 text-red-500" />
                    <span>{movieSelected?.startTime || currentTicket?.screening?.startTime}h</span>
                  </div>
                )}
                <div className="flex items-center text-gray-300 text-sm bg-gray-800/80 px-3 py-1.5 rounded-full">
                  <MapPin size={15} className="mr-2 text-red-500" />
                  <span>{movieSelected?.room?.name || currentTicket?.screening?.room?.name || "Sala"}</span>
                </div>
              </div>
            </div>

            {/* Divider with film reel design */}
            <div className="flex items-center w-full bg-gray-800/80">
              <div className="flex-grow h-px bg-gray-700"></div>
              <div className="flex space-x-1.5 mx-4 py-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-red-500"></div>
                ))}
              </div>
              <div className="flex-grow h-px bg-gray-700"></div>
            </div>

            {/* Contenido principal */}
            <div className="p-6 md:p-8">
              {/* Grid responsivo para asientos */}
              <div className="mb-8">
                <h3 className="text-xl font-light mb-4 text-gray-200 flex items-center">
                  <Users size={16} className="mr-2 text-red-500" />
                  Tus asientos
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {tickets.map((ticket, index) => (
                    <div 
                      key={index} 
                      className={`px-4 py-3.5 bg-gray-800/80 rounded-lg border transition-all duration-200 cursor-pointer
                        ${index === currentTicketIndex 
                          ? 'border-red-500 shadow-lg shadow-red-500/10 scale-[1.02]' 
                          : 'border-gray-700 hover:border-gray-500'}`}
                      onClick={() => setCurrentTicketIndex(index)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-medium">
                          {ticket.seats?.row || "?"}{ticket.seats?.number || "?"}
                        </span>
                        <span className="text-xs text-gray-400 uppercase px-2 py-0.5 bg-gray-900/80 rounded">
                          {ticket.ticketTypeCode || 'normal'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total price */}
              <div className="mt-6 pt-6 border-t border-gray-800 flex justify-between items-center">
                <span className="text-gray-400 flex items-center">
                  <Tag size={16} className="mr-2 text-red-500" />
                  Total pagado
                </span>
                <span className="text-2xl md:text-3xl font-light">€{typeof totalPrice === 'number' && !isNaN(totalPrice) ? totalPrice.toFixed(2) : '0.00'}</span>
              </div>

              {/* Current ticket QR code with pagination if multiple tickets */}
              <div className="mt-10">
                {tickets.length > 1 && (
                  <div className="flex justify-between items-center mb-6">
                    <button 
                      onClick={() => changeTicket('prev')}
                      disabled={isAnimating}
                      className="p-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-700 rounded-full transition-colors group"
                      aria-label="Ticket anterior"
                    >
                      <ArrowLeft size={18} className="group-hover:text-red-400 transition-colors" />
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-300 text-sm md:text-base">
                        Entrada <span className="text-white font-medium">{currentTicketIndex + 1}</span> de <span className="text-white font-medium">{tickets.length}</span>
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => changeTicket('next')}
                      disabled={isAnimating}
                      className="p-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-700 rounded-full transition-colors group"
                      aria-label="Ticket siguiente"
                    >
                      <ArrowRight size={18} className="group-hover:text-red-400 transition-colors" />
                    </button>
                  </div>
                )}
                
                <div className="flex justify-center items-center min-h-[350px]">
                  <div 
                    className={`transform transition-all duration-500 text-center
                      ${isAnimating 
                        ? animationDirection === 'next'
                          ? 'translate-x-full opacity-0 scale-90'
                          : '-translate-x-full opacity-0 scale-90' 
                        : 'translate-x-0 opacity-100'}`}
                  >
                    {currentTicket?.ticketCode ? (
                      <SimpleTicketQR ticketCode={currentTicket.ticketCode} />
                    ) : (
                      <div className="w-56 h-56 bg-gray-800 flex items-center justify-center rounded-lg">
                        <div className="text-center px-6">
                          <AlertTriangle size={24} className="text-red-500 mx-auto mb-3" />
                          <p className="text-gray-400">Código QR no disponible</p>
                        </div>
                      </div>
                    )}
                    <p className="mt-4 text-gray-400 text-sm">Presenta este código en la entrada</p>
                  </div>
                </div>
              </div>

              {/* Instrucciones */}
              <div className="mt-8 md:mt-12 bg-gradient-to-br from-gray-800/60 to-gray-900/80 rounded-xl p-6 backdrop-blur-sm border border-gray-800">
                <h3 className="text-xl font-light mb-4 text-red-500">Información importante</h3>
                <ul className="space-y-4 text-gray-300 text-sm md:text-base">
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 text-red-500 flex-shrink-0">•</div>
                    <p>Llega <span className="text-white">15 minutos antes</span> del inicio de la película para evitar aglomeraciones</p>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 text-red-500 flex-shrink-0">•</div>
                    <p>Muestra el <span className="text-white">código QR</span> o el email de confirmación en la entrada del cine</p>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 text-red-500 flex-shrink-0">•</div>
                    <p>Descarga o imprime tu entrada para un <span className="text-white">acceso más rápido</span></p>
                  </li>
                </ul>
              </div>

              {/* Buttons */}
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleDownloadTickets}
                  className="relative overflow-hidden rounded-lg group transition-all"
                >
                  <div className="absolute inset-0 w-3 bg-gradient-to-r from-red-600 to-red-700 group-hover:w-full transition-all duration-300"></div>
                  <div className="relative px-8 py-4 bg-transparent border border-red-500 rounded-lg group-hover:border-transparent flex items-center justify-center transition-all">
                    <Download className="mr-3 group-hover:text-white transition-colors" size={20} />
                    <span className="font-medium text-lg group-hover:text-white transition-colors">Descargar entrada</span>
                  </div>
                </button>

                <button
                  onClick={handleBackToCatalog}
                  className="px-8 py-4 rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors group flex items-center justify-center"
                >
                  <Ticket className="mr-3 group-hover:text-red-400 transition-colors" size={20} />
                  <span className="font-medium text-lg">Volver al catálogo</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-800">
            <div className="text-center py-12">
              <AlertTriangle size={48} className="text-red-500 mx-auto mb-6 opacity-70" />
              <h2 className="text-2xl font-light mb-4 text-gray-200">No se encontraron entradas</h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                No se encontraron detalles de tus entradas. Si has completado una compra, contacta con atención al cliente.
              </p>
              <button
                onClick={handleBackToCatalog}
                className="px-8 py-4 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg shadow-red-600/20 mx-auto flex items-center justify-center"
              >
                <Ticket className="mr-2" size={20} />
                <span className="font-medium text-lg">Volver al catálogo</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Cinema Barcelona — Avenida Diagonal 123, Barcelona</p>
          <p className="mt-1">© 2025 Cinema Barcelona | Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;