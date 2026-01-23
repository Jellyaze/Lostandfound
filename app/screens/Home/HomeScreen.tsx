import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchBar from '../../components/ui/SearchBar';
import LostFoundToggle from '../../components/ui/LostFoundToggle';
import RecentItems from '../../components/posts/RecentItems';
import ItemList from '../../components/posts/ItemList';
import { getPosts, searchPosts } from '../../services/postService';
import { Post } from '../../services/postService';
import { Colors } from '../../constants/Colors';

export default function HomeScreen({ navigation }: any) {
  const [isLost, setIsLost] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [isLost]);

  useEffect(() => {
    if (searchText.length > 0) {
      performSearch();
    } else {
      setFilteredPosts([]);
    }
  }, [searchText, isLost]);

  const loadPosts = async () => {
    const type = isLost ? 'lost' : 'found';
    const { data, error } = await getPosts(type);
    if (!error && data) {
      setPosts(data);
    }
  };

  const performSearch = async () => {
    const type = isLost ? 'lost' : 'found';
    const { data, error } = await searchPosts(searchText, type);
    if (!error && data) {
      setFilteredPosts(data);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handleShowLostItems = () => {
    setIsLost(true);
    setIsSearching(false);
    setSearchText('');
  };

  const handleShowFoundItems = () => {
    setIsLost(false);
    setIsSearching(false);
    setSearchText('');
  };

  const displayData = isSearching && searchText.length > 0 ? filteredPosts : posts;
  const recentData = posts.slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <SearchBar
          isLost={isLost}
          isSearching={isSearching}
          setIsSearching={setIsSearching}
          searchText={searchText}
          setSearchText={setSearchText}
          navigation={navigation}
        />

        {!isSearching && (
          <>
            <LostFoundToggle isLost={isLost} setIsLost={setIsLost} />
            
            <View style={styles.quickActionsContainer}>
              <TouchableOpacity 
                style={[styles.quickActionButton, styles.lostButton]} 
                onPress={handleShowLostItems}
              >
                <Text style={styles.quickActionText}>Lost Items</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.quickActionButton, styles.foundButton]} 
                onPress={handleShowFoundItems}
              >
                <Text style={styles.quickActionText}>Found Items</Text>
              </TouchableOpacity>
            </View>

            <RecentItems horizontalData={recentData} navigation={navigation} />
          </>
        )}

        <ItemList 
          data={displayData} 
          navigation={navigation}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: Colors.background,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  quickActionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  lostButton: {
    backgroundColor: Colors.error,
  },
  foundButton: {
    backgroundColor: Colors.success,
  },
  quickActionText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});