'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/store/userStore';
import useAuth from '@/hooks/auth/useAuth';

function Navbar() {
  const { user, clearUser } = useUserStore();
  const isUserLoggedIn = user.email && user.email.trim().length > 0;
  const { handleLogout } = useAuth();

  const handleClickLogout = () => {
    handleLogout();
  };

  return (
    <div className="w-full bg-gray-900 border-b border-gray-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <div className="text-red-500 font-medium text-xl">
              Cinema Barcelona
              {/* <img src="#" alt="logo cine barcelona"/> */}
            </div>
          </div>

          <nav className="flex">
            <ul className="flex items-center space-x-6">
              {!isUserLoggedIn ? (
                <>
                  <li>
                    <Link href="/login" className="text-gray-300 hover:text-white transition-colors duration-200">
                      Iniciar sesión
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white transition-colors duration-200">
                      Registrarse
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link 
                      href="/perfil" 
                      className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Mi Perfil
                    </Link>
                  </li>
                  <li>
                    <button 
                      onClick={handleClickLogout} 
                      className="px-4 py-2 rounded border border-red-600 text-red-500 hover:bg-red-600 hover:text-white transition-colors duration-200"
                    >
                      Cerrar Sesión
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>

      {/* Divider with film reel design */}
      <div className="flex items-center w-full">
        <div className="flex-grow h-px bg-gray-800"></div>
        <div className="flex space-x-1 mx-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
          ))}
        </div>
        <div className="flex-grow h-px bg-gray-800"></div>
      </div>
    </div>
  );
}

export default Navbar;