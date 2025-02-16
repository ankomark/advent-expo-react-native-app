import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { fetchNotifications, markNotificationAsRead } from '../services/api';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = 'http://192.168.28.138:8000/api';
const DEFAULT_PROFILE_IMAGE = 'https://via.placeholder.com/150';

const NotificationsBell = ({ navigation }) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationListener, setNotificationListener] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const setupNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        const listener = Notifications.addNotificationReceivedListener(handlePushNotification);
        setNotificationListener(listener);
      }
      loadNotifications();
      const interval = setInterval(loadNotifications, 60000); // Refresh every 60 seconds
      return () => clearInterval(interval);
    };

    setupNotifications();

    return () => {
      if (notificationListener) {
        Notifications.removeNotificationSubscription(notificationListener);
      }
    };
  }, []);

  const handlePushNotification = () => {
    setNotificationCount(prev => prev + 1); // Increment notification count
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await fetchNotifications();
      const notificationsWithProfiles = await Promise.all(
        data.map(async (notification) => {
          try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) return notification;

            const response = await axios.get(
              `${BASE_URL}/profiles/by_user/${notification.sender.id}/`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            return {
              ...notification,
              sender: {
                ...notification.sender,
                profile_picture: response.data?.picture || DEFAULT_PROFILE_IMAGE,
              },
            };
          } catch (error) {
            console.error('Profile fetch error:', error);
            return {
              ...notification,
              sender: {
                ...notification.sender,
                profile_picture: DEFAULT_PROFILE_IMAGE,
              },
            };
          }
        })
      );
      setNotifications(notificationsWithProfiles);
      const unread = notificationsWithProfiles.filter(n => !n.read).length;
      setNotificationCount(unread);
      await Notifications.setBadgeCountAsync(unread); // Update app badge count
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      Alert.alert(
        'Session Expired',
        'Please login again',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setNotificationCount(prev => prev - 1); // Decrement notification count
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleNotificationPress = (notification) => {
    handleMarkAsRead(notification.id);
    setShowNotifications(false);
    if (notification.post) {
      navigation.navigate('PostDetail', {
        postId: notification.post.id
      });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setShowNotifications(true)}
        style={styles.bellContainer}
      >
        <MaterialIcons name="notifications" size={24} color="azure" />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{notificationCount}</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={showNotifications}
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowNotifications(false)}
            >
              <Feather name="x" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading notifications...</Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.notificationItem,
                    !item.read && styles.unreadItem
                  ]}
                  onPress={() => handleNotificationPress(item)}
                >
                  <Image
                    source={{ uri: item.sender.profile_picture || DEFAULT_PROFILE_IMAGE }}
                    style={styles.avatar}
                  />
                  <View style={styles.notificationContent}>
                    <Text style={styles.username}>{item.sender.username}</Text>
                    <Text style={styles.notificationText}>{item.message}</Text>
                    <Text style={styles.notificationTime}>
                      {new Date(item.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text>No new notifications</Text>
                </View>
              }
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  bellContainer: {
    position: 'relative',
    paddingHorizontal: 10,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: 2,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  unreadItem: {
    backgroundColor: '#f8f9fa',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  notificationText: {
    fontSize: 14,
    color: '#666',
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default NotificationsBell;