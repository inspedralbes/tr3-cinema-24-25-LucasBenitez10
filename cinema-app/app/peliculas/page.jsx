'use client';
import * as React from 'react';
import CardMovie from '@/components/peliculas/CardMovie';
import { useState, useEffect } from 'react';
import { useMovieStore } from '@/store/moviesStore';
import { fetchMovies } from '@/lib/tmdb';

function Peliculas() {
    const { movies, setMovies } = useMovieStore();

    const getMovies = async () => {
        const moviesData = await fetchMovies();
        setMovies(moviesData.movies);
        console.log("respuestas del fetch: ", moviesData.movies);

    }

    console.log()
    
    useEffect(() => {
        getMovies();
    }, []);

    return (
        <div>
            <h1 className='text-center text-black'>Cartelera</h1>
            <div className="flex flex-row flex-wrap">
                {movies.length && movies.map((movie) => (
                    <CardMovie
                        key={movie._id}
                        movieData={movie}
                        title={movie.title || movie.name}
                        review={movie.overview}
                        lenguage={movie.original_language}
                        relase={movie.release_date}
                        image={movie.poster_path}
                    />
                ))}
            </div>
        </div>
    )
}

export default Peliculas;