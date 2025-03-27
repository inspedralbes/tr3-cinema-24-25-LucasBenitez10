import { create } from 'zustand'
import { persist } from 'zustand/middleware';
import { fetchMovies as fetchMoviesApi } from '@/services/tmdb';

export const useMovieStore = create(
    persist(
        (set, get) => ({
            movies: [],
            movieSelected: {},
            isLoading: false,
            error: null,

            fetchMovies: async () => {
                try {
                    set({ isLoading: true, error: null });
                    // Asignar directamente el resultado de la API a movies
                    const movies = await fetchMoviesApi();
                    console.log(movies)
                    // Usar setMovies para actualizar directamente
                    get().setMovies(movies.movies);
                    set({ isLoading: false });
                    return movies;
                } catch (error) {
                    console.error('Error fetching movies:', error);
                    set({ error: error.message || 'Error al cargar películas', isLoading: false });
                    return [];
                }
            },
            // Datos básicos
            setMovies: (movies) => set({ movies }),
            removeMovie: (movie) => set((state) => ({
                moviesSelected: state.moviesSelected ? state.moviesSelected.filter((m) => m.id !== movie.id) : []
            })),
            getMovies: () => get().movies,
            clearMovies: () => set({ movies: [] }),
            assignMovie: (movie) => set({ movieSelected: movie }),
        }),
        {
            name: 'movie-storage', 
            getStorage: () => localStorage,
        }
    ),
);