import { Client, Databases, Account, ID, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const FAVOURITES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_FAVOURITES_COLLECTION_ID;

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(PROJECT_ID);

const database = new Databases(client);
export const account = new Account(client);

// ─── Auth ────────────────────────────────────────────────────────────────────

export const getCurrentUser = async () => {
    try {
        return await account.get();
    } catch {
        return null;
    }
};

export const signup = async (name, email, password) => {
    await account.create(ID.unique(), email, password, name);
    return login(email, password);
};

export const login = async (email, password) => {
    await account.createEmailPasswordSession(email, password);
    return account.get();
};

export const logout = async () => {
    await account.deleteSession('current');
};

// ─── Trending / Search ───────────────────────────────────────────────────────

export const updateSearchCount = async (searchTerm, movie) => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', searchTerm),
        ]);

        if (result.documents.length > 0) {
            const doc = result.documents[0];
            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1,
            });
        } else {
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            });
        }
    } catch (error) {
        console.log(error);
    }
};

export const getTrendingMovies = async () => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc("count"),
        ]);
        return result.documents;
    } catch (error) {
        console.log(error);
    }
};

// ─── Favourites ───────────────────────────────────────────────────────────────

export const addFavourite = async (userId, movie) => {
    return database.createDocument(DATABASE_ID, FAVOURITES_COLLECTION_ID, ID.unique(), {
        user_id: userId,
        movie_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path || '',
        vote_average: movie.vote_average || 0,
        release_date: movie.release_date || '',
        original_language: movie.original_language || '',
    });
};

export const removeFavourite = async (docId) => {
    return database.deleteDocument(DATABASE_ID, FAVOURITES_COLLECTION_ID, docId);
};

export const getFavourites = async (userId) => {
    const result = await database.listDocuments(DATABASE_ID, FAVOURITES_COLLECTION_ID, [
        Query.equal('user_id', userId),
        Query.orderDesc('$createdAt'),
    ]);
    return result.documents;
};