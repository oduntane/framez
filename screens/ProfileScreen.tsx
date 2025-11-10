import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import UserHeader from '../components/UserHeader';
import UserPostsList from '../components/UserPostsList';
import { useUserStore } from '../stores/userStore';

const ProfileScreen = () => {
  const profile = useUserStore((state) => state.profile);
  const posts = useUserStore((state) => state.posts);
  const loading = useUserStore((state) => state.loading);
  const error = useUserStore((state) => state.error);
  const fetchUserProfile = useUserStore((state) => state.fetchUserProfile);
  const fetchUserPosts = useUserStore((state) => state.fetchUserPosts);

  useEffect(() => {
    const loadData = async () => {
      await fetchUserProfile();
      await fetchUserPosts();
    };

    loadData();
  }, []);

  if (loading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator testID="loading-indicator" size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <UserHeader />
      <UserPostsList posts={posts as any} loading={loading} />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#c62828',
    textAlign: 'center',
  },
});

export default ProfileScreen;
