const https = require('https');
const Movie = require('../models/Movie');
const Genre = require('../models/Genre'); 

TMDB_BASE_URL = 'api.themoviedb.org'
TMDB_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxYWY2NjI1OTA0YWJlNDUxOTNiMWJlNjg4YmVhMjZjNSIsIm5iZiI6MTc0MTc4MTM1Ni41MTAwMDAyLCJzdWIiOiI2N2QxNzk2Yzc3NjFhM2E2OGY2MGNkNjgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.O0jokKFFq1exNyArSPCVl1xulj7wUalvczdMows7emc'

// Configuración de imágenes de TMDB
let imageConfig = {
  base_url: 'https://image.tmdb.org/t/p/',
  secure_base_url: 'https://image.tmdb.org/t/p/',
  poster_sizes: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'],
  backdrop_sizes: ['w300', 'w780', 'w1280', 'original']
};

/**
 * Realizar petición HTTP a la API de TMDB con manejo de límites de tasa
 * @param {String} path - Ruta de la API
 * @param {Object} params - Parámetros de consulta
 * @param {Number} retryCount - Número de reintentos (para uso interno)
 * @returns {Promise<Object>} Datos de respuesta
 */
const makeRequest = (path, params = {}, retryCount = 0) => {
  return new Promise((resolve, reject) => {
    // Construir los parámetros de la consulta
    let queryParams = `language=es-ES`; // Añadir language por defecto
    for (const [key, value] of Object.entries(params)) {
      queryParams += `&${key}=${encodeURIComponent(value)}`;
    }

    // Opciones de la petición
    const options = {
      hostname: 'api.themoviedb.org',
      path: `/3${path}?${queryParams}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TMDB_API_KEY}` // Usar Bearer token
      }
    };

    // Realizar la petición
    const req = https.request(options, (res) => {
      let data = '';

      // Verificar si estamos excediendo el límite de tasa
      if (res.statusCode === 429 && retryCount < 5) {
        const retryAfter = parseInt(res.headers['retry-after'] || '1');

        // Esperar y reintentar
        setTimeout(() => {
          makeRequest(path, params, retryCount + 1)
            .then(resolve)
            .catch(reject);
        }, retryAfter * 1000);

        return;
      }

      // Manejar otros errores HTTP
      if (res.statusCode >= 400) {
        reject(new Error(`Error HTTP ${res.statusCode} en solicitud a TMDB`));
        return;
      }

      // Recibir datos
      res.on('data', (chunk) => {
        data += chunk;
      });

      // Finalizar y resolver la promesa
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          // Verificar si la API reporta un error
          if (parsedData.success === false) {
            reject(new Error(`TMDB API Error: ${parsedData.status_message}`));
            return;
          }
          resolve(parsedData);
        } catch (error) {
          reject(new Error(`Error al analizar la respuesta: ${error.message}`));
        }
      });
    });

    // Manejar errores
    req.on('error', (error) => {
      reject(error);
    });

    // Finalizar la petición
    req.end();
  });
};

/**
 * Obtiene la configuración de imágenes de TMDB
 * @returns {Promise<Object>} Configuración de imágenes
 */
const fetchImageConfiguration = async () => {
  try {
    const data = await makeRequest('/configuration');

    if (data.images) {
      imageConfig = data.images;
    }

    return imageConfig;
  } catch (error) {
    console.error('Error al obtener configuración de imágenes TMDB:', error);
    return imageConfig; // Devolver la configuración por defecto
  }
};

/**
 * Obtiene todas las películas populares (con paginación)
 * @param {Number} maxPages - Número máximo de páginas a obtener
 * @returns {Promise<Array>} Array de películas populares
 */
const fetchAllPopularMovies = async (maxPages = 5) => {
  try {
    let allMovies = [];
    let page = 1;
    let totalPages = 1;

    do {
      // Añadir pequeño retardo para evitar exceder límites de tasa
      if (page > 1) {
        await new Promise(resolve => setTimeout(resolve, 250));
      }

      const data = await makeRequest('/movie/popular', {
        language: 'es-ES',
        page: page
      });

      allMovies = [...allMovies, ...data.results];
      totalPages = data.total_pages;
      page++;

    } while (page <= totalPages && page <= maxPages);

    return allMovies;
  } catch (error) {
    console.error('Error al obtener películas populares de TMDB:', error);
    throw error;
  }
};

/**
 * Obtiene películas populares (versión simple para compatibilidad)
 * @returns {Promise<Array>} Array de películas populares
 */
const fetchPopularMovies = async () => {
  try {
    const data = await makeRequest('/movie/popular', {
      language: 'es-ES',
      page: 1
    });

    return data.results;
  } catch (error) {
    console.error('Error al obtener películas populares de TMDB:', error);
    throw error;
  }
};

/**
 * Obtiene detalles adicionales de una película
 * @param {Number} tmdbId - ID de la película en TMDB
 * @returns {Promise<Object>} Detalles completos de la película
 */
const fetchMovieDetails = async (tmdbId) => {
  try {
    const data = await makeRequest(`/movie/${tmdbId}`, {
      language: 'es-ES',
      append_to_response: 'credits,videos'  // Obtener información adicional
    });

    return data;
  } catch (error) {
    console.error(`Error al obtener detalles para la película ${tmdbId}:`, error);
    throw error;
  }
};

/**
 * Sincroniza los géneros de películas desde TMDB
 * @returns {Promise<Array>} Array de géneros sincronizados
 */
const syncGenres = async () => {
  try {
    const data = await makeRequest('/genre/movie/list', {
      language: 'es-ES'
    });

    const genres = data.genres;

    // Actualizar géneros en base de datos
    for (const genre of genres) {
      await Genre.findOneAndUpdate(
        { id: genre.id },
        { id: genre.id, name: genre.name },
        { upsert: true, new: true }
      );
    }

    return genres;
  } catch (error) {
    console.error('Error al sincronizar géneros:', error);
    throw error;
  }
};

/**
 * Obtiene la URL completa para una imagen de TMDB
 * @param {String} path - Ruta relativa de la imagen
 * @param {String} type - Tipo de imagen ('poster' o 'backdrop')
 * @param {String} size - Tamaño deseado 
 * @returns {String} URL completa de la imagen
 */
const getImageUrl = (path, type = 'poster', size = 'w500') => {
  if (!path) return null;

  const sizes = type === 'backdrop' ?
    imageConfig.backdrop_sizes :
    imageConfig.poster_sizes;

  // Usar el tamaño especificado o el más cercano disponible
  if (!sizes.includes(size)) {
    size = sizes[Math.floor(sizes.length / 2)]; // Tamaño medio como fallback
  }

  return `${imageConfig.secure_base_url}${size}${path}`;
};

/**
 * Sincroniza películas de TMDB a la base de datos local, incluyendo trailers
 * @param {Number} maxPages - Número máximo de páginas a sincronizar
 * @returns {Promise<Object>} Resultado de la sincronización
 */
const syncMoviesToDatabase = async (maxPages = 5) => {
  try {
    // Actualizar configuración de imágenes
    await fetchImageConfiguration();

    // Sincronizar géneros
    await syncGenres();

    // Obtener películas (paginadas)
    const popularMovies = await fetchAllPopularMovies(maxPages);
    let updated = 0;
    let created = 0;
    let errors = 0;
    let trailersAdded = 0;

    for (const movieData of popularMovies) {
      try {
        // Verificar si la película ya existe en nuestra BD
        const existingMovie = await Movie.findOne({ tmdbId: movieData.id });

        // Añadir pequeño retardo para no exceder límites de tasa
        await new Promise(resolve => setTimeout(resolve, 100));

        // Obtener detalles adicionales (como duración)
        const details = await fetchMovieDetails(movieData.id);

        // Obtener trailer
        const trailer = await fetchMovieTrailer(movieData.id);


        if (existingMovie) {
          // Actualizar película existente
          const updateData = {
            title: movieData.title,
            original_title: movieData.original_title,
            overview: movieData.overview,
            poster_path: movieData.poster_path,
            backdrop_path: movieData.backdrop_path,
            popularity: movieData.popularity,
            vote_average: movieData.vote_average,
            vote_count: movieData.vote_count,
            release_date: movieData.release_date,
            genre_ids: movieData.genre_ids,
            poster_url: getImageUrl(movieData.poster_path, 'poster'),
            backdrop_url: getImageUrl(movieData.backdrop_path, 'backdrop')
          };

          // Añadir trailer si existe y no estaba previamente
          if (trailer && !existingMovie.trailer) {
            updateData.trailer = trailer;
            trailersAdded++;
          }

          await Movie.updateOne(
            { tmdbId: movieData.id },
            { $set: updateData }
          );
          updated++;
        } else {
          // Crear nueva película
          await Movie.create({
            tmdbId: movieData.id,
            adult: movieData.adult,
            backdrop_path: movieData.backdrop_path,
            backdrop_url: getImageUrl(movieData.backdrop_path, 'backdrop'),
            genre_ids: movieData.genre_ids,
            media_type: 'movie',
            original_language: movieData.original_language,
            original_title: movieData.original_title,
            overview: movieData.overview,
            popularity: movieData.popularity,
            poster_path: movieData.poster_path,
            poster_url: getImageUrl(movieData.poster_path, 'poster'),
            release_date: movieData.release_date,
            title: movieData.title,
            video: movieData.video,
            vote_average: movieData.vote_average,
            vote_count: movieData.vote_count,
            duration: details.runtime || 120, // Duración en minutos
            // Información adicional de los detalles
            imdb_id: details.imdb_id,
            status: details.status,
            tagline: details.tagline,
            budget: details.budget,
            revenue: details.revenue,
            // Añadir información del trailer
            trailer: trailer
          });
          created++;

          // Incrementar contador de trailers si se encontró
          if (trailer) {
            trailersAdded++;
          }
        }
      } catch (movieError) {
        console.error(`Error procesando película ${movieData.id}:`, movieError);
        errors++;
      }
    }

    return {
      success: true,
      total: popularMovies.length,
      created,
      updated,
      errors,
      trailersAdded
    };
  } catch (error) {
    console.error('Error al sincronizar películas con la base de datos:', error);
    throw error;
  }
};

/**
 * Obtiene el trailer oficial de una película
 * @param {Number} tmdbId - ID de la película en TMDB
 * @returns {Promise<Object|null>} Información del trailer o null si no se encuentra
 */
const fetchMovieTrailer = async (tmdbId) => {
  try {
    const data = await makeRequest(`/movie/${tmdbId}/videos`, {
      language: 'es-ES'
    });

    // Buscar trailer oficial en español
    let trailer = data.results.find(video =>
      video.type === 'Trailer' &&
      video.site === 'YouTube' &&
      video.official === true &&
      video.iso_639_1 === 'es'
    );

    // Si no hay trailer en español, buscar en inglés
    if (!trailer) {
      trailer = data.results.find(video =>
        video.type === 'Trailer' &&
        video.site === 'YouTube' &&
        video.official === true &&
        video.iso_639_1 === 'en'
      );
    }

    // Si no hay trailer oficial, tomar el primer trailer disponible
    if (!trailer) {
      trailer = data.results.find(video =>
        video.type === 'Trailer' &&
        video.site === 'YouTube'
      );
    }

    // Construir URL de YouTube si se encuentra un trailer
    if (trailer) {
      return {
        key: trailer.key,
        name: trailer.name,
        official: trailer.official,
        site: trailer.site,
        youtubeUrl: `https://www.youtube.com/watch?v=${trailer.key}`
      };
    }

    return null;
  } catch (error) {
    console.error(`Error al obtener trailer para la película ${tmdbId}:`, error);
    return null;
  }
};

/**
 * Actualiza el modelo de Movie para incluir información del trailer
 * @param {Number} tmdbId - ID de la película en TMDB
 * @returns {Promise<Object>} Película actualizada con información de trailer
 */
const updateMovieWithTrailer = async (tmdbId) => {
  try {
    const trailer = await fetchMovieTrailer(tmdbId);

    if (trailer) {
      return await Movie.findOneAndUpdate(
        { tmdbId: tmdbId },
        {
          $set: {
            trailer: trailer
          }
        },
        { new: true }
      );
    }

    return null;
  } catch (error) {
    console.error(`Error al actualizar trailer para la película ${tmdbId}:`, error);
    throw error;
  }
};

/**
 * Modifica syncMoviesToDatabase para incluir trailers
 * @param {Number} maxPages - Número máximo de páginas a sincronizar
 * @returns {Promise<Object>} Resultado de la sincronización
 */
const syncMoviesToDatabaseWithTrailers = async (maxPages = 5) => {
  try {
    // Llamar a la función original de sincronización
    const syncResult = await syncMoviesToDatabase(maxPages);

    // Añadir proceso de obtención de trailers
    const moviesWithoutTrailers = await Movie.find({
      trailer: { $exists: false }
    });

    let trailersAdded = 0;

    for (const movie of moviesWithoutTrailers) {
      try {
        const updatedMovie = await updateMovieWithTrailer(movie.tmdbId);
        if (updatedMovie) {
          trailersAdded++;
        }
      } catch (movieError) {
        console.error(`Error añadiendo trailer para película ${movie.tmdbId}:`, movieError);
      }
    }

    return {
      ...syncResult,
      trailersAdded
    };
  } catch (error) {
    console.error('Error al sincronizar películas con trailers:', error);
    throw error;
  }
};


module.exports = {
  fetchPopularMovies,
  fetchAllPopularMovies,
  fetchMovieDetails,
  syncMoviesToDatabase,
  syncGenres,
  getImageUrl,
  fetchMovieTrailer,
  updateMovieWithTrailer,
  syncMoviesToDatabaseWithTrailers
};