
export const createScreening = async (screeningData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/screenings`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/screenings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Error al obtener las proyecciones');
      }
  
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error en getScreenings:', error);
      throw error;
    }
  };

  
  export const getScreeningsWithFilters = async () => {
    try{
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/screenings/filters`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/screenings/cancel/${id}`,{
        method: 'PUT',
        headers: {
          'Content-type' : 'application/json',
        }
      })

      return response

    }catch(error){
      console.error('error en deleteSession')
      throw error
    }
  }

  export const deleteScreening = async (id) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/screenings/delete/${id}`, {
        method: 'DELETE', 
        headers: {
          'Content-Type': 'application/json'
        }
      });

  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error al eliminar la sesión:', errorData);
        throw new Error(`Failed to delete screening: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      console.error('Error en deleteScreening:', error);
      throw error;
    }
  };