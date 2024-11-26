import axios from 'axios';
import * as FileSystem from 'expo-file-system';

export const analyzeImage = async (imageUri, apiKey, chatGPTKey) => {
  try {
    if (!imageUri) {
      throw new Error('No image selected');
    }

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
            { type: 'IMAGE_PROPERTIES' },
          ],
        },
      ],
    };

    const apiResponse = await axios.post(apiURL, requestData);

    const labelAnnotations = apiResponse.data.responses[0]?.labelAnnotations || [];
    const labels = labelAnnotations.map((label) => label.description);
    const clothingCategories = await fetchClothingCategoriesFromChatGPT(labels, chatGPTKey);

    const imageProps = apiResponse.data.responses[0].imagePropertiesAnnotation;
    let detectedColorName = '';
    if (imageProps) {
      const firstColor = imageProps.dominantColors.colors[0]?.color;
      if (firstColor) {
        const { red, green, blue } = firstColor;
        detectedColorName = await fetchColorNameFromChatGPT(red, green, blue, chatGPTKey);
      }
    }

    return { clothingCategories, detectedColorName };
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};

export const fetchColorNameFromChatGPT = async (red, green, blue, chatGPTKey) => {
  try {
    const prompt = `Given the RGB values (R: ${red}, G: ${green}, B: ${blue}), return the name of the color that most closely matches these values. Just give me the color name.`;
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${chatGPTKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error fetching color name from ChatGPT:', error);
    return 'Unable to determine color name';
  }
};

export const fetchClothingCategoriesFromChatGPT = async (labels, chatGPTKey) => {
  try {
    const prompt = `From these labels:\n${labels.join(
      ', '
    )}, choose 1 label per category: clothing type and clothing subtype.`;
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${chatGPTKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error fetching clothing categories from ChatGPT:', error);
    return 'Unable to determine clothing categories';
  }
};
