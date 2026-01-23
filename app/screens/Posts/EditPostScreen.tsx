import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { useAuth } from '../../context/AuthContext';
import { getPostById, updatePost } from '../../services/postService';
import { Colors } from '../../constants/Colors';
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
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Edit Post</Text>

        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>Category</Text>
          <DropDownPicker
            open={open}
            value={category}
            items={categories}
            setOpen={setOpen}
            setValue={setCategory}
            placeholder="Select Category"
            style={styles.dropdown}
          />
        </View>

        <View style={[styles.dropdownContainer, { zIndex: 999 }]}>
          <Text style={styles.label}>Status</Text>
          <DropDownPicker
            open={statusOpen}
            value={status}
            items={statusItems}
            setOpen={setStatusOpen}
            setValue={setStatus}
            placeholder="Select Status"
            style={styles.dropdown}
          />
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
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: Colors.white,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdownContainer: {
    marginBottom: 15,
    zIndex: 1000,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.text.primary,
  },
  dropdown: {
    borderColor: Colors.border,
  },
  submitButton: {
    marginTop: 20,
  },
});