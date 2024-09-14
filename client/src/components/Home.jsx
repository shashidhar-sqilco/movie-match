/* eslint-disable array-callback-return */
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import MovieCard from './MovieCard';

export default function Home() {
    const [movies,setMovies]=useState([]);
    const[loading,setLoading]=useState(true);
    const[error,setError]=useState(null);

    useEffect(()=>{
       const fetchMovies=async()=>{
         try {
           const response = await axios.get(
             "http://localhost:5000/api/movies/popular"
           );
           setMovies(response.data);
         } catch (error) {
            setError("Failed to fetch popular movies");
         }
         finally{
            setLoading(false);
         }
       };
       fetchMovies()
    },[])
    if(loading)return <div>Loading...</div>
    if(error)return <div>{error}</div>
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Popular movies</h1>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-8'>
        {movies.map((movie) => {
          return <MovieCard key={movie.id} movie={movie} />;
        })}
      </div>
    </div>
  );
}
