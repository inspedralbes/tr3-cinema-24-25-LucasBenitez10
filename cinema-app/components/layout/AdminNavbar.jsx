import { Link } from 'lucide-react';
import  * as React from 'react';


export default function AdminLayout() {
    return (
        <div>
            <div className="flex justify-around items-center flex-row gap-4 w-full h-20 bg-red-800 text-white">
            <div>
                <h3>Cinema Barcelona </h3>
                {/* <img src="#" alt="logo cine barcelona"/> */}
            </div>
            <nav >
                <ul className="flex justify-around items-center flex-row gap-10">
                    <li><Link href="/administracion">Configuracion</Link></li>
                    <li>Cerrar sesión</li>
                </ul>
            </nav>
        </div>
        </div>
    )
}