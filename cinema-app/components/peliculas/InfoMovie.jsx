import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Film, Globe, CalendarDays, X, Info, PlayCircle, Ticket } from 'lucide-react';

export default function InfoMovie({
    title,
    review,
    lenguage,
    relase,
    image,
    date,
    time,
    trailerUrl,
    onClose
}) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('info'); // 'info' o 'trailer'
    const [videoId, setVideoId] = useState(null);
    const [videoError, setVideoError] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Extraer el ID del video de YouTube de la URL
    useEffect(() => {
        setVideoError(false);

        if (!trailerUrl) {
            return;
        }

        // Si es un ID directo (11 caracteres alfanuméricos)
        if (typeof trailerUrl === 'string' && trailerUrl.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(trailerUrl)) {
            setVideoId(trailerUrl);
            return;
        }

        // Si es una URL, intentar extraer el ID
        if (typeof trailerUrl === 'string' && trailerUrl.includes('youtu')) {
            const youtubeLinkRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
            const match = trailerUrl.match(youtubeLinkRegex);

            if (match && match[1]) {
                setVideoId(match[1]);
                return;
            }
        }
    }, [trailerUrl]);

    function handleBuyTickets() {
        router.push('/seats');
    }

    // Efecto para la animación de entrada y bloquear el scroll
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        
        // Animación de entrada
        setTimeout(() => {
            setIsVisible(true);
        }, 10);

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    const handleClose = () => {
        // Animación de salida
        setIsVisible(false);
        setTimeout(() => {
            if (onClose) {
                onClose();
            }
        }, 300);
    };

    // Formatear fecha para mostrar de manera amigable
    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha por confirmar';

        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Formatear fecha de estreno
    const formatReleaseDate = (dateString) => {
        if (!dateString) return 'Pendiente';

        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // URL base para imágenes (con verificación de seguridad)
    const imageBaseUrl = process.env.NEXT_PUBLIC_URL_IMAGE || 'https://image.tmdb.org/t/p/w500';

    return (
        <div
            className={`fixed inset-0 flex justify-center items-center bg-black bg-opacity-90 z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    handleClose();
                }
            }}
        >
            <div className={`bg-gray-900 rounded-lg shadow-2xl max-w-5xl w-full mx-4 overflow-hidden flex flex-col max-h-[90vh] transition-transform duration-300 ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'}`}>
                {/* Botón de cierre */}
                <button
                    onClick={handleClose}
                    className='absolute top-4 right-4 bg-gray-800 text-gray-400 rounded-full w-9 h-9 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors z-10 shadow-md'
                    aria-label="Cerrar"
                >
                    <X size={18} />
                </button>

                {/* Tabs de navegación */}
                <div className="flex border-b border-gray-800 bg-gray-950 sticky top-0 z-10">
                    <button
                        className={`flex items-center px-6 py-4 font-medium transition-colors duration-200 ${activeTab === 'info'
                                ? 'text-white border-b-2 border-red-500 bg-gradient-to-b from-transparent to-gray-900'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
                            }`}
                        onClick={() => setActiveTab('info')}
                    >
                        <Info size={18} className="mr-2" />
                        Información
                    </button>
                    <button
                        className={`flex items-center px-6 py-4 font-medium transition-colors duration-200 ${activeTab === 'trailer'
                                ? 'text-white border-b-2 border-red-500 bg-gradient-to-b from-transparent to-gray-900'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
                            }`}
                        onClick={() => setActiveTab('trailer')}
                    >
                        <PlayCircle size={18} className="mr-2" />
                        Tráiler
                    </button>
                </div>

                <div className="overflow-y-auto">
                    {activeTab === 'info' ? (
                        <div className='flex flex-col md:flex-row'>
                            {/* Columna de imagen */}
                            {image && (
                                <div className='md:w-1/3 relative'>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 via-transparent to-transparent z-10"></div>
                                    <img
                                        src={`${imageBaseUrl}${image}`}
                                        alt={`Imagen de ${title}`}
                                        className='w-full h-full object-cover'
                                    />
                                </div>
                            )}

                            {/* Columna de información */}
                            <div className='p-8 md:w-2/3 flex flex-col'>
                                <h2 className='text-3xl font-light text-white mb-3'>{title}</h2>

                                {/* Detalles de la función */}
                                <div className="flex flex-wrap gap-4 mb-6">
                                    {date && (
                                        <div className="flex items-center text-gray-300 text-sm bg-gray-800/50 px-3 py-1.5 rounded-full">
                                            <Calendar size={16} className="mr-2 text-red-500" />
                                            <span>{formatDate(date)}</span>
                                        </div>
                                    )}
                                    {time && (
                                        <div className="flex items-center text-gray-300 text-sm bg-gray-800/50 px-3 py-1.5 rounded-full">
                                            <Clock size={16} className="mr-2 text-red-500" />
                                            <span>{time}</span>
                                        </div>
                                    )}
                                </div>

                                <div className='mb-6'>
                                    <h3 className='text-xl font-medium text-white mb-3'>Sinopsis</h3>
                                    <p className='text-gray-300 leading-relaxed'>{review}</p>
                                </div>

                                {/* Divider with film reel design */}
                                <div className="flex items-center my-6">
                                    <div className="flex-grow h-px bg-gray-800"></div>
                                    <div className="flex space-x-1 mx-4">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                        ))}
                                    </div>
                                    <div className="flex-grow h-px bg-gray-800"></div>
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
                                    <div className='bg-gray-800/30 p-4 rounded-lg'>
                                        <h4 className='font-medium text-gray-300 flex items-center mb-2'>
                                            <Globe size={16} className="mr-2 text-red-500" />
                                            Idioma
                                        </h4>
                                        <p className='text-white font-medium'>{lenguage || 'No especificado'}</p>
                                    </div>
                                    <div className='bg-gray-800/30 p-4 rounded-lg'>
                                        <h4 className='font-medium text-gray-300 flex items-center mb-2'>
                                            <CalendarDays size={16} className="mr-2 text-red-500" />
                                            Estreno
                                        </h4>
                                        <p className='text-white font-medium'>{formatReleaseDate(relase)}</p>
                                    </div>
                                </div>

                                <div className='mt-auto'>
                                    <button
                                        onClick={handleBuyTickets}
                                        className='w-full py-4 rounded-lg font-medium text-lg transition-all duration-300 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-red-700/30 flex items-center justify-center'
                                    >
                                        <Ticket className="mr-2" size={20} />
                                        Comprar entradas
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8">
                            <h2 className='text-2xl font-light text-white mb-8 text-center'>{title} - Tráiler</h2>

                            {videoId && !videoError ? (
                                <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden shadow-2xl">
                                    <iframe
                                        className="absolute inset-0 w-full h-full"
                                        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                                        title={`Tráiler de ${title}`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ) : (
                                <div className="bg-gray-800/50 rounded-lg p-12 text-center">
                                    <div className="mb-4 flex justify-center">
                                        <Film size={48} className="text-red-500 opacity-50" />
                                    </div>
                                    <p className="text-gray-300 text-lg mb-2">
                                        {videoError
                                            ? "Hubo un error al cargar el tráiler."
                                            : "No hay tráiler disponible para esta película."}
                                    </p>
                                    <p className="text-gray-400">
                                        {videoError
                                            ? "Por favor, intenta más tarde o contacta con soporte."
                                            : "Consulta más información en la pestaña de información."}
                                    </p>
                                </div>
                            )}

                            <div className="mt-8 text-center">
                                <button
                                    onClick={handleBuyTickets}
                                    className='px-8 py-4 rounded-lg font-medium text-lg transition-all duration-300 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-red-700/30 flex items-center justify-center mx-auto'
                                >
                                    <Ticket className="mr-2" size={20} />
                                    Comprar entradas
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}