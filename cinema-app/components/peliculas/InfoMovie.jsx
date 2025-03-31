'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, X, Info, PlayCircle, Ticket } from 'lucide-react';

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
    const [activeTab, setActiveTab] = useState('info');
    const [videoId, setVideoId] = useState(null);
    const [mounted, setMounted] = useState(false);
    
    // Montar el componente para el portal
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);
    
    // Extraer ID de YouTube
    useEffect(() => {
        if (!trailerUrl) return;
        
        // Caso 1: Es un ID directo
        if (trailerUrl && trailerUrl.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(trailerUrl)) {
            setVideoId(trailerUrl);
            return;
        }
        
        // Caso 2: Es una URL de YouTube
        if (trailerUrl && typeof trailerUrl === 'string') {
            const match = trailerUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            if (match && match[1]) {
                setVideoId(match[1]);
            }
        }
    }, [trailerUrl]);
    
    // Deshabilitar scroll del body
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);
    
    // Formatear fechas
    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha por confirmar';
        
        const date = new Date(dateString);
        const weekdays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        
        return `${weekdays[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
    };
    
    const formatReleaseDate = (dateString) => {
        if (!dateString) return 'Pendiente';
        
        const date = new Date(dateString);
        const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        
        return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
    };
    
    const handleBuyTickets = () => {
        if (onClose) onClose();
        router.push('/seats');
    };
    
    const handleCloseModal = (e) => {
        // Siempre detener la propagación 
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (onClose) onClose();
    };
    
    // Manejar cierre con tecla ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleCloseModal();
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    
    // URL base para imágenes
    const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
    
    // Componente modal que será renderizado en el portal
    const modalContent = (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4"
            onClick={handleCloseModal}
        >
            <div 
                className="bg-gray-900 w-full max-w-4xl rounded-lg overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Tabs de navegación */}
                <div className="flex border-b border-gray-800">
                    <button
                        className={`px-6 py-4 font-medium flex items-center ${
                            activeTab === 'info' 
                                ? 'text-white border-b-2 border-red-600' 
                                : 'text-gray-400'
                        }`}
                        onClick={() => setActiveTab('info')}
                    >
                        <Info size={18} className="mr-2" />
                        Información
                    </button>
                    <button
                        className={`px-6 py-4 font-medium flex items-center ${
                            activeTab === 'trailer' 
                                ? 'text-white border-b-2 border-red-600' 
                                : 'text-gray-400'
                        }`}
                        onClick={() => setActiveTab('trailer')}
                    >
                        <PlayCircle size={18} className="mr-2" />
                        Tráiler
                    </button>
                    
                    {/* Botón cerrar */}
                    <button 
                        className="ml-auto mr-4 my-3 p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-800"
                        onClick={handleCloseModal}
                    >
                        <X size={20} />
                    </button>
                </div>
                
                {/* Contenido */}
                {activeTab === 'info' ? (
                    <div className="flex flex-col md:flex-row">
                        {/* Imagen de la película */}
                        {image && (
                            <div className="md:w-1/3">
                                <img 
                                    src={`${imageBaseUrl}${image}`}
                                    alt={title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        
                        {/* Información */}
                        <div className="p-6 md:w-2/3">
                            <h2 className="text-2xl text-white font-medium mb-4">{title}</h2>
                            
                            {/* Fecha y hora */}
                            <div className="flex flex-wrap gap-3 mb-6">
                                {date && (
                                    <div className="inline-flex items-center bg-gray-800 px-3 py-1 rounded text-sm text-gray-300">
                                        <Calendar size={14} className="text-red-500 mr-2" />
                                        {formatDate(date)}
                                    </div>
                                )}
                                
                                {time && (
                                    <div className="inline-flex items-center bg-gray-800 px-3 py-1 rounded text-sm text-gray-300">
                                        <Clock size={14} className="text-red-500 mr-2" />
                                        {time}h
                                    </div>
                                )}
                            </div>
                            
                            {/* Sinopsis */}
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-white mb-2">Sinopsis</h3>
                                <p className="text-gray-300 text-sm">{review}</p>
                            </div>
                            
                            {/* Divider */}
                            <hr className="border-gray-800 my-6" />
                            
                            {/* Detalles */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                <div className="bg-gray-800 bg-opacity-50 p-4 rounded">
                                    <h4 className="font-medium text-gray-300 mb-1">Idioma</h4>
                                    <p className="text-white">{lenguage || 'No especificado'}</p>
                                </div>
                                
                                <div className="bg-gray-800 bg-opacity-50 p-4 rounded">
                                    <h4 className="font-medium text-gray-300 mb-1">Estreno</h4>
                                    <p className="text-white">{formatReleaseDate(relase)}</p>
                                </div>
                            </div>
                            
                            {/* Botón de compra */}
                            <button
                                onClick={handleBuyTickets}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded font-medium flex items-center justify-center"
                            >
                                <Ticket size={18} className="mr-2" />
                                Comprar entradas
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-6">
                        <h2 className="text-xl text-white font-medium mb-6 text-center">{title} - Tráiler</h2>
                        
                        {videoId ? (
                            <div className="relative pt-[56.25%] bg-black rounded overflow-hidden mb-6">
                                <iframe
                                    className="absolute inset-0 w-full h-full"
                                    src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                                    title={`Tráiler de ${title}`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ) : (
                            <div className="bg-gray-800 bg-opacity-50 p-8 text-center rounded mb-6">
                                <p className="text-gray-300">No hay tráiler disponible para esta película</p>
                            </div>
                        )}
                        
                        <div className="text-center">
                            <button
                                onClick={handleBuyTickets}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded font-medium inline-flex items-center"
                            >
                                <Ticket size={18} className="mr-2" />
                                Comprar entradas
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
    
    // Usar el portal para renderizar fuera del DOM anidado
    // Esto es clave para evitar problemas de z-index y posicionamiento
    return mounted ? createPortal(
        modalContent,
        document.body
    ) : null;
}