
export const createScreening = async (screeningData) => {
    try {
      const response = await fetch('http://localhost:4000/api/screenings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(screeningData),
      });
  
      if (!response.ok) {
        throw new Error('Error al crear la proyección');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en createScreening:', error);
      throw error;
    }
  };
  
  export const getScreenings = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/screenings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Error al obtener las proyecciones');
      }
  
      const data = await response.json();
      console.log("Screenings: ")
    //   console.log(data[0].movie)
      return data.data;
    } catch (error) {
      console.error('Error en getScreenings:', error);
      throw error;
    }
  };

  
  export const getScreeningsWithFilters = async () => {
    try{
      const response = await fetch('http://localhost:4000/api/screenings/filters', {
        method: 'GET',
        headers: {
          'Content-Type' : 'application/json'
        }
      })

      if(!response.ok){
        throw new Error('Error al obtener las proyecciones con filtros para el admin')
      }

      const data = await response.json()
      return data.data
    }catch(error) {
      console.error('error en getScreeningWithFilter: ', error )
      throw error;
    }
  }


  export const cancelScreening = async (id) => {
    try{
      const response = await fetch(`http://localhost:4000/api/screenings/cancel/${id}`,{
        method: 'PUT',
        headers: {
          'Content-type' : 'application/json',
        }
      })

      if(!response.ok) {
        console.log(`Error al cancelar la sesion`)
      }

      return response

    }catch(error){
      console.error('error en deleteSession')
      throw error
    }
  }

  export const deleteScreening = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/api/screenings/delete/${id}`, {
        method: 'DELETE', 
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(response)
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error al eliminar la sesión:', errorData);
        throw new Error(`Failed to delete screening: ${response.status}`);
      }
      
      console.log('Sesión eliminada correctamente');
      return response;
    } catch (error) {
      console.error('Error en deleteScreening:', error);
      throw error;
    }
  };