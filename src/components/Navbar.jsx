import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onAuthOpen, onFavouritesOpen }) => {
    const { user, logout, favourites } = useAuth();

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <span className="navbar-logo">🎬</span>
                <span className="navbar-title">MovieFinder</span>
            </div>

            <div className="navbar-actions">
                {user ? (
                    <>
                        <button
                            id="favourites-btn"
                            className="btn-favourites"
                            onClick={onFavouritesOpen}
                            title="My Favourites"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            My Favourites
                            {favourites.length > 0 && (
                                <span className="fav-badge">{favourites.length}</span>
                            )}
                        </button>

                        <div className="navbar-user">
                            <div className="user-avatar">
                                {user.name ? user.name[0].toUpperCase() : '?'}
                            </div>
                            <span className="user-name">{user.name || user.email}</span>
                        </div>

                        <button
                            id="logout-btn"
                            className="btn-logout"
                            onClick={logout}
                        >
                            Sign Out
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            id="signin-btn"
                            className="btn-signin"
                            onClick={onAuthOpen}
                        >
                            Sign In
                        </button>
                        <button
                            id="signup-btn"
                            className="btn-signup"
                            onClick={onAuthOpen}
                        >
                            Sign Up
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
