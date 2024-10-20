import React, {useState} from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function SignupScreen({ navigation }) {

  const { control, handleSubmit, formState: { errors } } = useForm();
  const [buttonPressed, setButtonPressed] = useState(false);
  const [password, setPassword] = useState('');


  const passwordRequirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  

  const onSubmit = async (data) => {
    const { email, password } = data;

    //Checking if password meets requirements
    if (!passwordRequirements.length ||
      !passwordRequirements.uppercase ||
      !passwordRequirements.lowercase ||
      !passwordRequirements.number ||
      !passwordRequirements.specialChar)
 {
    Alert.alert("Invalid Password", "Password must meet all requirements.");
    return;
  }
    //Creating user using firebase authentication
    try {
      const user = await createUserWithEmailAndPassword(auth, email, password);
      navigation.navigate('ProfileCreation', { user: user }); //Routing the created user to profile creation
    } catch (error) {
      Alert.alert("Signup Error");
    }
  };


  return (
    <View style={styles.container}>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>


      <Text style={styles.title}>New User</Text>
      <Text style={styles.subtitle}>Create an account to get started with Modista</Text>


      {/* Email */}
      <View style={styles.inputContainer}> 
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
        {errors.email && <Text style={styles.error}> {errors.email.message || "Email is required."}</Text>}
      </View>


      {/* Password */}
      <View style={styles.inputContainer}>      
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
        {errors.password && <Text style={styles.error}> Please enter a valid password.</Text>}
      </View>


      <View style={styles.passwordRequirementsContainer}>
        <Text style={[styles.requirement, passwordRequirements.length ? styles.metRequirement : styles.requirement]}>
          ✓ At least 8 characters
        </Text>
        <Text style={[styles.requirement, passwordRequirements.uppercase ? styles.metRequirement : styles.requirement]}>
          ✓ Contains an uppercase letter
        </Text>
        <Text style={[styles.requirement, passwordRequirements.lowercase ? styles.metRequirement : styles.requirement]}>
          ✓ Contains a lowercase letter
        </Text>
        <Text style={[styles.requirement, passwordRequirements.number ? styles.metRequirement : styles.requirement]}>
          ✓ Contains a number
        </Text>
        <Text style={[styles.requirement, passwordRequirements.specialChar ? styles.metRequirement : styles.requirement]}>
          ✓ Contains a special character
        </Text>
      </View>


      <TouchableOpacity style={[styles.button, buttonPressed ? styles.buttonPressed : styles.button]} 
          onPressIn={() => setButtonPressed(true)}
          onPressOut={() => setButtonPressed(false)} 
          onPress={handleSubmit(onSubmit)}
          activeOpacity={1}>
          <Text style={buttonPressed ? styles.buttonTextPressed : styles.buttonText}>Continue</Text>
      </TouchableOpacity>

    </View>
  );
}


const styles = StyleSheet.create({
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
      bottom: 90,
      width: '95%',
      alignSelf: 'center'
    },
    buttonText: {
      color: "purple", 
      fontSize: 15, 
      fontWeight: 'regular', 
      fontFamily: "Helvetica"
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
      color: 'gray'
    },
    metRequirement: {
      color: 'purple', 
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
    inputContainer: {
      marginBottom: 30,
    },
  });