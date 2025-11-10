
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import PostForm from '../PostForm';

// Mock ImagePickerButton
jest.mock('../ImagePickerButton', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  
  return function ImagePickerButton({ onImageSelected }: any) {
    return (
      <TouchableOpacity onPress={() => onImageSelected('file://test-image.jpg')}>
        <Text>Select Image</Text>
      </TouchableOpacity>
    );
  };
});

describe('PostForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render text input field', () => {
        const mockOnSubmit = jest.fn();
        const { getByPlaceholderText } = render(<PostForm onSubmit={mockOnSubmit} />);

        expect(getByPlaceholderText("What's on your mind?")).toBeTruthy();
    })

    it('should render ImagePickerButton', () => {
        const mockOnSubmit = jest.fn();
        const { getByText } = render(<PostForm onSubmit={mockOnSubmit} />);

        expect(getByText('Select Image')).toBeTruthy();
    })

    it('should render submit button', () => {
        const mockOnSubmit = jest.fn();
        const { getByText } = render(<PostForm onSubmit={mockOnSubmit} />);

        expect(getByText('Post')).toBeTruthy();
    })

    it('should display selected image preview', async () => {
        const mockOnSubmit = jest.fn();
        const { getByText, getByTestId } = render(<PostForm onSubmit={mockOnSubmit} />);

        // Simulate image selection
        const imagePickerButton = getByText('Select Image');
        fireEvent.press(imagePickerButton);

        await waitFor(() => {
            expect(getByTestId('image-preview')).toBeTruthy();
        });
    })

    it('should disable submit button if text is empty', () => {
        const mockOnSubmit = jest.fn();
        const { getByTestId } = render(<PostForm onSubmit={mockOnSubmit} />);

        const submitButton = getByTestId('submit-button');
        expect(submitButton.props.accessibilityState?.disabled).toBe(true);
    })

    it('should call onSubmit with text and image when submitted', async () => {
        const mockOnSubmit = jest.fn();
        const { getByPlaceholderText, getByText } = render(<PostForm onSubmit={mockOnSubmit} />);

        const textInput = getByPlaceholderText("What's on your mind?");
        fireEvent.changeText(textInput, 'Test post content');
        
        fireEvent.press(getByText('Post'));

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                text: 'Test post content',
                imageUri: null,
            });
        });
    })

    it('should clear form after successful submission', async () => {
        const mockOnSubmit = jest.fn();
        const { getByPlaceholderText, getByText } = render(<PostForm onSubmit={mockOnSubmit} />);

        const textInput = getByPlaceholderText("What's on your mind?");
        fireEvent.changeText(textInput, 'Test post content');
        
        fireEvent.press(getByText('Post'));

        await waitFor(() => {
            expect(textInput.props.value).toBe('');
        });
    })
})