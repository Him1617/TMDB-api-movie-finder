import React, { useCallback, useEffect, useRef, useState } from "react";
import Search from "./components/search";
import Spinner from "./components/spinner";
import MovieCard from "./components/movieCard";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import FavouritesModal from "./components/FavouritesModal";
import MovieDetails from "./components/MovieDetails";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite";
import { useAuth } from "./context/AuthContext";

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// API configuration for The Movie Database (TMDB) requests
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    authorization: `Bearer ${API_KEY}`
  }
};

/**
 * Main Application Component
 * Handles state management, fetching movies, infinite scroll, and displaying modals.
 */
const App = () => {
  // --- Global State ---
  const { favError } = useAuth(); // Retrieve any favorite-related errors from AuthContext

  // --- Local State ---
  const [searchTerm, setSearchTerm] = useState(''); // Current text in the search input
  const [debouncedSearch, setDebouncedSearch] = useState(''); // Search text after the user stops typing
  const [errorMessage, setErrorMessage] = useState(''); // API error feedback
  const [movieList, setMovieList] = useState([]); // List of fetched movies to display
  const [isLoading, setIsLoading] = useState(false); // Controls the initial loading spinner
  const [trendingMovies, setTrendingMovies] = useState([]); // Array of trending movies
  const [dismissedError, setDismissedError] = useState(''); // Tracks if the user dismissed the favorite error toast

  // --- Infinite Scroll State ---
  const [page, setPage] = useState(1); // Current page for pagination
  const [hasMore, setHasMore] = useState(true); // Are there more pages to fetch?
  const [isFetchingMore, setIsFetchingMore] = useState(false); // Controls the spinner at the bottom of the list
  const sentinelRef = useRef(null); // Reference to the invisible div used to trigger infinite scroll

  // --- Modal Visibility State ---
  const [showAuth, setShowAuth] = useState(false);
  const [showFavourites, setShowFavourites] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  /**
   * Prevents API spam by waiting 700ms after the user stops typing
   * before updating `debouncedSearch` which triggers the actual fetch.
   */
  useDebounce(() => setDebouncedSearch(searchTerm), 700, [searchTerm]);

  /**
   * Fetches movies from TMDB API based on the search query and page number.
   * If there's no query, it fetches popular discover movies.
   */
  const fetchMovies = useCallback(async (query = '', pageNum = 1) => {
    // Determine which loading state to activate based on the page number
    if (pageNum === 1) {
      setIsLoading(true);
      setErrorMessage('');
    } else {
      setIsFetchingMore(true);
    }

    try {
      // Choose the appropriate TMDB endpoint based on whether the user is searching
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${pageNum}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${pageNum}`;

      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) throw new Error('Failed to fetch movies');

      const data = await response.json();

      if (data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        setHasMore(false);
        return;
      }

      const results = data.results || [];
      setMovieList(prev => pageNum === 1 ? results : [...prev, ...results]);
      setHasMore(pageNum < (data.total_pages || 1));

      // Log this search query into our Appwrite database for analytics (trending searches).
      // Only log it once (on the first page) and only if it returned valid results.
      if (query && pageNum === 1 && results.length > 0) {
        await updateSearchCount(query, results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      if (pageNum === 1) setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, []);

  // Reset and re-fetch whenever debounced search changes
  useEffect(() => {
    setPage(1);
    setMovieList([]);
    setHasMore(true);
    fetchMovies(debouncedSearch, 1);
  }, [debouncedSearch, fetchMovies]);

  // Fetch next page when page increments (but not on the initial 1)
  useEffect(() => {
    if (page === 1) return;
    fetchMovies(debouncedSearch, page);
  }, [page]);

  /**
   * Infinite Scroll Setup using IntersectionObserver.
   * This watches the "sentinel" div at the bottom of the movie list.
   * When it comes into view (or within 200px of the viewport), it increments the page number.
   */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // If the sentinel is visible AND we have more movies AND we aren't currently loading anything
        if (entries[0].isIntersecting && hasMore && !isLoading && !isFetchingMore) {
          setPage(prev => prev + 1); // Trigger the next page fetch
        }
      },
      { rootMargin: '200px' } // Start fetching slightly before the user reaches the absolute bottom
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isFetchingMore]);

  // Load trending movies directly from TMDB API
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/trending/movie/day?language=en-US`, API_OPTIONS);
        if (!response.ok) throw new Error('Failed to fetch trending movies');
        const data = await response.json();
        
        // Take the top 5 trending movies
        if (data && data.results) {
          setTrendingMovies(data.results.slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching trending movies from TMDB:', err);
      }
    })();
  }, []);

  return (
    <main>
      <div className="pattern" />

      {/* Navbar */}
      <Navbar
        onAuthOpen={() => setShowAuth(true)}
        onFavouritesOpen={() => setShowFavourites(true)}
      />

      {/* Favourites error toast */}
      {favError && favError !== dismissedError && (
        <div className="fav-error-toast">
          <span>⚠️ {favError}</span>
          <button onClick={() => setDismissedError(favError)} aria-label="Dismiss">✕</button>
        </div>
      )}

      <div className="wrapper">
        <header>
          <img src="./hero-img.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {/* Trending */}
        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.id} onClick={() => setSelectedMovieId(movie.id)} className="cursor-pointer">
                  <p>{index + 1}</p>
                  <img 
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/no-movie.png'} 
                    alt={movie.title || movie.name} 
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* All Movies */}
        <section className="all-movies ml-[100px] mr-[100px]">
          <h2>All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <>
              <ul>
                {movieList.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onAuthRequired={() => setShowAuth(true)}
                    onClick={() => setSelectedMovieId(movie.id)}
                  />
                ))}
              </ul>

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="scroll-sentinel" />

              {isFetchingMore && (
                <div className="load-more-spinner">
                  <Spinner />
                </div>
              )}

              {!hasMore && movieList.length > 0 && (
                <p className="no-more-movies">You've seen it all! 🎬</p>
              )}
            </>
          )}
        </section>
      </div>

      {/* Auth Modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Favourites Drawer */}
      {showFavourites && <FavouritesModal onClose={() => setShowFavourites(false)} />}

      {/* Movie Details Modal */}
      <MovieDetails movieId={selectedMovieId} onClose={() => setSelectedMovieId(null)} />
    </main>
  );
};

export default App;