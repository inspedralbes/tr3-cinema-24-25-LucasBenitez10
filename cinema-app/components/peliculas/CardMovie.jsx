import * as React from 'react';
import { useState } from 'react';
import InfoMovie from './InfoMovie';
import { useMovieStore } from '@/store/moviesStore';

export default function CardMovie({ movieData, title, review, lenguage, relase, image, status }) {
    const assignMovie = useMovieStore((state) => state.assignMovie);
    const [showInfo, setShowInfo] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    function handleViewInfo() {
        setShowInfo(true);
        assignMovie(movieData); 

        console.log(movieData)
    }    

    function handleCloseInfo() {
        setShowInfo(false);
    }

    // Calcular año de estreno
    const releaseYear = relase ? new Date(relase).getFullYear() : 'N/A';
    
    // Verificar si la función está cancelada
    const isCancelled = status === 'cancelled';

    return (
        <div className="w-64 m-3">
            <div 
                className={`relative rounded-md overflow-hidden bg-white shadow-md transition-all duration-300 ${isHovered ? 'shadow-lg' : ''} ${isCancelled ? 'ring-1 ring-red-300' : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Contenedor de la imagen */}
                <div className="relative aspect-[2/3] overflow-hidden">
                    <img 
                        src={process.env.NEXT_PUBLIC_URL_IMAGE + image} 
                        alt={`Póster de ${title}`}
                        className={`w-full h-full object-cover transition-all duration-500 ${isHovered ? 'scale-105' : 'scale-100'} ${isCancelled ? 'filter grayscale brightness-75' : ''}`}
                    />
                    
                    {/* Overlay sutil */}
                    <div 
                        className={`absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50`}
                    ></div>
                    
                    {/* Badges minimalistas */}
                    <div className="absolute top-2 left-2 flex flex-col gap-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-sm backdrop-blur-sm ${isCancelled ? 'bg-gray-800/70 text-gray-300' : 'bg-black/70 text-white'}`}>
                            {lenguage.toUpperCase()}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-sm backdrop-blur-sm ${isCancelled ? 'bg-gray-800/70 text-gray-300' : 'bg-black/70 text-white'}`}>
                            {releaseYear}
                        </span>
                    </div>
                    
                    {/* CARTEL DE FUNCIÓN CANCELADA - Versión minimalista */}
                    {isCancelled && (
                        <div className="absolute bottom-0 inset-x-0 bg-red-500 py-1 flex justify-center items-center">
                            <p className="text-white text-xs font-medium tracking-wide">FUNCIÓN CANCELADA</p>
                        </div>
                    )}
                </div>
                
                {/* Información de la película */}
                <div className="p-3 bg-white">
                    <h2 className="font-medium text-gray-900 text-base mb-1 truncate">{title}</h2>
                    <p className="text-gray-500 text-xs line-clamp-2 mb-3 h-8">{review}</p>
                    
                    {/* Botón minimalista */}
                    <button 
                        onClick={handleViewInfo}
                        disabled={isCancelled}
                        className={`w-full py-2 text-sm font-medium rounded-sm transition-colors ${
                            isCancelled 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-black text-white hover:bg-gray-800'
                        }`}
                    >
                        {isCancelled ? 'No disponible' : 'Comprar entradas'}
                    </button>
                </div>
            </div>
            
            {showInfo && !isCancelled && (
                <InfoMovie
                    title={title}
                    review={review}
                    lenguage={lenguage}
                    relase={relase}
                    image={image}
                    onClose={handleCloseInfo}
                />
            )}
        </div>
    );
}