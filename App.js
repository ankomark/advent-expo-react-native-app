
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TrackList from './components/TrackList';
// import Playlist from './components/Playlist';
import Comments from './components/Comments';
import LikeButton from './components/LikeButton';
import UploadTrackPage from './components/UploadTrackPage';
import SignUpPage from './components/SignUpPage';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import FavoritesPage from './components/FavoritesPage';
import CreateProfile from './components/CreateProfile';
import Header from './components/Header'; // Move the import to the top
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
const Stack = createNativeStackNavigator();

const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    headerShown: false, // Hide default header
                }}
            >
                {/* Define your screens with custom header */}
                <Stack.Screen name="Home" component={HomePageWrapper} />
                <Stack.Screen name="Tracks" component={TrackListWrapper} />
                {/* <Stack.Screen name="Playlists" component={PlaylistWrapper} /> */}
                <Stack.Screen name="Comments" component={Comments} />
                <Stack.Screen name="LikeButton" component={LikeButton} />
                <Stack.Screen name="SignUp" component={SignUpPage} />
                <Stack.Screen name="Login" component={LoginPage} />
                <Stack.Screen name="CreateProfile" component={CreateProfile} />
                <Stack.Screen name="Favorites" component={FavoritesPage} />
                <Stack.Screen
                    name="UploadTrack"
                    component={UploadTrackPage}
                    options={{ headerShown: true }} // Optional screen-specific options
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

// Wrapper components for each screen to include the Header
const HomePageWrapper = ({ navigation }) => (
    <View style={{ flex: 1 }}>
        <Header navigation={navigation} />
        <HomePage />
    </View>
);

const TrackListWrapper = ({ navigation }) => (
    <View style={{ flex: 1 }}>
        <Header navigation={navigation} />
        <TrackList />
    </View>
);

const PlaylistWrapper = ({ navigation }) => (
    <View style={{ flex: 1 }}>
        <Header navigation={navigation} />
        <Playlist />
    </View>
);

// Repeat for other screens as needed...

export default App;
