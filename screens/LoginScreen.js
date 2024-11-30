import React, { useState } from 'react';
import { View, Text, Image, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useForm, Controller } from 'react-hook-form';
import { CommonActions } from '@react-navigation/native';

/**
 * This component handles user login with email and password authentication
 * It uses React Hook Form for form handling, validation, and Firebase Authentication
 * for user login.
 */
const LoginScreen = () => {
  const navigation = useNavigation(); 
  const {control, handleSubmit, formState: {errors}, watch} = useForm();
  const [buttonPressed, setButtonPressed] = useState(false);
  const email = watch('email');

  //Handles login process upon form form submission
  const onSubmit = async (data) => {
    const {email, password} = data;
    try{
      //Attempts to sign in using Firebase Authentication
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Login Successful', 'Welcome back!');
      navigation.dispatch(
        CommonActions.reset({
          index: 0, // Index of the active route
          routes: [{ name: 'Main' }], // TargetScreen becomes the only route
        })
      ); //Navigates to main screen upon successful login
    } catch (err) {
      //Shows error message if login fails
      Alert.alert('Login Error', err.message);
    }
  };

  return (
    <View style = {styles.container}>
      {/* Back button to go back to the previous screen (welcome screen) */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      
      <Text style = {styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Login to continue with Modista</Text>

    {/* Email input */}
    <View style={styles.inputWrapper}>
      <Controller
        control = {control}
        rules = {{
          required: "Email is required.",
          pattern: {
            value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
            message: "Enter a valid email address",
          },
        }}
        render={({field: {onChange, onBlur, value}}) => (
          <TextInput
            style={styles.inputWithLine}
            placeholder='Email'
            placeholderTextColor="#aaa"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
        name="email"
        defaultValue=""
      />
      {/* Displays email validation error */}
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
    </View>

    {/* Password input */}
    <View style={styles.inputWrapper}>
      <Controller
        control={control}
        rules={{
          required: "Password is required.",
          minLength: {
            value: 6,
            message: "Password must be at least 6 characters long",
          },
        }}
        render={({field: {onChange, onBlur, value}}) => (
          <TextInput
            style={styles.inputWithLine}
            placeholder='Password'
            placeholderTextColor="#aaa"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
        />
      )}
      name="password"
      defaultValue=""
    />
      {/* Displays password validation error */}
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
    </View>

    {/*Forgot password navigation */}
    <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
      <Text style={styles.forgotPassword}>Forgot your password?</Text>
    </TouchableOpacity>

    {/* Login button */}
    <TouchableOpacity
     style={[styles.button, buttonPressed ? styles.buttonPressed : styles.buttonDefault]}
     onPressIn={() => setButtonPressed(true)}
     onPressOut={() => setButtonPressed(false)}
     onPress={handleSubmit(onSubmit)}
     activeOpacity={1}
     >
      <Text style={buttonPressed ? styles.buttonTextPressed : styles.buttonText}>
        Continue
      </Text>
    </TouchableOpacity>

    {/* Sign Up navigation */}
    <Text style={{textAlign: 'center', marginTop: 10}}>New Here?
      <Text style={{color: 'purple'}} onPress={() => navigation.navigate('SignUp')}> Sign Up</Text>
    </Text>
  </View>
  );
};

//Customization and layouts for the screen page and its components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffff',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10,
    backgroundColor: 'transparent',
    borderRadius: 5,
    marginTop: 5,
  },
  backButtonText: {
    position: 'absolute',
    color: 'black',
    fontSize: 25,
    marginTop: 8,
  },
  title: {
    fontSize: 25,
    fontWeight: 'regular',
    marginBottom: 8,
    marginTop: 115,
    textAlign: 'left',
    fontFamily: 'Helvetica',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'left',
    fontWeight: 'thin',
    fontFamily: 'Helvetica',
    marginBottom: 30,
  },
  inputWrapper: {
    marginBottom: 30,
  },
  inputWithLine: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#cccc',
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  forgotPassword: {
    color: 'purple',
    fontSize: 16,
    fontStyle: "italic",
    textAlign: 'left',
    marginBottom: 80,
    marginTop: -20,
  },
  button: {
    width: '90%',
    borderColor: 'purple',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginTop: 20,
  },
  buttonDefault: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: 'purple',
    fontSize: 15,
    fontWeight: 'regular',
    fontFamily: "Helvetica",
  },
  buttonTextPressed: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'regular',
    fontFamily: 'Helvetica',
  },
  error: {
    color: 'red',
    marginLeft: 1,
    marginTop: -8,
  },
});
  
export default LoginScreen;
  