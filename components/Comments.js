


// import React, { useState, useEffect } from 'react';
// import { View, Text, TouchableOpacity, TextInput, StyleSheet, FlatList, Modal, Dimensions } from 'react-native';
// import { fetchComments, postComment } from '../services/api';

// const { width, height } = Dimensions.get('window');

// const Comments = ({ trackId }) => {
//     const [comments, setComments] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [newComment, setNewComment] = useState('');
//     const [showComments, setShowComments] = useState(false);

//     useEffect(() => {
//         const fetchCommentData = async () => {
//             try {
//                 const data = await fetchComments(trackId);
//                 setComments(data);
//             } catch (error) {
//                 console.error('Failed to fetch comments:', error);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchCommentData();
//     }, [trackId]);

//     const handlePostComment = async () => {
//         if (newComment.trim()) {
//             try {
//                 const postedComment = await postComment(trackId, newComment);
//                 setComments((prevComments) => [...prevComments, postedComment]);
//                 setNewComment(''); // Clear the input after posting
//             } catch (error) {
//                 console.error('Failed to post comment:', error);
//             }
//         }
//     };

//     const toggleComments = () => setShowComments((prev) => !prev);

//     return (
//         <View style={styles.commentsSection}>
//             <TouchableOpacity onPress={toggleComments} style={styles.avatarButton}>
//                 <Text style={styles.avatarButtonText}>
//                     💬 {comments.length}
//                 </Text>
//             </TouchableOpacity>
//             <Modal
//                 visible={showComments}
//                 animationType="slide"
//                 transparent={false}
//                 onRequestClose={() => setShowComments(false)}
//             >
//                 <View style={styles.modalContainer}>
//                     <TouchableOpacity onPress={toggleComments} style={styles.closeButton}>
//                         <Text style={styles.closeButtonText}>X</Text>
//                     </TouchableOpacity>
//                     {loading ? (
//                         <Text>Loading comments...</Text>
//                     ) : (
//                         <FlatList
//                             data={comments}
//                             keyExtractor={(item) => item.id.toString()}
//                             renderItem={({ item }) => (
//                                 <View style={styles.commentItem}>
//                                     <Text style={styles.commentUser}>{item.user.username}:</Text>
//                                     <Text style={styles.commentContent}>{item.content}</Text>
//                                 </View>
//                             )}
//                         />
//                     )}
//                     <View style={styles.commentInputSection}>
//                         <TextInput
//                             style={styles.commentInput}
//                             value={newComment}
//                             onChangeText={(text) => setNewComment(text)}
//                             placeholder="Write a comment..."
//                             multiline
//                         />
//                         <TouchableOpacity onPress={handlePostComment} style={styles.commentPostButton}>
//                             <Text style={styles.buttonText}>Post</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             </Modal>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     commentsSection: {
//         marginTop: 10,
//     },
//     avatarButton: {
//         padding: 5,
//     },
//     avatarButtonText: {
//         color: 'red',
//         fontSize: 14,
//     },
//     modalContainer: {
//         flex: 1,
//         padding: 20,
//         backgroundColor: '#708F96',
//     },
//     closeButton: {
//         alignSelf: 'flex-end',
//         marginBottom: 10,
//     },
//     closeButtonText: {
//         color: 'red',
//         fontSize: 20,
//     },
//     commentItem: {
//         marginBottom: 10,
//     },
//     commentUser: {
//         fontWeight: 'bold',
//         fontSize: 14,
//         color: 'black',
//     },
//     commentContent: {
//         fontSize: 14,
//         color: 'azure',
//     },
//     commentInputSection: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginTop: 10,
//     },
//     commentInput: {
//         flex: 1,
//         height: 60,
//         padding: 5,
//         borderWidth: 1,
//         borderColor: '#ddd',
//         borderRadius: 4,
//         color: 'white',
//     },
//     commentPostButton: {
//         marginLeft: 10,
//         padding: 10,
//         backgroundColor: '#007bff',
//         borderRadius: 4,
//     },
//     buttonText: {
//         color: '#fff',
//         textAlign: 'center',
//     },
// });

// export default Comments;


import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, FlatList, Modal, Dimensions, Image } from 'react-native';
import { fetchComments, postComment } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const BASE_URL = ' http://192.168.31.138:8000/api';

const Comments = ({ trackId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        const fetchCommentData = async () => {
            try {
                const data = await fetchComments(trackId);
                // Fetch profile pictures for all commenters
                const commentsWithProfiles = await Promise.all(
                    data.map(async (comment) => {
                        try {
                            const token = await AsyncStorage.getItem('accessToken');
                            if (!token) return comment; // Skip if no token
    
                            // Construct the URL
                            const url = `${BASE_URL}/profiles/by_user/${comment.user.id}/`;
                            console.log('Fetching profile picture from:', url); // Debug log
    
                            // Fetch the profile of the commenter using the new endpoint
                            const response = await axios.get(url, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            return {
                                ...comment,
                                user: {
                                    ...comment.user,
                                    profile_picture: response.data.picture || 'https://via.placeholder.com/50', // Fallback if no profile picture
                                },
                            };
                        } catch (error) {
                            console.error('Error fetching profile picture:', error);
                            return {
                                ...comment,
                                user: {
                                    ...comment.user,
                                    profile_picture: 'https://via.placeholder.com/50', // Fallback if API fails
                                },
                            };
                        }
                    })
                );
                setComments(commentsWithProfiles);
            } catch (error) {
                console.error('Failed to fetch comments:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCommentData();
    }, [trackId]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = await AsyncStorage.getItem('accessToken');
                if (!token) return;

                // Fetch the profile of the currently authenticated user
                const response = await axios.get(`${BASE_URL}/profiles/me/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserProfile(response.data);
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        fetchUserProfile();
    }, []);

    const handlePostComment = async () => {
        if (newComment.trim()) {
            try {
                const token = await AsyncStorage.getItem('accessToken');
                if (!token) {
                    Alert.alert('Error', 'You need to be logged in to post a comment.');
                    return;
                }

                const postedComment = await postComment(trackId, newComment, token);
                // Add the current user's profile picture to the posted comment
                postedComment.user = {
                    ...postedComment.user,
                    profile_picture: userProfile?.picture || 'https://via.placeholder.com/50', // Fallback if no profile picture
                };
                setComments((prevComments) => [...prevComments, postedComment]);
                setNewComment(''); // Clear the input after posting
            } catch (error) {
                console.error('Failed to post comment:', error);
            }
        }
    };

    const toggleComments = () => setShowComments((prev) => !prev);

    return (
        <View style={styles.commentsSection}>
            <TouchableOpacity onPress={toggleComments} style={styles.avatarButton}>
                <Text style={styles.avatarButtonText}>
                    💬 {comments.length}
                </Text>
            </TouchableOpacity>
            <Modal
                visible={showComments}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setShowComments(false)}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity onPress={toggleComments} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>X</Text>
                    </TouchableOpacity>
                    {loading ? (
                        <Text>Loading comments...</Text>
                    ) : (
                        <FlatList
                            data={comments}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.commentItem}>
                                    <Image
                                        source={{ uri: item.user.profile_picture || 'https://via.placeholder.com/50' }} // Fallback image if no profile picture
                                        style={styles.userImage}
                                    />
                                    <View style={styles.commentContentContainer}>
                                        <Text style={styles.commentUser}>{item.user.username}</Text>
                                        <Text style={styles.commentContent}>{item.content}</Text>
                                    </View>
                                </View>
                            )}
                        />
                    )}
                    <View style={styles.commentInputSection}>
                        {userProfile && (
                            <Image
                                source={{ uri: userProfile.picture || 'https://via.placeholder.com/50' }}
                                style={styles.currentUserImage}
                            />
                        )}
                        <TextInput
                            style={styles.commentInput}
                            value={newComment}
                            onChangeText={(text) => setNewComment(text)}
                            placeholder="Write a comment..."
                            multiline
                        />
                        <TouchableOpacity onPress={handlePostComment} style={styles.commentPostButton}>
                            <Text style={styles.buttonText}>Post</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    commentsSection: {
        marginTop: 10,
    },
    avatarButton: {
        padding: 5,
    },
    avatarButtonText: {
        color: 'white',
        fontSize: 14,
    },
    modalContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#708F96',
    },
    closeButton: {
        alignSelf: 'flex-end',
        marginBottom: 10,
    },
    closeButtonText: {
        color: 'red',
        fontSize: 30,
    },
    commentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    userImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    commentContentContainer: {
        flex: 1,
    },
    commentUser: {
        fontWeight: 'bold',
        fontSize: 14,
        color: 'black',
    },
    commentContent: {
        fontSize: 14,
        color: 'azure',
    },
    commentInputSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,

    },
    currentUserImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    commentInput: {
        flex: 1,
        height: 60,
        padding: 5,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        color: 'white',
    },
    commentPostButton: {
        marginLeft: 10,
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 4,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
    },
});

export default Comments;