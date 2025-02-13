

import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import PlayControls from './PlayControls';
import Likes from './LikeButton';
import Comments from './Comments';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TrackItem = ({ track }) => {
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const fetchFavoriteStatus = async () => {
            try {
                const favoriteTracks = await getFavoriteTracks();
                setIsFavorite(favoriteTracks.some(fav => fav.id === track.id));
            } catch (error) {
                console.error('Error fetching favorite status:', error);
            }
        };
        fetchFavoriteStatus();
    }, [track.id]);
    // Debugging: Log the track data
    // useEffect(() => {
    //     console.log("Track Data:", track);
    // }, [track]);

    const handleDownload = async () => {
        if (!track.audio_file) {
            Alert.alert("Error", "Track file is missing!");
            return;
        }

        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            console.log('Media Library Permission Status:', status);

            if (status !== 'granted') {
                Alert.alert("Permission Denied", "Storage access is required to save the track.");
                return;
            }

            const fileExtension = track.audio_file.split('.').pop();
            if (!fileExtension) {
                throw new Error("Could not determine file extension.");
            }

            const fileName = `${track.id}.${fileExtension}`;
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;

            const downloadResumable = FileSystem.createDownloadResumable(
                track.audio_file,
                fileUri,
                {},
                (downloadProgress) => {
                    const progress = (downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 100;
                    console.log(`Download Progress: ${progress.toFixed(2)}%`);
                }
            );

            const { uri } = await downloadResumable.downloadAsync();

            const asset = await MediaLibrary.createAssetAsync(uri);
            console.log('Asset Created:', asset);

            try {
                await MediaLibrary.createAlbumAsync("Downloads", asset, false);
                console.log('Album Created Successfully');
            } catch (albumError) {
                console.warn('Album creation failed:', albumError);
                console.log('File saved to device without album.');
            }

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            }
        } catch (error) {
            console.error('Error downloading the track:', error);
            Alert.alert("Download Failed", error.message || "An unexpected error occurred.");
        }
    };

    const toggleFavorite = async (trackId) => {
        try {
            const newFavoriteStatus = !isFavorite;
            await updateFavoriteTrack(trackId, newFavoriteStatus);
            return { favorite: newFavoriteStatus };
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
            throw error;
        }
    };

    const updateFavoriteTrack = async (trackId, isFavorite) => {
        try {
            let favoriteTracks = await getFavoriteTracks();
            if (isFavorite) {
                favoriteTracks.push({ id: trackId });
            } else {
                favoriteTracks = favoriteTracks.filter(track => track.id !== trackId);
            }
            await saveFavoriteTracks(favoriteTracks);
        } catch (error) {
            console.error('Error updating favorite tracks:', error);
            throw error;
        }
    };

    const getFavoriteTracks = async () => {
        return JSON.parse(await AsyncStorage.getItem('favoriteTracks')) || [];
    };

    const saveFavoriteTracks = async (tracks) => {
        await AsyncStorage.setItem('favoriteTracks', JSON.stringify(tracks));
    };

    const handleToggleFavorite = async () => {
        try {
            const result = await toggleFavorite(track.id);
            setIsFavorite(result.favorite);
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    };

    return (
        <View style={styles.trackItem}>
            <Image source={{ uri: track.cover_image }} style={styles.trackCover} />
            <Text style={styles.trackTitle}>{track.title}</Text>
            <Text style={styles.artistText}>Posted by: {track.artist.username}</Text>
            <PlayControls track={track} />
            <View style={styles.bottomSection}>
                <Likes trackId={track.id} initialLikes={track.likes_count} />
                <Comments trackId={track.id} />
                <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
                    <MaterialIcons name="download" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite}>
                    <FontAwesome name="heart" size={20} color={isFavorite ? 'red' : 'gray'} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    trackItem: {
      
        borderRadius: 10,
        padding: 16,
        marginVertical: 10,
        backgroundColor: '#0c2756',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    trackCover: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 6,
    },
    trackTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    artistText: {
        fontSize: 14,
        color: 'white',
        marginBottom: 8,
    },
    bottomSection: {
        // display:'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 8,
    },
    downloadButton: {
        padding: 10,
        borderRadius: 5,
        marginLeft: 10,
    },
    favoriteButton: {
        padding: 10,
        borderRadius: 5,
        marginLeft: 10,
    },
});

export default TrackItem;