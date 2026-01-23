import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { subscribeToPost } from '../../services/postService';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();

  const [isLost, setIsLost] = useState(true);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToPost(
      (fetchedPosts) => {
        const filteredPosts = fetchedPosts.filter(
          post => post.caseType === (isLost ? 'Lost' : 'Found')
        );
        setPosts(filteredPosts);
        setLoading(false);
        setRefreshing(false);
      },
      isLost ? 'Lost' : 'Found'
    );

    return () => unsubscribe();
  }, [isLost]);

  const onRefresh = () => {
    setRefreshing(true);
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => navigation.navigate('ItemDetail', { post: item })}
    >
      <Image source={{ uri: item.photo }} style={styles.postImage} />
      <View style={styles.postInfo}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postCategory}>{item.category}</Text>
        <View style={styles.postMeta}>
          <Image source={require('../../../app/assets/datelogo.png')} style={styles.icon} />
          <Text style={styles.postMetaText}>{item.date} • {item.time}</Text>
        </View>
        <View style={styles.postMeta}>
          <Image source={require('../../../app/assets/loclogo.png')} style={styles.icon} />
          <Text style={styles.postMetaText}>{item.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lost & Found</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Image
            source={require('../../../app/assets/filterIcon.png')}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, isLost && styles.toggleButtonActive]}
          onPress={() => setIsLost(true)}
        >
          <Text style={[styles.toggleText, isLost && styles.toggleTextActive]}>
            Lost
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, !isLost && styles.toggleButtonActive]}
          onPress={() => setIsLost(false)}
        >
          <Text style={[styles.toggleText, !isLost && styles.toggleTextActive]}>
            Found
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Most Recent</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#50A296" />
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No {isLost ? 'lost' : 'found'} items yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#50A296']}
            />
          }
        />
      )}

      <View style={styles.footer}>
        <View style={styles.foota}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Image source={require('../../../app/assets/homelogo.png')} style={styles.footbtn} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('PostItem')}>
            <Image source={require('../../../app/assets/storyplogo.png')} style={styles.footbtn} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Messages')}>
            <Image source={require('../../../app/assets/messlogo.png')} style={styles.footbtn} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image source={require('../../../app/assets/taologo.png')} style={styles.footbtn} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D0E1D7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#50A296',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  toggleContainer: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#50A296',
  },
  toggleText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: 'white',
  },
  recentSection: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
  },
  postImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  postInfo: {
    padding: 15,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  postCategory: {
    fontSize: 14,
    color: '#50A296',
    marginBottom: 10,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: '#666',
  },
  postMetaText: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  footer: {
    height: 50,
    width: '100%',
    backgroundColor: '#fff',
    padding: 10,
    position: 'absolute',
    bottom: 0,
  },
  foota: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '80%',
    alignSelf: 'center',
  },
  footbtn: {
    height: 30,
    width: 30,
  },
});
