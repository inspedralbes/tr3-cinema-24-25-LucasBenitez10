import { useMovieStore } from "@/store/moviesStore"
import { useState, useEffect } from "react"
import { useRoomStore } from "@/store/roomStore"
import { useScreeningStore } from "@/store/screeningStore"

export default function DropdownMovies() {
    const {fetchMovies, movies, assignMovie, movieSelected } = useMovieStore()
    const { fetchRooms, rooms, assignRoom, roomSelected } = useRoomStore();
    const { addScreening } = useScreeningStore();
    const [selectedTime, setSelectedTime] = useState("16:00")
    const [selectedDate, setSelectedDate] = useState("")
    const [selectedMovie, setSelectedMovie] = useState("")
    const [selectedRoom, setSelectedRoom] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const handleInfoScreening = async () => {
        // Validar que todos los campos estén completos
        if (!selectedMovie || !roomSelected || !selectedDate || !selectedTime) {
            setError("Por favor, completa todos los campos");
            setTimeout(() => setError(""), 3000);
            return;
        }
        
        setLoading(true);
        setError("");
        setSuccess("");
        
        const screeningData = {
            movieId: selectedMovie,
            roomId: roomSelected,
            date: selectedDate,
            startTime: selectedTime,
            endTime: calculateEndTime(selectedTime, movieSelected.duration),
            priceRegular: 8.50,
            language: "original"
        }

        try {
            const response = await addScreening(screeningData);
            console.log(response);
            setSuccess("Sesión creada correctamente");
            setTimeout(() => setSuccess(""), 3000);
        } catch (error) {
            console.error("Error al crear sesión:", error);
            setError("Error al crear la sesión. Inténtalo de nuevo.");
            setTimeout(() => setError(""), 3000);
        } finally {
            setLoading(false);
        }
    }

    const calculateEndTime = (startTime, durationInMinutes) => {
        // Dividir el tiempo de inicio en horas y minutos
        const [hours, minutes] = startTime.split(':').map(Number);
        
        // Convertir todo a minutos
        const startTimeInMinutes = hours * 60 + minutes;
        
        // Sumar la duración
        const endTimeInMinutes = startTimeInMinutes + durationInMinutes;
        
        // Convertir de vuelta a formato de hora
        const endHours = Math.floor(endTimeInMinutes / 60) % 24; // Usar módulo 24 para mantener en formato 24h
        const endMinutes = endTimeInMinutes % 60;
        
        // Formatear la hora de finalización (asegurando que tenga dos dígitos)
        const formattedEndHours = endHours.toString().padStart(2, '0');
        const formattedEndMinutes = endMinutes.toString().padStart(2, '0');
        
        return `${formattedEndHours}:${formattedEndMinutes}`;
    };

    const handleSelectedRoom = (e) => {
        const selectedRoomId = e.target.selectedIndex;
        // Verificar que rooms es un array y tiene elementos
        if (Array.isArray(rooms) && rooms.length > selectedRoomId) {
            const selectedRoomObj = rooms[selectedRoomId];
            setSelectedRoom(selectedRoomObj);
            assignRoom(selectedRoomObj);
        }
    }

    const handleSelectedMovie = (e) => {
        const selectedIndex = e.target.selectedIndex;
        // Verificar que movies es un array y tiene elementos
        if (Array.isArray(movies) && movies.length > selectedIndex) {
            const selectedMovieObj = movies[selectedIndex];
            setSelectedMovie(selectedMovieObj);
            assignMovie(selectedMovieObj);
        }
    }

    // Manejar cambios en el tiempo
    const handleTimeChange = (e) => {
        setSelectedTime(e.target.value);
    }

    // Manejar cambios en la fecha
    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    }

    useEffect(() => {
        fetchRooms();
        fetchMovies();
    }, [])

    useEffect(() => {
        if (Array.isArray(rooms) && rooms.length > 0 && !selectedRoom) {
            setSelectedRoom(rooms[0]);
            assignRoom(rooms[0]);
        }
    }, [rooms]);

    // Establecer la película inicial si hay películas disponibles
    useEffect(() => {
        if (Array.isArray(movies) && movies.length > 0 && !selectedMovie) {
            setSelectedMovie(movies[0]);
            assignMovie(movies[0]);
        }
    }, [movies]);
    
    // Establecer la fecha mínima como hoy
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        if (!selectedDate) {
            setSelectedDate(today);
        }
    }, []);

    return (
        <div>
            {/* Mensajes de éxito y error */}
            {error && (
                <div className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded-md mb-4" role="alert">
                    <p className="text-sm">{error}</p>
                </div>
            )}
            
            {success && (
                <div className="bg-green-900 border border-green-700 text-white px-4 py-3 rounded-md mb-4" role="alert">
                    <p className="text-sm">{success}</p>
                </div>
            )}
        
            <div className="space-y-4">
                <div>
                    <label htmlFor="select-movies" className="block mb-2 text-gray-400">Película</label>
                    <select
                        name="movies"
                        id="select-movies"
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-500 transition-colors duration-200"
                        onChange={handleSelectedMovie}
                        value={selectedMovie?._id || ""}
                    >
                        {Array.isArray(movies) ? movies.map((movie) => (
                            <option
                                key={movie._id} 
                                value={movie._id}
                            >
                                {movie.title}
                            </option>
                        )) : <option>Cargando películas...</option>}
                    </select>
                </div>

                <div>
                    <label htmlFor="select-time" className="block mb-2 text-gray-400">Hora de inicio</label>
                    <input
                        type="time"
                        id="select-time"
                        name="time"
                        value={selectedTime}
                        onChange={handleTimeChange}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-500 transition-colors duration-200"
                        min="10:00"
                        max="23:00"
                    />
                </div>

                <div>
                    <label htmlFor="select-date" className="block mb-2 text-gray-400">Fecha</label>
                    <input
                        type="date"
                        id="select-date"
                        name="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-500 transition-colors duration-200"
                        min={new Date().toISOString().split('T')[0]} 
                    />
                </div>

                <div>
                    <label htmlFor="select-room" className="block mb-2 text-gray-400">Sala</label>
                    <select 
                       name="rooms"
                       id="select-room"
                       className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-500 transition-colors duration-200"
                       onChange={handleSelectedRoom}
                       value={selectedRoom?._id || ""}
                    >
                        {Array.isArray(rooms) ? rooms.map((room) => (
                            <option 
                                key={room._id} 
                                value={room._id}
                                >
                                    {room.name}
                            </option>
                        )) : <option>Cargando salas...</option>}
                    </select>
                </div>
                
                <button 
                    onClick={handleInfoScreening}
                    disabled={loading} 
                    className={`w-full mt-4 py-3 rounded font-medium transition-colors duration-200 ${
                        loading 
                        ? 'bg-gray-700 cursor-not-allowed' 
                        : 'bg-red-600 hover:bg-red-700'
                    } text-white`}
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Procesando...
                        </span>
                    ) : (
                        'Crear sesión'
                    )}
                </button>
            </div>
        </div>
    )
}