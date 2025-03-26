import { useState, useEffect, useCallback } from 'react';
import { getScreeningStatistics } from '@/services/statisticsService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useScreeningStore } from '@/store/screeningStore';

export default function ScreeningStatistics() {
    const { screenings, fetchScreenings } = useScreeningStore();
    const [selectedScreeningId, setSelectedScreeningId] = useState(null);
    const [screeningStats, setScreeningStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(30); // segundos
    const [lastUpdated, setLastUpdated] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [error, setError] = useState(null);

    // Función para cargar estadísticas
    const loadStatistics = useCallback(async (screeningId) => {
        if (!screeningId) return;
        
        setLoading(true);
        setError(null);
        
        try {
            console.log("Cargando estadísticas para sesión:", screeningId);
            const stats = await getScreeningStatistics(screeningId);
            console.log("Estadísticas obtenidas:", stats);
            setScreeningStats(stats);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Error al cargar estadísticas:", error);
            setError(`Error al cargar estadísticas: ${error.message}`);
            // Optionally, set screeningStats to null to clear previous data
            setScreeningStats(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Recargar datos periódicamente y también cuando cambia la sesión seleccionada
    useEffect(() => {
        if (selectedScreeningId) {
            loadStatistics(selectedScreeningId);
        }
    }, [selectedScreeningId, loadStatistics]);

    // Cargar datos de sesiones si es necesario
    useEffect(() => {
        if (!screenings || screenings.length === 0) {
            fetchScreenings();
        }
    }, [screenings, fetchScreenings]);

    // Establecer primera sesión como seleccionada si hay sesiones disponibles
    useEffect(() => {
        if (screenings && screenings.length > 0 && !selectedScreeningId) {
            setSelectedScreeningId(screenings[0]._id);
        }
    }, [screenings, selectedScreeningId]);

    // Configurar actualización automática
    useEffect(() => {
        let interval;
        
        if (autoRefresh && selectedScreeningId) {
            interval = setInterval(() => {
                loadStatistics(selectedScreeningId);
            }, refreshInterval * 1000);
        }
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh, refreshInterval, selectedScreeningId, loadStatistics]);

    // Calcular tiempo desde la última actualización
    const getTimeSinceUpdate = () => {
        if (!lastUpdated) return 'Nunca';
        
        const seconds = Math.floor((new Date() - lastUpdated) / 1000);
        
        if (seconds < 60) return `hace ${seconds} segundos`;
        if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} minutos`;
        return `hace ${Math.floor(seconds / 3600)} horas`;
    };

    // Calcular el color del indicador de ocupación
    const getOccupancyColor = (rate) => {
        if (rate < 30) return '#ef4444'; // Rojo para baja ocupación
        if (rate < 70) return '#eab308'; // Amarillo para ocupación media
        return '#22c55e'; // Verde para alta ocupación
    };

    // Formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return '';
        
        return new Date(dateString).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Formatear timestamp para el gráfico
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        
        return new Date(timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit'
        });
    };

    // Formatear moneda
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    };

    // Colores personalizados para gráficos
    const chartColors = {
        primary: '#ef4444', // Rojo
        secondary: '#3b82f6', // Azul
        tertiary: '#22c55e', // Verde
        background: 'rgba(15, 23, 42, 0.8)', // Fondo
        text: '#94a3b8', // Texto
        grid: 'rgba(148, 163, 184, 0.15)' // Líneas de cuadrícula
    };

    if (!screenings || screenings.length === 0) {
        return (
            <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl p-12 text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No hay sesiones disponibles</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">Programa sesiones para ver sus estadísticas en tiempo real</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-2xl overflow-hidden">
            {/* Cabecera */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-800 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center">
                        <div className="bg-red-600 w-10 h-10 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Estadísticas de Sesiones</h2>
                            <p className="text-gray-400 text-sm">Análisis en tiempo real de ventas de entradas</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <select
                                value={selectedScreeningId || ''}
                                onChange={(e) => setSelectedScreeningId(e.target.value)}
                                className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 pr-10 appearance-none w-full focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm"
                            >
                                <option value="" disabled>Seleccionar sesión</option>
                                {screenings.map(screening => (
                                    <option key={screening._id} value={screening._id}>
                                        {screening.movie.title} - {new Date(screening.date).toLocaleDateString()} {screening.startTime}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-0 top-0 h-full flex items-center pr-3 pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <label htmlFor="refresh-interval" className="text-gray-400 text-sm">Actualizar:</label>
                            <div className="relative flex-1 min-w-[120px]">
                                <select
                                    id="refresh-interval"
                                    value={refreshInterval}
                                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                                    className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 pr-10 appearance-none w-full focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm"
                                >
                                    <option value="10">Cada 10s</option>
                                    <option value="30">Cada 30s</option>
                                    <option value="60">Cada minuto</option>
                                    <option value="300">Cada 5 minutos</option>
                                </select>
                                <div className="absolute right-0 top-0 h-full flex items-center pr-3 pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`p-2 rounded-lg border ${
                                    autoRefresh 
                                    ? 'bg-red-600 border-red-700 text-white' 
                                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                                title={autoRefresh ? 'Desactivar actualización automática' : 'Activar actualización automática'}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                            
                            <button
                                onClick={() => loadStatistics(selectedScreeningId)}
                                disabled={loading}
                                className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700"
                                title="Actualizar ahora"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Contenido de las estadísticas */}
            <div className="p-6">
                {error && (
                    <div className="bg-red-900 bg-opacity-50 border border-red-700 rounded-lg p-4 mb-6 text-white">
                        <p>{error}</p>
                    </div>
                )}
                
                {loading && !screeningStats ? (
                    <div className="flex flex-col items-center justify-center p-12">
                        <div className="relative w-20 h-20 mb-6">
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-700 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-red-600 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-gray-400">Cargando estadísticas...</p>
                    </div>
                ) : screeningStats ? (
                    <>
                        {/* Última actualización */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center">
                                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                <span className="text-gray-400 text-sm">Última actualización: {getTimeSinceUpdate()}</span>
                            </div>
                            {loading && (
                                <span className="text-gray-400 text-sm flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Actualizando...
                                </span>
                            )}
                        </div>
                    
                        {/* Información de la sesión */}
                        <div className="flex flex-col md:flex-row gap-6 mb-8">
                            <div className="bg-gray-800 bg-opacity-50 rounded-xl overflow-hidden border border-gray-700 flex-1 md:max-w-xs">
                                <div className="h-48 relative">
                                    <img
                                        src={process.env.NEXT_PUBLIC_URL_IMAGE + screeningStats.movie.poster_path}
                                        alt={screeningStats.movie.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <h3 className="text-xl font-bold text-white">{screeningStats.movie.title}</h3>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Sala:</span>
                                        <span className="text-white font-medium">{screeningStats.room.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Fecha:</span>
                                        <span className="text-white font-medium">{formatDate(screeningStats.date)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Hora:</span>
                                        <span className="text-white font-medium">{screeningStats.startTime}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Estado:</span>
                                        <span className={`font-medium ${screeningStats.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                                            {screeningStats.status === 'active' ? 'Activa' : 'Cancelada'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* KPI: Ocupación */}
                                <div className="bg-gray-800 bg-opacity-50 rounded-xl border border-gray-700 p-6">
                                    <h3 className="text-gray-400 text-sm mb-2">Ocupación</h3>
                                    <div className="flex items-end gap-2">
                                        <div className="text-4xl font-bold text-white">
                                            {Math.round(screeningStats.stats.occupancyRate)}%
                                        </div>
                                        <div className="text-sm text-gray-400 pb-1">
                                            {screeningStats.stats.ticketsSold} / {screeningStats.stats.totalSeats} asientos
                                        </div>
                                    </div>
                                    <div className="mt-4 bg-gray-700 h-3 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full" 
                                            style={{ 
                                                width: `${screeningStats.stats.occupancyRate}%`,
                                                backgroundColor: getOccupancyColor(screeningStats.stats.occupancyRate)
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                
                                {/* KPI: Ingresos */}
                                <div className="bg-gray-800 bg-opacity-50 rounded-xl border border-gray-700 p-6">
                                    <h3 className="text-gray-400 text-sm mb-2">Ingresos</h3>
                                    <div className="flex items-end gap-2">
                                        <div className="text-4xl font-bold text-white">
                                            {formatCurrency(screeningStats.stats.revenue)}
                                        </div>
                                    </div>
                                    <div className="mt-4 text-sm text-gray-400">
                                        <div className="flex justify-between mb-1">
                                            <span>Precio promedio por entrada:</span>
                                            <span className="text-white font-medium">
                                                {formatCurrency(screeningStats.stats.ticketsSold > 0 
                                                    ? (screeningStats.stats.revenue / screeningStats.stats.ticketsSold)
                                                    : 0
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Entradas disponibles:</span>
                                            <span className="text-white font-medium">
                                                {screeningStats.stats.availableSeats}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Gráficos */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Gráfico: Evolución de ventas */}
                            <div className="bg-gray-800 bg-opacity-50 rounded-xl border border-gray-700 p-6">
                                <h3 className="text-gray-200 font-medium mb-4">Evolución de ventas</h3>
                                
                                {screeningStats.stats.salesTimeline && screeningStats.stats.salesTimeline.length > 0 ? (
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={screeningStats.stats.salesTimeline}
                                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                                <XAxis 
                                                    dataKey="timestamp" 
                                                    tickFormatter={formatTimestamp} 
                                                    stroke={chartColors.text}
                                                    tick={{ fill: chartColors.text }}
                                                />
                                                <YAxis 
                                                    yAxisId="left"
                                                    stroke={chartColors.text}
                                                    tick={{ fill: chartColors.text }}
                                                />
                                                <YAxis 
                                                    yAxisId="right"
                                                    orientation="right"
                                                    stroke={chartColors.text}
                                                    tick={{ fill: chartColors.text }}
                                                />
                                                <Tooltip 
                                                    contentStyle={{ 
                                                        backgroundColor: chartColors.background,
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        color: '#fff'
                                                    }}
                                                    formatter={(value, name) => {
                                                        if (name === 'Ingresos (€)') return [formatCurrency(value), name];
                                                        return [value, name];
                                                    }}
                                                />
                                                <Legend 
                                                    formatter={(value) => <span style={{ color: '#fff' }}>{value}</span>}
                                                />
                                                <Line
                                                    yAxisId="left"
                                                    type="monotone"
                                                    dataKey="totalTickets"
                                                    name="Entradas vendidas"
                                                    stroke={chartColors.primary}
                                                    strokeWidth={2}
                                                    dot={{ fill: chartColors.primary, r: 4 }}
                                                    activeDot={{ r: 6 }}
                                                />
                                                <Line
                                                    yAxisId="right"
                                                    type="monotone"
                                                    dataKey="revenue"
                                                    name="Ingresos (€)"
                                                    stroke={chartColors.tertiary}
                                                    strokeWidth={2}
                                                    dot={{ fill: chartColors.tertiary, r: 4 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-80 flex items-center justify-center">
                                        <p className="text-gray-400">No hay datos de ventas disponibles</p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Gráfico: Distribución de tipos de entradas */}
                            <div className="bg-gray-800 bg-opacity-50 rounded-xl border border-gray-700 p-6">
                                <h3 className="text-gray-200 font-medium mb-4">Tipos de entradas vendidas</h3>
                                
                                {screeningStats.stats.ticketTypes && screeningStats.stats.ticketTypes.length > 0 && screeningStats.stats.ticketsSold > 0 ? (
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={screeningStats.stats.ticketTypes}
                                                    dataKey="count"
                                                    nameKey="type"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {screeningStats.stats.ticketTypes.map((entry, index) => (
                                                        <Cell 
                                                            key={`cell-${index}`} 
                                                            fill={index % 3 === 0 ? chartColors.primary : 
                                                                  index % 3 === 1 ? chartColors.secondary : 
                                                                  chartColors.tertiary} 
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{ 
                                                        backgroundColor: chartColors.background,
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        color: '#fff'
                                                    }}
                                                    formatter={(value, name, props) => [
                                                        `${value} entradas (${props.payload.percentage.toFixed(1)}%)`,
                                                        `Tipo: ${name}`
                                                    ]}
                                                />
                                                <Legend
                                                    formatter={(value) => <span style={{ color: '#fff' }}>{value}</span>}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-80 flex items-center justify-center">
                                        <p className="text-gray-400">No hay entradas vendidas</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-gray-800 rounded-xl p-8 text-center">
                        <p className="text-gray-400">Selecciona una sesión para ver sus estadísticas</p>
                    </div>
                )}
            </div>
        </div>
    );
}