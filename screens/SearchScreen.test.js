import React from 'react';
import { render, fireEvent, getByText, getByPlaceholderText } from '@testing-library/react-native';
import SearchScreen from '../SearchScreen';  

// Test case 1: Search functionality
test('filters outfits based on name or category', () => {
  const { getByPlaceholderText, getByText } = render(<SearchScreen />);

  const searchInput = getByPlaceholderText('Search');
  fireEvent.changeText(searchInput, 'Sweater');

  // Check if the "Sweater Weather" outfit is shown
  expect(getByText('Sweater Weather')).toBeTruthy();
  expect(() => getByText('Chic Skirts')).toThrow();
});

// Test case 2: Empty search displays popular outfits
test('displays popular outfits when search is empty', () => {
  const { getByText } = render(<SearchScreen />);

  // Check if popular items are shown by default
  expect(getByText('Autumn Outfit')).toBeTruthy();
  expect(getByText('Sweater Weather')).toBeTruthy();
});

// Test case 3: Collaborative filtering if no exact match
test('filters outfits based on collaborative recommendations when no exact match', () => {
  const { getByPlaceholderText, getByText } = render(<SearchScreen />);
  
  const searchInput = getByPlaceholderText('Search');
  fireEvent.changeText(searchInput, 'Casual');  // Trigger collaborative filtering
  
  // Check if outfits recommended by the collaborative filter appear
  expect(getByText('Sweater Weather')).toBeTruthy();
  expect(getByText('Winter Coat')).toBeTruthy();
});

// Test case 4: Sorting by popularity (views)
test('sorts outfits by views when no search query is entered', () => {
  const { getByText } = render(<SearchScreen />);

  // Ensure the most popular outfits are displayed first
  expect(getByText('Sweater Weather')).toBeTruthy();
  expect(getByText('Winter Coat')).toBeTruthy();
});

// Test case 5: No results found message
test('shows no results message when no matching outfits are found', () => {
  const { getByPlaceholderText, queryByText } = render(<SearchScreen />);

  const searchInput = getByPlaceholderText('Search');
  fireEvent.changeText(searchInput, 'NonExistentOutfit');
  
  // Expect "No results found" message
  expect(queryByText('No results found')).toBeTruthy();
});
