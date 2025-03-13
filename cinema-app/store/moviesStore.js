import { create } from 'zustand'
import { fetchMovies } from '@/lib/tmdb';

export const useMovieStore = create((set, get) => ({
    movies: [],
    movieSelected: {},
    setMovies: (movies) => set({ movies }),
    removeMovie: (movie) => set((state) => ({ moviesSelected: state.moviesSelected ? state.moviesSelected.filter((m) => m.id !== movie.id) : [] })),
    getMovies: () => get().movies,
    clearMovies: () => set({ movies: [] }),
    assignMovie: (movie) => set({ movieSelected: movie }),
}))