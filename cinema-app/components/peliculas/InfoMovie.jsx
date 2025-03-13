import * as React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InfoMovie({title, review, lenguage, relase, image, onClose}) {
    const router = useRouter();

    function handleBuyTickets() {
        router.push('/seats');
    }

    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        
        document.body.style.overflow = 'hidden';
        
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };
    
    return (
        <div 
            className='fixed inset-0 flex justify-center items-center bg-black bg-opacity-90 z-50'
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    handleClose();
                }
            }}
        >
            <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 overflow-hidden flex flex-col md:flex-row'>
                {image && (
                    <div className='md:w-1/3'>
                        <img 
                            src={process.env.NEXT_PUBLIC_URL_IMAGE + image} 
                            alt={`Imagen de ${title}`}
                            className='w-full h-full object-cover'
                        />
                    </div>
                )}
                
                <div className='p-6 md:w-2/3 flex flex-col relative'>
                    <button 
                        onClick={handleClose} 
                        className='absolute top-2 right-2 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-300 transition-colors'
                        aria-label="Cerrar"
                    >
                        ✕
                    </button>
                    
                    <h2 className='text-2xl font-bold mb-4'>{title}</h2>
                    
                    <div className='mb-4'>
                        <h3 className='text-lg font-semibold mb-2'>Sinopsis</h3>
                        <p className='text-gray-700'>{review}</p>
                    </div>
                    
                    <div className='mt-auto grid grid-cols-2 gap-4'>
                        <div>
                            <h4 className='font-medium text-gray-500'>Idioma original</h4>
                            <p>{lenguage}</p>
                        </div>
                        <div>
                            <h4 className='font-medium text-gray-500'>Fecha de estreno</h4>
                            <p>{relase}</p>
                        </div>
                        <div>
                            <button onClick={ handleBuyTickets } className='bg-red-400 p-4 rounded-md cursor-pointer hover:bg-red-800 active:bg-red-300:'>Comprar entradas</button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}