import React, {useState, useEffect} from 'react';
import { View, Image, Text, StyleSheet, TextInput, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { doc, collection, addDoc } from 'firebase/firestore';
import { db, storage } from '../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { analyzeImage } from '../../data/Helpers.js'; // Import helper functions
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import { auth } from '../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const GOOGLE_API_KEY = "AIzaSyAGRWVBWp-pJH9KD4XB2yedmv-2VQafbV4"
const CHATGPT_API_KEY = "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"
const REMOVE_BG_API_KEY = "q9wrwRUWDZb8D9jfKcakubeY"


export default function AddToCloset({navigation}) {

    const [buttonPressed, setButtonPressed] = useState(false);
    const [closetItemUrl, setClosetItemUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [color, setColor] = useState('');
    const [category, setCategory] = useState('');
    const [subcategory, setSubcategory] = useState('');
    const [occasion, setOccasion] = useState('');
    const [season, setSeason] = useState('');

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      setUser(currentUser);
    } else {
      console.log('No user logged in');
      Alert.alert('User not authenticated');
    }
  });
  return () => unsubscribe();
}, []);

const handleAnalyzeImage = async () => {
  if (!closetItemUrl) {
    Alert.alert('No image selected');
    return;
  }

  try {
    setLoading(true);
    const { clothingCategories, detectedColorName } = await analyzeImage(
      closetItemUrl,
      GOOGLE_API_KEY,
      CHATGPT_API_KEY
    );

    const { clothingType, clothingSubType, occasion, season } = clothingCategories;

    setCategory(clothingType);
    setSubcategory(clothingSubType);
    setColor(detectedColorName);
    setOccasion(occasion);
    setSeason(season);


    setLoading(false);
  } catch (error) {
    setLoading(false);
    Alert.alert('Error analyzing image. Please try again.');
  }
};

const onSubmit = async (data) => {

  if (!user) {
      Alert.alert('User not authenticated');
      return;
    }
try {
    // Create a reference to the user's document in Firestore and make collection
    const userRef = doc(db, 'users', user.uid);
    const closetRef = collection(userRef, 'closet');

    // Add the item data to the document
        setLoading(true);
        await addDoc(closetRef, {
        color,
        subcategory,
        occasion,
        season,  
        closetItemUrl: closetItemUrl //Url which leads to the actual image location

        });

        //Uploading the actual image to firestore
        if (closetItemUrl) {
            await uploadImage(closetItemUrl);
        }
        setLoading(false);
          // Navigate to the profile screen after successfully adding to closet
        navigation.navigate('Profile');

} catch (error) {
  console.error('Error adding to closet:', error);
}
};

if (loading) {
return (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="purple" />
    <Text>Adding Item to Closet...</Text>
  </View>
);
}

const pickImageFromGallery = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      setClosetItemUrl(uri);
      await handleAnalyzeImage(); // Analyze the image immediately after selection
    }
  } catch (error) {
    console.error('Error picking image:', error);
    alert('Error picking image. Try again');
  }
};

const pickImageFromCamera = async () => {
  try {
      setClosetItemUrl(null);
      const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      setClosetItemUrl(uri);
    }
  } catch (error) {
    console.error('Error using camera:', error);
  }
};

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Add to Closet</Text>
    
        {/* Button to pick an image from the gallery */}
        <TouchableOpacity style={styles.button2} onPress={pickImageFromCamera}>
          <Ionicons name="camera" size={40} color={'purple'} />
        </TouchableOpacity>
    
        {/* Button to pick an image from the camera */}
        <TouchableOpacity style={styles.button3} onPress={pickImageFromGallery}>
          <Ionicons name="image" size={40} color={'purple'} />
        </TouchableOpacity>
    
        {/* Button to analyze the image */}
        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={handleAnalyzeImage} // Call analyze function
        >
          <Text style={styles.analyzeButtonText}>Analyze Image</Text>
        </TouchableOpacity>
    
        {/* Display input fields for additional user input */}
        <TextInput
          style={{ position: 'relative', top: 60 }}
          placeholder="Color"
          value={color}
          onChangeText={setColor}
        />
        <TextInput
          style={{ position: 'relative', top: 60 }}
          placeholder="Category"
          value={category}
          onChangeText={setCategory}
        />
        <TextInput
          style={{ position: 'relative', top: 60 }}
          placeholder="Subcategory"
          value={subcategory}
          onChangeText={setSubcategory}
        />
        <TextInput
          style={{ position: 'relative', top: 60 }}
          placeholder="Occasion"
          value={occasion}
          onChangeText={setOccasion}
          multiline
        />
        <TextInput
          style={{ position: 'relative', top: 60 }}
          placeholder="Season"
          value={season}
          onChangeText={setSeason}
          multiline
        />
    
        {/* Display selected image */}
        <View
          style={{
            borderRadius: 50,
            borderWidth: 1,
            borderColor: 'gray',
            padding: 0,
            width: 300,
            height: 300,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            alignSelf: 'center',
            top: 450,
            position: 'absolute',
          }}
        >
          {closetItemUrl ? (
            <Image
              source={{ uri: closetItemUrl }}
              style={{ width: '100%', height: '100%', alignSelf: 'center' }}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ textAlign: 'center', fontSize: 10 }}>Nice Choice</Text>
          )}
        </View>
    
        {/* Button to submit the data */}
        <TouchableOpacity
          style={[styles.button, buttonPressed ? styles.buttonPressed : styles.button]}
          onPressIn={() => setButtonPressed(true)}
          onPressOut={() => setButtonPressed(false)}
          onPress={onSubmit} // Call submission function (optional)
          activeOpacity={1}
        >
          <Text style={buttonPressed ? styles.buttonTextPressed : styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>
    );


  }
    
  
  const styles = StyleSheet.create({
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

 analyzeButton: {
    borderWidth: 1,
    borderColor: "blue",
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 90, // Add this to push the button down
    marginVertical: 10,
    alignSelf: "center",
    width: "95%",
  },
  analyzeButtonText: {
    color: "blue",
    fontSize: 15,
    fontWeight: "bold",
    fontFamily: "Helvetica",
  },

      button2: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'purple',
        paddingVertical: 12,
        alignItems: 'center',
        position: 'absolute',
        bottom: 600,
        right: 230,
        width: 150,
        height: 150,
        alignSelf: 'center',
        justifyContent: 'center'
      },
      button3: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'purple',
        paddingVertical: 12,
        alignItems: 'center',
        position: 'absolute',
        bottom: 600,
        right: 50,
        width: 150,
        height: 150,
        alignSelf: 'center',
        justifyContent: 'center'
      },
    });