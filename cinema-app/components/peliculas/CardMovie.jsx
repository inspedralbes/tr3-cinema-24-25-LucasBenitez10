import * as React from 'react';
import { useState } from 'react';
import InfoMovie from './InfoMovie';
import { useMovieStore } from '@/store/moviesStore';

export default function CardMovie({ movieData, title, review, lenguage, relase, image }) {
    const assignMovie = useMovieStore((state) => state.assignMovie);

    
    const [showInfo, setShowInfo] = useState(false);


    function handleViewInfo() {
        setShowInfo(true);
        assignMovie(movieData); 
    }    

    function handleCloseInfo() {
        setShowInfo(false);
    }

    return (
        <div>
            <div className='container-card-movie flex flex-col items-center justify-center border-2 border-solid border-black rounded-lg relative'>
                <img src={process.env.NEXT_PUBLIC_URL_IMAGE + image} alt="imagen de la película" />
                <h2 className=''>{title}</h2>
                <button 
                    onClick={handleViewInfo} 
                    className='absolute z-10 text-white top-92 cursor-pointer bg-gray-200/40 w-87 h-8'
                >
                    Comprar entradas
                </button>
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