// screens/Profile/UserProfile.js
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const UserProfile = () => {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://via.placeholder.com/150' }}
        style={styles.avatar}
      />
      <Text style={styles.name}>John Doe</Text>
      <Text style={styles.bio}>Fashion enthusiast and style blogger</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75, // Makes it circular
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bio: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default UserProfile;
