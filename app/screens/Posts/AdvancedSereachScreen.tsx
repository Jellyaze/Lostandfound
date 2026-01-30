import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DropDownPicker from 'react-native-dropdown-picker';
import { colors } from '../../constants/Colors';
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
          activeOpacity={0.7}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Advanced Search</Text>
          <Text style={styles.headerSubtitle}>Refine your results</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Type</Text>
          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'lost' && styles.typeButtonActiveLost]}
              onPress={() => setType('lost')}
              activeOpacity={0.85}
            >
              <Text style={[styles.typeButtonText, type === 'lost' && styles.typeButtonTextActive]}>
                Lost
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, type === 'found' && styles.typeButtonActiveFound]}
              onPress={() => setType('found')}
              activeOpacity={0.85}
            >
              <Text style={[styles.typeButtonText, type === 'found' && styles.typeButtonTextActive]}>
                Found
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
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
            placeholderStyle={{ color: colors.textMuted }}
            textStyle={styles.dropdownText}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tags</Text>

          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Add tag..."
              placeholderTextColor={colors.textMuted}
              onSubmitEditing={addTag}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={addTag} style={styles.addTagButton} activeOpacity={0.85}>
              <Text style={styles.addTagText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity onPress={() => removeTag(tag)} activeOpacity={0.7}>
                  <Text style={styles.removeTagText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
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
                placeholderStyle={{ color: colors.textMuted }}
                textStyle={styles.dropdownText}
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
                placeholderStyle={{ color: colors.textMuted }}
                textStyle={styles.dropdownText}
              />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TouchableOpacity style={styles.locationButton} activeOpacity={0.85}>
            <Text style={styles.locationButtonText}>Not Selected</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.clearButton} onPress={handleClear} activeOpacity={0.85}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>

          <PrimaryButton title="Show Results" onPress={handleShowResults} style={styles.showResultsButton} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '700',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },

  scrollContent: { padding: 16, paddingBottom: 30 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12,
  },

  typeToggle: { flexDirection: 'row', gap: 12 },
  typeButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  typeButtonActiveLost: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  typeButtonActiveFound: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  typeButtonText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 14,
  },
  typeButtonTextActive: { color: '#FFFFFF' },

  dropdown: {
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: colors.background,
    minHeight: 52,
  },
  dropdownContainer: {
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  dropdownText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  tagInputContainer: { flexDirection: 'row', alignItems: 'center' },
  tagInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginRight: 10,
    backgroundColor: colors.background,
    fontSize: 14,
    color: colors.textPrimary,
  },
  addTagButton: {
    width: 46,
    height: 46,
    backgroundColor: colors.primary,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addTagText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },

  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  tagText: { color: '#FFFFFF', marginRight: 8, fontWeight: '700', fontSize: 13 },
  removeTagText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },

  dateContainer: { flexDirection: 'row', gap: 12 },
  dateDropdown: { flex: 1 },
  dateLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },

  locationButton: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  locationButtonText: { color: colors.textMuted, fontWeight: '600' },

  buttonContainer: { flexDirection: 'row', gap: 12, marginTop: 6 },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  clearButtonText: { color: colors.primary, fontWeight: '800', fontSize: 14 },

  showResultsButton: { flex: 1 },
});
