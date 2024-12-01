import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, storage } from '../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

const ProfileEdit = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [profilePictureUrl, setProfilePictureUrl] = useState(null);
    const [headerImageUrl, setHeaderImageUrl] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bio, setBio] = useState('');
    const [buttonPressed, setButtonPressed] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
        const user = auth.currentUser;
        if (user) {
            const userRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setProfilePictureUrl(data.profilePictureUrl || null);
                setHeaderImageUrl(data.headerImageUrl || null);
                setFirstName(data.firstName || '');
                setLastName(data.lastName || '');
                setBio(data.bio || '');
            }
      }
      setLoading(false);
    };

    fetchUserData();
    }, []);

    const handleImagePick = async (setImage) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "Images",
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            const { uri } = result.assets[0];
            setImage(uri);
        }
  };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const user = auth.currentUser;
            if (!user) return;
  
            const userRef = doc(db, 'users', user.uid);
            const updatedData = { firstName, lastName, bio };
  
            if (profilePictureUrl && profilePictureUrl.startsWith('file://')) {
                const profileImageUrl = await uploadImage(profilePictureUrl);
                updatedData.profilePictureUrl = profileImageUrl;
            }
  
            if (headerImageUrl && headerImageUrl.startsWith('file://')) {
                const uploadedHeaderImageUrl = await uploadImage(headerImageUrl);
                updatedData.headerImageUrl = uploadedHeaderImageUrl;
            }
  
            await setDoc(userRef, updatedData, { merge: true });
  
            Alert.alert('Profile Updated', 'Your profile has been successfully updated!');
            navigation.goBack();
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'There was an issue updating your profile. Please try again.');
        } finally {
        setLoading(false);
        }
    };
  
    const uploadImage = async (uri) => {
        try {
            if (!uri) throw new Error('Invalid URI');
            const response = await fetch(uri);
            if (!response.ok) throw new Error('Failed to fetch the image');
            const blob = await response.blob();
            const reference = ref(storage, `images/${new Date().getTime()}`);
            await uploadBytes(reference, blob);
            return await getDownloadURL(reference);
        } catch (error) {
        console.error('Error uploading image:', error.message);
        throw new Error('Image upload failed. Please try again.');
        }
    };
  

    if (loading) {
        return (
        <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="purple" />
        <Text>Loading...</Text>
        </View>
        );
    }

    return (
    <View style={styles.container}>

        <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backArrowContainer}>
            <Text style={styles.backArrowText}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Update Profile</Text>

        {/* Placeholder for alignment */}
        <View style={styles.placeholder}></View>
        </View>

      <TouchableOpacity onPress={() => handleImagePick(setHeaderImageUrl)} style={styles.headerWrapper}>
        {headerImageUrl ? (
          <Image source={{ uri: headerImageUrl }} style={styles.headerImage} />
        ) : (
          <Text style={styles.headerPlaceholder}>Choose Header Image</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleImagePick(setProfilePictureUrl)} style={styles.profileWrapper}>
        {profilePictureUrl ? (
          <Image source={{ uri: profilePictureUrl }} style={styles.profileImage} />
        ) : (
          <Text style={styles.profilePlaceholder}>Choose Profile Picture</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.bioInput}
        placeholder="Bio"
        value={bio}
        onChangeText={setBio}
        multiline
      />

        <TouchableOpacity
        style={[styles.button, buttonPressed ? styles.buttonPressed : styles.button]}
        onPressIn={() => setButtonPressed(true)}
        onPressOut={() => setButtonPressed(false)}
        onPress={handleSubmit}
        activeOpacity={1}
        >
        <Text style={buttonPressed ? styles.buttonTextPressed : styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
    </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'transparent',
    marginTop: 50
  },
  headerWrapper: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 8,
    fontSize: 16,
    marginBottom: 16,
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerRow: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backArrowContainer: {
    padding: 5,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backArrowText: {
    fontSize: 30,
    fontWeight: 'medium',
    color: 'black',
  },
  placeholder: {
    width: 40,
  },
});

export default ProfileEdit;