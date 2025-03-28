const API_URL = 'http://localhost:4000/api';

// Handler genérico para las respuestas
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Error en la petición');
  }
  return response.json();
};

// Obtener tickets por cliente (email)
export const getTicketsByCustomer = async (email) => {
  try {
    const response = await fetch(`${API_URL}/tickets/customer/${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error("Error al obtener tickets del cliente:", error);
    throw error;
  }
};

// Obtener tickets por sesión
export const getTicketsByScreening = async (screeningId) => {
  try {
    const response = await fetch(`${API_URL}/tickets/screening/${screeningId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error("Error al obtener tickets por sesión:", error);
    throw error;
  }
};

// Comprar tickets
export const purchaseTickets = async (ticketData) => {
  try {
    const response = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ticketData)
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error("Error al comprar tickets:", error);
    throw error;
  }
};

// Cancelar un ticket específico
export const cancelTicket = async (ticketId) => {
  try {
    const response = await fetch(`${API_URL}/tickets/${ticketId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error("Error al cancelar ticket:", error);
    throw error;
  }
};

// Verificar un ticket por su código
export const verifyTicket = async (ticketCode) => {
  try {
    const response = await fetch(`${API_URL}/tickets/verify/${ticketCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error("Error al verificar ticket:", error);
    throw error;
  }
};

// Cancelar todas las entradas relacionadas con una sesión específica
export const cancelTicketsByScreeningId = async (screeningId) => {
  try {
    const response = await fetch(`${API_URL}/tickets/cancel-by-screening/${screeningId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error("Error al cancelar entradas por ID de sesión:", error);
    throw error;
  }
};

// Eliminar todas las entradas relacionadas con una sesión específica
export const deleteTicketsByScreeningId = async (screeningId) => {
  try {
    const response = await fetch(`${API_URL}/tickets/delete-by-screening/${screeningId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error("Error al eliminar entradas por ID de sesión:", error);
    throw error;
  }
};