import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';

interface PostCardProps {
  post: {
    id: string;
    user_id: string;
    text: string;
    image_url: string | null;
    created_at: string;
    profiles?: {
      email?: string;
      display_name?: string;
    };
  };
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [displayName, setDisplayName] = React.useState<string>('');

  React.useEffect(() => {
    const fetchDisplayName = async () => {
      const { data } = await supabase.auth.admin.getUserById(post.user_id);
      const name = data?.user?.user_metadata?.display_name || post.profiles?.email || 'Unknown User';
      setDisplayName(name);
    };
    
    // Since we can't use admin API, get it from the current post's user metadata when available
    // For now, use email as fallback
    setDisplayName(post.profiles?.email?.split('@')[0] || 'Unknown User');
  }, [post]);

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

  const getDisplayName = (): string => {
    return post.profiles?.display_name || post.profiles?.email?.split('@')[0] || 'Unknown User';
  };

  const getAvatarInitial = (): string => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar} testID="author-avatar">
          <Text style={styles.avatarText}>
            {getAvatarInitial()}
          </Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.username}>{getDisplayName()}</Text>
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
  headerText: {
    flex: 1,
  },
  username: {
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
