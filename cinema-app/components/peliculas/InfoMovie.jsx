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
            <div className='bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 overflow-hidden flex flex-col md:flex-row border border-gray-800'>
                {image && (
                    <div className='md:w-1/3 relative'>
                        <img 
                            src={process.env.NEXT_PUBLIC_URL_IMAGE + image} 
                            alt={`Imagen de ${title}`}
                            className='w-full h-full object-cover'
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-50"></div>
                    </div>
                )}
                
                <div className='p-6 md:w-2/3 flex flex-col relative'>
                    <button 
                        onClick={handleClose} 
                        className='absolute top-4 right-4 bg-gray-800 text-gray-400 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700 hover:text-white transition-colors'
                        aria-label="Cerrar"
                    >
                        ✕
                    </button>
                    
                    <h2 className='text-2xl font-light text-white mb-4'>{title}</h2>
                    
                    <div className='mb-6'>
                        <h3 className='text-lg font-medium text-red-500 mb-2'>Sinopsis</h3>
                        <p className='text-gray-300'>{review}</p>
                    </div>
                    
                    {/* Divider with film reel design */}
                    <div className="flex items-center my-6">
                        <div className="flex-grow h-px bg-gray-800"></div>
                        <div className="flex space-x-1 mx-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
                            ))}
                        </div>
                        <div className="flex-grow h-px bg-gray-800"></div>
                    </div>
                    
                    <div className='mt-auto grid grid-cols-2 gap-4'>
                        <div>
                            <h4 className='font-medium text-gray-400'>Idioma original</h4>
                            <p className='text-white'>{lenguage}</p>
                        </div>
                        <div>
                            <h4 className='font-medium text-gray-400'>Fecha de estreno</h4>
                            <p className='text-white'>{relase}</p>
                        </div>
                        <div className='col-span-2 mt-4'>
                            <button 
                                onClick={handleBuyTickets} 
                                className='w-full py-3 rounded font-medium transition-colors duration-200 bg-red-600 hover:bg-red-700 text-white'
                            >
                                Comprar entradas
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}