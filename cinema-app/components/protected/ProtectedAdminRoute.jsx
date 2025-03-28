'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

export default function ProtectedAdminRoute({ children }) {
  const router = useRouter();
  const { user } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pequeño delay para asegurar que el estado del usuario se ha cargado desde localStorage
    const timer = setTimeout(() => {
      // Verifica si hay un usuario en el store
      if (!user || !user.email) {
        router.push('/login');
        return;
      }
      
      // Verifica si el usuario tiene rol de admin
      if (user.role !== 'admin') {
        router.push('/');
        return;
      }
      
      // Usuario autenticado y es admin
      setLoading(false);
    }, 300); // Un pequeño delay para que localStorage se cargue
    
    return () => clearTimeout(timer);
  }, [user, router]);

  // Muestra un indicador de carga mientras verifica el acceso
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Si ha pasado la verificación, muestra el contenido protegido
  return children;
}