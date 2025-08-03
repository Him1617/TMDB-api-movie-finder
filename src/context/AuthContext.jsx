import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, login as appwriteLogin, signup as appwriteSignup, logout as appwriteLogout } from '../appwrite';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [favourites, setFavourites] = useState([]);
    const [favLoading, setFavLoading] = useState(false);
    const [favError, setFavError] = useState('');
    const [togglingIds, setTogglingIds] = useState(new Set()); 

    // Load user on mount
    useEffect(() => {
        (async () => {
            const u = await getCurrentUser();
            setUser(u);
            setAuthLoading(false);
        })();
    }, []);

    // Load favourites from localStorage whenever user changes
    useEffect(() => {
        if (!user) { 
            setFavourites([]); 
            return; 
        }
        
        setFavLoading(true);
        try {
            const saved = localStorage.getItem(`favourites_${user.$id}`);
            if (saved) {
                setFavourites(JSON.parse(saved));
            } else {
                setFavourites([]);
            }
        } catch (e) {
            console.error('Failed to load favourites from localStorage:', e);
            setFavError('Could not load favourites.');
        } finally {
            setFavLoading(false);
        }
    }, [user]);

    // Save to localStorage whenever favourites change (and user is logged in)
    useEffect(() => {
        if (user && favourites !== null) {
            localStorage.setItem(`favourites_${user.$id}`, JSON.stringify(favourites));
        }
    }, [favourites, user]);

    const login = async (email, password) => {
        const u = await appwriteLogin(email, password);
        setUser(u);
        return u;
    };

    const signup = async (name, email, password) => {
        const u = await appwriteSignup(name, email, password);
        setUser(u);
        return u;
    };

    const logout = async () => {
        await appwriteLogout();
        setUser(null);
        setFavourites([]);
    };

    const toggleFavourite = async (movie) => {
        if (!user) return false;
        
        setFavError('');
        const existing = favourites.find(f => f.movie_id === movie.id);

        if (existing) {
            setFavourites(prev => prev.filter(f => f.movie_id !== movie.id));
        } else {
            // Create a local document shape to match what we expect
            const doc = {
                $id: `local-${movie.id}-${Date.now()}`,
                movie_id: movie.id,
                title: movie.title,
                poster_path: movie.poster_path || '',
                vote_average: movie.vote_average || 0,
                release_date: movie.release_date || '',
                original_language: movie.original_language || '',
            };
            setFavourites(prev => [doc, ...prev]);
        }

        return true;
    };

    const isFavourite = (movieId) => favourites.some(f => f.movie_id === movieId);
    const isToggling = (movieId) => togglingIds.has(movieId);

    return (
        <AuthContext.Provider value={{ user, authLoading, favourites, favLoading, favError, login, signup, logout, toggleFavourite, isFavourite, isToggling }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
