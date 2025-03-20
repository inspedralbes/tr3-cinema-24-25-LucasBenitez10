import { useState, useEffect } from 'react'
import { getScreeningsWithFilters } from '@/services/screeningService'
import CardSession from './CardSession'
import { useScreeningStore } from '@/store/screeningStore'

export default function SessionMovies() {
    const [screenings, setScreenings] = useState([])
    const { fetchScreenings, loading } = useScreeningStore();

    useEffect(() => {
        fetchScreenings()
    }, [])
    return (
        <div>
            <h1>Sesiones</h1>
            {loading ? (
                <p>Cargando sesiones...</p>
            ) : (
                <CardSession />
            )}
        </div>
    )
}