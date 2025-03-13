
export const fetchMovies = async () => {
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
    }
  });
  console.log(response);

  if(response){
    return response.json();
  }else{
    console.log('Error');
  }
}
