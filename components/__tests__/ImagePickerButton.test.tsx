
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import ImagePickerButton from '../ImagePickerButton';

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

import * as ImagePicker from 'expo-image-picker';

describe('ImagePickerButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render button with "Select Image" text', () => {
        const mockOnImageSelected = jest.fn();
        const { getByText } = render(<ImagePickerButton onImageSelected={mockOnImageSelected} />);

        expect(getByText('Select Image')).toBeTruthy();
    })

    it('should call expo-image-picker when button pressed', async () => {
        const mockOnImageSelected = jest.fn();
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
            canceled: true,
        });

        const { getByText } = render(<ImagePickerButton onImageSelected={mockOnImageSelected} />);

        fireEvent.press(getByText('Select Image'));

        await waitFor(() => {
            expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });
        });
    })

    it('should call onImageSelected callback with image URI on success', async () => {
        const mockOnImageSelected = jest.fn();
        const mockImageUri = 'file://test-image.jpg';

        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
            canceled: false,
            assets: [{ uri: mockImageUri }],
        });

        const { getByText } = render(<ImagePickerButton onImageSelected={mockOnImageSelected} />);

        fireEvent.press(getByText('Select Image'));

        await waitFor(() => {
            expect(mockOnImageSelected).toHaveBeenCalledWith(mockImageUri);
        });
    })

    it('should not call callback if user cancels selection', async () => {
        const mockOnImageSelected = jest.fn();

        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
            canceled: true,
        });

        const { getByText } = render(<ImagePickerButton onImageSelected={mockOnImageSelected} />);

        fireEvent.press(getByText('Select Image'));

        await waitFor(() => {
            expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
        });

        expect(mockOnImageSelected).not.toHaveBeenCalled();
    })
})