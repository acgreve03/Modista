import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import OutfitGenerateDisplay from '../screens/OutfitGenerateDisplay'; // Adjust with your file path
import { firebase } from "@firebase/testing";  // Mock Firestore
import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection } from "../firebaseConfig"; // Ensure firestore is correctly imported
import { db } from '../firebaseConfig';  // Ensure this path matches your config file

// Mocking Firestore functions
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  getDocs: jest.fn(),
  collection: jest.fn(),
}));

describe('OutfitGenerationScreen', () => {
  beforeEach(() => {
    // You can mock db.collection or specific document actions here.
    collection.mockReturnValue({
      get: jest.fn().mockResolvedValue({ docs: [] }),  // Mock an empty Firestore response
    });
  });

  test('renders Outfit Generation screen', async () => {
    const { getByText } = render(<OutfitGenerationScreen />);
    
    // Example check, adjust based on what your screen renders
    expect(getByText('Outfit Generation')).toBeTruthy();
  });

  test('fetches outfit data from Firestore', async () => {
    const mockData = [
      { id: '1', data: () => ({ name: 'Shirt', color: 'Red' }) },
      { id: '2', data: () => ({ name: 'Pants', color: 'Blue' }) },
    ];

    // Mock Firestore response with mockData
    getDocs.mockResolvedValueOnce({
      docs: mockData,
    });

    const { getByText } = render(<OutfitGenerationScreen />);

    await waitFor(() => {
      // Adjust based on what gets rendered from Firestore data
      expect(getByText('Shirt')).toBeTruthy();
      expect(getByText('Pants')).toBeTruthy();
    });

    // Check if Firestore methods were called
    expect(getFirestore).toHaveBeenCalled();
    expect(getDocs).toHaveBeenCalled();
  });

  test('handles error when fetching data from Firestore', async () => {
    // Mock Firestore error
    getDocs.mockRejectedValueOnce(new Error('Firestore error'));

    const { getByText } = render(<OutfitGenerationScreen />);

    await waitFor(() => {
      expect(getByText('Error loading outfits')).toBeTruthy(); // Adjust based on error handling
    });
  });
});

describe('generateOutfit', () => {
    const closetItems = [
      { ItemID: 1, season: 'Winter', occasion: 'Casual', category: 'Top', subcategory: 'Shirt', color: 'Red', imageUrl: 'image1.jpg' },
      { ItemID: 2, season: 'Summer', occasion: 'Casual', category: 'Top', subcategory: 'T-shirt', color: 'Blue', imageUrl: 'image2.jpg' },
      { ItemID: 3, season: 'Winter', occasion: 'Formal', category: 'Bottom', subcategory: 'Pants', color: 'Black', imageUrl: 'image3.jpg' },
      { ItemID: 4, season: 'Winter', occasion: 'Casual', category: 'Shoes', subcategory: 'Boots', color: 'Brown', imageUrl: 'image4.jpg' },
      { ItemID: 5, season: 'Spring', occasion: 'Casual', category: 'Shoes', subcategory: 'Sneakers', color: 'White', imageUrl: 'image5.jpg' },
    ];
    const incompleteCloset = [
        { ItemID: 1, season: 'Winter', occasion: 'Casual', category: 'Top', subcategory: 'Shirt', color: 'Red', imageUrl: 'image1.jpg' },
        
      ];
  
    test('filters items by season and occasion', async () => {
      const outfit = await generateOutfit(closetItems, 'Winter', 'Casual');
      expect(outfit.top).toBeDefined();
      expect(outfit.bottom).toBeDefined();
      expect(outfit.shoes).toBeDefined();
    });
  
    test('handles missing essential items correctly', async () => {
      const incompleteCloset = closetItems.filter(item => item.category !== 'Shoes');
      const outfit = await generateOutfit(incompleteCloset, 'Winter', 'Casual');
      expect(outfit).toEqual({});
    });

    test('returns empty object when no matching items found', async () => {
      const outfit = await generateOutfit([], 'Winter', 'Casual');
      expect(outfit).toEqual({});
    });
});
