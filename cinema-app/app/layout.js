'use client';

import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { montserrat }  from "@/lib/fonts";
import GestorSesionUsuario from "@/components/GestorSesionUsuario";
import { useUserStore } from "@/store/userStore";
import AdminNavbar from "@/components/layout/AdminNavbar"; // Vamos a crear este componente

export default function RootLayout({ children }) {
  const { user } = useUserStore();
  
  // Verifica si el usuario está logueado y es admin
  const isAdmin = user && user.role === 'admin';

  return (
    <html lang="en">
      <body
        className={`${montserrat.className} antialiased`}
      >
        <GestorSesionUsuario/>
        <header>
          {isAdmin ? (
            <AdminNavbar />
          ) : (
            <Navbar />
          )}
        </header>
        {children}
      </body>
    </html>
  );
}