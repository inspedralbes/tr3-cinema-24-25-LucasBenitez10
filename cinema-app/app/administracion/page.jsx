'use client';
import { useEffect, useState } from 'react';
import DropdownMovies from '@/components/admin/DropdownMovies';
import SessionMovies from '@/components/admin/SessionMovies';
import ScreeningStatistics from '@/components/admin/ScreeningStatistics';
import ProtectedAdminRoute from '@/components/protected/ProtectedAdminRoute';

export default function Administracion() {
    const [activeTab, setActiveTab] = useState('sesiones');

    return (
        <ProtectedAdminRoute>
            <div className="min-h-screen bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Cabecera */}
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Panel de Administración
                        </h1>
                        <p className="text-gray-400">
                            Gestiona tu cine, programa sesiones y monitorea el rendimiento
                        </p>
                    </div>

                    {/* Navegación */}
                    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-xl mb-8">
                        <div className="flex overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('sesiones')}
                                className={`px-6 py-4 text-sm font-medium transition-colors flex items-center ${activeTab === 'sesiones'
                                        ? 'text-white border-b-2 border-red-600 bg-gray-800'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                </svg>
                                Sesiones
                            </button>
                            <button
                                onClick={() => setActiveTab('programar')}
                                className={`px-6 py-4 text-sm font-medium transition-colors flex items-center ${activeTab === 'programar'
                                        ? 'text-white border-b-2 border-red-600 bg-gray-800'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Programar Sesión
                            </button>
                            <button
                                onClick={() => setActiveTab('estadisticas')}
                                className={`px-6 py-4 text-sm font-medium transition-colors flex items-center ${activeTab === 'estadisticas'
                                        ? 'text-white border-b-2 border-red-600 bg-gray-800'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Estadísticas
                            </button>
                        </div>
                    </div>

                    {/* Contenido */}
                    <div className="space-y-8">
                        {activeTab === 'sesiones' && (
                            <SessionMovies />
                        )}

                        {activeTab === 'programar' && (
                            <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-2xl overflow-hidden">
                                <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-800 p-6">
                                    <div className="flex items-center">
                                        <div className="bg-red-600 w-10 h-10 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">Programar Nueva Sesión</h2>
                                            <p className="text-gray-400 text-sm">Crea una nueva sesión para las películas disponibles</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <DropdownMovies />
                                </div>
                            </div>
                        )}

                        {activeTab === 'estadisticas' && (
                            <ScreeningStatistics />
                        )}
                    </div>
                </div>
            </div>
        </ProtectedAdminRoute>

    );
}