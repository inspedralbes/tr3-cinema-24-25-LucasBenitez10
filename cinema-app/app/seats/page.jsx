'use client';

import React, { useState } from 'react';
import { useMovieStore }  from '@/store/moviesStore';

const CinemaSeats = () => {
  const movieSelected = useMovieStore((state) => state.movieSelected);
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 12;
  const [selectedSeats, setSelectedSeats] = useState([]);
  const occupiedSeats = [];
  
  const toggleSeat = (seatId) => {
    if (occupiedSeats.includes(seatId)) {
      return;
    }
    
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(seat => seat !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };
  
  const getSeatStatus = (seatId) => {
    if (occupiedSeats.includes(seatId)) return 'occupied';
    if (selectedSeats.includes(seatId)) return 'selected';
    return 'available';
  };
  
  const getSeatClasses = (status) => {
    switch (status) {
      case 'occupied':
        return 'bg-gray-500 cursor-not-allowed opacity-50';
      case 'selected':
        return 'bg-green-500 text-white';
      default:
        return 'bg-blue-100 hover:bg-blue-300 cursor-pointer';
    }
  };
  
  const ticketPrice = 8.5; 
  const totalPrice = selectedSeats.length * ticketPrice;
  
  return (
    <div className="mx-auto max-w-4xl p-4">

      <h2 className="text-2xl font-bold text-center mb-8">Selección de Asientos para "{ movieSelected.title}"</h2>
      <span></span>
      
      {/* Pantalla */}
      <div className="w-full bg-gray-300 h-8 rounded-t-lg mb-10 flex items-center justify-center text-sm text-gray-700">
        PANTALLA
      </div>
      
      {/* Asientos */}
      <div className="mb-10">
        {rows.map((row) => (
          <div key={row} className="flex justify-center mb-2">
            <div className="w-8 h-8 flex items-center justify-center font-bold">
              {row}
            </div>
            {[...Array(seatsPerRow)].map((_, index) => {
              const seatNumber = index + 1;
              const seatId = `${row}${seatNumber}`;
              const status = getSeatStatus(seatId);
              
              return (
                <div 
                  key={seatId} 
                  className={`w-8 h-8 mx-1 flex items-center justify-center rounded-t-lg ${getSeatClasses(status)} transition-colors duration-200`}
                  onClick={() => toggleSeat(seatId)}
                  title={`Fila ${row}, Asiento ${seatNumber}`}
                >
                  {seatNumber}
                </div>
              );
            })}
            <div className="w-8 h-8 flex items-center justify-center font-bold">
              {row}
            </div>
          </div>
        ))}
      </div>
      
      {/* Leyenda */}
      <div className="flex justify-center space-x-8 mb-6">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-blue-100 rounded-t-lg mr-2"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-green-500 rounded-t-lg mr-2"></div>
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-gray-500 opacity-50 rounded-t-lg mr-2"></div>
          <span>Ocupado</span>
        </div>
      </div>
      
      {/* Resumen */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between mb-2">
          <span>Asientos seleccionados:</span>
          <span className="font-medium">{selectedSeats.sort().join(', ') || 'Ninguno'}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Precio por asiento:</span>
          <span>{ticketPrice.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>{totalPrice.toFixed(2)} €</span>
        </div>
        
        <button 
          className={`w-full mt-4 py-2 rounded-lg text-white font-medium ${selectedSeats.length > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
          disabled={selectedSeats.length === 0}
        >
          Confirmar selección
        </button>
      </div>
    </div>
  );
};

export default CinemaSeats;