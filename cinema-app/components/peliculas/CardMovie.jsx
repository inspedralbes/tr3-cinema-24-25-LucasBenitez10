import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InfoMovie from './InfoMovie';
import { useMovieStore } from '@/store/moviesStore';
import { useBookingStore } from '@/store/bookingStore';
import { Calendar, Clock, Info, Ticket, Star, Eye } from 'lucide-react';

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
    const [isLoading, setIsLoading] = useState(true);
    const { setBookingStep } = useBookingStore();

    // Formatear fecha para mostrar de manera amigable
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
        
        // Redirigimos a la página de selección de asientos
        router.push('/seats');
    }

    function handleCloseInfo() {
        setShowInfo(false);
    }

    // Manejar carga de imagen
    const handleImageLoad = () => {
        setIsLoading(false);
    };

    // Calcular año de estreno
    const releaseYear = relase ? new Date(relase).getFullYear() : 'N/A';

    // Verificar si la función está cancelada
    const isCancelled = status === 'cancelled';

    // Fecha formateada para mostrar
    const formattedDate = formatDate(date);

    // URL base para imágenes
    const imageBaseUrl = process.env.NEXT_PUBLIC_URL_IMAGE || 'https://image.tmdb.org/t/p/w500';

    return (
        <div className="w-64 sm:w-72 md:w-80 m-3 transform transition-all duration-300 hover:-translate-y-1">
            <div 
                className={`relative overflow-hidden bg-gray-900 rounded-xl shadow-xl transition-all duration-300 
                    ${isHovered ? 'shadow-2xl shadow-red-900/20 scale-[1.02]' : 'shadow-lg shadow-black/40'} 
                    ${isCancelled ? 'ring-1 ring-red-800' : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    backfaceVisibility: 'hidden'
                }}
            >
                {/* Contenedor de la imagen con skeleton loader */}
                <div 
                    className="relative aspect-[2/3] overflow-hidden cursor-pointer"
                    onClick={!isCancelled ? handleViewInfo : undefined}
                >
                    {/* Skeleton loader */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 animate-pulse" />
                    )}
                    
                    {/* Imagen de poster */}
                    <img 
                        src={`${imageBaseUrl}${image}`} 
                        alt={`Póster de ${title}`}
                        onLoad={handleImageLoad}
                        className={`w-full h-full object-cover transition-all duration-500 
                            ${isHovered ? 'scale-110 filter brightness-110' : 'scale-100'} 
                            ${isCancelled ? 'filter grayscale brightness-50' : ''}`}
                    />

                    {/* Overlay gradiente mejorado */}
                    <div 
                        className={`absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent 
                            opacity-80 transition-opacity duration-300 ${isHovered ? 'opacity-70' : 'opacity-80'}`}
                    ></div>

                    {/* Botón de info superpuesto con efecto más suave */}
                    {!isCancelled && (
                        <button
                            onClick={handleViewInfo}
                            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                                     bg-red-600/90 hover:bg-red-500 text-white rounded-full p-4
                                     transition-all duration-500 flex items-center justify-center
                                     ${isHovered ? 'opacity-100 scale-100 shadow-lg shadow-red-600/50' : 'opacity-0 scale-75'}`}
                            aria-label="Ver información"
                        >
                            <Eye size={24} />
                        </button>
                    )}

                    {/* Badges con mejor diseño */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between">
                        <div className="flex flex-col gap-2">
                            {lenguage && (
                                <span className={`text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm 
                                    ${isCancelled 
                                        ? 'bg-gray-800/70 text-gray-300' 
                                        : 'bg-black/70 text-white border border-gray-700'}`}
                                >
                                    {lenguage.toUpperCase()}
                                </span>
                            )}
                        </div>
                        
                        <span className={`text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center
                            ${isCancelled 
                                ? 'bg-gray-800/70 text-gray-300' 
                                : 'bg-red-600/80 text-white'}`}
                        >
                            <Star size={12} className="mr-1" />
                            {releaseYear}
                        </span>
                    </div>

                    {/* Título flotante en la parte inferior de la imagen */}
                    <div className="absolute bottom-0 inset-x-0 p-4 pt-10 bg-gradient-to-t from-black to-transparent">
                        <h2 className="font-medium text-white text-lg mb-1 line-clamp-2">{title}</h2>
                    </div>

                    {/* CARTEL DE FUNCIÓN CANCELADA - Versión mejorada */}
                    {isCancelled && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-red-600/90 px-4 py-2 rotate-45 transform origin-center w-[150%] text-center shadow-lg">
                                <p className="text-white font-bold tracking-wider text-base">FUNCIÓN CANCELADA</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Información de la película */}
                <div className="p-4 bg-gradient-to-b from-gray-900 to-gray-800 backdrop-filter backdrop-blur-sm">
                    {/* Descripción con altura fija */}
                    <p className="text-gray-300 text-sm line-clamp-2 mb-4 h-10">{review}</p>

                    {/* Información de horario y fecha con íconos mejorados */}
                    <div className="mb-4 space-y-2">
                        <div className="flex items-center text-gray-300 text-xs">
                            <Calendar size={14} className="mr-2 text-red-500" />
                            <span className="uppercase tracking-wide">{formattedDate}</span>
                        </div>
                        {time && (
                            <div className="flex items-center text-gray-300 text-xs">
                                <Clock size={14} className="mr-2 text-red-500" />
                                <span className="uppercase tracking-wide">{time}h</span>
                            </div>
                        )}
                    </div>

                    {/* Botones de acción con efectos mejorados */}
                    <div className="grid grid-cols-2 gap-2">
                        {/* Botón Ver información */}
                        <button 
                            onClick={handleViewInfo}
                            disabled={isCancelled}
                            className={`py-2.5 text-sm font-medium rounded transition-all flex items-center justify-center
                                ${isCancelled 
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-60' 
                                    : 'bg-gray-800 text-white hover:bg-gray-700 shadow-md hover:shadow active:shadow-inner'
                                }`}
                        >
                            <Info size={14} className="mr-1.5" />
                            <span>Ver info</span>
                        </button>

                        {/* Botón Comprar entradas */}
                        <button 
                            onClick={handleBuyTickets}
                            disabled={isCancelled}
                            className={`py-2.5 text-sm font-medium rounded transition-all flex items-center justify-center
                                ${isCancelled 
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-60' 
                                    : 'bg-red-600 text-white hover:bg-red-500 shadow-md hover:shadow-red-600/30 active:shadow-inner'
                                }`}
                        >
                            <Ticket size={14} className="mr-1.5" />
                            <span>Comprar</span>
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