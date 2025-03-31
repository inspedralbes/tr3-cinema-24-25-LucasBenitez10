'use client';
import CardMovie from '@/components/peliculas/CardMovie';
import { useState, useEffect, useRef } from 'react';
import { getScreenings } from '@/services/screeningService';
import { useBookingStore } from '@/store/bookingStore';
import { Film, ChevronRight, ChevronLeft, Calendar, Clock, Search } from 'lucide-react';

function Peliculas() {
    const [screenings, setScreenings] = useState([]);
    const [filteredScreenings, setFilteredScreenings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const containerRef = useRef(null);

    const { setBookingStep } = useBookingStore();

    // Obtener screenings
    const getScreeningsData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getScreenings();
            setScreenings(data);
            setFilteredScreenings(data);
        } catch (error) {
            console.error("Error al obtener screenings:", error);
            setError("No se pudieron cargar las películas. Intenta de nuevo más tarde.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getScreeningsData();
    }, []);

    // Filtrar screenings cuando cambie el término de búsqueda o la fecha
    useEffect(() => {
        if (!screenings.length) return;

        let results = [...screenings];
        
        // Filtrar por término de búsqueda
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            results = results.filter(screening => 
                screening.movie?.title?.toLowerCase().includes(term) ||
                screening.language?.toLowerCase().includes(term)
            );
        }
        
        // Filtrar por fecha
        if (selectedDate) {
            const dateObj = new Date(selectedDate);
            const formattedDate = dateObj.toISOString().split('T')[0];
            
            results = results.filter(screening => {
                if (!screening.date) return false;
                return screening.date.startsWith(formattedDate);
            });
        }
        
        setFilteredScreenings(results);
    }, [searchTerm, selectedDate, screenings]);

    // Formatear hora
    const formatTime = (timeString) => {
        if (!timeString) return null;

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

    // Obtener ID del trailer
    const getTrailerId = (screening) => {
        if (screening.movie?.trailer?.key) {
            return screening.movie.trailer.key;
        }
        
        if (screening.movie?.trailer && typeof screening.movie.trailer === 'string') {
            return screening.movie.trailer;
        }

        return null;
    };

    // Obtener fechas únicas para el filtro
    const getUniqueDates = () => {
        if (!screenings.length) return [];
        
        const uniqueDates = new Set();
        screenings.forEach(screening => {
            if (screening.date) {
                const date = new Date(screening.date);
                uniqueDates.add(date.toISOString().split('T')[0]);
            }
        });
        
        return Array.from(uniqueDates).sort();
    };

    // Formatear fecha para mostrar
    const formatDateDisplay = (dateString) => {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('es-ES', { month: 'short' });
        
        return `${day} ${month}`;
    };

    const ChevronDown = ({ size, className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    );

    const RefreshIcon = ({ size }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
            <path d="M21 3v5h-5"></path>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
            <path d="M3 21v-5h5"></path>
        </svg>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto relative z-10">
                {/* Cabecera con animación */}
                <div className="text-center mb-12 relative">
                    <h1 className="text-4xl md:text-5xl font-light text-white mb-3">
                        <span className="text-red-500">Cartelera</span> Cinema Barcelona
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Descubre nuestra selección de películas y reserva tus entradas online
                    </p>
                </div>

                {/* Filtros y búsqueda */}
                <div className="mb-10 p-4 bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-800 shadow-lg max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Búsqueda */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar película..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white 
                                    placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            />
                        </div>
                        
                        {/* Filtro por fecha */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar size={16} className="text-gray-400" />
                            </div>
                            <select
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white 
                                    focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none"
                            >
                                <option value="">Todas las fechas</option>
                                {getUniqueDates().map((date) => (
                                    <option key={date} value={date}>
                                        {formatDateDisplay(date)}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <ChevronDown size={16} className="text-gray-400" />
                            </div>
                        </div>
                        
                        {/* Botón para recargar */}
                        <button
                            onClick={getScreeningsData}
                            className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg shadow transition-all 
                                flex items-center justify-center space-x-2"
                        >
                            <RefreshIcon size={16} />
                            <span>Actualizar cartelera</span>
                        </button>
                    </div>
                </div>

                {/* Separador estilizado */}
                <div className="flex items-center w-full max-w-4xl mx-auto mb-12">
                    <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
                    <div className="flex space-x-1.5 mx-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-red-500"></div>
                        ))}
                    </div>
                    <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
                </div>

                {/* Películas con estados de carga y error */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-gray-600 border-t-red-500 rounded-full animate-spin mb-6"></div>
                        <p className="text-gray-300 text-lg">Cargando películas...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4">
                        <div className="text-red-500 mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>
                        <p className="text-gray-300 text-xl mb-4">No se pudieron cargar las películas</p>
                        <p className="text-gray-400 mb-6 text-center max-w-lg">{error}</p>
                        <button
                            onClick={getScreeningsData}
                            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-lg transition-all"
                        >
                            Intentar de nuevo
                        </button>
                    </div>
                ) : filteredScreenings.length > 0 ? (
                    <>
                        {/* Contador de resultados */}
                        {(searchTerm || selectedDate) && (
                            <div className="text-center mb-8">
                                <p className="text-gray-300">
                                    Se encontraron <span className="text-white font-medium">{filteredScreenings.length}</span> películas
                                </p>
                            </div>
                        )}
                        
                        {/* Grid de películas */}
                        <div 
                            ref={containerRef}
                            className="flex flex-wrap justify-center"
                        >
                            {filteredScreenings.map((screening, index) => {
                                const trailerId = getTrailerId(screening);

                                return (
                                    <div
                                        key={screening._id || index}
                                        className="movie-card"
                                    >
                                        <CardMovie
                                            movieData={screening}
                                            title={screening.movie?.title || "Sin título"}
                                            review={screening.movie?.overview || "Sin descripción"}
                                            lenguage={screening.language || "N/A"}
                                            relase={screening.movie?.release_date}
                                            image={screening.movie?.poster_path}
                                            status={screening.status}
                                            date={screening.date}
                                            time={formatTime(screening.startTime)}
                                            trailerUrl={trailerId}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800 mb-6">
                            <Film size={40} className="text-gray-500" />
                        </div>
                        <h2 className="text-2xl text-gray-200 font-light mb-3">No hay películas disponibles</h2>
                        <p className="text-gray-400 max-w-md mx-auto mb-6">
                            {searchTerm || selectedDate 
                                ? "No se encontraron películas con los filtros seleccionados." 
                                : "Actualmente no hay películas disponibles. Por favor, vuelve a consultar más tarde."}
                        </p>
                        {(searchTerm || selectedDate) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedDate('');
                                }}
                                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-lg transition-all"
                            >
                                Mostrar todas las películas
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Peliculas;