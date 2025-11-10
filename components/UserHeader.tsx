import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../stores/authStore';

const UserHeader = () => {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const logout = useAuthStore((state) => (state as any).logout);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator testID="loading-indicator" size="large" color="#007AFF" />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  const getAvatarInitial = (email?: string): string => {
    if (!email) return '';
    return email.charAt(0).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <View style={styles.avatar} testID="user-avatar">
          <Text style={styles.avatarText}>{getAvatarInitial(user.email)}</Text>
        </View>
        <View style={styles.textContainer}>
          {(user as any).name && <Text style={styles.userName}>{(user as any).name}</Text>}
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
      </View>
      <TouchableOpacity
        testID="logout-button"
        onPress={logout}
        style={styles.logoutButton}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ff3b30',
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default UserHeader;
