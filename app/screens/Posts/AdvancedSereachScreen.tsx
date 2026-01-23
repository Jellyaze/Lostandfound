import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DropDownPicker from 'react-native-dropdown-picker';
import { Colors } from '../../constants/Colors';
import PrimaryButton from '../../components/ui/PrimaryButton';

export default function AdvancedSearchScreen({ navigation }: any) {
  const [type, setType] = useState<'lost' | 'found'>('lost');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [categories] = useState([
    { label: 'Device', value: 'device' },
    { label: 'Clothing', value: 'clothing' },
    { label: 'Accessory', value: 'accessory' },
    { label: 'Bag', value: 'bag' },
    { label: 'Wallet', value: 'wallet' },
    { label: 'Vehicle', value: 'vehicle' },
    { label: 'Pet', value: 'pet' },
  ]);

  const [monthOpen, setMonthOpen] = useState(false);
  const [month, setMonth] = useState<string | null>(null);
  const [months] = useState([
    { label: 'January', value: '01' },
    { label: 'February', value: '02' },
    { label: 'March', value: '03' },
    { label: 'April', value: '04' },
    { label: 'May', value: '05' },
    { label: 'June', value: '06' },
    { label: 'July', value: '07' },
    { label: 'August', value: '08' },
    { label: 'September', value: '09' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
  ]);

  const [yearOpen, setYearOpen] = useState(false);
  const [year, setYear] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();
  const [years] = useState(
    Array.from({ length: 5 }, (_, i) => ({
      label: (currentYear - i).toString(),
      value: (currentYear - i).toString(),
    }))
  );

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleClear = () => {
    setType('lost');
    setCategory(null);
    setTags([]);
    setMonth(null);
    setYear(null);
  };

  const handleShowResults = () => {
    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    navigation.navigate('Home', {
      searchFilters: {
        type,
        category,
        tags,
        month,
        year,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Advanced Search</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type</Text>
          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'lost' && styles.typeButtonActive]}
              onPress={() => setType('lost')}
            >
              <Text style={[styles.typeButtonText, type === 'lost' && styles.typeButtonTextActive]}>
                Lost
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, type === 'found' && styles.typeButtonActive]}
              onPress={() => setType('found')}
            >
              <Text style={[styles.typeButtonText, type === 'found' && styles.typeButtonTextActive]}>
                Found
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <DropDownPicker
            open={categoryOpen}
            value={category}
            items={categories}
            setOpen={setCategoryOpen}
            setValue={setCategory}
            placeholder="Select Category"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Add tag..."
              onSubmitEditing={addTag}
            />
            <TouchableOpacity onPress={addTag} style={styles.addTagButton}>
              <Text style={styles.addTagText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity onPress={() => removeTag(tag)}>
                  <Text style={styles.removeTagText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>
          <View style={styles.dateContainer}>
            <View style={styles.dateDropdown}>
              <Text style={styles.dateLabel}>Month</Text>
              <DropDownPicker
                open={monthOpen}
                value={month}
                items={months}
                setOpen={setMonthOpen}
                setValue={setMonth}
                placeholder="Month"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />
            </View>
            <View style={styles.dateDropdown}>
              <Text style={styles.dateLabel}>Year</Text>
              <DropDownPicker
                open={yearOpen}
                value={year}
                items={years}
                setOpen={setYearOpen}
                setValue={setYear}
                placeholder="Year"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TouchableOpacity style={styles.locationButton}>
            <Text style={styles.locationButtonText}>Not Selected</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
          <PrimaryButton
            title="Show Results"
            onPress={handleShowResults}
            style={styles.showResultsButton}
          />
        </View>
      </ScrollView>
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
  closeButton: {
    fontSize: 24,
    color: Colors.text.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  typeToggle: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
  },
  typeButtonText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  typeButtonTextActive: {
    color: Colors.white,
  },
  dropdown: {
    borderColor: Colors.border,
  },
  dropdownContainer: {
    borderColor: Colors.border,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    backgroundColor: Colors.white,
  },
  addTagButton: {
    width: 44,
    height: 44,
    backgroundColor: Colors.primary,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  tagText: {
    color: Colors.white,
    marginRight: 8,
  },
  removeTagText: {
    color: Colors.white,
    fontSize: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  dateDropdown: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  locationButton: {
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  locationButtonText: {
    color: Colors.text.secondary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  clearButton: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  showResultsButton: {
    flex: 1,
  },
});