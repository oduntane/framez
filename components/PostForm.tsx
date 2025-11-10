import React, { useState } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import ImagePickerButton from './ImagePickerButton';

interface PostFormProps {
  onSubmit: (data: { text: string; imageUri: string | null }) => void;
}

const PostForm: React.FC<PostFormProps> = ({ onSubmit }) => {
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handleImageSelected = (uri: string) => {
    setImageUri(uri);
  };

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit({ text, imageUri });
      // Clear form after submission
      setText('');
      setImageUri(null);
    }
  };

  const isFormValid = text.trim() !== '';

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        placeholder="What's on your mind?"
        value={text}
        onChangeText={setText}
        multiline
        numberOfLines={4}
      />

      {imageUri && (
        <Image
          testID="image-preview"
          source={{ uri: imageUri }}
          style={styles.imagePreview}
        />
      )}

      <ImagePickerButton onImageSelected={handleImageSelected} />

      <TouchableOpacity
        testID="submit-button"
        style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!isFormValid}
        accessibilityState={{ disabled: !isFormValid }}
      >
        <Text style={styles.submitButtonText}>Post</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PostForm;
