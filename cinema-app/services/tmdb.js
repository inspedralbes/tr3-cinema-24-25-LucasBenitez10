

export const fetchMovies = async () => {
  const response = await fetch(`http://localhost:4000/api/movies`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if(response){
    return response.json();
  }else{
    console.log('Error');
  }
}

