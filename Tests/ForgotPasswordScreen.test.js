import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';

// Mocking Firebase functions and Navigation
jest.mock('firebase/auth', () => ({
  sendPasswordResetEmail: jest.fn(),
  getAuth: jest.fn(() => ({ currentUser: null})),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

describe('../screens/ForgotPasswordScreen', () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = jest.fn();
    useNavigation.mockReturnValue({ goBack: mockNavigate });
  });

  test('renders Forgot Password screen', () => {
    const { getByText, getByPlaceholderText } = render(<ForgotPasswordScreen />);
    
    // Check if the title and subtitle are rendered
    expect(getByText('Forgot Password')).toBeTruthy();
    expect(getByText('Enter your email to reset your password.')).toBeTruthy();

    // Check if email input and button are rendered
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByText('Send Reset Link')).toBeTruthy();
  });

  test('valid email triggers password reset email', async () => {
    const { getByPlaceholderText, getByText } = render(<ForgotPasswordScreen />);

    // Simulate entering a valid email
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    
    // Mock the Firebase sendPasswordResetEmail function to resolve successfully
    sendPasswordResetEmail.mockResolvedValueOnce({});

    // Simulate pressing the button
    fireEvent.press(getByText('Send Reset Link'));

    await waitFor(() => {
      // Check if success alert is called
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'test@example.com');
    });
  });

  test('invalid email shows error', async () => {
    const { getByPlaceholderText, getByText, getByTestId } = render(<ForgotPasswordScreen />);

    // Simulate entering an invalid email
    fireEvent.changeText(getByPlaceholderText('Email'), 'invalid-email');
    
    // Simulate pressing the button
    fireEvent.press(getByText('Send Reset Link'));

    // Wait for validation error message
    await waitFor(() => {
      expect(getByText('Enter a valid email address')).toBeTruthy();
    });
  });

  test('error alert when Firebase fails', async () => {
    const { getByPlaceholderText, getByText } = render(<ForgotPasswordScreen />);
    
    // Simulate entering a valid email
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');

    // Mock the Firebase sendPasswordResetEmail function to throw an error
    sendPasswordResetEmail.mockRejectedValueOnce(new Error('Some error occurred'));

    // Simulate pressing the button
    fireEvent.press(getByText('Send Reset Link'));

    // Wait for error alert to appear
    await waitFor(() => {
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'test@example.com');
    });
  });
});
