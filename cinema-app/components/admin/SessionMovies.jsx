import { useState, useEffect } from 'react';
import CardSession from './CardSession';
import { useScreeningStore } from '@/store/screeningStore';

export default function SessionMovies() {
    const { fetchScreenings, loading, screenings } = useScreeningStore();
    const [statsVisible, setStatsVisible] = useState(true);

    useEffect(() => {
        fetchScreenings();
    }, []);

    // Calcular estadísticas de las sesiones
    const activeScreenings = screenings?.filter(s => s.status !== 'cancelled')?.length || 0;
    const cancelledScreenings = screenings?.filter(s => s.status === 'cancelled')?.length || 0;
    const totalScreenings = screenings?.length || 0;

    return (
        <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-2xl overflow-hidden">
            {/* Cabecera */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-800 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex items-center mb-4 sm:mb-0">
                        <div className="bg-red-600 w-10 h-10 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Gestión de Sesiones</h2>
                            <p className="text-gray-400 text-sm">Administra las sesiones de cine programadas</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setStatsVisible(!statsVisible)}
                        className="flex items-center text-gray-300 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        {statsVisible ? 'Ocultar Estadísticas' : 'Mostrar Estadísticas'}
                    </button>
                </div>
                
                {/* Estadísticas */}
                {statsVisible && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 transition-all duration-300">
                        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-gray-700">
                            <div className="flex items-center">
                                <div className="w-12 h-12 rounded-lg bg-green-900 flex items-center justify-center mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider">Sesiones Activas</p>
                                    <p className="text-2xl font-bold text-white">{activeScreenings}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-gray-700">
                            <div className="flex items-center">
                                <div className="w-12 h-12 rounded-lg bg-red-900 flex items-center justify-center mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider">Sesiones Canceladas</p>
                                    <p className="text-2xl font-bold text-white">{cancelledScreenings}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-gray-700">
                            <div className="flex items-center">
                                <div className="w-12 h-12 rounded-lg bg-blue-900 flex items-center justify-center mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider">Total Sesiones</p>
                                    <p className="text-2xl font-bold text-white">{totalScreenings}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Contenido */}
            <div className="p-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12">
                        <div className="relative w-20 h-20 mb-6">
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-700 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-red-600 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-gray-400">Cargando sesiones...</p>
                    </div>
                ) : (
                    <CardSession />
                )}
            </div>
        </div>
    );
}