import React, { useState } from 'react';
import { View, Text, Image, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const LoginScreen = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both fields.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Login Successful', 'Welcome back!');
      // add navigation or futher login logic
    }, 200); // Simulates login delay
  };

    return (
      <View style = {styles.container}>
        <Image
          source={{ uri: 'https://via.placeholder.com/75' }}
          style={styles.avatar}
        />
        <MaterialCommunityIcons
          name="arrow-left"
          size={30}
          color="black"
          style={styles.arrow}
        />

        <Text style = {styles.title}>Sign in</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          />

        <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        />

        <TouchableOpacity onPress={() => Alert.alert('Sign Up Page')}>
          <Text style={styles.subtitle}>New Here? Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Alert.alert('Forgot Password')}>
          <Text style={styles.forgotPassword}>Forgot your password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>
      </View>
    );
};

const styles = StyleSheet.create({
    arrow: {
      position: 'absolute',
      top: 20,
      left: 20,
      transform: [{scaleX: 1.3}],
    },
    avatar: {
      width: 75,
      height: 75,
      borderRadius: 50, // Makes the image circular
      marginTop: -10,
      position: 'absolute',
      top: 30,
      right: 20,
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 30,
      paddingVertical: 20,
    },
    title: {
      fontSize: 30,
      fontWeight: '600',
      color: 'black',
      position: 'absolute',
      top: 20,
      left: 20,
      marginBottom: 40,
      marginTop: 40,
    },
    subtitle: {
      fontSize: 14,
      fontStyle: 'italic',
      color: 'purple',
      position: 'absolute',
      top: -300,
      left: -10,
      marginTop: -10,
      marginBottom: 50,
    },
    input: {
      height: 50,
      borderBottomColor: 'purple',
      borderBottomWidth: 0.5,
      paddingTop: 15,
      marginBottom: 40,
      fontSize: 16,
      backgroundColor: 'transparent',
      width: '105%',
      alignSelf: 'center',
    },
    button: {
      width: 150,
      borderColor: 'purple',
      borderWidth: 1,
      paddingVertical: 15,
      borderRadius: 4,
      alignSelf: 'center',
      backgroundColor: 'transparent',
      marginTop: 20,
    },
    buttonText: {
      color: 'purple',
      fontSize: 22,
      textAlign: 'center',
    },
    forgotPassword: {
      color: 'purple',
      fontSize: 16,
      fontStyle: "italic",
      textAlign: 'left',
      marginLeft: -10,
      marginTop: -25,
      marginBottom: 40,
    },
  });
  
  export default LoginScreen;
  