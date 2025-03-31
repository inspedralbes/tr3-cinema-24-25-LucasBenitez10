import { useState, useEffect } from 'react';
import { useBookingStore } from '@/store/bookingStore';
import { useMovieStore } from '@/store/moviesStore';

export default function BookingSeatType() {
    const { 
        getSelectedSeatsCount, 
        selectedSeats,
        assignTotal,
        nextStep,
        previousStep,
        needsConfirmationForPreviousStep,
        // Nuevas funciones que necesitaremos añadir al store
        assignTicketTypes
    } = useBookingStore();

    const { movieSelected } = useMovieStore();

    // Estado para almacenar los tipos de tickets desde la API
    const [ticketTypes, setTicketTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estado para almacenar las cantidades seleccionadas
    const [quantities, setQuantities] = useState({});

    // Estado para el total
    const [total, setTotal] = useState(0);
    // Estado para el total de entradas
    const [totalTickets, setTotalTickets] = useState(0);
    // Total de asientos seleccionados previamente
    const totalSeats = getSelectedSeatsCount();

    // Cargar los tipos de tickets desde la API
    useEffect(() => {
        const fetchTicketTypes = async () => {
            try {
                setLoading(true);
                // Si hay una película seleccionada, obtenemos precios específicos
                const endpoint = movieSelected && movieSelected._id 
                    ? `${process.env.NEXT_PUBLIC_API_URL}/api/ticket-types/movie/${movieSelected._id}`
                    : `${process.env.NEXT_PUBLIC_API_URL}/api/ticket-types`;
                
                const response = await fetch(endpoint);
                
                if (!response.ok) {
                    throw new Error('Error al cargar los tipos de entradas');
                }
                
                const data = await response.json();
                setTicketTypes(data);
                
                // Inicializar el objeto de cantidades con los tipos obtenidos
                const initialQuantities = {};
                data.forEach(type => {
                    initialQuantities[type.code] = 0;
                });
                setQuantities(initialQuantities);
                
            } catch (err) {
                setError(err.message);
                console.error('Error al cargar tipos de entradas:', err);
            } finally {
                setLoading(false);
            }
        };
        
        // Mientras desarrollas, puedes usar datos estáticos en caso de que la API no esté lista
        const useMockData = false; // Cambiar a false cuando la API esté lista
        
        if (useMockData) {
            // Usar los datos estáticos originales para desarrollo
            const mockTypes = [
                {
                    code: 'normal',
                    name: 'Normal',
                    description: 'Entrada general',
                    price: 10.40
                },
                {
                    code: 'menor',
                    name: 'Menores 13',
                    description: 'Presentar DNI o Libro de familia. 1 entrada máx. por carnet. Debe tener entre 3 y 12 años.',
                    price: 8.40
                },
                {
                    code: 'joven',
                    name: 'Carnet Joven',
                    description: 'Titular del Carnet Joven Oficial -30, carnet estudiante universitario o carnet estudiante internacional (ISIC). 1 entrada máx. por carnet.',
                    price: 8.40
                },
                {
                    code: 'mayor',
                    name: 'Mayores 65',
                    description: 'Presentar DNI o documento acreditativo de edad. 1 entrada máx. por carnet.',
                    price: 8.40
                },
                {
                    code: 'familia',
                    name: 'Familia Numerosa',
                    description: 'Titular Carnet Familia Numerosa',
                    price: 8.40
                }
            ];
            setTicketTypes(mockTypes);
            
            const initialQuantities = {};
            mockTypes.forEach(type => {
                initialQuantities[type.code] = 0;
            });
            setQuantities(initialQuantities);
            setLoading(false);
        } else {
            fetchTicketTypes();
        }
    }, [movieSelected]);

    // Inicializar cantidades basado en el número de asientos seleccionados
    useEffect(() => {
        if (totalSeats > 0 && totalTickets === 0 && Object.keys(quantities).length > 0 && ticketTypes.length > 0) {
            // Si hay asientos seleccionados pero no tenemos tickets asignados
            // asignamos todos como 'normal' por defecto
            const defaultType = ticketTypes.find(type => type.code === 'normal') ? 'normal' : ticketTypes[0]?.code;
            
            if (defaultType) {
                setQuantities(prev => ({
                    ...prev,
                    [defaultType]: totalSeats
                }));
            }
        }
    }, [totalSeats, totalTickets, quantities, ticketTypes]);

    // Calcular total cuando cambien las cantidades
    useEffect(() => {
        let newTotal = 0;
        let newTotalTickets = 0;
        
        if (ticketTypes.length > 0) {
            ticketTypes.forEach(type => {
                const quantity = quantities[type.code] || 0;
                newTotal += type.price * quantity;
                newTotalTickets += quantity;
            });
        }
        
        setTotal(newTotal);
        setTotalTickets(newTotalTickets);
    }, [quantities, ticketTypes]);

    // Función para incrementar la cantidad
    const incrementQuantity = (code) => {
        // Solo permitir incrementar si no excedemos el total de asientos seleccionados
        if (totalTickets < totalSeats) {
            setQuantities(prev => ({
                ...prev,
                [code]: (prev[code] || 0) + 1
            }));
        }
    };

    // Función para decrementar la cantidad
    const decrementQuantity = (code) => {
        if (quantities[code] > 0) {
            setQuantities(prev => ({
                ...prev,
                [code]: prev[code] - 1
            }));
        }
    };

    // Función para calcular el subtotal
    const calculateSubtotal = (code) => {
        const type = ticketTypes.find(type => type.code === code);
        const quantity = quantities[code] || 0;
        return type ? (type.price * quantity).toFixed(2) : "0.00";
    };

    // Función para manejar el botón "Atrás"
    const handleGoBack = () => {
        const { needsConfirmation, message } = needsConfirmationForPreviousStep();
        
        if (needsConfirmation) {
            const confirmed = window.confirm(message);
            if (confirmed) {
                previousStep();
            }
        } else {
            previousStep();
        }
    };

    // Función para continuar al siguiente paso
    const handleContinue = () => {
        // Verificar que el total de tickets sea igual al total de asientos
        if (totalTickets === totalSeats) {
            // Generar un array con la información detallada de cada tipo de entrada
            const ticketTypeDetails = [];
            
            // Para cada tipo de entrada con cantidad > 0
            ticketTypes.forEach(type => {
                const quantity = quantities[type.code] || 0;
                if (quantity > 0) {
                    ticketTypeDetails.push({
                        code: type.code,
                        name: type.name,
                        price: type.price,
                        quantity: quantity,
                        subtotal: type.price * quantity
                    });
                }
            });
            
            // Asignar los tipos de entradas al store para uso posterior
            if (typeof assignTicketTypes === 'function') {
                assignTicketTypes(ticketTypeDetails);
            }
            
            // Asignar el precio total
            assignTotal(total);
            
            // Avanzar al siguiente paso
            nextStep();
        } else {
            alert(`Debes asignar todos los asientos. Has seleccionado ${totalSeats} asientos pero has asignado ${totalTickets} tipos de entrada.`);
        }
    };

    // Mostrar indicador de carga
    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white py-12 px-4 flex flex-col items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-red-500 border-r-transparent"></div>
                <p className="mt-4">Cargando tipos de entradas...</p>
            </div>
        );
    }

    // Mostrar mensaje de error
    if (error) {
        return (
            <div className="min-h-screen bg-black text-white py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-red-900 border border-red-700 p-4 rounded-md text-center">
                        <h2 className="text-xl font-medium mb-2">Error</h2>
                        <p>{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <h1 className="text-2xl font-light mb-4 sm:mb-0">Selecciona tus entradas</h1>
                    <button
                        onClick={handleGoBack}
                        className="px-4 py-2 bg-transparent border border-gray-700 text-white rounded hover:bg-gray-900 transition-colors"
                    >
                        Atrás
                    </button>
                </div>
                
                <div className="flex items-center space-x-2 mb-6">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    <p className="text-sm text-gray-300">
                        Asientos seleccionados: <span className="text-white font-medium">{totalSeats}</span>
                    </p>
                </div>
                
                {/* Divider with film reel design */}
                <div className="flex items-center my-8">
                    <div className="flex-grow h-px bg-gray-800"></div>
                    <div className="flex space-x-1 mx-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-gray-700"></div>
                        ))}
                    </div>
                    <div className="flex-grow h-px bg-gray-800"></div>
                </div>
                
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                    <div className="divide-y divide-gray-800">
                        {ticketTypes.map((type) => (
                            <div key={type.code} className="py-5 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <h2 className="text-lg font-medium text-white">{type.name}</h2>
                                    <p className="text-sm text-gray-400 mt-1">{type.description}</p>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                                    <span className="text-lg font-light text-gray-300 w-20 text-right">
                                        {type.price.toFixed(2)} €
                                    </span>
                                    
                                    <div className="flex items-center border border-gray-700 rounded-md overflow-hidden bg-gray-800">
                                        <button 
                                            onClick={() => decrementQuantity(type.code)}
                                            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white font-bold transition"
                                        >
                                            -
                                        </button>
                                        <span className="w-10 text-center py-1 text-white font-medium">{quantities[type.code] || 0}</span>
                                        <button 
                                            onClick={() => incrementQuantity(type.code)}
                                            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white font-bold transition"
                                        >
                                            +
                                        </button>
                                    </div>
                                    
                                    <span className="text-lg font-medium text-red-500 w-24 text-right">
                                        {calculateSubtotal(type.code)} €
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="mt-10 pt-6 border-t border-gray-800">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div>
                            <p className="text-sm text-gray-400">
                                Gastos de gestión, IVA y recargos incluidos
                            </p>
                            <div className="flex items-center mt-2">
                                <div className={`w-2 h-2 rounded-full mr-2 ${totalTickets === totalSeats ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <p className="text-sm text-gray-300">
                                    {totalTickets}/{totalSeats} entradas seleccionadas
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-light text-gray-300">Total</div>
                            <div className="text-3xl font-medium text-white">
                                {total.toFixed(2)} €
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleContinue}
                        disabled={totalTickets !== totalSeats}
                        className={`mt-8 w-full py-3 px-4 rounded font-medium transition-colors
                            ${totalTickets === totalSeats ? 
                              'bg-red-600 text-white hover:bg-red-700' : 
                              'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    >
                        Continuar
                    </button>
                </div>
            </div>
        </div>
    );
}