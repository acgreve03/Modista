import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const DetectObject = () => {
  const [imageUri, setImageUri] = useState(null);
  const [clothingCategories, setClothingCategories] = useState("");
  const [colorName, setColorName] = useState(""); // State to store ChatGPT-determined color name

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.cancelled) {
        const uri = result.assets ? result.assets[0].uri : result.uri;
        setImageUri(uri);
      }
    } catch (error) {
      console.error('Error picking image: ', error);
    }
  };

  const analyzeImage = async () => {
    try {
      if (!imageUri) {
        alert('Please select an image first');
        return;
      }

      const apiKey = "AIzaSyAGRWVBWp-pJH9KD4XB2yedmv-2VQafbV4";
      const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

      const base64ImageData = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const requestData = {
        requests: [
          {
            image: {
              content: base64ImageData,
            },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'IMAGE_PROPERTIES' }
            ],
          },
        ],
      };

      const apiResponse = await axios.post(apiURL, requestData);

      // Extract and process labels
      const labelAnnotations = apiResponse.data.responses[0]?.labelAnnotations || [];
      const labels = labelAnnotations.map(label => label.description);
      if (labels.length > 0) {
        const clothingCategories = await fetchClothingCategoriesFromChatGPT(labels);
        setClothingCategories(clothingCategories);
      }

      const imageProps = apiResponse.data.responses[0].imagePropertiesAnnotation;
      if (imageProps) {
        const firstColor = imageProps.dominantColors.colors[0]?.color;
        if (firstColor) {
          const { red, green, blue } = firstColor;
          const detectedColorName = await fetchColorNameFromChatGPT(red, green, blue);
          setColorName(detectedColorName);
        } else {
          setColorName("No dominant color detected");
        }
      }
    } catch (error) {
      console.error('Error analyzing image: ', error);
      alert('Error analyzing image. Please try again later');
    }
  };

  const fetchColorNameFromChatGPT = async (red, green, blue) => {
    try {
      const apiKey = "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";
      const prompt = `Given the RGB values (R: ${red}, G: ${green}, B: ${blue}), return the name of the color that most closely matches these values. just give me the color only, and nothing else in your answer`;
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error("Error fetching color name from ChatGPT: ", error);
      return "Unable to determine color name";
    }
  };

  const fetchClothingCategoriesFromChatGPT = async (labels) => {
    try {
      const apiKey = "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";
      const prompt = `From these labels:\n${labels.join(", ")}, choose 1 label per category: clothing type, and clothing subtype.`;
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error("Error fetching clothing categories from ChatGPT: ", error);
      return "Unable to determine clothing categories";
    }
  };


  return (
    <View style={styles.container}>
      <Text>Google Cloud Vision API Demo</Text>

      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={{ width: 300, height: 300 }}
        />
      )}
      <TouchableOpacity onPress={analyzeImage} style={styles.button}>
        <Text style={styles.text}>Analyze Image</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={pickImage} style={styles.button}>
        <Text style={styles.text}>Choose an Image</Text>
      </TouchableOpacity>

      {clothingCategories && (
        <View>
          <Text style={styles.label}>Clothing Categories:</Text>
          <Text style={styles.outputtext}>{clothingCategories}</Text>
        </View>
      )}

      {colorName && (
        <View>
          <Text style={styles.label}>Detected Color:</Text>
          <Text style={styles.outputtext}>{colorName}</Text>
        </View>
      )}
    </View>
  );
};

export default DetectObject;

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
    backgroundColor: '#DDDDDD',
    padding: 10,
    marginBottom: 10,
    marginTop: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  outputtext: {
    fontSize: 18,
    marginBottom: 10,
  },
});