'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import Link from 'next/link';

const API_URL = 'http://localhost:4000';

const PerfilUsuario = () => {
  const { user, setUser } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    lastname: '',
    email: '',
    phone: '',
    preferences: {
      notifications: true,
      newsletter: false
    }
  });
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Cargar datos del usuario cuando el componente se monta
    if (user && user.email) {
      setUserData({
        ...userData,
        name: user.name || '',
        lastname: user.lastname || '',
        email: user.email || '',
        phone: user.phone || '',
      });

      // Cargar tickets del usuario
      fetchUserTickets();
    }
  }, [user]);

  const fetchUserTickets = async () => {
    if (!user || !user.email) return;

    setIsLoading(true);
    setError(null);

    try {

      // URL completa con puerto
      const url = `${API_URL}/api/tickets/customer/${encodeURIComponent(user.email)}`;

      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });


      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setTickets(data);
    } catch (err) {
      console.error('Error al obtener tickets:', err);
      setError('No se pudieron cargar los tickets. Intente nuevamente más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setUserData({
        ...userData,
        preferences: {
          ...userData.preferences,
          [name]: checked
        }
      });
    } else {
      setUserData({
        ...userData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/users/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: userData.name,
          lastname: userData.lastname,
          phone: userData.phone
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Actualizar el usuario en el store
      setUser({
        ...user,
        name: userData.name,
        lastname: userData.lastname,
        phone: userData.phone,
      });

      setIsEditing(false);
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      setError('No se pudo actualizar el perfil. Intente nuevamente más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelTicket = async (ticketId) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta entrada?')) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/tickets/${ticketId}/cancel`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Actualizar la lista de tickets después de cancelar
      fetchUserTickets();

    } catch (err) {
      console.error('Error al cancelar ticket:', err);
      setError('No se pudo cancelar la entrada. Intente nuevamente más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  if (!user || !user.email) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Acceso no autorizado</h2>
            <p className="text-gray-600 text-center mb-6">Debes iniciar sesión para ver tu perfil</p>
            <div className="flex flex-col space-y-4">
              <Link
                href="/login"
                className="w-full px-4 py-2 text-center font-medium rounded bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="w-full px-4 py-2 text-center font-medium rounded border border-red-600 text-red-500 hover:bg-red-600 hover:text-white transition-colors duration-200"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Perfil */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="py-6 px-8 bg-gray-900 text-white">
            <h1 className="text-2xl font-bold">Perfil de Usuario</h1>
            <p className="text-gray-300">Gestiona tus datos personales</p>
          </div>

          {/* Divider with film reel design */}
          <div className="flex items-center w-full">
            <div className="flex-grow h-px bg-gray-200"></div>
            <div className="flex space-x-1 mx-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
              ))}
            </div>
            <div className="flex-grow h-px bg-gray-200"></div>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="lastname"
                    id="lastname"
                    value={userData.lastname}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border bg-gray-100"
                    disabled
                  />
                  <p className="mt-1 text-sm text-gray-500">El email no se puede modificar</p>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={userData.phone || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border"
                    placeholder="Ej. +34 612345678"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors duration-200"
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Información personal</h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Nombre</p>
                        <p className="mt-1 text-gray-900">{userData.name || 'No especificado'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Apellido</p>
                        <p className="mt-1 text-gray-900">{userData.lastname || 'No especificado'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="mt-1 text-gray-900">{userData.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Teléfono</p>
                        <p className="mt-1 text-gray-900">{userData.phone || 'No especificado'}</p>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
                    >
                      Editar perfil
                    </button>
                    <button
                      onClick={fetchUserTickets}
                      className="px-4 py-2 rounded border border-red-600 text-red-500 hover:bg-red-600 hover:text-white transition-colors duration-200"
                    >
                      Actualizar historial
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Historial de tickets */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="py-6 px-8 bg-gray-900 text-white">
            <h2 className="text-2xl font-bold">Mis Entradas</h2>
            <p className="text-gray-300">Historial de compras y entradas disponibles</p>
          </div>

          {/* Divider with film reel design */}
          <div className="flex items-center w-full">
            <div className="flex-grow h-px bg-gray-200"></div>
            <div className="flex space-x-1 mx-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
              ))}
            </div>
            <div className="flex-grow h-px bg-gray-200"></div>
          </div>

          <div className="p-8">
            {isLoading ? (
              <div className="text-center py-4">
                <p>Cargando tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No hay entradas en tu historial</p>
                <Link
                  href="/"
                  className="mt-4 inline-block px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
                >
                  Ver películas en cartelera
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Película
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sala
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Asiento
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tickets.map((ticket) => (
                      <tr key={ticket._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {ticket.screening?.movie?.poster_path && (
                              <div className="flex-shrink-0 h-10 w-10 mr-2">
                                <img
                                  className="h-10 w-10 rounded-sm object-cover"
                                  src={`https://image.tmdb.org/t/p/w92${ticket.screening.movie.poster_path}`}
                                  alt={ticket.screening.movie.title}
                                />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {ticket.screening?.movie?.title || 'Película no disponible'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {ticket.screening?.startTime || ''} h
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {ticket.screening?.date ? formatDate(ticket.screening?.date) : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{ticket.screening?.room?.name || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {ticket.seats?.row}{ticket.seats?.number}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ticket.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : ticket.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {ticket.status === 'active' ? 'Activo' :
                              ticket.status === 'cancelled' ? 'Cancelado' :
                                ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {ticket.status === 'active' && (
                            <>
                              <Link
                                href={`/tickets/${ticket._id}`}
                                className="text-red-600 hover:text-red-900 mr-4"
                              >
                                Ver Ticket
                              </Link>
                              <button
                                onClick={() => cancelTicket(ticket._id)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilUsuario;