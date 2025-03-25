'use client';

import React, { useState, useEffect } from 'react';
import { useBookingStore } from '@/store/bookingStore';
import Link from 'next/link';
import TicketQR from '@/components/shared/TicketQR';

const BookingConfirmation = () => {
  const { selectedSeats, totalPrice, resetBooking } = useBookingStore();
  const [tickets, setTickets] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedTickets = localStorage.getItem('lastPurchasedTickets');
      if (savedTickets) {
        setTickets(JSON.parse(savedTickets));
      }
    } catch (error) {
      console.error('Error al cargar tickets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDownloadTickets = () => {
    alert('La funcionalidad de descarga de boletos estará disponible próximamente.');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-red-500 border-r-transparent"></div>
        <p className="mt-4 font-light">Cargando tus entradas...</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Hora no disponible';
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with minimalist confirmation */}
        <div className="text-center mb-12">
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
            <div className="mb-10">
              <h2 className="text-2xl font-medium text-red-500 mb-4">
                {tickets[0].screeningDetails?.movieTitle || 'Película'}
              </h2>
              
              <div className="flex items-center space-x-3 mb-6 text-lg">
                <span className="text-gray-400">{formatDate(tickets[0].screeningDetails?.date)}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span className="text-gray-200">{formatTime(tickets[0].screeningDetails?.date)}</span>
              </div>
              
              <div className="flex items-center space-x-8 text-sm text-gray-400">
                <div className="flex items-center">
                  <span>SALA</span>
                  <span className="ml-2 px-3 py-1 bg-gray-900 rounded text-white">
                    {tickets[0].screeningDetails?.roomName || 'N/A'}
                  </span>
                </div>
                <div>
                  <span>{tickets.length} {tickets.length === 1 ? 'entrada' : 'entradas'}</span>
                </div>
                <div>
                  <span>#{tickets[0].ticketCode?.substring(0, 6) || 'N/A'}</span>
                </div>
              </div>
            </div>

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

            {/* Seats listing */}
            <div>
              <h3 className="text-lg font-light mb-4 text-gray-300">Tus asientos</h3>
              <div className="grid grid-cols-2 gap-3">
                {tickets.map((ticket, index) => (
                  <div key={index} className="px-4 py-3 bg-gray-900 rounded border border-gray-800">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-medium">
                        {ticket.seat?.row}{ticket.seat?.number}
                      </span>
                      <span className="text-sm text-gray-400 capitalize">
                        {ticket.seat?.type || 'normal'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total price */}
            <div className="mt-8 pt-8 border-t border-gray-800 flex justify-between items-center">
              <span className="text-gray-400">Total pagado</span>
              <span className="text-2xl">€{totalPrice.toFixed(2)}</span>
            </div>

            {/* QR code */}
            <div className="mt-12 flex justify-center">
              <div className="text-center">
                <TicketQR ticketCode={tickets[0].ticketCode} />
                <p className="mt-3 text-sm text-gray-400">Presenta este código en la entrada</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 bg-gray-900 rounded-lg text-center">
            <p className="text-gray-400">
              No se encontraron detalles de tus entradas. Si has completado una compra, contacta con atención al cliente.
            </p>
          </div>
        )}

        {/* Simple instructions */}
        <div className="mb-12 bg-gray-900 rounded-lg p-6">
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

          <Link href="/peliculas" legacyBehavior>
            <a
              className="w-full bg-transparent hover:bg-gray-900 text-white border border-gray-700 py-3 px-6 rounded font-medium text-center"
              onClick={resetBooking}
            >
              Volver al catálogo
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;