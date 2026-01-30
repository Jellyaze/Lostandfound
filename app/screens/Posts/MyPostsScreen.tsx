import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getUserPosts, deletePost, updatePost } from '../../services/postService';
import { Post } from '../../services/postService';
import { colors } from '../../constants/Colors';
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
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
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
    ]);
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
    const imageUrl =
      item.image_urls && item.image_urls.length > 0
        ? item.image_urls[0]
        : require('../../assets/lostitem.png');

    return (
      <View style={styles.postCard}>
        <TouchableOpacity
          style={styles.postContent}
          onPress={() => navigation.navigate('ViewPost', { postId: item.id })}
          activeOpacity={0.95}
        >
          <View style={styles.imageContainer}>
            <Image
              source={typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl}
              style={styles.thumbnail}
            />
            <View style={[styles.typeBadge, item.type === 'lost' ? styles.lostBadge : styles.foundBadge]}>
              <Text style={styles.typeBadgeText}>{item.type === 'lost' ? 'Lost' : 'Found'}</Text>
            </View>
          </View>

          <View style={styles.postInfo}>
            <Text style={styles.postTitle} numberOfLines={2}>
              {item.title}
            </Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📍</Text>
              <Text style={styles.detailText} numberOfLines={1}>
                {item.location_name}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📅</Text>
              <Text style={styles.detailText}>{formatDate(item.date_lost_found)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>🕐</Text>
              <Text style={styles.detailText}>{formatTime(item.date_lost_found)}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.actionsContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => navigation.navigate('EditPost', { postId: item.id })}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonIcon}>✏️</Text>
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonIcon}>🗑️</Text>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            {item.type === 'found' ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.claimedButton]}
                onPress={() => handleStatusChange(item.id, 'claimed')}
                activeOpacity={0.8}
              >
                <Text style={styles.actionButtonIcon}>✅</Text>
                <Text style={styles.buttonText}>Mark Claimed</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, styles.returnedButton]}
                onPress={() => handleStatusChange(item.id, 'returned')}
                activeOpacity={0.8}
              >
                <Text style={styles.actionButtonIcon}>↩️</Text>
                <Text style={styles.buttonText}>Mark Returned</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.toggleContainer}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Post Visibility</Text>
            <Text style={styles.toggleSubtext}>
              {item.status === 'active' ? 'Visible to everyone' : 'Hidden from feed'}
            </Text>
          </View>

          <Switch
            value={item.status === 'active'}
            onValueChange={() => handleToggleVisibility(item.id, item.status)}
            trackColor={{ false: colors.border, true: colors.primarySoft }}
            thumbColor={item.status === 'active' ? colors.primary : colors.textMuted}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Posts</Text>
          <Text style={styles.subtitle}>Manage your listings</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('CreatePost')}
          style={styles.createButton}
          activeOpacity={0.8}
        >
          <Text style={styles.createButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyText}>No posts yet</Text>
          <Text style={styles.emptySubtext}>Create your first post to get started</Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => navigation.navigate('CreatePost')}
            activeOpacity={0.8}
          >
            <Text style={styles.createFirstButtonText}>Create Post</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  listContent: {
    padding: 16,
  },
  postCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  postContent: {
    flexDirection: 'row',
    padding: 12,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  typeBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  lostBadge: {
    backgroundColor: colors.danger,
  },
  foundBadge: {
    backgroundColor: colors.success,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  postInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  detailIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  detailText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    fontWeight: '500',
  },
  actionsContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionButtonIcon: {
    fontSize: 14,
  },
  editButton: {
    backgroundColor: colors.accent,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  claimedButton: {
    backgroundColor: colors.success,
  },
  returnedButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.primarySoft,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  toggleSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  createFirstButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  createFirstButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
