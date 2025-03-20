'use client';
import CardMovie from '@/components/peliculas/CardMovie';
import { useState, useEffect } from 'react';
import { getScreenings } from '@/services/screeningService'


function Peliculas() {
    const [screenings, setScreenings] = useState([])

    const getScreeningsData = async () =>  {
        const data = await getScreenings()
        setScreenings(data)
    }

    useEffect(() => {
        getScreeningsData()
    }, [])
 
    return (
        <div>
            <h1 className='text-center text-black'>Cartelera</h1>
            <div className="flex flex-row flex-wrap">
                {screenings.length > 0 && screenings.map((screening) => (
                    <CardMovie
                        key={screening._id}
                        movieData={screening}
                        title={screening.movie.title}
                        review={screening.movie.overview}
                        lenguage={screening.language}
                        relase={screening.date}
                        image={screening.movie.poster_path}
                        status={screening.status}
                    />
                ))}
            </div>
        </div>
    )
}
export default Peliculas;