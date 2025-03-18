'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/store/userStore';
import useAuth from '@/hooks/auth/useAuth';


function Navbar() {
  const { user, clearUser } = useUserStore();
  const isUserLoggedIn = user.email && user.email.trim().length > 0;
  const{ handleLogout } = useAuth()

  const handleClickLogout = () => {
    handleLogout()
  }



  useEffect(() => {
    console.log('Estado del usuario:', user);
  }, [user]);

  return (
    <div className="flex justify-around items-center flex-row gap-4 w-full h-20 bg-red-800 text-white">
      <div>
        <h3>Cinema Barcelona</h3>
        {/* <img src="#" alt="logo cine barcelona"/> */}
      </div>
      <nav>
        <ul className="flex justify-around items-center flex-row gap-10">
          <li><Link href="/peliculas">Películas</Link></li>
          <li><Link href="/promociones">Promociones</Link></li>
          <li><Link href="/experiencias">Experiencias</Link></li>
          <li><Link href="/bonos">Bonos</Link></li>
          {!isUserLoggedIn ? (
            <>
              <li><Link href="/login">Iniciar sesión</Link></li>
              <li><Link href="/register">Registrarse</Link></li>
            </>
          ) : (
            <li><button onClick={ handleClickLogout }>Cerrar Sesión</button></li>
          )}
        </ul>
      </nav>
    </div>
  );
}

export default Navbar;
