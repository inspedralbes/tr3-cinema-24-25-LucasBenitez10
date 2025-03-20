import { useMovieStore } from "@/store/moviesStore"
import { useState, useEffect } from "react"
import { useRoomStore } from "@/store/roomStore"
import { useScreeningStore } from "@/store/screeningStore"

export default function DropdownMovies() {
    const { movies, assignMovie, movieSelected } = useMovieStore()
    const { fetchRooms, rooms,assignRoom,roomSelected } = useRoomStore();
    const { addScreening } = useScreeningStore();
    const [selectedTime, setSelectedTime] = useState("16:00")
    const [selectedDate, setSelectedDate] = useState("")
    const [selectedMovie, setSelectedMovie] = useState("")
    const [selectedRoom, setSelectedRoom]  = useState("")


    const handleInfoScreening = async () => {
        const screeningData = {
            movieId : selectedMovie,
            roomId : roomSelected,
            date : selectedDate,
            startTime: selectedTime,
            endTime: calculateEndTime(selectedTime, movieSelected.duration),
            priceRegular : 8.50,
            language: "original"
        }

        const response = await addScreening(screeningData);
        console.log(response)
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
        const selectedRoomId = e.target.selectedIndex
        // Buscar el objeto completo de room basado en el ID seleccionado
        const selectedRoomObj = rooms[selectedRoomId]
        
        setSelectedRoom(selectedRoomObj);
        
        
        console.log("Room seleccionada:", selectedRoomObj);

        assignRoom(selectedRoomObj);
    }

    

    const handleSelectedMovie = (e) => {
        const selectedIndex = e.target.selectedIndex;
        const selectedMovieObj = movies[selectedIndex];
        
        setSelectedMovie(selectedMovieObj);
        assignMovie(selectedMovieObj);
        
        console.log("Película seleccionada:", movieSelected);
    }

    // Manejar cambios en el tiempo
    const handleTimeChange = (e) => {
        setSelectedTime(e.target.value)
    }

    // Manejar cambios en la fecha
    const handleDateChange = (e) => {
        setSelectedDate(e.target.value)
    }

    useEffect(() => {
        fetchRooms();
    }, [])

    useEffect(() => {
        if (rooms.length > 0 && !selectedRoom) {
            setSelectedRoom(rooms[0]);
            assignRoom(rooms[0]);

        }
    }, [rooms]);

    // Establecer la película inicial si hay películas disponibles
    useEffect(() => {
        if (movies.length > 0 && !selectedMovie) {
            setSelectedMovie(movies[0]);
            assignMovie(movies[0]);
        }
    }, [movies]);

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="select-movies" className="block mb-2">Elegir película ➡️ </label>
                <select
                    name="movies"
                    id="select-movies"
                    className="w-full p-2 border rounded"
                    onChange={handleSelectedMovie}
                    value={selectedMovie?._id || ""}
                >
                    {movies.map((movie) => (
                        <option
                            key={movie._id} 
                            value={movie._id}
                        >
                            {movie.title}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="select-time" className="block mb-2">Elegir horario ➡️ </label>
                <input
                    type="time"
                    id="select-time"
                    name="time"
                    value={selectedTime}
                    onChange={handleTimeChange}
                    className="w-full p-2 border rounded"
                    min="10:00"
                    max="23:00"
                />
            </div>

            <div>
                <label htmlFor="select-date" className="block mb-2">Elegir día ➡️ </label>
                <input
                    type="date"
                    id="select-date"
                    name="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="w-full p-2 border rounded"
                    min={new Date().toISOString().split('T')[0]} 
                />
            </div>

            <div>
                <label htmlFor="select-room" className="block mb-2">Elegir sala ➡️ </label>
                <select 
                   name="rooms"
                   id="select-room"
                   className="w-full p-2 border rounded"
                   onChange={handleSelectedRoom}
                   value={selectedRoom?._id || ""}
                >
                    {rooms.map((room) => (
                        <option 
                            key={room._id} 
                            value={room._id}
                            >
                                {room.name}
                        </option>
                    ))}
                </select>
            </div>
            <button onClick={ handleInfoScreening } className="cursor-pointer">Crear sesion</button>
        </div>
    )
}