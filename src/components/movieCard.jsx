import React from 'react';
import { useAuth } from '../context/AuthContext';

const MovieCard = ({ movie, onAuthRequired, onClick }) => {
    const { title, vote_average, poster_path, release_date, original_language } = movie;
    const { user, toggleFavourite, isFavourite, isToggling } = useAuth();
    const fav = isFavourite(movie.id);
    const busy = isToggling(movie.id);

    const handleFavClick = async (e) => {
        e.stopPropagation();
        if (!user) {
            onAuthRequired?.();
            return;
        }
        await toggleFavourite(movie);
    };

    return (
        <div className="movie-card cursor-pointer" onClick={() => onClick?.()}>
            <div className="movie-card-img-wrap">
                <img
                    src={poster_path
                        ? `https://image.tmdb.org/t/p/w500/${poster_path}`
                        : '/no-movie.png'}
                    alt={title}
                />
                <button
                    className={`heart-btn ${fav ? 'active' : ''} ${busy ? 'busy' : ''}`}
                    onClick={handleFavClick}
                    disabled={busy}
                    title={user ? (fav ? 'Remove from favourites' : 'Add to favourites') : 'Sign in to save favourites'}
                    aria-label={fav ? 'Remove from favourites' : 'Add to favourites'}
                >
                    {busy ? (
                        <span className="heart-spinner" />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                            fill={fav ? 'currentColor' : 'none'}
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                    )}
                </button>
            </div>

            <div className="mt-4">
                <h3>{title}</h3>
                <div className="content">
                    <div className="rating">
                        <img src="star.svg" alt="star icon" />
                        <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
                    </div>
                    <span>•</span>
                    <p className="lang">{original_language}</p>
                    <span>•</span>
                    <p className="year">
                        {release_date ? release_date.split('-')[0] : 'N/A'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MovieCard;
