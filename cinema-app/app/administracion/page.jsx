'use client'
import { useEffect, useState } from 'react';
import DropdownMovies from '@/components/admin/DropdownMovies';
import SessionMovies from '@/components/admin/SessionMovies'
export default function Administracion() {  

    return (
        <div>
            <h1>Administración</h1>
            <h3>Programar sesiones</h3>
            <DropdownMovies />
            <h3>Cancelar Sesiones</h3>
            <SessionMovies/>

        </div>
    )
}