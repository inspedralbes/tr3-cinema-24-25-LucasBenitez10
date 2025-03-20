// screeningStore.js
import { create } from 'zustand';
import { getScreenings, createScreening, cancelScreening, deleteScreening } from '@/services/screeningService';

// Crear el store con Zustand
export const useScreeningStore = create((set, get) => ({
    // Estado
    screenings: [],
    loading: false,
    error: null,

    // Acciones
    fetchScreenings: async () => {
        try {
            set({ loading: true, error: null });
            const data = await getScreenings();
            set({ screenings: data, loading: false });
            return data;
        } catch (error) {
            console.error('Error en fetchScreenings:', error);
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    addScreening: async (screeningData) => {
        try {
            set({ loading: true, error: null });
            const response = await createScreening(screeningData);

            if (response.success || response.ok) {
                // Actualización optimista - Añadir la nueva sesión al estado
                // Nota: Si el backend no devuelve la sesión completa, deberías hacer un fetchScreenings
                await get().fetchScreenings();
            }

            set({ loading: false });
            return response;
        } catch (error) {
            console.error('Error en addScreening:', error);
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    cancelScreeningById: async (id) => {
        try {
            set({ loading: true, error: null });
            const response = await cancelScreening(id);

            if (response.success || response.ok) {
                // Actualización optimista - Marcar la sesión como cancelada
                set(state => ({
                    screenings: state.screenings.map(screening =>
                        screening._id === id
                            ? { ...screening, status: 'cancelled' }
                            : screening
                    )
                }));
            }

            set({ loading: false });
            return response;
        } catch (error) {
            console.error('Error en cancelScreening:', error);
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    deleteScreeningById: async (id) => {
        try {
            set({ loading: true });

            // Primero guardamos un backup del estado actual
            const previousScreenings = get().screenings;

            // Actualización optimista - hacemos el cambio en la UI inmediatamente
            set(state => ({
                screenings: state.screenings.filter(screening => screening._id !== id)
            }));

            // Luego hacemos la petición al servidor
            const response = await deleteScreening(id);

            // Si hay error, revertimos al estado anterior
            if (!response.success && !response.ok) {
                set({ screenings: previousScreenings });
            }

            set({ loading: false });
            return response;
        } catch (error) {
            console.error('Error en deleteScreening:', error);
            // Revertir al estado anterior en caso de error
            await get().fetchScreenings();
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Selectores
    getMovies: () => {
        return get().screenings.map(screening => screening.movie);
    },

    getMovieById: (movieId) => {
        const screening = get().screenings.find(s => s.movie._id === movieId);
        return screening ? screening.movie : null;
    },

    getScreeningsByMovieId: (movieId) => {
        return get().screenings.filter(screening => screening.movie._id === movieId);
    },

    // Limpiar estado
    clearScreenings: () => set({ screenings: [], loading: false, error: null }),
}));