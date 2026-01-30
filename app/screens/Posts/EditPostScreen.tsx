import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DropDownPicker from 'react-native-dropdown-picker';
import { useAuth } from '../../context/AuthContext';
import { getPostById, updatePost } from '../../services/postService';
import { colors } from '../../constants/Colors';
import PrimaryButton from '../../components/ui/PrimaryButton';

export default function EditPostScreen({ route, navigation }: any) {
  const { postId } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [status, setStatus] = useState<'active' | 'claimed' | 'returned' | 'closed'>('active');

  const [open, setOpen] = useState(false);
  const [categories] = useState([
    { label: 'Electronics', value: 'electronics' },
    { label: 'Documents', value: 'documents' },
    { label: 'Accessories', value: 'accessories' },
    { label: 'Bags', value: 'bags' },
    { label: 'Keys', value: 'keys' },
    { label: 'Pets', value: 'pets' },
    { label: 'Others', value: 'others' },
  ]);

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusItems] = useState([
    { label: 'Active', value: 'active' },
    { label: 'Claimed', value: 'claimed' },
    { label: 'Returned', value: 'returned' },
    { label: 'Closed', value: 'closed' },
  ]);

  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    const { data, error } = await getPostById(postId);
    if (!error && data) {
      setTitle(data.title);
      setDescription(data.description || '');
      setCategory(data.category);
      setStatus(data.status);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setSaving(true);

    const { error } = await updatePost(postId, {
      title: title.trim(),
      description: description.trim(),
      category,
      status,
    });

    setSaving(false);

    if (error) {
      Alert.alert('Error', 'Failed to update post');
    } else {
      Alert.alert('Success', 'Post updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Edit Post</Text>
          <Text style={styles.subtitle}>Update your post details</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={[styles.input, focusedInput === 'title' && styles.inputFocused]}
              placeholder="Enter post title"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
              onFocus={() => setFocusedInput('title')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                focusedInput === 'description' && styles.inputFocused,
              ]}
              placeholder="Enter description"
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              onFocus={() => setFocusedInput('description')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          <View style={styles.dropdownBlock}>
            <Text style={styles.label}>Category</Text>
            <DropDownPicker
              open={open}
              value={category}
              items={categories}
              setOpen={setOpen}
              setValue={setCategory}
              placeholder="Select Category"
              placeholderStyle={{ color: colors.textMuted }}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              listMode="SCROLLVIEW"
            />
          </View>

          <View style={[styles.dropdownBlock, { zIndex: 999 }]}>
            <Text style={styles.label}>Status</Text>
            <DropDownPicker
              open={statusOpen}
              value={status}
              items={statusItems}
              setOpen={setStatusOpen}
              setValue={setStatus}
              placeholder="Select Status"
              placeholderStyle={{ color: colors.textMuted }}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              listMode="SCROLLVIEW"
            />
          </View>
        </View>

        <PrimaryButton
          title="Save Changes"
          onPress={handleSave}
          loading={saving}
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    fontSize: 15,
    color: colors.textPrimary,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  textArea: {
    height: 120,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  dropdownBlock: {
    marginBottom: 16,
    zIndex: 1000,
  },
  dropdown: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
    minHeight: 52,
  },
  dropdownContainer: {
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  submitButton: {
    marginTop: 18,
  },
});
