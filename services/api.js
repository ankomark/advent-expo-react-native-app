


import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = ' http://192.168.31.138:8000/api/songs'; 
export const BASE_URL = ' http://192.168.31.138:8000/api';
export const BASE_URI = ' http://192.168.31.138:8000/';

// Function to get the token from AsyncStorage
const getAuthToken = async () => {
    return await AsyncStorage.getItem('accessToken');
};

// Function to refresh the access token
const refreshAuthToken = async () => {
    const refreshToken = await AsyncStorage.getItem('refreshToken');

    if (!refreshToken) {
        console.error("No refresh token found in storage.");
        throw new Error('No refresh token found');
    }

    try {
        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
        });

        if (!response.data.access) {
            throw new Error("Failed to get new access token");
        }

        await AsyncStorage.setItem('accessToken', response.data.access);
        console.log("Access token refreshed successfully!");

        return response.data.access;
    } catch (error) {
        console.error('Error refreshing token:', error.response?.data || error.message);
        throw new Error('Failed to refresh token');
    }
};


// Centralized function to handle API requests with token refresh
const makeAuthenticatedRequest = async (method, url, data = null, options = {}) => {
    let token = await getAuthToken();

    try {
        const response = await axios({
            method,
            url,
            data,
            headers: {
                Authorization: `Bearer ${token}`,
                ...options.headers,
            },
            ...options,
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            // Token expired, try refreshing
            const newToken = await refreshAuthToken();
            if (newToken) {
                // Retry the request with the new token
                const retryResponse = await axios({
                    method,
                    url,
                    data,
                    headers: {
                        Authorization: `Bearer ${newToken}`,
                        ...options.headers,
                    },
                    ...options,
                });
                return retryResponse.data;
            }
        }
        throw error;
    }
};

// Fetch tracks
export const fetchTracks = async () => {
    const refreshToken = await AsyncStorage.getItem('refreshToken');

    if (!refreshToken) {
        console.error("No refresh token found, forcing login.");
        throw new Error("No refresh token found, please log in again.");
    }

    return makeAuthenticatedRequest('get', `${API_URL}/tracks/`);
};


// Fetch user profile
export const fetchProfile = async () => {
    return makeAuthenticatedRequest('get', `${BASE_URL}/profiles/me/`);
};

// Fetch users
export const fetchUsers = async () => {
    return makeAuthenticatedRequest('get', `${API_URL}/users/`);
};

// Fetch playlists
export const fetchPlaylists = async () => {
    return makeAuthenticatedRequest('get', `${API_URL}/playlists/`);
};

// Fetch comments for a track
export const fetchComments = async (trackId) => {
    return makeAuthenticatedRequest('get', `${API_URL}/tracks/${trackId}/comments/`);
};

// Post a new comment for a track
export const postComment = async (trackId, content) => {
    return makeAuthenticatedRequest('post', `${API_URL}/tracks/${trackId}/comments/`, { content });
};

// Update like status for a track
export const updateLike = async (trackId) => {
    return makeAuthenticatedRequest('post', `${API_URL}/tracks/${trackId}/toggle_like/`);
};

// Fetch categories
export const fetchCategories = async () => {
    return makeAuthenticatedRequest('get', `${API_URL}/categories/`);
};

// Create a new track
export const createTrack = async (formData) => {
    try {
        let token = await getAuthToken(); // Retrieve token

        if (!token) {
            console.warn('Access token not found. Trying to refresh...');
            token = await refreshAuthToken(); // Refresh token if missing
        }

        if (!token) {
            throw new Error('No authentication token found after refresh');
        }

        const response = await axios.post(`${API_URL}/tracks/upload/`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`, // Include JWT token
                'Content-Type': 'multipart/form-data',
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error uploading track:', error.response?.data || error.message);
        throw error;
    }
};


// Login user
export const loginUser = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/token/`, {
            username,
            password,
        });
        const { access, refresh } = response.data;

        if (!access || !refresh) {
            throw new Error("Access or Refresh token missing in response");
        }

        await AsyncStorage.setItem('accessToken', access);
        await AsyncStorage.setItem('refreshToken', refresh);

        console.log("Tokens stored successfully!");

        return response.data;
    } catch (error) {
        console.error("Login Error:", error.response?.data || error.message);
        throw error;
    }
};


// Download a track
export const downloadTrack = async (trackId, fileName) => {
    const token = await getAuthToken();
    try {
        const response = await axios.get(`${API_URL}/tracks/${trackId}/download/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            responseType: 'blob',
        });

        // Create a blob URL for the downloaded file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName || 'track.mp3');
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error('Error downloading the track:', error);
        throw new Error('Failed to download the track.');
    }
};

// Toggle favorite status for a track
export const toggleFavorite = async (trackId) => {
    return makeAuthenticatedRequest('post', `${API_URL}/tracks/${trackId}/favorite/`);
};

// Fetch favorite tracks
export const getFavoriteTracks = async () => {
    return makeAuthenticatedRequest('get', `${API_URL}/favorites/`);
};

// Check if a profile exists
export const checkProfileExistence = async () => {
    return makeAuthenticatedRequest('get', `${BASE_URL}/profiles/check_or_redirect/`);
};