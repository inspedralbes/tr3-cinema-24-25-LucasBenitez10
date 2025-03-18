import { useMovieStore } from "@/store/moviesStore"

export default function DropdownMovies() {
    const { movies } = useMovieStore()

    return (
        <div>

            <div>
                <label htmlFor="select-movies">Elegir pelicula ➡️ </label>
                <select name="movies" id="select-movies">
                    {movies.map((movie) => (
                        <option key={movie._id} value={movie._id}>{movie.title}</option>
                    ))}
                </select>
            </div>

            <label htmlFor="select-time">Elegir horario ➡️ </label>
            <select name="time" id="select-time">
                <option value="16:00">16:00</option>
                <option value="18:00">18:00</option>
                <option value="20:00">20:00</option>
            </select>

            <div>
                <label htmlFor="select-date">Elegir dia ➡️ </label>
                <select name="date" id="select-date">
                    <option value="Lunes">Lunes</option>
                    <option value="Lunes">Martes</option>
                    <option value="Lunes">Miercoles</option>
                    <option value="Lunes">Jueves</option>
                    <option value="Lunes">Viernes</option>
                    <option value="Lunes">Sabado</option>
                    <option value="Lunes">Domingo</option>
                </select>
            </div>
        </div>
    )

}