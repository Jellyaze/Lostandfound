import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Post } from '../../services/postService';
import PostCard from '../../components/posts/PostCard';
import { Colors } from '../../constants/Colors';

interface SearchResultsScreenProps {
  route: {
    params: {
      results: Post[];
      filters: any;
      dateRange: any;
    };
  };
  navigation: any;
}

export default function SearchResultsScreen({ route, navigation }: SearchResultsScreenProps) {
  const { results, filters, dateRange } = route.params;

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onPress={() => navigation.navigate('ViewPost', { postId: item.id })}
    />
  );

  const getFilterSummary = () => {
    const activeFilters = [];
    if (filters.searchText) activeFilters.push(`"${filters.searchText}"`);
    if (filters.category) activeFilters.push(filters.category);
    if (filters.type) activeFilters.push(filters.type);
    if (filters.location) activeFilters.push(`in ${filters.location}`);
    if (dateRange.startDate || dateRange.endDate) {
      const start = dateRange.startDate?.toLocaleDateString() || 'any date';
      const end = dateRange.endDate?.toLocaleDateString() || 'now';
      activeFilters.push(`${start} - ${end}`);
    }
    return activeFilters.join(', ');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Results</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.resultCount}>
          {results.length} result{results.length !== 1 ? 's' : ''} found
        </Text>
        {getFilterSummary() && (
          <Text style={styles.filterSummary}>
            Filters: {getFilterSummary()}
          </Text>
        )}
      </View>

      {results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your search filters or keywords
          </Text>
          <TouchableOpacity 
            style={styles.newSearchButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.newSearchButtonText}>New Search</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
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
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  editButton: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  summaryContainer: {
    backgroundColor: Colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  resultCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 5,
  },
  filterSummary: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  listContainer: {
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  newSearchButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  newSearchButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});