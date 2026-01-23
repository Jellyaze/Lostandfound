import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getUserPosts, deletePost, updatePost } from '../../services/postService';
import { Post } from '../../services/postService';
import { Colors } from '../../constants/Colors';
import { formatDate, formatTime } from '../../utils/formatDate';

export default function MyPostsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user]);

  const loadPosts = async () => {
    if (!user) return;
    
    const { data, error } = await getUserPosts(user.id);
    if (!error && data) {
      setPosts(data);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handleDelete = (postId: string) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deletePost(postId);
            if (!error) {
              loadPosts();
            } else {
              Alert.alert('Error', 'Failed to delete post');
            }
          },
        },
      ]
    );
  };

  const handleStatusChange = async (postId: string, newStatus: 'claimed' | 'returned') => {
    const { error } = await updatePost(postId, { status: newStatus });
    if (!error) {
      loadPosts();
      Alert.alert('Success', `Post marked as ${newStatus}`);
    } else {
      Alert.alert('Error', 'Failed to update post status');
    }
  };

  const handleToggleVisibility = async (postId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    const { error } = await updatePost(postId, { status: newStatus });
    if (!error) {
      loadPosts();
    } else {
      Alert.alert('Error', 'Failed to update post visibility');
    }
  };

  const renderPost = ({ item }: { item: Post }) => {
    const imageUrl = item.image_urls && item.image_urls.length > 0 
      ? item.image_urls[0] 
      : require('../../assets/lostitem.png');

    return (
      <View style={styles.postCard}>
        <TouchableOpacity
          style={styles.postContent}
          onPress={() => navigation.navigate('ViewPost', { postId: item.id })}
        >
          <Image 
            source={typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl} 
            style={styles.thumbnail} 
          />
          <View style={styles.postInfo}>
            <Text style={styles.postTitle} numberOfLines={1}>{item.title}</Text>
            <View style={styles.detailRow}>
              <Image source={require('../../assets/loclogo.png')} style={styles.icon}/>
              <Text style={styles.detailText} numberOfLines={1}>{item.location_name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Image source={require('../../assets/datelogo.png')} style={styles.icon}/>
              <Text style={styles.detailText}>{formatDate(item.date_lost_found)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Image source={require('../../assets/timelogo.png')} style={styles.icon}/>
              <Text style={styles.detailText}>{formatTime(item.date_lost_found)}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.actionsContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => navigation.navigate('EditPost', { postId: item.id })}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonRow}>
            {item.type === 'found' ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.claimedButton]}
                onPress={() => handleStatusChange(item.id, 'claimed')}
              >
                <Text style={styles.buttonText}>Claimed</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, styles.returnedButton]}
                onPress={() => handleStatusChange(item.id, 'returned')}
              >
                <Text style={styles.buttonText}>Returned</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Post Visibility</Text>
          <Switch
            value={item.status === 'active'}
            onValueChange={() => handleToggleVisibility(item.id, item.status)}
            trackColor={{ false: Colors.lightGray, true: Colors.primaryLight }}
            thumbColor={item.status === 'active' ? Colors.primary : Colors.gray}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Posts</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreatePost')}>
          <Text style={styles.createButton}>+ Create</Text>
        </TouchableOpacity>
      </View>

      {posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No posts yet</Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => navigation.navigate('CreatePost')}
          >
            <Text style={styles.createFirstButtonText}>Create Your First Post</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  backButton: {
    fontSize: 16,
    color: Colors.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  createButton: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 10,
  },
  postCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginVertical: 8,
    overflow: 'hidden',
  },
  postContent: {
    flexDirection: 'row',
    padding: 10,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  postInfo: {
    flex: 1,
    justifyContent: 'space-around',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  icon: {
    width: 12,
    height: 12,
    marginRight: 6,
  },
  detailText: {
    fontSize: 11,
    color: Colors.text.secondary,
    flex: 1,
  },
  actionsContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: Colors.error,
  },
  editButton: {
    backgroundColor: Colors.primary,
  },
  claimedButton: {
    backgroundColor: Colors.success,
  },
  returnedButton: {
    backgroundColor: Colors.warning,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  toggleLabel: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  createFirstButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  createFirstButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});