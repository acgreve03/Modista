import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const DetectObject = () => {
  const[imageUri, setImageUri] = useState(null);
  const[labels, setLabels] = useState([])

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4,3],
        quality: 1
      });

      if(!result.cancelled){
        const uri = result.assets ? result.assets[0].uri : result.uri;
        setImageUri(uri);
      }
      console.log(result);
    }
    catch (error){
      console.error(' Error picking Image: ', error );
    }
  };

const analyzeImage = async () => {
  try {
    if(!imageUri) {
      alert('Please select an image first');
      return;
    }

    const apiKey = "AIzaSyAGRWVBWp-pJH9KD4XB2yedmv-2VQafbV4"
    const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    //read the image file from local URI and convert it to base64
    const base64ImageData = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const requestData = {
      requests: [
        {
          image: {
            content: base64ImageData,
          }, 
          features:[{type: 'LABEL-DETECTION',maxResults: 10}],
        }
      ]
    }

    const apiResponse = await axios.post(apiURL, requestData);
    setLabels(apiResponse.data.responses[0].labelAnnotations);
  } catch(error) {
    console.error('Error analyzing image: ', error);
    alert('Error analyzing image. Please try again later ');
    
  }
};

  return (
    <View style={styles.container}>
      <Text>
         Google Cloud Vision API Demo
      </Text>

      {imageUri && (
        <Image 
          source={{uri: imageUri }}
          style={{ width: 300, height: 300}}
        />
      )}
      <TouchableOpacity
        onPress={analyzeImage}
        style={styles.button}
      >
        <Text style={styles.text}>Analyze  Image</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={pickImage}
        style={styles.button}
      >
        <Text style={styles.text}>Choose an Image</Text>
      </TouchableOpacity>
      {
        labels.length > 0 && (
          <View>
            <Text style={styles.label}>
              Labels: 

            </Text>
            {
              labels.map((label) => (
                <Text
                  key={label.mid}
                  style={styles.outputtext}
                >
                  {label.description}
                </Text>
              ))
            }
          </View>


        )
      }

    </View>
  )
}

export default DetectObject

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 30, 
    fontWeight: 'bold',
    marginBottom: 50,
    marginTop: 100,
  },
  button: {
    backgroundColor: '#DDDDDDD',
    padding: 10,
    marginBottom: 10,
    marginTop: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  label: {
    fontSize:20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  outputtext: {
    fontSize: 18,
    marginBottom: 10
  }
});










































/*import React, { useState } from 'react';
import { Button, View, Image, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { sendToGoogleCloudVision } from '../util/VisionService'; // Import your Cloud Vision function

export default function UploadScreen() {
  const [image, setImage] = useState(null);
  const [labels, setLabels] = useState([]);

  const pickImage = async () => {
    // Request permission to access media library
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission is required to access the camera roll.");
      return;
    }

    // Let the user pick an image
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true, // Make sure base64 is enabled
    });

    // Log the result and check if base64 is defined
  console.log('Image Picker Result:', result);


    if (!result.canceled) {
      setImage(result.uri); // Set the image URI to display it

      // Call the Cloud Vision API with the base64 image
      try {
        const response = await sendToGoogleCloudVision(result.base64);
        // Process the response, e.g., extracting labels
        const detectedLabels = response.responses[0].labelAnnotations.map(label => label.description);
        setLabels(detectedLabels); // Set the detected labels in state
      } catch (error) {
        console.error("Error calling Cloud Vision:", error);
      }
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title="Pick an Image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      {labels.length > 0 && (
        <View>
          <Text>Detected Clothing Labels:</Text>
          {labels.map((label, index) => (
            <Text key={index}>{label}</Text>
          ))}
        </View>
      )}
    </View>
  );
}*/
