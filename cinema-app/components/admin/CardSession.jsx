import { cancelScreening, deleteScreening } from "@/services/screeningService"
import { useScreeningStore } from '@/store/screeningStore'

export default function CardSession({ sessions, onCancel, onDelete }) {
    const { screenings, cancelScreeningById, deleteScreeningById } = useScreeningStore()

    const cancelSession = async (id) => {
        await cancelScreeningById(id);
    }

    const deleteSession = async (id) => {
        await deleteScreeningById(id)
    }

    return (
        <div className=" flex flex-row flex-wrap items-center">
            {screenings.map((session) => {
                return (
                    <div key={session.movie._id} className="w-60 ml-10 mb-10">
                        <img src={process.env.NEXT_PUBLIC_URL_IMAGE + session.movie.poster_path} alt="" />
                        <p>Estado: {session.status}</p>
                        <p>Pelicula: {session.movie.title}</p>
                        <p>Sala: {session.room.name}</p>
                        <p>Inicio: {session.startTime}</p>
                        <p>Día: {new Date(session.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

                        {session.status !== 'cancelled' && (
                            <button onClick={() => cancelSession(session._id)} className="cursor-pointer bg-red-300">
                                Cancelar sesión
                            </button>
                        )}

                        <button onClick={() => deleteSession(session._id)}>
                            Eliminar sesión
                        </button>

                    </div>
                );
            })}

        </div>
    )
}