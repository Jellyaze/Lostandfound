import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../constants/Colors';

interface SearchBarProps {
  isLost: boolean;
  isSearching: boolean;
  setIsSearching: (value: boolean) => void;
  searchText: string;
  setSearchText: (value: string) => void;
  navigation: any;
}

export default function SearchBar({
  isLost,
  isSearching,
  setIsSearching,
  searchText,
  setSearchText,
  navigation
}: SearchBarProps) {
  return (
    <View style={styles.searchContainer}>
      {isSearching ? (
        <View style={styles.searchBar}>
          <View style={styles.searchLabel}>
            <Text style={styles.searchLabelText}>{isLost ? 'Lost' : 'Found'}</Text>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
          <TouchableOpacity
            onPress={() => { setIsSearching(false); setSearchText(''); }}
            style={styles.cancelButton}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.searchButtonContainer}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setIsSearching(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.advancedSearchButton}
            onPress={() => navigation.navigate('AdvancedSearch')}
            activeOpacity={0.8}
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
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  searchButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  searchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.textPrimary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  advancedSearchButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.primary,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  advancedSearchText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchLabel: {
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  searchLabelText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: colors.textPrimary,
  },
  cancelButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
  },
  cancelText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
});
