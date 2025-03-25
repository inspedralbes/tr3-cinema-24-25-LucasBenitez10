import { useState, useEffect } from 'react';
import { useBookingStore } from '@/store/bookingStore';

export default function BookingSeatType() {
    const { 
        getSelectedSeatsCount, 
        selectedSeats,
        assignTotal,
        nextStep,
        previousStep,
        needsConfirmationForPreviousStep
    } = useBookingStore();

    // Datos de los tipos de entradas
    const ticketTypes = [
        {
            id: 'normal',
            name: 'Normal',
            description: 'Entrada general',
            price: 10.40
        },
        {
            id: 'menor',
            name: 'Menores 13',
            description: 'Presentar DNI o Libro de familia. 1 entrada máx. por carnet. Debe tener entre 3 y 12 años.',
            price: 8.40
        },
        {
            id: 'joven',
            name: 'Carnet Joven',
            description: 'Titular del Carnet Joven Oficial -30, carnet estudiante universitario o carnet estudiante internacional (ISIC). 1 entrada máx. por carnet.',
            price: 8.40
        },
        {
            id: 'mayor',
            name: 'Mayores 65',
            description: 'Presentar DNI o documento acreditativo de edad. 1 entrada máx. por carnet.',
            price: 8.40
        },
        {
            id: 'familia',
            name: 'Familia Numerosa',
            description: 'Titular Carnet Familia Numerosa',
            price: 8.40
        }
    ];

    // Estado para almacenar las cantidades seleccionadas
    const [quantities, setQuantities] = useState({
        normal: 0,
        menor: 0,
        joven: 0,
        mayor: 0,
        familia: 0
    });

    // Estado para el total
    const [total, setTotal] = useState(0);
    // Estado para el total de entradas
    const [totalTickets, setTotalTickets] = useState(0);
    // Total de asientos seleccionados previamente
    const totalSeats = getSelectedSeatsCount();

    // Inicializar cantidades basado en el número de asientos seleccionados
    useEffect(() => {
        if (totalSeats > 0 && totalTickets === 0) {
            // Si hay asientos seleccionados pero no tenemos tickets asignados
            // asignamos todos como 'normal' por defecto
            setQuantities({
                ...quantities,
                normal: totalSeats
            });
        }
    }, [totalSeats]);

    // Calcular total cuando cambien las cantidades
    useEffect(() => {
        let newTotal = 0;
        let newTotalTickets = 0;
        
        ticketTypes.forEach(type => {
            newTotal += type.price * quantities[type.id];
            newTotalTickets += quantities[type.id];
        });
        
        setTotal(newTotal);
        setTotalTickets(newTotalTickets);
    }, [quantities]);

    // Función para incrementar la cantidad
    const incrementQuantity = (id) => {
        // Solo permitir incrementar si no excedemos el total de asientos seleccionados
        if (totalTickets < totalSeats) {
            setQuantities(prev => ({
                ...prev,
                [id]: prev[id] + 1
            }));
        }
    };

    // Función para decrementar la cantidad
    const decrementQuantity = (id) => {
        if (quantities[id] > 0) {
            setQuantities(prev => ({
                ...prev,
                [id]: prev[id] - 1
            }));
        }
    };

    // Función para calcular el subtotal
    const calculateSubtotal = (id) => {
        const type = ticketTypes.find(type => type.id === id);
        return (type.price * quantities[id]).toFixed(2);
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
            // Aquí podrías guardar información adicional sobre los tipos de asientos
            // en el store si fuera necesario
            assignTotal(total)
            nextStep();
        } else {
            alert(`Debes asignar todos los asientos. Has seleccionado ${totalSeats} asientos pero has asignado ${totalTickets} tipos de entrada.`);
        }
    };

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
                            <div key={type.id} className="py-5 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                                            onClick={() => decrementQuantity(type.id)}
                                            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white font-bold transition"
                                        >
                                            -
                                        </button>
                                        <span className="w-10 text-center py-1 text-white font-medium">{quantities[type.id]}</span>
                                        <button 
                                            onClick={() => incrementQuantity(type.id)}
                                            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white font-bold transition"
                                        >
                                            +
                                        </button>
                                    </div>
                                    
                                    <span className="text-lg font-medium text-red-500 w-24 text-right">
                                        {calculateSubtotal(type.id)} €
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