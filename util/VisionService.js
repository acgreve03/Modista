// services/visionService.js

export const sendToGoogleCloudVision = async (base64Image) => {
    const apiKey = 'AIzaSyAGRWVBWp-pJH9KD4XB2yedmv-2VQafbV4'; // Replace with your actual API key
  
    const visionRequest = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'LABEL_DETECTION',
            },
          ],
        },
      ],
    };
  
    try {
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: 'POST',
          body: JSON.stringify(visionRequest),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      const result = await response.json();

    console.log('Base64 Image:', base64Image); // Log the base64 image string
    console.log('Vision API full response:', result); // Log the entire response

    // Check if the responses array exists and has results
    if (result.responses && result.responses.length > 0) {
      return result;
    } else {
      throw new Error('No responses found in Vision API response');
    }
  } catch (error) {
    console.error('Error with Vision API:', error);
    throw error; // Handle this error in the calling component
  }
};