import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import AddToCloset from './AddToCloset'; // Adjust the path as necessary
import { analyzeImage } from '../../data/imageAnalysisHelpers';

// Mock the analyzeImage function
jest.mock('../../data/imageAnalysisHelpers', () => ({
  analyzeImage: jest.fn(),
}));

describe('AddToCloset Component', () => {
  it('ensures labels from Google Cloud Vision are not null', async () => {
    // Mock the response from analyzeImage
    analyzeImage.mockResolvedValueOnce({
      clothingCategories: {
        clothingType: 'T-shirt',
        occasion: 'Casual',
        season: 'Summer',
      },
      detectedColorName: 'Red',
    });

    const { getByText, getByTestId } = render(<AddToCloset />);
    
    // Simulate pressing the Analyze Image button
    const analyzeButton = getByText('Analyze Image');
    await act(async () => {
      fireEvent.press(analyzeButton);
    });

    // Get the input fields
    const colorInput = getByTestId('color-input');
    const subcategoryInput = getByTestId('subcategory-input');
    const occasionInput = getByTestId('occasion-input');
    const seasonInput = getByTestId('season-input');

    // Assert that none of these fields are null or undefined
    expect(colorInput.props.value).not.toBeNull();
    expect(colorInput.props.value).not.toBeUndefined();

    expect(subcategoryInput.props.value).not.toBeNull();
    expect(subcategoryInput.props.value).not.toBeUndefined();

    expect(occasionInput.props.value).not.toBeNull();
    expect(occasionInput.props.value).not.toBeUndefined();

    expect(seasonInput.props.value).not.toBeNull();
    expect(seasonInput.props.value).not.toBeUndefined();
  });
});
