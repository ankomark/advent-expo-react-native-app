
import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { updateLike } from '../services/api'; // API to handle like updates

const LikeButton = ({ trackId, initialLikes }) => {
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(false);

    const handleLikeClick = async () => {
        try {
            const response = await updateLike(trackId, !isLiked); // Pass trackId and new like state
            if (response && typeof response.likes_count === 'number') {
                setLikes(response.likes_count); // Update UI with the new like count
                setIsLiked(!isLiked); // Toggle like state
            } else {
                console.error('Invalid response format:', response);
            }
        } catch (error) {
            console.error('Failed to update like status:', error);
        }
    };

    return (
        <TouchableOpacity
        style={styles.likeButton}
        onPress={handleLikeClick}
    >
        <Text style={[styles.likeText, isLiked && styles.liked]}>
            👍 {likes} {/* Replace heart with thumb-up */}
        </Text>
    </TouchableOpacity>
    );
};

export default LikeButton;

const styles = StyleSheet.create({
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: 'transparent',
    },
    likeText: {
        fontSize: 18,
        color: '#f30b3a', // Default color
        fontWeight: 'bold',
        textAlign: 'center',
    },
    liked: {
        color: '#ff6b81', // Liked color
    },
});