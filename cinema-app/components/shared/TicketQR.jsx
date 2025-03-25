import React from 'react';
import QRCode from 'react-qr-code';

const TicketQR = ({ ticketCode }) => {
  if (!ticketCode) return <p>Código no disponible</p>;
  
  return (
    <div className="ticket-qr flex flex-col items-center my-4">
      <QRCode 
        value={ticketCode} 
        size={128} 
        level="H"
        className="qr-code"
      />
      <p className="ticket-code text-sm text-gray-600 mt-2">{ticketCode}</p>
    </div>
  );
};

export default TicketQR;