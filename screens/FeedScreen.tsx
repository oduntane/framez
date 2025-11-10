import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import PostCard from '../components/PostCard';
import { postService } from '../services/postService';
import { usePostsStore } from '../stores/postsStore';

const FeedScreen = () => {
  const posts = usePostsStore((state) => state.posts);
  const loading = usePostsStore((state) => state.loading);
  const error = usePostsStore((state) => state.error);
  const fetchPosts = usePostsStore((state) => state.fetchPosts);
  const addPost = usePostsStore((state) => state.addPost);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Fetch posts on mount
    fetchPosts();

    // Subscribe to realtime updates
    const channel = postService.subscribeToPostsRealtime((newPost) => {
      addPost(newPost);
    });

    // Cleanup subscription on unmount
    return () => {
      if (channel && channel.unsubscribe) {
        channel.unsubscribe();
      }
    };
  }, []);

  React.useEffect(() => {
    fetchPosts();

    // Subscribe to real-time post changes
    const subscription = postService.subscribeToPostsRealtime((newPost) => {
      // Refresh posts when a new post is created
      fetchPosts();
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const renderEmptyState = () => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No posts yet</Text>
        <Text style={styles.emptySubtext}>Be the first to share something!</Text>
      </View>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  };

  if (loading && posts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator testID="loading-indicator" size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderError()}
      <FlatList
        testID="posts-list"
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={posts.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default FeedScreen;
