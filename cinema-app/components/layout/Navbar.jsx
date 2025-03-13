'use client'
import * as React from "react"
import { useRouter } from 'next/navigation'
import  Link  from "next/link";


function Navbar () {
    
    
    return (
        <div className="flex justify-around items-center flex-row gap-4 w-full h-20 bg-red-800 text-white">
            <div>
                <h3>Cinema Barcelona </h3>
                {/* <img src="#" alt="logo cine barcelona"/> */}
            </div>
            <nav >
                <ul className="flex justify-around items-center flex-row gap-10">
                    <li><Link href="/peliculas">Películas</Link></li>
                    <li><Link href="/promociones">Promociones</Link></li>
                    <li><Link href="/experiencias">Experiencias</Link></li>
                    <li> <Link href="/bonos">Bonos</Link></li>
                    <li><Link href="/login">Iniciar sesión</Link></li>
                    <li><Link href="/register">Register</Link></li>
                </ul>
            </nav>
        </div>
    )
}

export default Navbar