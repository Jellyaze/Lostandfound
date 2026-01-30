import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, RefreshControl, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchBar from '../../components/ui/SearchBar';
import LostFoundToggle from '../../components/ui/LostFoundToggle';
import RecentItems from '../../components/posts/RecentItems';
import ItemList from '../../components/posts/ItemList';
import { getPosts, searchPosts } from '../../services/postService';
import { Post } from '../../services/postService';
import { colors } from '../../constants/Colors';

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Seeker</Text>
          <Text style={styles.headerSubtitle}>Lost & Found Community</Text>
        </View>

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
                style={[
                  styles.quickActionButton,
                  isLost ? styles.lostButtonActive : styles.lostButton
                ]}
                onPress={handleShowLostItems}
                activeOpacity={0.8}
              >
                <View style={styles.quickActionContent}>
                  <Text style={styles.quickActionEmoji}>🔍</Text>
                  <Text
                    style={[
                      styles.quickActionText,
                      isLost && styles.quickActionTextActive
                    ]}
                  >
                    Lost Items
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickActionButton,
                  !isLost ? styles.foundButtonActive : styles.foundButton
                ]}
                onPress={handleShowFoundItems}
                activeOpacity={0.8}
              >
                <View style={styles.quickActionContent}>
                  <Text style={styles.quickActionEmoji}>✨</Text>
                  <Text
                    style={[
                      styles.quickActionText,
                      !isLost && styles.quickActionTextActive
                    ]}
                  >
                    Found Items
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <RecentItems horizontalData={recentData} navigation={navigation} />
          </>
        )}

        <ItemList
          data={displayData}
          navigation={navigation}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: colors.textPrimary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  lostButton: {
    borderColor: colors.border,
  },
  lostButtonActive: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
    shadowColor: colors.danger,
    shadowOpacity: 0.2,
  },
  foundButton: {
    borderColor: colors.border,
  },
  foundButtonActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
    shadowColor: colors.success,
    shadowOpacity: 0.2,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickActionEmoji: {
    fontSize: 18,
  },
  quickActionText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 15,
  },
  quickActionTextActive: {
    color: '#FFFFFF',
  },
});
