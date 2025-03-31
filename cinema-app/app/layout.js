// /app/layout.js - SIN 'use client'
import "./globals.css";
import { montserrat } from "@/lib/fonts";
import GestorSesionUsuario from "@/components/GestorSesionUsuario";
import NavbarWrapper from "@/components/layout/NavbarWrapper"; // Crearemos este componente

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
       <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      </head>
      <body className={`${montserrat.className} antialiased bg-black`}>
        <GestorSesionUsuario />
        <NavbarWrapper />
        <main className="pt-32"> 
          {children}
        </main>
      </body>
    </html>
  );
}