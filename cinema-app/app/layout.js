import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { montserrat }  from "@/lib/fonts";
import  GestorSesionUsuario  from "@/components/GestorSesionUsuario"


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={` ${montserrat.className} antialiased`}
      >
        <GestorSesionUsuario/>
        <header>
          <Navbar />
        </header>
        {children}
      </body>
    </html>
  );
}
