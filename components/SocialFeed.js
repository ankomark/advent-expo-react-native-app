// // components/SocialFeed.js
// import React, { useState, useEffect,useRef} from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   TouchableOpacity
// } from 'react-native';
// import { Video } from 'expo-av';
// import { MaterialIcons } from '@expo/vector-icons';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import { fetchSocialPosts } from '../services/api';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import {
//   LikeButton,
//   SaveButton,
//   CommentAction,
//   DownloadButton
// } from '../components/SocialActions';
// import SearchBaar from '../components/SearchBaar';

// const BASE_URL = 'http://192.168.246.138:8000/api';
// const DEFAULT_PROFILE_IMAGE = 'https://via.placeholder.com/150';

// const SocialFeed = () => {
//   const [posts, setPosts] = useState([]);
//   const [filteredPosts, setFilteredPosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const navigation = useNavigation();
//   const videoRefs = useRef({}); // Refs for video components

//   useEffect(() => {
//     filterPosts();
//   }, [searchQuery, posts]);

//   const filterPosts = () => {
//     if (!searchQuery) {
//       setFilteredPosts(posts);
//       return;
//     }

//     const lowerQuery = searchQuery.toLowerCase();
//     const filtered = posts.filter(post => 
//       post.caption?.toLowerCase().includes(lowerQuery) ||
//       post.user.username?.toLowerCase().includes(lowerQuery) ||
//       post.location?.toLowerCase().includes(lowerQuery)
//     );
//     setFilteredPosts(filtered);
//   };

//   const loadPosts = async () => {
//     try {
//       setLoading(true);
//       const data = await fetchSocialPosts();
      
//       const postsWithProfiles = await Promise.all(
//         data.map(async (post) => {
//           try {
//             const token = await AsyncStorage.getItem('accessToken');
//             if (!token) return post;

//             const response = await axios.get(
//               `${BASE_URL}/profiles/by_user/${post.user.id}/`,
//               { headers: { Authorization: `Bearer ${token}` } }
//             );

//             return {
//               ...post,
//               user: {
//                 ...post.user,
//                 profile_picture: response.data.picture || DEFAULT_PROFILE_IMAGE
//               }
//             };
//           } catch (error) {
//             return {
//               ...post,
//               user: {
//                 ...post.user,
//                 profile_picture: DEFAULT_PROFILE_IMAGE
//               }
//             };
//           }
//         })
//       );

//       setPosts(postsWithProfiles.sort((a, b) => 
//         new Date(b.created_at) - new Date(a.created_at)
//       ));
//     } catch (error) {
//       Alert.alert('Error', 'Failed to fetch posts');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     const interval = setInterval(loadPosts, 3000000);
//     return () => clearInterval(interval);
//   }, []);

//   useFocusEffect(
//     React.useCallback(() => {
//       loadPosts();
//     }, [])
//   );
//   const onViewableItemsChanged = useRef(({ viewableItems }) => {
//     viewableItems.forEach((item) => {
//       const videoRef = videoRefs.current[item.item.id];
//       if (videoRef && item.isViewable) {
//         videoRef.playAsync(); // Play the video when it comes into view
//       } else if (videoRef) {
//         videoRef.pauseAsync(); // Pause the video when it goes out of view
//       }
//     });
//   }).current;

//   const viewabilityConfig = {
//     itemVisiblePercentThreshold: 50, // Adjust this threshold as needed
//   };
//   const renderItem = ({ item }) => (
//     <View style={styles.postContainer}>
//       <View style={styles.postHeader}>
//         <Image 
//           source={{ uri: item.user.profile_picture }}
//           style={styles.profileImage}
//           onError={() => {}}
//         />
//         <Text style={styles.username}>{item.user.username}</Text>
//       </View>

//       {item.content_type === 'video' ? (
//         <Video
//         ref={(ref) => (videoRefs.current[item.id] = ref)} // Assign ref to the video
//           source={{ uri: item.media_file }}
//           style={styles.media}
//           useNativeControls
//           resizeMode="cover"
//           isLooping
//           shouldPlay={false} // Start with paused state
//         />
//       ) : (
//         <Image 
//           source={{ uri: item.media_file }} 
//           style={styles.media}
//           resizeMode="cover"
//         />
//       )}

//       <View style={styles.postFooter}>
//         <View style={styles.actions}>
//           <LikeButton postId={item.id} initialLikes={item.likes_count} isLiked={item.is_liked} />
//           <CommentAction postId={item.id} commentCount={item.comments_count} />
//           <DownloadButton mediaUrl={item.media_file} contentType={item.content_type} />
//           <SaveButton postId={item.id} initialSaved={item.is_saved} />
//         </View>

//         <View style={styles.postInfo}>
//           <Text style={styles.caption}>{item.caption}</Text>
//           {item.location && (
//             <Text style={styles.location}>
//               <Feather name="map-pin" size={14} color="#666" /> {item.location}
//             </Text>
//           )}
//           <Text style={styles.timestamp}>
//             {new Date(item.created_at).toLocaleDateString()}
//           </Text>
//         </View>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <SearchBaar onSearch={setSearchQuery} />
      
//       <TouchableOpacity
//         style={styles.topFab}
//         onPress={() => navigation.navigate('CreatePost')}
//       >
//         <MaterialIcons name="add" size={28} color="white" />
//       </TouchableOpacity>

//       <FlatList
//         data={filteredPosts}
//         renderItem={renderItem}
//         keyExtractor={item => item.id.toString()}
//         contentContainerStyle={styles.listContent}
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             {!loading && <Text style={styles.emptyText}>
//               {searchQuery ? `No results for "${searchQuery}"` : 'No posts found'}
//             </Text>}
//           </View>
//         }
//         refreshing={refreshing}
//         onRefresh={loadPosts}
//         showsVerticalScrollIndicator={false}
//         onViewableItemsChanged={onViewableItemsChanged} // Track visible items
//         viewabilityConfig={viewabilityConfig} // Configure visibility threshold
//       />

//       {loading && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color="#1DA1F2" />
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   listContent: {
//     paddingTop: 100,
//     paddingBottom: 20,
//     paddingHorizontal: 12,
//   },
//   postContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     marginBottom: 15,
//     overflow: 'hidden',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     shadowOffset: { width: 0, height: 2 },
//   },
//   postHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//   },
//   profileImage: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginRight: 10,
//     backgroundColor: '#eee',
//   },
//   username: {
//     fontWeight: '600',
//     fontSize: 16,
//     color: '#333',
//   },
//   media: {
//     width: '100%',
//     height: 450,
//     backgroundColor: '#eee',
//   },
//   postFooter: {
//     padding: 12,
//   },
//   actions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   postInfo: {
//     marginTop: 8,
//   },
//   caption: {
//     fontSize: 15,
//     color: '#333',
//     lineHeight: 20,
//     marginBottom: 6,
//   },
//   location: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 4,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   timestamp: {
//     fontSize: 12,
//     color: '#999',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//   },
//   topFab: {
//     position: 'absolute',
//     top: 2,
//     right: 16,
//     zIndex: 1001,
//     backgroundColor: '#1DA1F2',
//     width: 40,
//     height: 40,
//     borderRadius: 28,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     shadowOffset: { width: 0, height: 2 },
//   },
//   loadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(255,255,255,0.8)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// export default SocialFeed;


import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Video } from 'expo-av';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { fetchSocialPosts } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  LikeButton,
  SaveButton,
  CommentAction,
  DownloadButton,
} from '../components/SocialActions';
import SearchBaar from '../components/SearchBaar';

const BASE_URL = 'http://192.168.246.138:8000/api';
const DEFAULT_PROFILE_IMAGE = 'https://via.placeholder.com/150';

const SocialFeed = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();
  const videoRefs = useRef({}); // Refs for video components

  useEffect(() => {
    filterPosts();
  }, [searchQuery, posts]);

  const filterPosts = () => {
    if (!searchQuery) {
      setFilteredPosts(posts);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filtered = posts.filter(
      (post) =>
        post.caption?.toLowerCase().includes(lowerQuery) ||
        post.user.username?.toLowerCase().includes(lowerQuery) ||
        post.location?.toLowerCase().includes(lowerQuery)
    );
    setFilteredPosts(filtered);
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await fetchSocialPosts();

      const postsWithProfiles = await Promise.all(
        data.map(async (post) => {
          try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) return post;

            const response = await axios.get(
              `${BASE_URL}/profiles/by_user/${post.user.id}/`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            return {
              ...post,
              user: {
                ...post.user,
                profile_picture: response.data.picture || DEFAULT_PROFILE_IMAGE,
              },
            };
          } catch (error) {
            return {
              ...post,
              user: {
                ...post.user,
                profile_picture: DEFAULT_PROFILE_IMAGE,
              },
            };
          }
        })
      );

      setPosts(postsWithProfiles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(loadPosts, 300000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadPosts();
    }, [])
  );

  // Handle visibility change for videos
  const onViewableItemsChanged = useRef(({ changed }) => {
    changed.forEach((item) => {
      const videoRef = videoRefs.current[item.key]; // Use item.key (string ID)
      if (item.isViewable) {
        videoRef?.playAsync(); // Play when visible
      } else {
        videoRef?.pauseAsync(); // Pause when not visible
      }
    });
  }).current;

 const viewabilityConfig = {
    itemVisiblePercentThreshold: 80, // Play when 80% of the video is visible
  };

  const renderItem = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Image
          source={{ uri: item.user.profile_picture }}
          style={styles.profileImage}
          onError={() => {}}
        />
        <Text style={styles.username}>{item.user.username}</Text>
      </View>

      {item.content_type === 'video' ? (
        <Video
          ref={(ref) => (videoRefs.current[item.id] = ref)} // Assign ref to the video
          source={{ uri: item.media_file }}
          style={styles.media}
          useNativeControls
          resizeMode="cover"
          isLooping
          shouldPlay={false} // Start with paused state
        />
      ) : (
        <Image
          source={{ uri: item.media_file }}
          style={styles.media}
          resizeMode="cover"
        />
      )}

      <View style={styles.postFooter}>
        <View style={styles.actions}>
          <LikeButton postId={item.id} initialLikes={item.likes_count} isLiked={item.is_liked} />
          <CommentAction postId={item.id} commentCount={item.comments_count} />
          <DownloadButton mediaUrl={item.media_file} contentType={item.content_type} />
          <SaveButton postId={item.id} initialSaved={item.is_saved} />
        </View>

        <View style={styles.postInfo}>
          <Text style={styles.caption}>{item.caption}</Text>
          {item.location && (
            <Text style={styles.location}>
              <Feather name="map-pin" size={14} color="#666" /> {item.location}
            </Text>
          )}
          <Text style={styles.timestamp}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SearchBaar onSearch={setSearchQuery} />

      <TouchableOpacity
        style={styles.topFab}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <MaterialIcons name="add" size={28} color="white" />
      </TouchableOpacity>

      <FlatList
        data={filteredPosts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {!loading && (
              <Text style={styles.emptyText}>
                {searchQuery ? `No results for "${searchQuery}"` : 'No posts found'}
              </Text>
            )}
          </View>
        }
        refreshing={refreshing}
        onRefresh={loadPosts}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged} // Track visible items
        viewabilityConfig={viewabilityConfig} // Configure visibility threshold
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1DA1F2" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingTop: 100,
    paddingBottom: 20,
    paddingHorizontal: 12,
  },
  postContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  username: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  media: {
    width: '100%',
    height: 450,
    backgroundColor: '#eee',
  },
  postFooter: {
    padding: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  postInfo: {
    marginTop: 8,
  },
  caption: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
    marginBottom: 6,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  topFab: {
    position: 'absolute',
    top: 2,
    right: 16,
    zIndex: 1001,
    backgroundColor: '#1DA1F2',
    width: 40,
    height: 40,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SocialFeed;