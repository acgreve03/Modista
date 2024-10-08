import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

const LoginScreen = () => {
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
      padding: 20,
    },
    avatar: {
      width: 150,
      height: 150,
      borderRadius: 75, // Makes the image circular
      marginBottom: 10,
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    bio: {
      fontSize: 16,
      textAlign: 'center',
    },
  });
  
  export default LoginScreen;
  