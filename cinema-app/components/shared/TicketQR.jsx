import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';

const TicketQR = ({ ticketCode }) => {
  const [isClient, setIsClient] = useState(false);

  // Este efecto se asegura de que el componente QR solo se renderice en el cliente
  // Evita errores de hidratación en Next.js
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!ticketCode) {
    return (
      <div className="w-48 h-48 bg-gray-800 flex items-center justify-center rounded">
        <p className="text-gray-400 text-xs">Código no disponible</p>
      </div>
    );
  }

  // Solo renderizamos el QR en el cliente para evitar problemas de SSR
  return (
    <div className="bg-white p-4 rounded-lg inline-block">
      {isClient ? (
        <QRCode
          value={ticketCode}
          size={150}
          level="H"
          includeMargin={true}
          renderAs="svg"
          bgColor="#FFFFFF"
          fgColor="#000000"
        />
      ) : (
        <div className="w-[150px] h-[150px] bg-gray-200 animate-pulse"></div>
      )}
    </div>
  );
};

export default TicketQR;