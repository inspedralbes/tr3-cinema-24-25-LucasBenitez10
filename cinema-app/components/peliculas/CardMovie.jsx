import * as React from 'react';
import { useState } from 'react';
import InfoMovie from './InfoMovie';
import { useMovieStore } from '@/store/moviesStore';

export default function CardMovie({ movieData, title, review, lenguage, relase, image }) {
    const assignMovie = useMovieStore((state) => state.assignMovie);
    const [showInfo, setShowInfo] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    function handleViewInfo() {
        setShowInfo(true);
        assignMovie(movieData); 
    }    

    function handleCloseInfo() {
        setShowInfo(false);
    }

    // Calcular año de estreno
    const releaseYear = relase ? new Date(relase).getFullYear() : 'N/A';

    return (
        <div className="w-72 m-4 group perspective">
            <div 
                className="relative rounded-lg overflow-hidden shadow-2xl bg-black border-2 border-yellow-500/20 transform transition-all duration-500 hover:scale-105 preserve-3d group-hover:shadow-yellow-500/30"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{boxShadow: isHovered ? '0 22px 40px rgba(0, 0, 0, 0.3)' : '0 10px 30px rgba(0, 0, 0, 0.2)'}}
            >
                {/* Efecto de luz cinematográfica en la parte superior */}
                <div className={`absolute -top-20 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-yellow-500 rounded-full blur-3xl opacity-0 transition-opacity duration-700 ${isHovered ? 'opacity-20' : ''}`}></div>
                
                {/* Imagen con overlay */}
                <div className="relative aspect-[2/3] overflow-hidden">
                    {/* Overlay con patrón de rayas estilo cine */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/30 opacity-20 bg-stripes"></div>
                    
                    <img 
                        src={process.env.NEXT_PUBLIC_URL_IMAGE + image} 
                        alt={`Póster de ${title}`}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    
                    {/* Overlay gradiente estilo cinematográfico */}
                    <div 
                        className={`absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-90' : 'opacity-70'}`}
                    ></div>
                    
                    {/* Badge de lenguaje */}
                    <div className="absolute top-3 left-3 rotate-2">
                        <span className="bg-gradient-to-r from-red-700 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-md border border-red-500/30 shadow-lg">
                            {lenguage.toUpperCase()}
                        </span>
                    </div>
                    
                    {/* Badge de estreno */}
                    <div className="absolute top-3 right-3 -rotate-2">
                        <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-md border border-yellow-500/30 shadow-lg">
                                {releaseYear}
                            </span>
                        </div>
                    </div>
                    
                    {/* Título estilizado sobre la imagen */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
                        <h2 className="font-bold text-xl text-white mb-1 drop-shadow-lg">{title}</h2>
                        <div className="w-12 h-1 bg-gradient-to-r from-red-600 to-yellow-500 rounded-full mb-3 transform origin-left scale-0 transition-transform duration-300 delay-100 group-hover:scale-100"></div>
                    </div>
                </div>
                
                {/* Panel informativo */}
                <div className="p-4 bg-gradient-to-b from-gray-900 to-black">
                    <p className="text-gray-300 text-sm line-clamp-3 mb-4">{review}</p>
                    
                    {/* Botón de tickets estilo cine */}
                    <button 
                        onClick={handleViewInfo}
                        className="w-full py-3 px-4 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold rounded-md transition-all duration-300 shadow-lg hover:shadow-red-600/30 transform hover:-translate-y-1 flex items-center justify-center gap-2 border border-red-500/20"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
                        </svg>
                        Comprar entradas
                    </button>
                </div>
                
                {/* Detalles cinematográficos - Esquinas perforadas de tickets */}
                <div className="absolute -left-1 top-1/2 w-2 h-4 bg-yellow-500 rounded-r-full opacity-70"></div>
                <div className="absolute -right-1 top-1/2 w-2 h-4 bg-yellow-500 rounded-l-full opacity-70"></div>
            </div>
            
            {showInfo && (
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