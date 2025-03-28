'use client';

import Link from 'next/link';
import { useUserStore } from '@/store/userStore';

export default function AdminNavbar() {
    const { clearUser } = useUserStore();
    
    const handleLogout = () => {
        clearUser(); // Asumiendo que existe esta función en tu store
        // Puedes agregar redirección si es necesario
    };

    return (
        <div className="flex justify-around items-center flex-row gap-4 w-full h-20 bg-red-800 text-white">
            <div>
                <h3 className="font-bold text-xl">Cinema Barcelona</h3>
                {/* <img src="#" alt="logo cine barcelona"/> */}
            </div>
            <nav>
                <ul className="flex justify-around items-center flex-row gap-10">
                    <li>
                        <Link href="/administracion" className="hover:text-gray-200 transition-colors">
                            Configuración
                        </Link>
                    </li>
                    <li 
                        className="cursor-pointer hover:text-gray-200 transition-colors"
                        onClick={handleLogout}
                    >
                        Cerrar sesión
                    </li>
                </ul>
            </nav>
        </div>
    );
}