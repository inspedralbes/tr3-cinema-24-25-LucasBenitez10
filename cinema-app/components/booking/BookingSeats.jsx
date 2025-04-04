'use client';
import React, { useState, useEffect } from 'react';
import { useMovieStore } from '@/store/moviesStore';
import { useBookingStore } from '@/store/bookingStore'
import { useRouter } from 'next/navigation';

export default function BookingSeats() {
  const movieSelected = useMovieStore((state) => state.movieSelected);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatLayout, setSeatLayout] = useState({
    rows: [],
    seatsPerRow: 0,
    occupiedSeats: []
  });
  const {assignSeats, nextStep } = useBookingStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleBuyTickets = () => {
    assignSeats(selectedSeats);
    nextStep();
  }
  

  useEffect(() => {
    const fetchOccupiedSeats = async () => {
      if (movieSelected && movieSelected._id) {
        try {
          setIsLoading(true);
          setError(null);
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/seat-status/${movieSelected._id}`);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Error de API:', errorData);
            throw new Error(errorData.message || 'Error al obtener los asientos ocupados');
          }
          
          const data = await response.json();
          
          
      
          const occupiedSeatsIds = data
            .filter(seat => seat.status === 'occupied')
            .map(seat => seat.seatId);
          
          
          
       
          setSeatLayout(prevLayout => ({
            ...prevLayout,
            occupiedSeats: occupiedSeatsIds
          }));
        } catch (error) {
          console.error('Error al cargar asientos ocupados:', error);
          setError('No se pudieron cargar los asientos ocupados. Los asientos mostrados podrían no estar actualizados.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchOccupiedSeats();
  }, [movieSelected]);
  

  useEffect(() => {
    if (movieSelected && movieSelected.availableSeats) {
      
      const totalSeats = movieSelected.availableSeats;
      generateSeatLayout(totalSeats);
    }
  }, [movieSelected]);
  
 
  const generateSeatLayout = (totalSeats) => {
    
    if (typeof totalSeats === 'number') {
      
      let seatsPerRow;
      if (totalSeats <= 48) seatsPerRow = 8;
      else if (totalSeats <= 80) seatsPerRow = 10;
      else if (totalSeats <= 112) seatsPerRow = 12;
      else if (totalSeats <= 144) seatsPerRow = 14;
      else seatsPerRow = 16;
      
     
      const numRows = Math.ceil(totalSeats / seatsPerRow);
      
      
      const rowLetters = Array.from({ length: numRows }, (_, i) => 
        String.fromCharCode(65 + i)
      );
      
      setSeatLayout(prevLayout => ({
        rows: rowLetters,
        seatsPerRow: seatsPerRow,
        occupiedSeats: prevLayout.occupiedSeats 
      }));
    } 
    else if (typeof totalSeats === 'object' && !Array.isArray(totalSeats)) {
      if (totalSeats.numRows && totalSeats.seatsPerRow) {
        const rowLetters = Array.from({ length: totalSeats.numRows }, (_, i) => 
          String.fromCharCode(65 + i)
        );
        
        setSeatLayout(prevLayout => ({
          rows: rowLetters,
          seatsPerRow: totalSeats.seatsPerRow,
          occupiedSeats: prevLayout.occupiedSeats.length > 0 
            ? prevLayout.occupiedSeats 
            : totalSeats.occupied || []
        }));
      }
    }
    else if (Array.isArray(totalSeats)) {
      const seatIds = totalSeats;
      
     
      const rowLetters = [...new Set(seatIds.map(id => id[0]))].sort();
      
      
      const maxSeatNum = Math.max(...seatIds.map(id => parseInt(id.substring(1))));
      
      setSeatLayout(prevLayout => ({
        rows: rowLetters,
        seatsPerRow: maxSeatNum,
        occupiedSeats: prevLayout.occupiedSeats
      }));
    }
   
    else {
      console.warn("No se pudo determinar la estructura de asientos desde availableSeats");
      setSeatLayout(prevLayout => ({
        rows: ['A', 'B', 'C', 'D'],
        seatsPerRow: 10,
        occupiedSeats: prevLayout.occupiedSeats 
      }));
    }
  };
  
  
  const isOccupied = (seatId) => {
   
    if (seatLayout.occupiedSeats && seatLayout.occupiedSeats.length > 0) {
      if (seatLayout.occupiedSeats.includes(seatId)) {
        return true;
      }
    }
   
    if (Array.isArray(movieSelected?.availableSeats)) {
      return !movieSelected.availableSeats.includes(seatId);
    }
    
    return false;
  };
  
  const toggleSeat = (seatId) => {
    if (isOccupied(seatId)) {
      return;
    }
    
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(seat => seat !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };
  
  const getSeatStatus = (seatId) => {
    if (isOccupied(seatId)) return 'occupied';
    if (selectedSeats.includes(seatId)) return 'selected';
    return 'available';
  };
  
  const getSeatClasses = (status) => {
    switch (status) {
      case 'occupied':
        return 'bg-gray-800 cursor-not-allowed opacity-50';
      case 'selected':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-700 hover:bg-gray-600 cursor-pointer text-gray-300';
    }
  };

  
  return (
    <div className="mx-auto max-w-4xl p-4 min-h-screen bg-black text-white py-12">
      {movieSelected?.movie ? (
        <>
          <h2 className="text-2xl font-light text-center mb-12 text-white">Selección de Asientos</h2>
          
          {/* Título de la película */}
          <h3 className="text-xl font-medium text-center mb-8 text-red-500">"{movieSelected.movie.title}"</h3>
          
          {/* Información de capacidad */}
          <div className="text-center mb-8 text-gray-400 text-sm">
            <p>Capacidad de la sala: {typeof movieSelected.availableSeats === 'number' 
              ? movieSelected.availableSeats 
              : (Array.isArray(movieSelected.availableSeats) 
                ? movieSelected.availableSeats.length 
                : `${seatLayout.rows.length} filas x ${seatLayout.seatsPerRow} asientos`)}</p>
          </div>
          
          {/* Pantalla */}
          <div className="w-full bg-gray-800 h-10 rounded mb-16 flex items-center justify-center text-sm text-gray-400">
            PANTALLA
          </div>
          
          {/* Mensajes de error */}
          {error && (
            <div className="mb-8 p-4 bg-red-900/50 border border-red-800 rounded-md text-center text-sm">
              <p>{error}</p>
            </div>
          )}
          
          {/* Indicador de carga */}
          {isLoading && (
            <div className="text-center mb-8">
              <div className="inline-block animate-spin h-6 w-6 border-t-2 border-red-500 rounded-full"></div>
              <p className="mt-2 text-gray-400">Cargando estado de asientos...</p>
            </div>
          )}
          
          {/* Asientos */}
          <div className="mb-16 overflow-x-auto">
            <div className="inline-block min-w-full">
              {seatLayout.rows.map((row) => (
                <div key={row} className="flex justify-center mb-3">
                  <div className="w-8 h-8 flex items-center justify-center font-medium text-gray-400">
                    {row}
                  </div>
                  {[...Array(seatLayout.seatsPerRow)].map((_, index) => {
                    const seatNumber = index + 1;
                    const seatId = `${row}${seatNumber}`;
                    const status = getSeatStatus(seatId);
                    
                    return (
                      <div 
                        key={seatId} 
                        className={`w-8 h-8 mx-1 flex items-center justify-center rounded ${getSeatClasses(status)} transition-colors duration-200`}
                        onClick={() => toggleSeat(seatId)}
                        title={`Fila ${row}, Asiento ${seatNumber}`}
                      >
                        {seatNumber}
                      </div>
                    );
                  })}
                  <div className="w-8 h-8 flex items-center justify-center font-medium text-gray-400">
                    {row}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Leyenda */}
          <div className="flex justify-center space-x-10 mb-12 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-700 rounded mr-2"></div>
              <span className="text-gray-300">Disponible</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-600 rounded mr-2"></div>
              <span className="text-gray-300">Seleccionado</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-800 opacity-50 rounded mr-2"></div>
              <span className="text-gray-300">Ocupado</span>
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
          
          {/* Resumen */}
          <div className="bg-gray-900 p-6 rounded border border-gray-800 max-w-xl mx-auto">
            <div className="mb-2">
              <span className="text-lg font-light text-red-500">Sala: <span className="text-white">{movieSelected.room.name}</span></span>
            </div>
            <div className="flex justify-between mb-6 mt-4">
              <span className="text-gray-400">Asientos seleccionados:</span>
              <span className="font-medium">{selectedSeats.sort().join(', ') || 'Ninguno'}</span>
            </div>            
            <button 
              className={`w-full mt-6 py-3 rounded font-medium transition-colors duration-200 ${selectedSeats.length > 0 ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
              disabled={selectedSeats.length === 0}
              onClick={handleBuyTickets}
            >
              Confirmar selección
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-10">
          <p className="text-lg text-gray-400">No se ha seleccionado ninguna película</p>
        </div>
      )}
    </div>
  );
}