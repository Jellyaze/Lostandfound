import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

interface SearchBarProps {
  isLost: boolean;
  isSearching: boolean;
  setIsSearching: (value: boolean) => void;
  searchText: string;
  setSearchText: (value: string) => void;
  navigation: any;
}

export default function SearchBar({ isLost, isSearching, setIsSearching, searchText, setSearchText, navigation }: SearchBarProps) {
  return (
    <View style={styles.searchContainer}>
      {isSearching ? (
        <View style={styles.searchBar}>
          <Text style={styles.searchLabel}>{isLost ? 'Lost' : 'Found'}</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
          <TouchableOpacity
            onPress={() => { setIsSearching(false); setSearchText(''); }}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.searchButtonContainer}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setIsSearching(true)}
          >
            <Text style={styles.searchButtonText}>🔍 Search</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.advancedSearchButton}
            onPress={() => navigation.navigate('AdvancedSearch')}
          >
            <Text style={styles.advancedSearchText}>Advanced</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: { 
    marginBottom: 10, 
    paddingTop: 20, 
    paddingLeft: 20,
    paddingRight: 20 
  },
  searchButtonContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  searchButton: {
    flex: 1,
    padding: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  searchButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
  },
  advancedSearchButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  advancedSearchText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 10,
    backgroundColor: Colors.white,
  },
  searchLabel: {  
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    padding: 3,
    paddingLeft: 10,
    paddingRight: 10,
    color: Colors.white,
  },
  searchInput: { 
    flex: 1, 
    height: 40 
  },
  cancelText: {
    marginLeft: 10,
    color: Colors.primary,
  },
});