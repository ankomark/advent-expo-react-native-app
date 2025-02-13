import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  StyleSheet, 
  ScrollView,
  Alert 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { createSocialPost } from '../services/api';

const CreatePost = ({ navigation }) => {
  const [contentType, setContentType] = useState('image');
  const [media, setMedia] = useState(null);
  const [caption, setCaption] = useState('');
  const [selectedSong, setSelectedSong] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Request media library permissions
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required!', 'We need access to your media library to upload files');
      }
    })();
  }, []);

  const pickMedia = async () => {
    const options = {
      mediaTypes: contentType === 'video' 
        ? ImagePicker.MediaTypeOptions.Videos 
        : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 1,
    };

    const result = await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setMedia(result.assets[0]);
    }
  };

  const handlePost = async () => {
    if (!media) {
      Alert.alert('Error', 'Please select a media file');
      return;
    }
  
    setIsUploading(true);
    try {
      const formData = new FormData();
      
      // Convert local URI to proper file object
      const file = {
        uri: media.uri,
        name: media.fileName || `media_${Date.now()}.jpg`,
        type: 'image/jpeg', // Force correct MIME type
      };
  
      formData.append('media_file', file);
      formData.append('content_type', contentType);
      formData.append('caption', caption);
  
      console.log('Final FormData:', formData);
      
      const response = await createSocialPost(formData);
      navigation.goBack();
    } catch (error) {
      console.error('Full error:', error.response?.data || error.message);
      Alert.alert('Error', `Failed to create post: ${error.response?.data?.detail || 'Invalid file format or missing fields'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Create New Post</Text>

      {/* Media Type Selector */}
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, contentType === 'image' && styles.activeType]}
          onPress={() => setContentType('image')}
        >
          <MaterialIcons 
            name="image" 
            size={24} 
            color={contentType === 'image' ? '#fff' : '#666'} 
          />
          <Text style={[styles.typeText, contentType === 'image' && styles.activeTypeText]}>
            Image
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, contentType === 'video' && styles.activeType]}
          onPress={() => setContentType('video')}
        >
          <MaterialIcons 
            name="videocam" 
            size={24} 
            color={contentType === 'video' ? '#fff' : '#666'} 
          />
          <Text style={[styles.typeText, contentType === 'video' && styles.activeTypeText]}>
            Video
          </Text>
        </TouchableOpacity>
      </View>

      {/* Media Preview */}
      {media ? (
        <View style={styles.mediaPreviewContainer}>
          {contentType === 'video' ? (
            <Video
              source={{ uri: media.uri }}
              style={styles.mediaPreview}
              useNativeControls
              resizeMode="cover"
              isLooping
            />
          ) : (
            <Image source={{ uri: media.uri }} style={styles.mediaPreview} />
          )}
          <TouchableOpacity 
            style={styles.changeMediaButton}
            onPress={pickMedia}
          >
            <Feather name="edit" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={pickMedia}
        >
          <Feather name="upload" size={32} color="#666" />
          <Text style={styles.uploadText}>
            Select {contentType === 'video' ? 'Video' : 'Image'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Caption Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Caption</Text>
        <TextInput
          style={styles.captionInput}
          placeholder="Write a caption..."
          placeholderTextColor="#999"
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={2200}
        />
      </View>

      {/* Post Button */}
      <TouchableOpacity 
        style={[styles.postButton, isUploading && styles.disabledButton]}
        onPress={handlePost}
        disabled={isUploading}
      >
        <Text style={styles.postButtonText}>
          {isUploading ? 'Posting...' : 'Share Post'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Keep the same styles as before
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeType: {
    backgroundColor: '#1DA1F2',
    borderColor: '#1DA1F2',
  },
  typeText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  activeTypeText: {
    color: '#fff',
  },
  uploadButton: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 15,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  uploadText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  mediaPreviewContainer: {
    position: 'relative',
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  mediaPreview: {
    width: '100%',
    height: 300,
  },
  changeMediaButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  captionInput: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    textAlignVertical: 'top',
    color: '#333',
  },
  postButton: {
    backgroundColor: '#1DA1F2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreatePost;