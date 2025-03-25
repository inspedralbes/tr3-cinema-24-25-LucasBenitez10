import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { montserrat }  from "@/lib/fonts";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={` ${montserrat.className} antialiased`}
      >
        <header>
          <Navbar />
        </header>
        {children}
      </body>
    </html>
  );
}
