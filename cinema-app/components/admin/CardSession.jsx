import { useScreeningStore } from '@/store/screeningStore';
import { useState } from 'react';
import { cancelTicketsByScreeningId, deleteTicketsByScreeningId } from "@/services/ticketService";

export default function CardSession() {
    const { screenings, cancelScreeningById, deleteScreeningById } = useScreeningStore();
    const [processing, setProcessing] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedScreening, setSelectedScreening] = useState(null);
    const [modalAction, setModalAction] = useState(null);

    const openConfirmModal = (screening, action) => {
        setSelectedScreening(screening);
        setModalAction(action);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedScreening(null);
        setModalAction(null);
    };

    const cancelSession = async (id) => {
        setProcessing(id);
        setError("");
        setSuccess("");
        closeModal();
        
        try {
            // Primero cancelar todas las entradas vendidas
            const ticketResult = await cancelTicketsByScreeningId(id);
            console.log("Tickets cancelados:", ticketResult);
            
            // Luego cancelar la sesión
            await cancelScreeningById(id);
            
            setSuccess(`Sesión y ${ticketResult.modifiedCount || 0} entradas canceladas correctamente`);
            setTimeout(() => setSuccess(""), 3000);
        } catch (error) {
            console.error("Error al cancelar sesión:", error);
            setError("Error al cancelar la sesión. Inténtalo de nuevo.");
            setTimeout(() => setError(""), 3000);
        } finally {
            setProcessing(null);
        }
    };

    const deleteSession = async (id) => {
        setProcessing(id);
        setError("");
        setSuccess("");
        closeModal();
        
        try {
            // Primero eliminar todas las entradas vendidas
            const ticketResult = await deleteTicketsByScreeningId(id);
            console.log("Tickets eliminados:", ticketResult);
            
            // Luego eliminar la sesión
            await deleteScreeningById(id);
            
            setSuccess(`Sesión y ${ticketResult.deletedCount || 0} entradas eliminadas correctamente`);
            setTimeout(() => setSuccess(""), 3000);
        } catch (error) {
            console.error("Error al eliminar sesión:", error);
            setError("Error al eliminar la sesión. Inténtalo de nuevo.");
            setTimeout(() => setError(""), 3000);
        } finally {
            setProcessing(null);
        }
    };

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    return (
        <div className="min-h-[300px]">
            {/* Mensajes de éxito y error */}
            {error && (
                <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-red-900 to-red-700 border border-red-600 text-white px-6 py-4 rounded-lg shadow-2xl max-w-md transform transition-all duration-500 ease-in-out opacity-100 translate-y-0" role="alert">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>{error}</p>
                    </div>
                </div>
            )}
            
            {success && (
                <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-900 to-green-700 border border-green-600 text-white px-6 py-4 rounded-lg shadow-2xl max-w-md transform transition-all duration-500 ease-in-out opacity-100 translate-y-0" role="alert">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p>{success}</p>
                    </div>
                </div>
            )}

            {/* Modal de confirmación */}
            {showModal && selectedScreening && (
                <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 ease-in-out animate-scale-in">
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-white">
                                    {modalAction === 'cancel' ? 'Cancelar Sesión' : 'Eliminar Sesión'}
                                </h3>
                                <button 
                                    onClick={closeModal}
                                    className="rounded-full p-1 hover:bg-gray-700 transition-colors duration-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-gray-300 text-sm">
                                {modalAction === 'cancel' 
                                    ? 'Esta acción cancelará la sesión y todas las entradas vendidas. Los clientes serán notificados de la cancelación.'
                                    : 'Esta acción eliminará permanentemente la sesión y todas las entradas vendidas. Esta operación no se puede deshacer.'}
                            </p>
                        </div>
                        
                        <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg mb-6 border border-gray-700">
                            <div className="flex items-center">
                                <div className="mr-4 w-10 h-10 flex-shrink-0 bg-red-600 rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white mb-1">{selectedScreening.movie.title}</h4>
                                    <div className="text-xs text-gray-300 space-y-1">
                                        <p className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            Sala: {selectedScreening.room.name}
                                        </p>
                                        <p className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {formatDate(selectedScreening.date)}
                                        </p>
                                        <p className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {selectedScreening.startTime}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                            <button 
                                onClick={closeModal}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors duration-200 text-sm"
                            >
                                Cancelar
                            </button>
                            
                            <button 
                                onClick={() => modalAction === 'cancel' 
                                    ? cancelSession(selectedScreening._id) 
                                    : deleteSession(selectedScreening._id)}
                                className={`px-4 py-2 rounded-md transition-colors duration-200 flex items-center text-sm ${
                                    modalAction === 'cancel'
                                        ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                                        : 'bg-red-600 hover:bg-red-500 text-white'
                                }`}
                            >
                                {modalAction === 'cancel' ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                        Confirmar Cancelación
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Confirmar Eliminación
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Listado de sesiones */}
            {screenings && screenings.length === 0 ? (
                <div className="bg-gray-900 bg-opacity-60 rounded-xl border border-gray-800 shadow-xl p-12 text-center">
                    <div className="mx-auto w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No hay sesiones programadas</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">Programa nuevas sesiones para que aparezcan aquí y los clientes puedan comprar entradas</p>
                    <button className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors shadow-lg inline-flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Programar Nueva Sesión
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {screenings && screenings.map((session) => (
                        <div key={session._id || session.movie._id} className="group bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-gray-700 hover:translate-y-[-5px]">
                            <div className="relative h-80">
                                <img 
                                    src={process.env.NEXT_PUBLIC_URL_IMAGE + session.movie.poster_path} 
                                    alt={session.movie.title} 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                                
                                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                                    session.status === 'cancelled' 
                                    ? 'bg-red-600 text-white' 
                                    : 'bg-green-600 text-white'
                                }`}>
                                    {session.status === 'cancelled' ? 'Cancelada' : 'Activa'}
                                </div>
                                
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">{session.movie.title}</h3>
                                </div>
                            </div>
                            
                            <div className="p-5">
                                <div className="space-y-3 text-gray-300 mb-5">
                                    <div className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <div>
                                            <p className="text-xs text-gray-500">Sala</p>
                                            <p className="font-medium">{session.room.name}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-xs text-gray-500">Hora</p>
                                            <p className="font-medium">{session.startTime}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <div>
                                            <p className="text-xs text-gray-500">Fecha</p>
                                            <p className="font-medium">
                                                {formatDate(session.date)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    {session.status !== 'cancelled' && (
                                        <button 
                                            onClick={() => openConfirmModal(session, 'cancel')} 
                                            disabled={processing === session._id}
                                            className={`w-full py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center ${
                                                processing === session._id 
                                                ? 'bg-gray-700 cursor-not-allowed' 
                                                : 'bg-amber-700 hover:bg-amber-600 text-white'
                                            }`}
                                        >
                                            {processing === session._id ? (
                                                <span className="flex items-center justify-center">
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Procesando...
                                                </span>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                    </svg>
                                                    Cancelar Sesión
                                                </>
                                            )}
                                        </button>
                                    )}
                                    
                                    <button 
                                        onClick={() => openConfirmModal(session, 'delete')}
                                        disabled={processing === session._id}
                                        className={`w-full py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center ${
                                            processing === session._id 
                                            ? 'bg-gray-700 cursor-not-allowed' 
                                            : 'bg-red-700 hover:bg-red-600 text-white'
                                        }`}
                                    >
                                        {processing === session._id ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Procesando...
                                            </span>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Eliminar Sesión
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}