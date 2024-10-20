import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useForm, Controller } from 'react-hook-form';

const ForgotPasswordScreen = ({ navigation }) => {
  const { control, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const { email } = data;
    try {
      await sendPasswordResetEmail(auth, email)
      Alert.alert('Success', 'Check your email for a link to reset your password.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>Enter your email to reset your password.</Text>

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
        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Send Reset Link</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backToLogin}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

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