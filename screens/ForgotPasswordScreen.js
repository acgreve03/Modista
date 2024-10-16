import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useForm, Controller } from 'react-hook-form';

/**
 * This component handles the password reset process for a user's account
 * It uses React Hook Form for managing the input and Firebase Authentication
 * to send a password reset link to the user's email
 */
const ForgotPasswordScreen = ({ navigation }) => {
  const { control, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const { email } = data;
    try {
      //Sends password reset email using Firebase
      await sendPasswordResetEmail(auth, email)
      Alert.alert('Success', 'Check your email for a link to reset your password.');
      navigation.goBack(); //Returns to the login screen after sending the email
    } catch (err) {
      //Shows an error alert if the email couldn't be sent
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>Enter your email to reset your password.</Text>

      {/* Email input field */}
      <View style={styles.inputWrapper}>
        <Controller
          control={control}
          rules={{
            required: "Email is required.",
            pattern: {
            value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
            message: "Enter a valid email address",
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
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
        {/* Displays validation errors for email input */}
        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
      </View>
      
      {/* Button to send the reset email */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Send Reset Link</Text>
      </TouchableOpacity>

      {/* Navigation to go back to the Login screen */}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backToLogin}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

//Customizations and layouts for the screen page and its components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffff',
  },
  title: {
    fontSize: 25,
    fontWeight: 'regular',
    marginBottom: 8,
    marginTop: 80,
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
    marginBottom: 100,
  },
  inputWithLine: {
    height: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#cccc',
    paddingHorizontal: 8,
    margin: 10,
    marginLeft: 8,
    marginTop: 50,
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
  buttonText: {
    color: 'purple',
    fontSize: 15,
    fontWeight: 'regular',
    fontFamily: 'Helvetica',
  },
  backToLogin: {
    color: 'purple',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
    fontStyle: "italic",
  },
  error: {
    color: 'red',
    marginLeft: 15,
    marginTop: -8,
  },
});

export default ForgotPasswordScreen;