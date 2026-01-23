import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import { searchPosts } from '../../services/postService';
import { Colors } from '../../constants/Colors';

const categories = [
  { label: 'All Categories', value: '' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Clothing', value: 'clothing' },
  { label: 'Accessories', value: 'accessories' },
  { label: 'Documents', value: 'documents' },
  { label: 'Keys', value: 'keys' },
  { label: 'Bags', value: 'bags' },
  { label: 'Jewelry', value: 'jewelry' },
  { label: 'Books', value: 'books' },
  { label: 'Sports Equipment', value: 'sports' },
  { label: 'Other', value: 'other' },
];

const typeOptions = [
  { label: 'Both Lost & Found', value: '' },
  { label: 'Lost Items Only', value: 'lost' },
  { label: 'Found Items Only', value: 'found' },
];

export default function AdvancedSearchScreen({ navigation }: any) {
  const [filters, setFilters] = useState({
    searchText: '',
    category: '',
    type: '',
    tags: '',
    location: '',
  });
  const [dateRange, setDateRange] = useState({
    startDate: null as Date | null,
    endDate: null as Date | null,
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClear = () => {
    setFilters({
      searchText: '',
      category: '',
      type: '',
      tags: '',
      location: '',
    });
    setDateRange({
      startDate: null,
      endDate: null,
    });
  };

  const handleSearch = async () => {
    setLoading(true);
    
    try {
      const searchQuery = filters.searchText || filters.tags || filters.location || 'all';
      const type = filters.type as 'lost' | 'found' | undefined;
      const category = filters.category || undefined;

      const { data, error } = await searchPosts(searchQuery, type, category);
      
      if (!error && data) {
        // Navigate to results screen with the data
        navigation.navigate('SearchResults', { 
          results: data,
          filters: filters,
          dateRange: dateRange
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    }
    
    setLoading(false);
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setDateRange(prev => ({ ...prev, startDate: selectedDate }));
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setDateRange(prev => ({ ...prev, endDate: selectedDate }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Advanced Search</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Search Text */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Keywords</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter keywords to search for..."
            value={filters.searchText}
            onChangeText={(text) => setFilters(prev => ({ ...prev, searchText: text }))}
          />
        </View>

        {/* Type Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Item Type</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={typeOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select type"
            value={filters.type}
            onChange={(item) => setFilters(prev => ({ ...prev, type: item.value }))}
          />
        </View>

        {/* Category Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={categories}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select category"
            value={filters.category}
            onChange={(item) => setFilters(prev => ({ ...prev, category: item.value }))}
          />
        </View>

        {/* Tags Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter tags separated by commas..."
            value={filters.tags}
            onChangeText={(text) => setFilters(prev => ({ ...prev, tags: text }))}
          />
        </View>

        {/* Location Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter location or area..."
            value={filters.location}
            onChangeText={(text) => setFilters(prev => ({ ...prev, location: text }))}
          />
        </View>

        {/* Date Range Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date Range</Text>
          <View style={styles.dateRangeContainer}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {dateRange.startDate ? dateRange.startDate.toLocaleDateString() : 'Start Date'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.dateSeparator}>to</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {dateRange.endDate ? dateRange.endDate.toLocaleDateString() : 'End Date'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.searchButton, loading && styles.disabledButton]} 
            onPress={handleSearch}
            disabled={loading}
          >
            <Text style={styles.searchButtonText}>
              {loading ? 'Searching...' : 'Show Results'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={dateRange.startDate || new Date()}
          mode="date"
          display="default"
          onChange={onStartDateChange}
          maximumDate={new Date()}
        />
      )}
      {showEndDatePicker && (
        <DateTimePicker
          value={dateRange.endDate || new Date()}
          mode="date"
          display="default"
          onChange={onEndDateChange}
          maximumDate={new Date()}
          minimumDate={dateRange.startDate || undefined}
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
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.white,
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 10,
    padding: 15,
    backgroundColor: Colors.white,
  },
  placeholderStyle: {
    fontSize: 16,
    color: Colors.gray,
  },
  selectedTextStyle: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 10,
    padding: 15,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  dateSeparator: {
    fontSize: 16,
    color: Colors.text.secondary,
    paddingHorizontal: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    padding: 20,
  },
  clearButton: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  searchButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.gray,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  bottomPadding: {
    height: 50,
  },
});