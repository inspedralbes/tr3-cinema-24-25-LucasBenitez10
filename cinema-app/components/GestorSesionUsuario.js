'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/userStore';

// Tiempo en milisegundos (5 minutos = 300000ms)
const TIEMPO_INACTIVIDAD = 300000;

const GestorSesionUsuario = () => {
  const { clearGuestData, isGuestCheckout, user } = useUserStore();
  
  useEffect(() => {
    let temporizadorInactividad;
    
    // Solo configurar temporizadores si el usuario está en modo invitado
    if (isGuestCheckout && (!user || !user.name)) {
      // Función para reiniciar el temporizador de inactividad
      const reiniciarTemporizadorInactividad = () => {
        if (temporizadorInactividad) {
          clearTimeout(temporizadorInactividad);
        }
        
        temporizadorInactividad = setTimeout(() => {
          console.log('Usuario inactivo durante 5 minutos, limpiando datos de invitado');
          clearGuestData();
        }, TIEMPO_INACTIVIDAD);
      };
      
      // Establecer temporizador inicial
      reiniciarTemporizadorInactividad();
      
      // Agregar event listeners para la actividad del usuario
      const eventosActividad = [
        'mousedown', 'mousemove', 'keypress', 
        'scroll', 'touchstart', 'click'
      ];
      
      // Agregar listener para cada evento de actividad
      eventosActividad.forEach(tipoEvento => {
        window.addEventListener(tipoEvento, reiniciarTemporizadorInactividad);
      });
      
      // Manejar cierre de página
      const manejarCierre = () => {
        clearGuestData();
      };
      
      window.addEventListener('beforeunload', manejarCierre);
      
      // Limpiar event listeners al desmontar el componente
      return () => {
        if (temporizadorInactividad) {
          clearTimeout(temporizadorInactividad);
        }
        
        eventosActividad.forEach(tipoEvento => {
          window.removeEventListener(tipoEvento, reiniciarTemporizadorInactividad);
        });
        
        window.removeEventListener('beforeunload', manejarCierre);
      };
    }
  }, [clearGuestData, isGuestCheckout, user]);
  
  // Este componente no renderiza nada
  return null;
};

export default GestorSesionUsuario;