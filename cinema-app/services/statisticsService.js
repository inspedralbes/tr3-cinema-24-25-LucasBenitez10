const API_URL = 'http://localhost:4000/api';

// Helper function to get last week's sales (can be replaced with actual backend logic)
const getLastWeekSales = () => {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  return days.map(day => ({
    day,
    ticketsSold: Math.floor(Math.random() * 150) + 50,
    revenue: Math.floor(Math.random() * 1500) + 500
  }));
};

/**
 * Obtener estadísticas generales de todas las sesiones
 * @returns {Promise<Object>} Estadísticas generales de sesiones y ventas
 */
export const getGeneralStatistics = async () => {
  try {
    // Obtener todas las sesiones
    const screeningsResponse = await fetch(`${API_URL}/screenings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!screeningsResponse.ok) {
      throw new Error('Error al obtener sesiones');
    }
    
    const screeningsData = await screeningsResponse.json();
    const screenings = screeningsData.data || [];
    
    // Calcular estadísticas básicas de las sesiones
    const totalScreenings = screenings.length;
    const activeScreenings = screenings.filter(s => s.status !== 'cancelled').length;
    const cancelledScreenings = screenings.filter(s => s.status === 'cancelled').length;
    
    // Preparar datos para obtener tickets de sesiones recientes
    const recentScreenings = screenings
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
    
    // Preparar contenedor para estadísticas de películas
    const movieStats = {};
    let totalTicketsSold = 0;
    let totalRevenue = 0;
    
    // Obtener tickets para cada sesión reciente
    for (const screening of recentScreenings) {
      try {
        // Usar la ruta de tickets por sesión
        const ticketsResponse = await fetch(`${API_URL}/tickets/screening/${screening._id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (ticketsResponse.ok) {
          const tickets = await ticketsResponse.json();
          
          // Filtrar tickets activos
          const activeTickets = tickets.filter(t => t.status !== 'cancelled');
          
          // Acumular estadísticas
          totalTicketsSold += activeTickets.length;
          
          // Calcular ingresos
          const revenue = activeTickets.reduce((sum, ticket) => sum + (ticket.pricePaid || 0), 0);
          totalRevenue += revenue;
          
          // Actualizar estadísticas de película
          const movieTitle = screening.movie.title;
          if (!movieStats[movieTitle]) {
            movieStats[movieTitle] = { 
              title: movieTitle, 
              ticketsSold: 0, 
              revenue: 0,
              poster: screening.movie.poster_path || ''
            };
          }
          
          movieStats[movieTitle].ticketsSold += activeTickets.length;
          movieStats[movieTitle].revenue += revenue;
        }
      } catch (error) {
        console.error(`Error al obtener tickets para la sesión ${screening._id}:`, error);
      }
    }
    
    // Convertir las estadísticas de películas a un array y ordenar por tickets vendidos
    const topMovies = Object.values(movieStats)
      .sort((a, b) => b.ticketsSold - a.ticketsSold)
      .slice(0, 5);
    
    // Ultimos 7 días de ventas (simuladas por ahora)
    const lastWeekSales = getLastWeekSales();
    
    return {
      totalScreenings,
      activeScreenings,
      cancelledScreenings,
      totalTicketsSold,
      totalRevenue,
      topMovies,
      lastWeekSales
    };
  } catch (error) {
    console.error("Error en statisticsService (general):", error);
    throw error;
  }
};

/**
 * Obtener estadísticas específicas de una sesión
 * @param {String} screeningId - ID de la sesión
 * @returns {Promise<Object>} Estadísticas detalladas de la sesión
 */
export const getScreeningStatistics = async (screeningId) => {
  try {
    // Obtener detalles de la sesión
    const screeningResponse = await fetch(`${API_URL}/screenings/filters?screeningId=${screeningId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!screeningResponse.ok) {
      throw new Error('Error al obtener detalles de la sesión');
    }
    
    const screeningData = await screeningResponse.json();
    
    // Asegurar que tenemos datos
    if (!screeningData.data || screeningData.data.length === 0) {
      throw new Error('Sesión no encontrada');
    }
    
    // Encontrar la sesión exacta por ID
    let screening = screeningData.data.find(s => s._id === screeningId) || screeningData.data[0];
    
    // Obtener tickets para esta sesión
    const ticketsResponse = await fetch(`${API_URL}/tickets/screening/${screeningId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!ticketsResponse.ok) {
      throw new Error('Error al obtener tickets de la sesión');
    }
    
    const tickets = await ticketsResponse.json();
    
    // Filtrar tickets activos
    const activeTickets = tickets.filter(t => t.status !== 'cancelled');
    
    // Calcular estadísticas de tickets
    const ticketTypes = calculateTicketTypeStats(activeTickets);
    const salesTimeline = generateSalesTimeline(activeTickets);
    
    // Preparar estadísticas generales
    const stats = {
      totalSeats: screening.room.capacity,
      availableSeats: screening.availableSeats,
      ticketsSold: activeTickets.length,
      occupancyRate: (activeTickets.length / screening.room.capacity) * 100,
      revenue: activeTickets.reduce((sum, ticket) => sum + ticket.pricePaid, 0),
      ticketTypes,
      salesTimeline
    };
    
    // Combinar toda la información
    return {
      ...screening,
      stats
    };
  } catch (error) {
    console.error(`Error en statisticsService (screening ${screeningId}):`, error);
    throw error;
  }
};

/**
 * Calcular estadísticas de tipos de entradas
 * @param {Array} tickets - Lista de tickets
 * @returns {Array} Estadísticas de tipos de entradas
 */
const calculateTicketTypeStats = (tickets) => {
  // Agrupar tickets por tipo y calcular estadísticas
  const typeGroups = tickets.reduce((acc, ticket) => {
    const type = ticket.ticketTypeCode || 'normal';
    
    if (!acc[type]) {
      acc[type] = {
        type,
        count: 0,
        revenue: 0,
        percentage: 0
      };
    }
    
    acc[type].count++;
    acc[type].revenue += ticket.pricePaid;
    
    return acc;
  }, {});
  
  // Convertir a array y calcular porcentajes
  const total = tickets.length;
  return Object.values(typeGroups).map(group => ({
    ...group,
    percentage: (group.count / total) * 100
  })).sort((a, b) => b.count - a.count);
};

/**
 * Generar línea de tiempo de ventas
 * @param {Array} tickets - Lista de tickets
 * @returns {Array} Línea de tiempo de ventas
 */
const generateSalesTimeline = (tickets) => {
  // Ordenar tickets por timestamp de creación
  const sortedTickets = tickets.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  // Agrupar ventas por intervalos de tiempo
  const timeline = sortedTickets.reduce((acc, ticket) => {
    const timestamp = new Date(ticket.createdAt);
    
    // Buscar o crear entrada para este timestamp
    let entry = acc.find(e => new Date(e.timestamp).getTime() === timestamp.getTime());
    
    if (!entry) {
      entry = {
        timestamp: timestamp.toISOString(),
        totalTickets: 0,
        revenue: 0
      };
      acc.push(entry);
    }
    
    entry.totalTickets++;
    entry.revenue += ticket.pricePaid;
    
    return acc;
  }, []);
  
  return timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};