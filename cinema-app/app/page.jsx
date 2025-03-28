'use client';
import CardMovie from '@/components/peliculas/CardMovie';
import { useState, useEffect } from 'react';
import { getScreenings } from '@/services/screeningService';
import { useBookingStore } from '@/store/bookingStore';

function Peliculas() {
    const [screenings, setScreenings] = useState([]);
    const { setBookingStep } = useBookingStore();

    // Variable para almacenar los trailers obtenidos desde TMDB
    const [trailerCache, setTrailerCache] = useState({});
    const [loading, setLoading] = useState(true);

    const getScreeningsData = async () => {
        try {
            setLoading(true);
            const data = await getScreenings();
            setScreenings(data);

            // Análisis de la estructura de datos (solo para desarrollo)
            if (data && data.length > 0) {
                console.log("Ejemplo de screening completo:", data[0]);
                console.log("Ejemplo de datos de película:", data[0].movie);
                
                if (data[0].movie) {
                    console.log("Propiedades disponibles en movie:", Object.keys(data[0].movie));
                }
            }
        } catch (error) {
            console.error("Error al obtener screenings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getScreeningsData();
    }, []);

    // Función para formatear la hora
    const formatTime = (timeString) => {
        if (!timeString) return null;

        // Si el formato es HH:MM, simplemente retornarlo
        if (/^\d{1,2}:\d{2}$/.test(timeString)) {
            return timeString;
        }

        try {
            const date = new Date(timeString);
            return date.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        } catch (error) {
            console.error("Error al formatear hora:", error);
            return timeString;
        }
    };

    // Función para obtener el trailer de manera segura
    const getTrailerId = (screening) => {
        // Si existe trailer directamente en la estructura
        if (screening.movie?.trailer?.key) {
            return screening.movie.trailer.key;
        }
        
        // Si existe trailer pero está en un formato diferente
        if (screening.movie?.trailer && typeof screening.movie.trailer === 'string') {
            return screening.movie.trailer;
        }

        // Verificar si hay TMDB ID para potencial búsqueda futura
        const tmdbId = screening.movie?.tmdbId || screening.movie?.id;
        if (tmdbId) {
            console.log("Se podría buscar trailer para TMDB ID:", tmdbId);
            // Para implementación futura sin llamar a la API ahora
        }

    };

    return (
        <div className="min-h-screen bg-black py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-light text-white mb-2">Cartelera</h1>
                    <p className="text-gray-400">Descubre nuestra selección de películas</p>
                </div>

                {/* Divider with film reel design */}
                <div className="flex items-center w-full max-w-4xl mx-auto mb-12">
                    <div className="flex-grow h-px bg-gray-800"></div>
                    <div className="flex space-x-1 mx-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-gray-700"></div>
                        ))}
                    </div>
                    <div className="flex-grow h-px bg-gray-800"></div>
                </div>

                {loading ? (
                    <div className="text-center py-16">
                        <p className="text-gray-400 text-lg">Cargando películas...</p>
                    </div>
                ) : screenings.length > 0 ? (
                    <div className="flex flex-wrap justify-center">
                        {screenings.map((screening) => {
                            // Obtener ID del trailer de manera segura
                            const trailerId = getTrailerId(screening);

                            return (
                                <CardMovie
                                    key={screening._id}
                                    movieData={screening}
                                    title={screening.movie.title}
                                    review={screening.movie.overview}
                                    lenguage={screening.language}
                                    relase={screening.movie.release_date}
                                    image={screening.movie.poster_path}
                                    status={screening.status}
                                    date={screening.date}
                                    time={formatTime(screening.startTime)}
                                    trailerUrl={trailerId}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-gray-400 text-lg">No hay películas disponibles</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Peliculas;