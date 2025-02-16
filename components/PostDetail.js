import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Image,
  ScrollView,
  Alert
} from 'react-native';
import axios from 'axios';

const BASE_URL = 'http://192.168.28.138:8000/';

const PostDetail = ({ route, navigation }) => {
  // Get postId from navigation params
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/posts/${postId}/`);
        setPost(response.data);
      } catch (err) {
        console.error('Error fetching post details:', err);
        setError('Failed to load post details.');
        Alert.alert('Error', 'Failed to load post details.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetail();
  }, [postId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Post not found.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{post.title}</Text>
      {post.image && (
        <Image source={{ uri: post.image }} style={styles.image} />
      )}
      <Text style={styles.content}>{post.content}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    color: '#444',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
});

export default PostDetail;
