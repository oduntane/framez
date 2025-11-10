import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface PostCardProps {
  post: {
    id: string;
    user_id: string;
    text: string;
    image_url: string | null;
    created_at: string;
    profiles: {
      email: string;
    };
  };
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const formatTimestamp = (timestamp: string): string => {
    const now = Date.now();
    const postTime = new Date(timestamp).getTime();
    const diffInSeconds = Math.floor((now - postTime) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  };

  const getAvatarInitial = (email: string): string => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar} testID="author-avatar">
          <Text style={styles.avatarText}>{getAvatarInitial(post.profiles.email)}</Text>
        </View>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{post.profiles.email}</Text>
          <Text style={styles.timestamp} testID="post-timestamp">
            {formatTimestamp(post.created_at)}
          </Text>
        </View>
      </View>

      <Text style={styles.postText}>{post.text}</Text>

      {post.image_url && (
        <Image
          testID="post-image"
          source={{ uri: post.image_url }}
          style={styles.postImage}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  postText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
});

export default PostCard;
