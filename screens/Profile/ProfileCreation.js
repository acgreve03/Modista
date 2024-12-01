import React, {useState, useEffect} from 'react';
import { View, Image, Text, StyleSheet, TextInput, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { doc, setDoc, getDocs, query, collection, where } from 'firebase/firestore';
import { db, storage } from '../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileCreation({ navigation, route }) {

  const { user } = route.params.user;

  const { control, handleSubmit, formState: { errors } } = useForm();
  const [buttonPressed, setButtonPressed] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    requestPermissions();
  }, []);

  
  const onSubmit = async (data) => {
    try {
        // Checking is the username chosen is available
        const isAvailable = await checkUsernameAvailability(data.userName);
        // Create a reference to the user's document in Firestore
        const userRef = doc(db, 'users', user.uid);
  
        // Add the profile data to the document
        if (isAvailable) {
            setLoading(true);
            await setDoc(userRef, {
            firstName: data.firstName,
            lastName: data.lastName,
            userName: data.userName,
            bio: data.bio,
            profilePictureUrl: profilePictureUrl, //Url which leads to the actual image location
            followers: [],
            following: [],
            });

            //Uploading the actual image to firestore
            if (profilePictureUrl) {
                const imageUrl = await uploadImage(profilePictureUrl);
                await setDoc(userRef, { profilePictureUrl: imageUrl }, { merge: true });
            }
            setLoading(false);
              // Navigate to the next screen after successful profile creation
            navigation.navigate('Main');
        }

        else{
            alert('Username is taken 😨. Please choose another one.')
        }

    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="purple" />
        <Text>Creating profile...</Text>
      </View>
    );
  }


  const pickImageFromGallery = async () => {
    try {
        setProfilePictureUrl(null);
        const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const { uri } = result.assets[0];
        setProfilePictureUrl(uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Error picking image. Try again');
    }
  };

  const pickImageFromCamera = async () => {
    try {
        setProfilePictureUrl(null);
        const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const { uri } = result.assets[0];
        setProfilePictureUrl(uri);
      }
    } catch (error) {
      console.error('Error using camera:', error);
    }
  };

  const uploadImage = async (uri) => {
    try {
        console.log('Image URI:', uri);
    
        // Convert image URI to a Blob which can be uploaded
        const response = await fetch(uri);
        const blob = await response.blob();
        console.log('Blob created:', blob);
    
        // Reference to Firebase storage
        const reference = ref(storage, 'images/' + new Date().getTime());
    
        // Upload the blob to storage
        await uploadBytes(reference, blob);
    
        // Get the download URL of the uploaded image
        const imageUrl = await getDownloadURL(reference);
        console.log('Image uploaded successfully:', imageUrl);
    
        return imageUrl;
      } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
      }
  };

  // Requesting camera and camera roll access
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || galleryStatus !== 'granted') {
      alert('Permission to access camera or gallery was denied');
    }
  };

  // Display options to choose profile picture
  const showImagePickerOptions = () => {
    Alert.alert(
      'Choose Profile Picture',
      'Pick an image from your gallery or take a new one.',
      [
        { text: 'Camera', onPress: () => pickImageFromCamera() },
        { text: 'Gallery', onPress: () => pickImageFromGallery() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };


  const checkUsernameAvailability = async (username) => {
    try {
      // References all users in Firebase storage and query for username
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('userName', '==', username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return false; // Username taken if query returns data
      } else {
        return true; // Username is available if query results are empty
      }
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  };

  return (
    <View style={styles.container}>


      <Text style={styles.title}>Create Profile</Text>
      <Text style={styles.subtitle}>Tell us about yourself</Text>

      <TouchableOpacity
        style={{
            borderRadius: 50,
            borderWidth: 1,
            borderColor: 'gray',
            padding: 0,
            width: 100,
            height: 100,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            alignSelf: 'center'
        }}
        onPress={showImagePickerOptions}
      >
        {profilePictureUrl ? (
            <Image
                source={{ uri: profilePictureUrl }}
                style={{ width: '100%', height: '100%', alignSelf: 'center' }}
                resizeMode="cover" 
            />
        ) : (
            <Text style={{ textAlign: 'center', fontSize: 10 }}>Choose Picture</Text>
        )}
      </TouchableOpacity>


      <View style={styles.inputWrapper}> 
      <Controller
        control={control}
        rules={{ required: true }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.inputWithLine}
            placeholder="First name"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
        name="firstName"
        defaultValue=""
      />
      {errors.firstName && <Text style={styles.error}>First name is required.</Text>}
      </View>


      <View style={styles.inputWrapper}> 
      <Controller
        control={control}
        rules={{ required: true }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.inputWithLine}
            placeholder="Last name"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
        name="lastName"
        defaultValue=""
      />
      {errors.lastName && <Text style={styles.error}>Last name is required.</Text>}
      </View>


      <View style={styles.inputWrapper}> 
      <Controller
        control={control}
        rules={{ required: true }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.inputWithLine}
            placeholder="Username"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
        name="userName"
        defaultValue=""
      />
      {errors.userName && <Text style={styles.error}>Username is required.</Text>}
      </View>


      <View style={styles.inputWrapper}> 
      <Controller
        control={control}
        rules={{ required: false }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.bioInput}
            placeholder="Bio"
            multiline={true}
            numberOfLines={4}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
        name="bio"
        defaultValue=""
      />
      </View>


      <TouchableOpacity style={[styles.button, buttonPressed ? styles.buttonPressed : styles.button]} 
          onPressIn={() => setButtonPressed(true)}
          onPressOut={() => setButtonPressed(false)} 
          onPress={handleSubmit(onSubmit)}
          activeOpacity={1}>
          <Text style={buttonPressed ? styles.buttonTextPressed : styles.buttonText}>Create Profile</Text>
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
    inputWrapper: {
      marginBottom: 30,
    },
    bioInput: {
        height: 100,
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
  });