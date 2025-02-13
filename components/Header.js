
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
const { width, height } = Dimensions.get('window');

const BASE_URL = ' http://192.168.246.138:8000/api';

const Header = () => {
    const navigation = useNavigation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('accessToken');
            setIsAuthenticated(!!token);
        };

        checkAuth();
    }, []);

    useEffect(() => {
        const checkProfile = async () => {
            try {
                const token = await AsyncStorage.getItem('accessToken');
                if (!token) return;

                const response = await axios.get(`${BASE_URL}/profiles/has_profile/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.data.profile_exists) {
                    navigation.navigate('CreateProfile');
                } else {
                    const profileResponse = await axios.get(`${BASE_URL}/profiles/me/`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setProfile(profileResponse.data);
                }
            } catch (error) {
                console.error('Error checking profile:', error);
            }
        };

        if (isAuthenticated) checkProfile();
    }, [isAuthenticated, navigation]);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
        navigation.navigate('Home');
    };

    return (
        <View style={styles.header}>
            {/* Top Row: Logo and Title */}
            <View style={styles.topRow}>
                <Image source={require('../assets/logo.png')} style={styles.logo} />
                <Text style={styles.title}> ADVENTIST HOME</Text>
            </View>

            {/* Bottom Row: Navigation Links */}
            <View style={styles.bottomRow}>
                {/* Home Icon */}
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Ionicons name="home" size={width * 0.06} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Music')}>
        <MaterialIcons name="music-note" size={24} color="white" />
    </TouchableOpacity>

                {/* Favorites Icon */}
                <TouchableOpacity onPress={() => navigation.navigate('Favorites')}>
                    <Ionicons name="star" size={width * 0.06} color="gold" />
                </TouchableOpacity>

                {/* Conditional Rendering for Authenticated Users */}
                {isAuthenticated ? (
                    <>
                        {/* Upload Link
                        <TouchableOpacity onPress={() => navigation.navigate('UploadTrack')}>
                            <Text style={styles.navLink}>Upload</Text>
                        </TouchableOpacity> */}

                        {/* Logout Button */}
                        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                            <Text style={styles.logoutButtonText}>Log Out</Text>
                        </TouchableOpacity>

                        {/* Profile Picture */}
                        {profile && profile.picture ? (
                            <Image
                                source={{ uri: profile.picture }}
                                style={styles.profilePicture}
                            />
                        ) : (
                            <View style={styles.profilePicturePlaceholder}>
                                <Ionicons name="person" size={width * 0.06} color="#fff" />
                            </View>
                        )}
                    </>
                ) : (
                    <>
                        {/* Sign Up Link */}
                        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                            <Text style={styles.navLink}>Sign Up</Text>
                        </TouchableOpacity>

                        {/* Log In Link */}
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.navLink}>Log In</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
};

export default Header;

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#1D478B',
        padding: width * 0.03,
        borderRadius: 10,
        marginBottom: height * 0.02,
        marginTop: height * 0.04,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start', // Align logo and title to the left
        marginBottom: height * 0.02, // Space between top and bottom rows
    },
    logo: {
        height: width * 0.08,
        width: width * 0.08,
        borderRadius: width * 0.04,
        marginRight: width * 0.02, // Space between logo and title
    },
    title: {
        fontSize: width * 0.045, // Responsive font size
        fontWeight: 'bold',
        color: '#FFF',
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Space out navigation links
        flexWrap: 'wrap', // Allow wrapping on smaller screens
    },
    navLink: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: width * 0.035, // Responsive font size
    },
    profilePicture: {
        width: width * 0.08,
        height: width * 0.08,
        borderRadius: width * 0.04,
    },
    profilePicturePlaceholder: {
        width: width * 0.08,
        height: width * 0.08,
        borderRadius: width * 0.04,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutButton: {
        borderWidth: 1,
        borderColor: 'red',
        borderRadius: 5,
        padding: width * 0.01,
    },
    logoutButtonText: {
        color: '#FFF',
        fontSize: width * 0.035, // Responsive font size
    },
});