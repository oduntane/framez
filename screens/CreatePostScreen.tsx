import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import PostForm from '../components/PostForm';
import { postService } from '../services/postService';
import { useAuthStore } from '../stores/authStore';
import { usePostsStore } from '../stores/postsStore';

const CreatePostScreen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const addPost = usePostsStore((state) => state.addPost);

  const handleSubmit = async (data: { text: string; imageUri: string | null }) => {
    if (!user) {
      setError('Please log in to create a post');
      return;
    }

    try {
      setError('');
      setLoading(true);

      let imageUrl: string | undefined = undefined;

      // Upload image if one was selected
      if (data.imageUri) {
        const fileName = data.imageUri.split('/').pop() || 'image.jpg';
        const fileType = fileName.split('.').pop() || 'jpg';
        
        imageUrl = await postService.uploadImage({
          uri: data.imageUri,
          type: `image/${fileType}`,
          name: fileName,
        });
      }

      // Create the post
      const post = await postService.createPost(user.id, data.text, imageUrl);

      // Add post to store
      addPost(post);

      // Navigate back to feed
      navigation.goBack();
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <PostForm onSubmit={handleSubmit} />

        {error && <Text style={styles.errorText}>{error}</Text>}

        {loading && (
          <ActivityIndicator
            testID="loading-indicator"
            size="large"
            color="#007AFF"
            style={styles.loader}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 16,
  },
  loader: {
    marginTop: 20,
  },
});

export default CreatePostScreen;
