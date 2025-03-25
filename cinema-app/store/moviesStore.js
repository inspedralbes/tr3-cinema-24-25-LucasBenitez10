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
        }),
        {
            name: 'movie-storage', 
            getStorage: () => localStorage,
        }
    ),
);