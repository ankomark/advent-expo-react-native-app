import React from "react";
import { View, Text, StyleSheet } from "react-native";
import TrackList from "./TrackList";
import Footer from "./Footer";

const HomePage = () => {
  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>SEVENTHDAY ADVENTIST MUSIC</Text> */}
      <TrackList />
      <Footer />
    </View>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: {
    display:'flex',
    flex: 1,
    padding: 8,
    backgroundColor: "#F2F7F5", // Adjust background color to your preference
  },
  // title: {
  //   fontSize: 24,
  //   fontWeight: "bold",
  //   textAlign: "center",
  //   marginBottom: 6,
  // },
});
