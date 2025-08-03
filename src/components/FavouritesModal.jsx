import React from 'react';
import { useAuth } from '../context/AuthContext';

const FavouritesModal = ({ onClose }) => {
    const { favourites, favLoading, toggleFavourite } = useAuth();

    return (
        <div className="fav-overlay" onClick={onClose}>
            <div className="fav-drawer" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="fav-drawer-header">
                    <div className="fav-drawer-title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#AB8BFF">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        <h2>My Favourites</h2>
                    </div>
                    <button className="fav-close" onClick={onClose} aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="fav-drawer-content">
                    {favLoading ? (
                        <div className="fav-loading">
                            <div className="fav-spinner" />
                            <p>Loading favourites…</p>
                        </div>
                    ) : favourites.length === 0 ? (
                        <div className="fav-empty">
                            <div className="fav-empty-icon">💔</div>
                            <p>No favourites yet!</p>
                            <span>Click the heart icon on any movie to save it here.</span>
                        </div>
                    ) : (
                        <ul className="fav-list">
                            {favourites.map(fav => (
                                <li key={fav.$id} className="fav-item">
                                    <img
                                        src={fav.poster_path
                                            ? `https://image.tmdb.org/t/p/w185${fav.poster_path}`
                                            : '/no-movie.png'}
                                        alt={fav.title}
                                        className="fav-item-poster"
                                    />
                                    <div className="fav-item-info">
                                        <h3 className="fav-item-title">{fav.title}</h3>
                                        <div className="fav-item-meta">
                                            <span>⭐ {fav.vote_average ? fav.vote_average.toFixed(1) : 'N/A'}</span>
                                            <span>•</span>
                                            <span>{fav.release_date ? fav.release_date.split('-')[0] : 'N/A'}</span>
                                            <span>•</span>
                                            <span className="uppercase">{fav.original_language}</span>
                                        </div>
                                    </div>
                                    <button
                                        className="fav-item-remove"
                                        title="Remove from favourites"
                                        onClick={() => toggleFavourite({
                                            id: fav.movie_id,
                                            title: fav.title,
                                            poster_path: fav.poster_path,
                                            vote_average: fav.vote_average,
                                            release_date: fav.release_date,
                                            original_language: fav.original_language,
                                        })}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FavouritesModal;
