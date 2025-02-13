import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Button } from "react-native";
import { fetchTracks, refreshAuthToken } from "../services/api";
import TrackItem from "./TrackItem";
import SearchBar from "./SearchBar";

const API_URL = 'http://192.168.230.138:8000/'; // Replace with your machine's IP

const TrackList = () => {
  const [tracks, setTracks] = useState([]);
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrackData = async () => {
    try {
      console.log('Fetching tracks from:', `${API_URL}/tracks/`); // Log the API URL
      const data = await fetchTracks();
      setTracks(data);
      setFilteredTracks(data);
    } catch (err) {
      console.error("Error fetching tracks:", err); // Log the full error
      setError(
        err.message || "Failed to load tracks. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackData();
  }, []);

  const handleSearch = (searchTerm) => {
    if (searchTerm) {
      const filtered = tracks.filter((track) =>
        track.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTracks(filtered);
    } else {
      setFilteredTracks(tracks);
    }
  };

  const handleRetry = async () => {
    setError(null);
    setLoading(true);
    await fetchTrackData();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>Loading tracks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Button title="Retry" onPress={handleRetry} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar onSearch={handleSearch} />
      <FlatList
        data={filteredTracks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <TrackItem track={item} />}
        contentContainerStyle={styles.trackList}
      />
    </View>
  );
};

export default TrackList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#727D8F",
    padding: 10,
    color:'white'
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
  trackList: {
    marginTop: 10,
  },
});