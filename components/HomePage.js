import React from "react";
import { View, Text, StyleSheet } from "react-native";
import TrackList from "./TrackList";
import Footer from "./Footer";
import SocialFeed from "./SocialFeed";

const HomePage = () => {
  return (
    <View style={styles.container}>
      
      {/* <TrackList /> */}
      <SocialFeed/>
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
 
});
