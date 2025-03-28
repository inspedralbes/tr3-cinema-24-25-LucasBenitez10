'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import Link from 'next/link';
import { Calendar, Clock, Map, Users, Tag, Download, Printer, ArrowLeft } from 'lucide-react';

// URL base absoluta del backend
const API_URL = 'http://localhost:4000';

export default function TicketDetail() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!params?.id) {
        setError('ID de entrada no proporcionado');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/tickets/${params.id}`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setTicket(data);
      } catch (err) {
        console.error('Error al obtener detalles de la entrada:', err);
        setError('No se pudo cargar la información de la entrada. Intente nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [params?.id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', { 
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const generateQrValue = () => {
    if (!ticket) return '';
    
    // Incluir información esencial en el QR
    return JSON.stringify({
      id: ticket._id,
      movieId: ticket.screening?.movie?.id,
      movieTitle: ticket.screening?.movie?.title,
      date: ticket.screening?.date,
      startTime: ticket.screening?.startTime,
      room: ticket.screening?.room?.name,
      seat: `${ticket.seats?.row}${ticket.seats?.number}`,
      customerEmail: ticket.customer?.email,
      status: ticket.status,
      timestamp: new Date().toISOString()
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Crear un elemento canvas para la conversión
    const canvas = document.createElement('canvas');
    const svg = document.getElementById('ticket-qr');
    const data = new XMLSerializer().serializeToString(svg);
    const win = window.URL || window.webkitURL || window;
    const img = new Image();
    const blob = new Blob([data], { type: 'image/svg+xml' });
    const url = win.createObjectURL(blob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      win.revokeObjectURL(url);

      const imgURI = canvas.toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');

      // Trigger descarga
      const a = document.createElement('a');
      a.href = imgURI;
      a.download = `ticket-${ticket._id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    img.src = url;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando detalles de la entrada...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error al cargar la entrada</h1>
            <p className="text-gray-600 mb-6">{error || 'No se pudo encontrar la entrada solicitada.'}</p>
            <Link href="/perfil" className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors duration-200">
              <ArrowLeft size={18} className="mr-2" />
              Volver a mi perfil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto">
        {/* Botón para volver */}
        <div className="mb-6 print:hidden">
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span>Volver</span>
          </button>
        </div>

        {/* Tarjeta de entrada */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden print:shadow-none">
          {/* Encabezado */}
          <div className="bg-gray-900 px-6 py-4 print:py-6 relative">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-white">Cinema Barcelona</h1>
                <p className="text-gray-400 text-sm">Entrada de cine</p>
              </div>
              <div className="print:hidden flex space-x-3">
                <button 
                  onClick={handlePrint}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-white"
                  title="Imprimir entrada"
                >
                  <Printer size={18} />
                </button>
                <button 
                  onClick={handleDownload}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-white"
                  title="Descargar QR"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Divider with film reel design */}
          <div className="flex items-center w-full">
            <div className="flex-grow h-px bg-gray-200"></div>
            <div className="flex space-x-1 mx-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
              ))}
            </div>
            <div className="flex-grow h-px bg-gray-200"></div>
          </div>

          {/* Contenido de la entrada */}
          <div className="p-6">
            <div className="flex flex-col lg:flex-row">
              {/* Poster de la película + QR */}
              <div className="lg:w-1/3 flex flex-col items-center mb-6 lg:mb-0">
                {ticket.screening?.movie?.poster_path ? (
                  <div className="w-48 h-64 rounded overflow-hidden shadow-md mb-6">
                    <img 
                      src={`https://image.tmdb.org/t/p/w500${ticket.screening.movie.poster_path}`}
                      alt={ticket.screening.movie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-64 bg-gray-200 rounded flex items-center justify-center mb-6">
                    <span className="text-gray-400">Sin imagen</span>
                  </div>
                )}

                {/* QR Code */}
                <div className="p-3 bg-white border rounded shadow-sm">
                  <QRCode 
                    id="ticket-qr"
                    value={generateQrValue()} 
                    size={128}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 text-center">ID: {ticket._id}</p>
              </div>

              {/* Detalles de la película y función */}
              <div className="lg:w-2/3 lg:pl-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {ticket.screening?.movie?.title || 'Película no disponible'}
                </h2>

                {/* Estado del ticket */}
                <div className="mb-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    ticket.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : ticket.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <span className="mr-1 h-2 w-2 rounded-full bg-current"></span>
                    {ticket.status === 'active' ? 'Activo' : 
                     ticket.status === 'cancelled' ? 'Cancelado' : 
                     ticket.status}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <Calendar className="flex-shrink-0 h-5 w-5 text-red-600 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Fecha</p>
                      <p className="text-gray-900">{formatDate(ticket.screening?.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className="flex-shrink-0 h-5 w-5 text-red-600 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Hora</p>
                      <p className="text-gray-900">{ticket.screening?.startTime || 'No disponible'} h</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Map className="flex-shrink-0 h-5 w-5 text-red-600 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Sala</p>
                      <p className="text-gray-900">{ticket.screening?.room?.name || 'No disponible'}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Users className="flex-shrink-0 h-5 w-5 text-red-600 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Asiento</p>
                      <p className="text-gray-900">Fila {ticket.seats?.row}, Asiento {ticket.seats?.number}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Tag className="flex-shrink-0 h-5 w-5 text-red-600 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Precio</p>
                      <p className="text-gray-900">{ticket.price ? `${ticket.price.toFixed(2)} €` : 'No disponible'}</p>
                    </div>
                  </div>
                </div>

                {/* Instrucciones para la entrada */}
                <div className="mt-8 p-4 bg-gray-50 rounded border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Instrucciones</h3>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Presenta este código QR en la entrada del cine</li>
                    <li>Llega 15 minutos antes del inicio de la función</li>
                    <li>Esta entrada es válida solo para la fecha y hora indicadas</li>
                    <li>No se permiten cambios ni devoluciones (excepto cancelación)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-100 px-6 py-4 text-center text-sm text-gray-600 print:bg-white">
            <p>Cinema Barcelona - Avenida Diagonal 123, Barcelona - Tel: 932 123 456</p>
          </div>
        </div>
      </div>
    </div>
  );
}