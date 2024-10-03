import React, {useState} from 'react';
import { View, Image, Text, StyleSheet, TextInput, Button, Alert, TouchableOpacity} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { firebase } from '../firebaseConfig';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function SignupScreen({ navigation }) {

  const { control, handleSubmit, formState: { errors } } = useForm();
  const [buttonPressed, setButtonPressed] = useState(false);
  const [password, setPassword] = useState('');

  
  const onSubmit = async (data) => {
    const { email, password } = data;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Signup Successful", "You have successfully signed up!");
    } catch (error) {
      Alert.alert("Signup Error", error.message);
    }
  };

  const passwordRequirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  return (
    <View style={styles.container}>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>


      <Text style={styles.title}>New User</Text>
      <Text style={styles.subtitle}>Create an account to get started with Modista</Text>


      <View style={styles.inputWrapper}> 
      <Controller
        control={control}
        rules={{ required: true }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.inputWithLine}
            placeholder="Name"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
        name="name"
        defaultValue=""
      />
      {errors.name && <Text style={styles.error}>Name is required.</Text>}
      </View>

      <View style={styles.inputWrapper}> 
      <Controller
        control={control}
        rules={{
          required: true,
          pattern: {
            value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
            message: "Enter a valid email address",
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.inputWithLine}
            placeholder="Email"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
        name="email"
        defaultValue=""
      />
        {errors.email && <Text style={styles.error}>{errors.email.message || "Email is required."}</Text>}
      </View>

      <View style={styles.inputWrapper}>      
        <Controller
          control={control}
          rules={{ required: true}}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.inputWithLine}
              placeholder="Password"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={(text) => {
                onChange(text);
                setPassword(text); 
              }}
              value={value}
            />
          )}
          name="password"
          defaultValue=""
        />
        {errors.password && <Text style={styles.error}>Password must be at least 6 characters.</Text>}
      </View>


      <View style={styles.passwordRequirementsContainer}>
        <Text style={[styles.requirement, passwordRequirements.length ? styles.met : styles.notMet]}>
          ✓ At least 6 characters
        </Text>
        <Text style={[styles.requirement, passwordRequirements.uppercase ? styles.met : styles.notMet]}>
          ✓ Contains an uppercase letter
        </Text>
        <Text style={[styles.requirement, passwordRequirements.lowercase ? styles.met : styles.notMet]}>
          ✓ Contains a lowercase letter
        </Text>
        <Text style={[styles.requirement, passwordRequirements.number ? styles.met : styles.notMet]}>
          ✓ Contains a number
        </Text>
        <Text style={[styles.requirement, passwordRequirements.specialChar ? styles.met : styles.notMet]}>
          ✓ Contains a special character
        </Text>
      </View>


      <TouchableOpacity style={[styles.button, buttonPressed ? styles.buttonPressed : styles.buttonDefault]} 
          onPressIn={() => setButtonPressed(true)}
          onPressOut={() => setButtonPressed(false)} 
          onPress={handleSubmit(onSubmit)}
          activeOpacity={1}>
          <Text style={buttonPressed ? styles.buttonTextPressed : styles.buttonText}>Continue</Text>
      </TouchableOpacity>
      <Text style={{textAlign:'center', top:780, left:145, position:'absolute'}}>Next: Profile Creation</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    avatar: {
      width: 150,
      height: 150,
      borderRadius: 75, 
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
    subtitle: {
      fontSize: 15,
      textAlign: 'left',
      fontWeight: "thin",
      fontFamily: 'Helvetica',
      marginBottom: 30
    },
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#ffff',
    },
    title: {
      fontSize: 25,
      fontWeight: 'regular',
      marginTop: 115,
      marginBottom: 8,
      textAlign: 'left',
      fontFamily: 'Helvetica'
    },
    input: {
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      marginBottom: 12,
      paddingHorizontal: 8,
    },
    error: {
      color: 'red',
      height: 20, 
      margintop: 5,
    },
    inputWithLine: {
      height: 40,
      borderBottomWidth: 1,  
      borderBottomColor: '#cccc',  
      paddingHorizontal: 8,
      marginBottom: 0
    },
    button: {
      borderWidth: 1,
      borderColor: "purple",
      backgroundColor: 'transparent', 
      paddingVertical: 12,
      paddingHorizontal: 20, 
      alignItems: 'center',
      marginTop: 220, 
      position: 'absolute',
      bottom: 70,
      width: '90%',
      alignSelf: 'center'
    },
    buttonText: {
      color: "purple", 
      fontSize: 15, 
      fontWeight: 'regular', 
      fontFamily: "Helvetica"
    },
    buttonDefault: {
      backgroundColor: 'transparent', 
    },
    buttonPressed: {
      borderWidth: 1,
      borderColor: "purple",
      backgroundColor: "purple", 
    },
    buttonTextPressed: {
      fontSize: 15, 
      color: 'white', 
      fontWeight: 'regular', 
      fontFamily: "Helvetica"
    },
    passwordRequirementsContainer: {
      marginTop: 10,
    },
    requirement: {
      fontSize: 14,
      marginVertical: 5,
    },
    met: {
      color: 'purple', 
    },
    notMet: {
      color: 'gray', 
    },
    backButton: {
      position: 'absolute',
      top: 50,
      left: 20,
      padding: 10,
      backgroundColor: 'transparent', 
      borderRadius: 5,
      marginTop: 5
    },
    backButtonText: {
      position: 'absolute',
      color: 'black', 
      fontSize: 25,
      marginTop: 8
    },
    inputWrapper: {
      marginBottom: 30,
    },
  });