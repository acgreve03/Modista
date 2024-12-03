import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { doc, setDoc, getDocs, query, collection, where } from 'firebase/firestore';
import { db, storage } from '../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { CommonActions } from '@react-navigation/native';

/**
 * ProfileCreation Component
 *
 * **Description**:
 * - Allows users to create a profile after registration.
 * - Users can upload a profile picture and header image, enter personal details, and set a unique username.
 * - Saves the profile data to Firestore and uploads images to Firebase Storage.
 * - Validates username availability to ensure uniqueness.
 *
 * **Features**:
 * - Image picker for profile picture and header image (supports camera and gallery).
 * - Input fields for first name, last name, username, and bio.
 * - Firebase integration:
 *   - Stores profile details in Firestore under `users` collection.
 *   - Uploads images to Firebase Storage and retrieves their URLs.
 * - Username validation ensures it is not already in use.
 * - Navigation resets to the main application upon successful profile creation.
 */
export default function ProfileCreation({ navigation, route }) {
  const { user } = route.params.user;

  const { control, handleSubmit, formState: { errors } } = useForm();
  const [buttonPressed, setButtonPressed] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [headerImageUrl, setHeaderImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // Request permissions for camera and gallery access on mount
  useEffect(() => {
    requestPermissions();
  }, []);

  /**
   * Submits the profile data.
   * - Validates username availability.
   * - Saves profile data and uploads images to Firestore/Storage.
   */
  const onSubmit = async (data) => {
    try {
      const userRef = doc(db, 'users', user.uid);

      const isAvailable = await checkUsernameAvailability(data.userName);

        if (isAvailable) {
        setLoading(true);
        const profileData = {
          firstName: data.firstName,
          lastName: data.lastName,
          userName: data.userName,
          bio: data.bio,
          profilePictureUrl: null,
          headerImageUrl: null,
          followers: [],
          following: [],
        };


      if (profilePictureUrl) {
        profileData.profilePictureUrl = await uploadImage(profilePictureUrl);
      }
      if (headerImageUrl) {
        profileData.headerImageUrl = await uploadImage(headerImageUrl);
      }

      await setDoc(userRef, profileData);

      setLoading(false);

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        })
      );
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
        <Text>Creating Profile...</Text>
      </View>
    );
  }

  /**
   * Checks if the given username is available in Firestore.
   */
  const checkUsernameAvailability = async (username) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('userName', '==', username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  };

  const pickImage = async (setImage) => {
    try {
      const options = [
        { text: 'Camera', onPress: () => pickFromCamera(setImage) },
        { text: 'Gallery', onPress: () => pickFromGallery(setImage) },
        { text: 'Cancel', style: 'cancel' },
      ];
      Alert.alert('Select From', '', options);
    } catch (error) {
      console.error('Error opening image picker options:', error);
      alert('Error picking image. Please try again.');
    }
  };

  const pickFromGallery = async (setImage) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!result.canceled) {
        const { uri } = result.assets[0];
        setImage(uri);
      }
    } catch (error) {
      console.error('Error picking image from gallery:', error);
    }
  };

  const pickFromCamera = async (setImage) => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!result.canceled) {
        const { uri } = result.assets[0];
        setImage(uri);
      }
    } catch (error) {
      console.error('Error picking image from camera:', error);
    }
  };

  //Uploads the selected image to Firebase Storage.
  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const reference = ref(storage, 'images/' + new Date().getTime());
      await uploadBytes(reference, blob);
      const imageUrl = await getDownloadURL(reference);
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  //Requests camera and library permissions
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || galleryStatus !== 'granted') {
      alert('Permission to access camera or gallery was denied');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Profile</Text>
      <Text style={styles.subtitle}>Tell us about yourself</Text>

      {/* Header Image */}
      <TouchableOpacity style={styles.headerWrapper} onPress={() => pickImage(setHeaderImageUrl)}>
        {headerImageUrl ? (
          <Image source={{ uri: headerImageUrl }} style={styles.headerImage} resizeMode="cover" />
        ) : (
          <Text style={styles.headerPlaceholder}>Choose Header</Text>
        )}
      </TouchableOpacity>

      {/* Profile Picture */}
      <TouchableOpacity style={styles.profileWrapper} onPress={() => pickImage(setProfilePictureUrl)}>
        {profilePictureUrl ? (
          <Image source={{ uri: profilePictureUrl }} style={styles.profileImage} />
        ) : (
          <Text style={styles.profilePlaceholder}>Choose Picture</Text>
        )}
      </TouchableOpacity>

      {/* Form Inputs */}
      <View style={styles.inputWrapper}>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
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
              style={styles.input}
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
              style={styles.input}
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
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.bioInput}
              placeholder="Bio"
              multiline
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="bio"
          defaultValue=""
        />
      </View>

      <TouchableOpacity
        style={[styles.button, buttonPressed ? styles.buttonPressed : styles.button]}
        onPressIn={() => setButtonPressed(true)}
        onPressOut={() => setButtonPressed(false)}
        onPress={handleSubmit(onSubmit)}
        activeOpacity={1}
      >
        <Text style={buttonPressed ? styles.buttonTextPressed : styles.buttonText}>Create Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'transparent',
    marginTop: 50,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  headerWrapper: {
    width: '100%',
    height: width / 2.5,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerPlaceholder: {
    color: '#888',
    fontSize: 16,
  },
  profileWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 50,
    borderRadius: 50
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  profilePlaceholder: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  button: {
    borderWidth: 1,
    borderColor: 'purple',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonPressed: {
    backgroundColor: 'purple',
  },
  buttonText: {
    color: 'purple',
    fontSize: 16,
  },
  buttonTextPressed: {
    color: '#fff',
    fontSize: 16,
  },
  error: {
    color: 'red',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});