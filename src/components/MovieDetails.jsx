import React, { useEffect, useState } from 'react';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    authorization: `Bearer ${API_KEY}`
  }
};

const MovieDetails = ({ movieId, onClose }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/movie/${movieId}?append_to_response=videos,credits`, API_OPTIONS);
                if (!response.ok) throw new Error('Failed to fetch movie details');
                
                const data = await response.json();
                setDetails(data);
            } catch (err) {
                console.error(err);
                setError('Could not load movie details.');
            } finally {
                setLoading(false);
            }
        };

        if (movieId) {
            fetchDetails();
        }
    }, [movieId]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!movieId) return null;

    // Find a YouTube trailer
    const trailer = details?.videos?.results?.find(
        (vid) => vid.site === 'YouTube' && vid.type === 'Trailer'
    ) || details?.videos?.results?.find(
        (vid) => vid.site === 'YouTube'
    );

    const topCast = details?.credits?.cast?.slice(0, 5) || [];

    return (
        <div className="movie-details-overlay" onClick={onClose}>
            <div className="movie-details-modal" onClick={e => e.stopPropagation()}>
                <button className="movie-details-close" onClick={onClose} aria-label="Close">
                    ✕
                </button>

                {loading ? (
                    <div className="movie-details-loading">
                        <span className="auth-spinner" />
                        <p>Loading details...</p>
                    </div>
                ) : error ? (
                    <div className="movie-details-error">
                        <p>{error}</p>
                    </div>
                ) : details && (
                    <div className="movie-details-content">
                        
                        {/* Trailer Section */}
                        {trailer ? (
                            <div className="trailer-container">
                                <iframe
                                    src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=0`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ) : (
                            <div className="no-trailer">
                                <img 
                                    src={details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : '/no-movie.png'} 
                                    alt="Backdrop" 
                                />
                                <div className="no-trailer-overlay">
                                    <p>No trailer available</p>
                                </div>
                            </div>
                        )}

                        {/* Info Section */}
                        <div className="movie-details-info">
                            <h2 className="movie-title">{details.title}</h2>
                            <p className="movie-tagline">{details.tagline}</p>

                            <div className="movie-meta-tags">
                                <span className="meta-badge rating">
                                    ⭐ {details.vote_average?.toFixed(1)}
                                </span>
                                <span className="meta-badge">
                                    {details.release_date?.split('-')[0]}
                                </span>
                                <span className="meta-badge">
                                    {details.runtime} min
                                </span>
                            </div>

                            <div className="movie-genres">
                                {details.genres?.map(g => (
                                    <span key={g.id} className="genre-pill">{g.name}</span>
                                ))}
                            </div>

                            <div className="movie-overview">
                                <h3>Overview</h3>
                                <p>{details.overview}</p>
                            </div>

                            {topCast.length > 0 && (
                                <div className="movie-cast">
                                    <h3>Top Cast</h3>
                                    <div className="cast-list">
                                        {topCast.map(actor => (
                                            <div key={actor.id} className="cast-member">
                                                {actor.profile_path ? (
                                                    <img src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} alt={actor.name} />
                                                ) : (
                                                    <div className="no-profile">{actor.name.charAt(0)}</div>
                                                )}
                                                <div className="actor-info">
                                                    <p className="actor-name">{actor.name}</p>
                                                    <p className="character-name">{actor.character}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieDetails;
