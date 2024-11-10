import React from 'react';
import {useState} from 'react';
import { Text, StyleSheet, ImageBackground, TouchableOpacity} from 'react-native';

export default function WelcomeScreen({ navigation }) {

  const [buttonPressed, setButtonPressed] = useState(false);
  const [buttonPressed2, setButtonPressed2] = useState(false);

  const navSignup = () => {
    navigation.navigate('SignUp'); // Navigate to SignUp screen
  };

  const navLogin = () => {
    navigation.navigate('Login'); // Navigate to Login screen
  };

  return (

    <ImageBackground 
    source={require('./modista_image1.jpg')}
    style={styles.background}
    resizeMode="cover"
    >

      <Text style={styles.title}>MODISTA</Text>


      {/* Login Button */}
      <TouchableOpacity style={[buttonPressed ? styles.buttonPressed : styles.button]} 
        onPressIn={() => setButtonPressed(true)}
        onPressOut={() => setButtonPressed(false)} 
        onPress={navLogin}
        activeOpacity={1}>
        <Text style={buttonPressed ? styles.buttonTextPressed : styles.buttonText}>log in</Text>
      </TouchableOpacity>


      {/* SignUp Button */}
      <TouchableOpacity style={[buttonPressed2 ? styles.buttonPressed : styles.button]} 
        onPressIn={() => setButtonPressed2(true)}
        onPressOut={() => setButtonPressed2(false)} 
        onPress={navSignup}
        activeOpacity={1}>
        <Text style={buttonPressed2 ? styles.buttonTextPressed : styles.buttonText}>sign up</Text>
      </TouchableOpacity>

    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 50,
    color: 'white',
    marginTop: 500,
    textAlign: 'center',
    marginBottom: 35,
    top: 140,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  button: {
    borderWidth: 1,
    borderColor: "white",
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 20, 
    alignItems: 'center',
    marginTop: 10,
    width: '90%',
    alignSelf: 'center',
    top: 140
  },
  buttonText: {
    color: "white",
    fontSize: 15,
    fontWeight: 'regular',
    fontFamily: "Helvetica"
  },
  buttonPressed: {
    borderWidth: 1,
    borderColor: "white",
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 20, 
    alignItems: 'center',
    marginTop: 10,
    width: '90%',
    alignSelf: 'center',
    top: 140
  },
  buttonTextPressed: {
    fontSize: 15, 
    color: 'black',
    fontWeight: 'regular',
    fontFamily: "Helvetica"
  },
});