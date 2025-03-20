import { create } from 'zustand'
import { persist } from 'zustand/middleware';

export const useMovieStore = create(
    persist(
        (set, get) => ({
            movies: [],
            movieSelected: {},
            isLoading: false,
            error: null,
            
            // Datos básicos
            setMovies: (movies) => set({ movies }),
            removeMovie: (movie) => set((state) => ({
                moviesSelected: state.moviesSelected ? state.moviesSelected.filter((m) => m.id !== movie.id) : []
            })),
            getMovies: () => get().movies,
            clearMovies: () => set({ movies: [] }),
            assignMovie: (movie) => set({ movieSelected: movie }),
            
            // Nuevo método para fetchear las películas
            fetchMovies: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(`http://localhost:4000/api/movies`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                    
                    if (!response.ok) {
                        throw new Error('Error al obtener películas');
                    }
                    
                    console.log("Se hace una peticion a movies: ",response)
                    const data = await response.json();
                    set({ movies: data.movies, isLoading: false });
                    return data;
                } catch (error) {
                    console.error('Error:', error);
                    set({ error: error.message, isLoading: false });
                    return null;
                }
            }
        }),
        {
            name: 'movie-storage', 
            getStorage: () => localStorage,
        }
    ),
    {
        name: 'screening-storage', 
        getStorage: () => localStorage,
    }
);