'use client';
import * as React from 'react';
import CardMovie from '@/components/peliculas/CardMovie';
import { useState, useEffect } from 'react';
import { useMovieStore } from '@/store/moviesStore';

function Peliculas() {
    const { movies, fetchMovies } = useMovieStore();

    useEffect(() => {
        fetchMovies();
    }, []);

    return (
        <div>
            <h1 className='text-center text-black'>Cartelera</h1>
            {movies.length > 0 && movies.map((movie) => (
                <div key={movie.id} className="movie-container">
                    <CardMovie
                        movieData={movie}
                        title={movie.title || movie.name}
                        review={movie.overview}
                        lenguage={movie.original_language}
                        relase={movie.release_date}
                        image={movie.poster_path}
                    />
                </div>
            ))}
        </div>
    )
}

export default Peliculas;