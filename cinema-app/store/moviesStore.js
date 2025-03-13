import { create } from 'zustand'
import { fetchMovies } from '@/lib/tmdb';

export const useMovieStore = create((set, get) => ({
    movies: [],
    movieSelected: {},

    fetchMovies: async () => {
        try {
          const moviesData = await fetchMovies();
          set({ movies: moviesData.results }); 
        } catch (error) {
          console.error("Error al obtener películas:", error);
        }
      },
    removeMovie: (movie) => set((state) => ({ moviesSelected: state.moviesSelected ? state.moviesSelected.filter((m) => m.id !== movie.id) : [] })),
    getMovies: () => get().movies,
    clearMovies: () => set({ movies: [] }),
    assignMovie: (movie) => set({ movieSelected: movie }),
}))