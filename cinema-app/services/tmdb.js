

export const fetchMovies = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies`, {
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

