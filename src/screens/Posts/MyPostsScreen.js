import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserPosts, deletePost } from '../../services/postService';
import { useAuth } from '../../context/AuthContext';

export default function MyPostsScreen({ navigation }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const result = await getUserPosts(user.uid);
    setLoading(false);

    if (result.success) {
      setPosts(result.data);
    }
  };

  const handleDelete = (post) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deletePost(post.id, post.photo);
            if (result.success) {
              loadPosts();
              Alert.alert('Success', 'Post deleted successfully');
            } else {
              Alert.alert('Error', 'Failed to delete post');
            }
          }
        }
      ]
    );
  };

  const filteredPosts = filter === 'All' 
    ? posts 
    : posts.filter(post => post.status === filter);

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <Image source={{ uri: item.photo }} style={styles.postImage} />
      <View style={styles.postInfo}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postCategory}>{item.category} • {item.caseType}</Text>
        <View style={[styles.statusBadge, 
          item.status === 'Active' && styles.statusActive,
          item.status === 'Claimed' && styles.statusClaimed,
          item.status === 'Returned' && styles.statusReturned
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('EditPost', { post: item })}
          style={styles.actionButton}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleDelete(item)}
          style={[styles.actionButton, styles.deleteButton]}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Posts</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {['All', 'Active', 'Claimed', 'Returned'].map(status => (
          <TouchableOpacity
            key={status}
            style={[styles.filterButton, filter === status && styles.filterButtonActive]}
            onPress={() => setFilter(status)}
          >
            <Text style={[styles.filterText, filter === status && styles.filterTextActive]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#50A296" />
        </View>
      ) : filteredPosts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No posts found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D0E1D7'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#50A296'
  },
  headerButton: {
    color: 'white',
    fontSize: 16
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold'
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white'
  },
  filterButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4
  },
  filterButtonActive: {
    backgroundColor: '#50A296'
  },
  filterText: {
    fontSize: 14,
    color: '#666'
  },
  filterTextActive: {
    color: 'white',
    fontWeight: 'bold'
  },
  listContent: {
    padding: 15
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden'
  },
  postImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0'
  },
  postInfo: {
    padding: 15
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  postCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15
  },
  statusActive: {
    backgroundColor: '#4CAF50'
  },
  statusClaimed: {
    backgroundColor: '#FF9800'
  },
  statusReturned: {
    backgroundColor: '#2196F3'
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  actionButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center'
  },
  actionButtonText: {
    color: '#50A296',
    fontSize: 16,
    fontWeight: 'bold'
  },
  deleteButton: {
    borderLeftWidth: 1,
    borderLeftColor: '#f0f0f0'
  },
  deleteButtonText: {
    color: '#f44336'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyText: {
    fontSize: 16,
    color: '#999'
  }
});