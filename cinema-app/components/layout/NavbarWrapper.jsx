'use client';

import { useState, useEffect } from 'react';
import Navbar from "@/components/layout/Navbar";
import AdminNavbar from "@/components/layout/AdminNavbar";
import { useUserStore } from "@/store/userStore";

// Este componente se ejecuta solo en el cliente donde es seguro usar Zustand
export default function NavbarWrapper() {
  const { user } = useUserStore();
  const [mounted, setMounted] = useState(false);
  
  // Esperamos a que el componente esté montado en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // No renderizamos nada durante la fase de SSR
  if (!mounted) return null;
  
  // Verifica si el usuario está logueado y es admin
  const isAdmin = user && user.role === 'admin';

  return (
    <header>
      {isAdmin ? <AdminNavbar /> : <Navbar />}
    </header>
  );
}