import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { montserrat }  from "@/lib/fonts";


export default function RootLayout({ children }) {

  // function handleRoleUser() {
  //   if (localStorage.getItem('role') === 'admin') {
  //     return (
  //       <AdminNavbar />
  //     )
  //   }else {
  //     return (
  //       <Navbar />
  //     )
  //   }
  // }
  return (
    <html lang="en">
      <body
        className={` ${montserrat.className} antialiased`}
      >
        <header>
          {/* { handleRoleUser() } */}
          <Navbar />
        </header>
        {children}
      </body>
    </html>
  );
}
