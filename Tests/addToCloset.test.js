import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddToCloset from '../screens/Profile/AddToCloset'; // Adjust path to your component
import { uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc } from 'firebase/firestore';
import { auth } from '../firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';


// Mocking Firebase functions and Navigation
jest.mock('firebase/storage', () => ({
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

describe('../screens/Profile/AddToCloset', () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = jest.fn();
    useNavigation.mockReturnValue({ goBack: mockNavigate });

    // Set up mock user for Firebase
    onAuthStateChanged.mockImplementation((auth, callback) =>
      callback({
        uid: 'user123',
        email: 'test@domain.com',
      })
    );
  });

  test('renders AddToCloset screen', () => {
    const { getByText, getByTestId } = render(<AddToCloset />);

    // Check if the title and button are rendered
    expect(getByText('Add to Closet')).toBeTruthy();
    expect(getByTestId('button-add')).toBeTruthy();
  });

  test('valid image triggers upload and adds item to closet', async () => {
    const imageUri = 'mock-image-uri';
    const imageUrl = 'mock-image-url';

    // Mock image picker behavior
    require('expo-image-picker').launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: imageUri }],
    });

    // Mock Firebase upload and URL fetch
    uploadBytes.mockResolvedValue({ ref: 'some-reference' });
    getDownloadURL.mockResolvedValue(imageUrl);

    const { getByTestId } = render(<AddToCloset />);

    // Simulate image picking
    const pickImageButton = getByTestId('button-image-gallery'); // Make sure this ID matches
    fireEvent.press(pickImageButton);

    await waitFor(() => {
      expect(uploadBytes).toHaveBeenCalledTimes(1);
      expect(getDownloadURL).toHaveBeenCalledTimes(1);
    });

    // Check if the image URL is correctly set to the state
    expect(getByTestId('image-preview')).toHaveProp('source', { uri: imageUrl });
  });

  test('add item to closet triggers Firestore addDoc', async () => {
    const imageUrl = 'mock-image-url';

    // Mock Firebase addDoc function
    addDoc.mockResolvedValue({ id: 'document-id' });

    const { getByTestId } = render(<AddToCloset />);

    // Simulate image picking and state update
    const pickImageButton = getByTestId('button-image-gallery');
    fireEvent.press(pickImageButton);
    
    await waitFor(() => expect(uploadBytes).toHaveBeenCalled());

    // Simulate adding the item to the closet
    const addButton = getByTestId('button-add');
    fireEvent.press(addButton);

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledTimes(1);
      expect(addDoc).toHaveBeenCalledWith(
        expect.objectContaining({
          closetItemUrl: imageUrl,
          color: expect.any(String),
          subcategory: expect.any(String),
          category: expect.any(String),
          occasion: expect.any(String),
          season: expect.any(String),
        })
      );
    });
  });

  test('no user authenticated shows alert', async () => {
    // Simulate user not being authenticated
    onAuthStateChanged.mockImplementationOnce((auth, callback) => callback(null));

    const { getByTestId, getByText } = render(<AddToCloset />);

    const addButton = getByTestId('button-add');
    fireEvent.press(addButton);

    // Wait for alert message
    await waitFor(() => {
      expect(getByText('User not authenticated')).toBeTruthy();
    });
  });

  test('error handling on Firebase failure', async () => {
    const imageUrl = 'mock-image-url';

    // Mock Firebase functions to reject with an error
    uploadBytes.mockRejectedValueOnce(new Error('Upload failed'));
    getDownloadURL.mockRejectedValueOnce(new Error('Download URL failed'));

    const { getByTestId } = render(<AddToCloset />);

    // Simulate image picking
    const pickImageButton = getByTestId('button-image-gallery');
    fireEvent.press(pickImageButton);

    // Check if error handling works (you can mock alert or error UI components accordingly)
    await waitFor(() => {
      expect(getByTestId('error-message')).toHaveTextContent('Error uploading image');
    });
  });
});
