import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InfoMovie from './InfoMovie';
import { useMovieStore } from '@/store/moviesStore';
import { useBookingStore } from '@/store/bookingStore';
import { Calendar, Clock, Info, Ticket } from 'lucide-react';

export default function CardMovie({ 
    movieData, 
    title, 
    review, 
    lenguage, 
    relase, 
    image, 
    status,
    date,            
    time,            
    trailerUrl       
}) {
    const router = useRouter();
    const assignMovie = useMovieStore((state) => state.assignMovie);
    const [showInfo, setShowInfo] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const { setBookingStep } = useBookingStore();

    // Formatear fecha para mostrar de manera amigable (ej: "Vie, 29 Mar")
    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha por confirmar';

        const date = new Date(dateString);
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
    };

    // Función para mostrar la información de la película
    function handleViewInfo() {
        setShowInfo(true);
        assignMovie(movieData);
    }    

    // Función para comprar entradas (redirige a selección de asientos)
    function handleBuyTickets() {
        // Primero asignamos la película seleccionada al estado global
        assignMovie(movieData); 
        
        // Establecemos el paso de reserva en el estado global
        setBookingStep('seat-selection');
        
        // Redirigimos a la página de selección de asientos, igual que en InfoMovie
        router.push('/seats');
    }

    function handleCloseInfo() {
        setShowInfo(false);
    }

    // Calcular año de estreno
    const releaseYear = relase ? new Date(relase).getFullYear() : 'N/A';

    // Verificar si la función está cancelada
    const isCancelled = status === 'cancelled';

    // Fecha formateada para mostrar
    const formattedDate = formatDate(date);

    // URL base para imágenes (con verificación de seguridad)
    const imageBaseUrl = process.env.NEXT_PUBLIC_URL_IMAGE || 'https://image.tmdb.org/t/p/w500';

    return (
        <div className="w-64 m-3">
            <div 
                className={`relative rounded-md overflow-hidden bg-gray-900 border border-gray-800 shadow-md transition-all duration-300 ${isHovered ? 'shadow-lg shadow-gray-900/50' : ''} ${isCancelled ? 'ring-1 ring-red-800' : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Contenedor de la imagen */}
                <div 
                    className="relative aspect-[2/3] overflow-hidden cursor-pointer"
                    onClick={!isCancelled ? handleViewInfo : undefined}
                >
                    <img 
                        src={`${imageBaseUrl}${image}`} 
                        alt={`Póster de ${title}`}
                        className={`w-full h-full object-cover transition-all duration-500 ${isHovered ? 'scale-105' : 'scale-100'} ${isCancelled ? 'filter grayscale brightness-75' : ''}`}
                    />

                    {/* Overlay sutil */}
                    <div 
                        className={`absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70`}
                    ></div>

                    {/* Botón "Ver información" superpuesto */}
                    {!isCancelled && (
                        <button
                            onClick={handleViewInfo}
                            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                                       bg-black/60 hover:bg-red-600 text-white rounded-full p-3
                                       transition-all duration-300 flex items-center justify-center
                                       ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                            aria-label="Ver información"
                        >
                            <Info size={24} />
                        </button>
                    )}

                    {/* Badges minimalistas */}
                    <div className="absolute top-2 left-2 flex flex-col gap-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-sm backdrop-blur-sm ${isCancelled ? 'bg-gray-800/70 text-gray-300' : 'bg-black/70 text-white'}`}>
                            {lenguage && lenguage.toUpperCase()}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-sm backdrop-blur-sm ${isCancelled ? 'bg-gray-800/70 text-gray-300' : 'bg-black/70 text-white'}`}>
                            {releaseYear}
                        </span>
                    </div>

                    {/* CARTEL DE FUNCIÓN CANCELADA - Versión minimalista */}
                    {isCancelled && (
                        <div className="absolute bottom-0 inset-x-0 bg-red-600 py-1 flex justify-center items-center">
                            <p className="text-white text-xs font-medium tracking-wide">FUNCIÓN CANCELADA</p>
                        </div>
                    )}
                </div>

                {/* Información de la película */}
                <div className="p-3 bg-gray-900">
                    <h2 className="font-medium text-white text-base mb-1 truncate">{title}</h2>
                    <p className="text-gray-400 text-xs line-clamp-2 mb-3 h-8">{review}</p>

                    {/* Información de horario y fecha */}
                    <div className="mb-3 space-y-1">
                        <div className="flex items-center text-gray-300 text-xs">
                            <Calendar size={12} className="mr-1.5 text-red-500" />
                            <span>{formattedDate}</span>
                        </div>
                        {time && (
                            <div className="flex items-center text-gray-300 text-xs">
                                <Clock size={12} className="mr-1.5 text-red-500" />
                                <span>{time}</span>
                            </div>
                        )}
                    </div>

                    {/* Botones de acción */}
                    <div className="grid grid-cols-2 gap-2">
                        {/* Botón Ver información */}
                        <button 
                            onClick={handleViewInfo}
                            disabled={isCancelled}
                            className={`py-2 text-sm font-medium rounded-sm transition-colors flex items-center justify-center ${
                                isCancelled 
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                    : 'bg-gray-700 text-white hover:bg-gray-600'
                            }`}
                        >
                            <Info size={14} className="mr-1.5" />
                            <span>Ver info</span>
                        </button>

                        {/* Botón Comprar entradas */}
                        <button 
                            onClick={handleBuyTickets}
                            disabled={isCancelled}
                            className={`py-2 text-sm font-medium rounded-sm transition-colors flex items-center justify-center ${
                                isCancelled 
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                    : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                        >
                            <Ticket size={14} className="mr-1.5" />
                            <span>Comprar entradas</span>
                        </button>
                    </div>
                </div>
            </div>

            {showInfo && !isCancelled && (
                <InfoMovie
                    title={title}
                    review={review}
                    lenguage={lenguage}
                    relase={relase}
                    image={image}
                    date={date}
                    time={time}
                    trailerUrl={trailerUrl}
                    onClose={handleCloseInfo}
                />
            )}
        </div>
    );
}