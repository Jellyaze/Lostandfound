import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { searchPosts } from '../../services/postService';

export default function SearchScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const [caseType, setCaseType] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tags, setTags] = useState('');

  const categories = ['', 'Device', 'Clothing', 'Accessory', 'Bag', 'Wallet', 'Vehicle', 'Pet'];

  const handleSearch = async () => {
    setLoading(true);
    
    const filters = {};
    if (caseType) filters.caseType = caseType;
    if (category) filters.category = category;
    if (location) filters.location = location;
    if (date) filters.date = date.toLocaleDateString();
    if (tags) filters.tags = tags.split(',').map(t => t.trim()).filter(t => t);

    const result = await searchPosts(filters);
    setLoading(false);

    if (result.success) {
      setResults(result.data);
      setShowResults(true);
    }
  };

  const handleClear = () => {
    setCaseType('');
    setCategory('');
    setLocation('');
    setDate(new Date());
    setTags('');
    setResults([]);
    setShowResults(false);
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity 
      style={styles.postCard}
      onPress={() => navigation.navigate('ItemDetail', { post: item })}
    >
      <Image source={{ uri: item.photo }} style={styles.postImage} />
      <View style={styles.postInfo}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postCategory}>{item.category} • {item.caseType}</Text>
        <Text style={styles.postLocation}>{item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Advanced Search</Text>
        <View style={{ width: 60 }} />
      </View>

      {!showResults ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Case Type */}
          <Text style={styles.label}>Case Type</Text>
          <View style={styles.caseTypeContainer}>
            <TouchableOpacity
              style={[styles.caseTypeButton, caseType === 'Lost' && styles.caseTypeButtonActive]}
              onPress={() => setCaseType(caseType === 'Lost' ? '' : 'Lost')}
            >
              <Text style={[styles.caseTypeText, caseType === 'Lost' && styles.caseTypeTextActive]}>Lost</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.caseTypeButton, caseType === 'Found' && styles.caseTypeButtonActive]}
              onPress={() => setCaseType(caseType === 'Found' ? '' : 'Found')}
            >
              <Text style={[styles.caseTypeText, caseType === 'Found' && styles.caseTypeTextActive]}>Found</Text>
            </TouchableOpacity>
          </View>

          {/* Category */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              style={styles.picker}
            >
              <Picker.Item label="All Categories" value="" />
              {categories.filter(c => c).map(cat => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </View>

          {/* Date */}
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
            <Text>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSearch} style={styles.searchButton} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.searchButtonText}>Show Results</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>{results.length} Results Found</Text>
            <TouchableOpacity onPress={() => setShowResults(false)}>
              <Text style={styles.backToSearch}>← Back to Search</Text>
            </TouchableOpacity>
          </View>
          
          {results.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No items found matching your criteria</Text>
            </View>
          ) : (
            <FlatList
              data={results}
              renderItem={renderPost}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
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
  scrollContent: {
    padding: 20
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginTop: 10
  },
  caseTypeContainer: {
    flexDirection: 'row',
    marginBottom: 20
  },
  caseTypeButton: {
    flex: 1,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center'
  },
  caseTypeButtonActive: {
    backgroundColor: '#50A296'
  },
  caseTypeText: {
    fontSize: 16,
    color: '#666'
  },
  caseTypeTextActive: {
    color: 'white',
    fontWeight: 'bold'
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden'
  },
  picker: {
    height: 50
  },
  dateButton: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10
  },
  clearButton: {
    flex: 1,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#50A296'
  },
  clearButtonText: {
    color: '#50A296',
    fontSize: 16,
    fontWeight: 'bold'
  },
  searchButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#50A296',
    borderRadius: 10,
    alignItems: 'center'
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  resultsContainer: {
    flex: 1
  },
  resultsHeader: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  backToSearch: {
    color: '#50A296',
    fontSize: 14
  },
  listContent: {
    padding: 20
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    flexDirection: 'row'
  },
  postImage: {
    width: 100,
    height: 100,
    backgroundColor: '#f0f0f0'
  },
  postInfo: {
    flex: 1,
    padding: 15
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  postCategory: {
    fontSize: 14,
    color: '#50A296',
    marginBottom: 5
  },
  postLocation: {
    fontSize: 12,
    color: '#666'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center'
  }
});