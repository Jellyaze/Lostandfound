import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { createPost } from '../../services/postService';
import { colors, Colors } from '../../constants/Colors';
import { isWithinOlongapo, OLONGAPO_CENTER } from '../../utils/mapHelpers';
import PrimaryButton from '../../components/ui/PrimaryButton';

export default function CreatePostScreen({ navigation }: any) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [type, setType] = useState<'lost' | 'found'>('lost');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState<number>(OLONGAPO_CENTER.latitude);
  const [longitude, setLongitude] = useState<number>(OLONGAPO_CENTER.longitude);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [claimingMethod, setClaimingMethod] = useState<'meetup' | 'station'>('meetup');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [itemType, setItemType] = useState<'item' | 'pet'>('item');

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categories] = useState([
    { label: 'Device', value: 'device' },
    { label: 'Clothing', value: 'clothing' },
    { label: 'Accessory', value: 'accessory' },
    { label: 'Bag', value: 'bag' },
    { label: 'Wallet', value: 'wallet' },
    { label: 'Vehicle', value: 'vehicle' },
    { label: 'Pet', value: 'pet' },
  ]);

  const pickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Permission to access gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages([...images, ...newImages].slice(0, 5));
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude: lat, longitude: lng } = location.coords;

      if (!isWithinOlongapo(lat, lng)) {
        Alert.alert('Location Error', 'You must be in Olongapo City to use current location');
        return;
      }

      setLatitude(lat);
      setLongitude(lng);

      const address = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (address.length > 0) {
        const addr = address[0];
        setLocationName(`${addr.street || ''}, ${addr.city || 'Olongapo City'}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const openMapSelector = () => {
    navigation.navigate('MapCreatePost', {
      onLocationSelect: (location: { latitude: number; longitude: number; locationName: string }) => {
        setLatitude(location.latitude);
        setLongitude(location.longitude);
        setLocationName(location.locationName);
      },
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!locationName.trim()) {
      Alert.alert('Error', 'Please select a location on the map');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Error', 'Please add at least one image');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a post');
      return;
    }

    setLoading(true);

    const postData = {
      user_id: user.id,
      type,
      title: title.trim(),
      description: description.trim(),
      category,
      location_name: locationName.trim(),
      latitude,
      longitude,
      date_lost_found: date.toISOString(),
      status: 'active' as const,
    };

    const { error } = await createPost(postData, images, user.id);

    setLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } else {
      Alert.alert('Success', 'Post created successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('HomeTabs') }
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Text style={styles.headerButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Create Post</Text>
          <Text style={styles.headerSubtitle}>Share a lost/found report</Text>
        </View>

        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Images</Text>
          <Text style={styles.sectionHint}>Max 5 photos</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imagesRow}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => setImages(images.filter((_, i) => i !== index))}
                  activeOpacity={0.8}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}

            {images.length < 5 && (
              <TouchableOpacity style={styles.addImageButton} onPress={pickImages} activeOpacity={0.8}>
                <Text style={styles.addImageText}>+</Text>
                <Text style={styles.addImageLabel}>Add</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Type title here"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Location</Text>
          <TouchableOpacity style={styles.mapPreview} onPress={openMapSelector} activeOpacity={0.85}>
            <Text style={styles.mapIcon}>📍</Text>
            <View style={styles.mapTextContainer}>
              <Text style={styles.mapTitle} numberOfLines={2}>
                {locationName || 'Select location it was last seen within Olongapo'}
              </Text>
              <Text style={styles.mapSubtitle}>Tap to open map</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.currentLocationButton} onPress={getCurrentLocation} activeOpacity={0.85}>
            <Text style={styles.currentLocationText}>Use Current Location</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Details</Text>

          <Text style={styles.label}>Choose which case</Text>
          <View style={styles.toggleButtons}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'lost' && styles.typeButtonActive]}
              onPress={() => setType('lost')}
              activeOpacity={0.85}
            >
              <Text style={[styles.typeButtonText, type === 'lost' && styles.typeButtonTextActive]}>Lost</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, type === 'found' && styles.typeButtonActive]}
              onPress={() => setType('found')}
              activeOpacity={0.85}
            >
              <Text style={[styles.typeButtonText, type === 'found' && styles.typeButtonTextActive]}>Found</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Category Type</Text>
          <View style={styles.toggleButtons}>
            <TouchableOpacity
              style={[styles.typeButton, itemType === 'item' && styles.typeButtonActive]}
              onPress={() => setItemType('item')}
              activeOpacity={0.85}
            >
              <Text style={[styles.typeButtonText, itemType === 'item' && styles.typeButtonTextActive]}>Item</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, itemType === 'pet' && styles.typeButtonActive]}
              onPress={() => setItemType('pet')}
              activeOpacity={0.85}
            >
              <Text style={[styles.typeButtonText, itemType === 'pet' && styles.typeButtonTextActive]}>Pet</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dropdownContainer}>
            <Text style={styles.label}>Category</Text>
            <DropDownPicker
              open={categoryOpen}
              value={category}
              items={categories}
              setOpen={setCategoryOpen}
              setValue={setCategory}
              placeholder="Select category"
              placeholderStyle={{ color: colors.textMuted }}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownList}
            />
          </View>

          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeItem}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowDatePicker(true)} activeOpacity={0.85}>
                <Text style={styles.dateTimeText}>
                  {date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateTimeItem}>
              <Text style={styles.label}>Time</Text>
              <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowTimePicker(true)} activeOpacity={0.85}>
                <Text style={styles.dateTimeText}>
                  {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(_, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              display="default"
              onChange={(_, selectedDate) => {
                setShowTimePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Input description here"
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Claiming Method/s</Text>
          <View style={styles.toggleButtons}>
            <TouchableOpacity
              style={[styles.typeButton, claimingMethod === 'meetup' && styles.typeButtonActive]}
              onPress={() => setClaimingMethod('meetup')}
              activeOpacity={0.85}
            >
              <Text style={[styles.typeButtonText, claimingMethod === 'meetup' && styles.typeButtonTextActive]}>
                Meet-up
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, claimingMethod === 'station' && styles.typeButtonActive]}
              onPress={() => setClaimingMethod('station')}
              activeOpacity={0.85}
            >
              <Text style={[styles.typeButtonText, claimingMethod === 'station' && styles.typeButtonTextActive]}>
                Hand over to station
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Tags</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Type any tag"
              placeholderTextColor={colors.textMuted}
              onSubmitEditing={addTag}
            />
            <TouchableOpacity onPress={addTag} style={styles.addTagButton} activeOpacity={0.85}>
              <Text style={styles.addTagText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tagsDisplay}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity onPress={() => removeTag(tag)} activeOpacity={0.8}>
                  <Text style={styles.removeTagText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <PrimaryButton
          title="POST"
          onPress={handleSubmit}
          loading={loading}
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '700',
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 12,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 10,
  },

  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    backgroundColor: colors.background,
    fontSize: 15,
    color: colors.textPrimary,
  },
  textArea: {
    height: 110,
    textAlignVertical: 'top',
  },

  imagesContainer: {
    marginBottom: 0,
  },
  imagesRow: {
    paddingTop: 6,
    paddingBottom: 2,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 14,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.danger,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 16,
  },
  addImageButton: {
    width: 110,
    height: 110,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  addImageText: {
    fontSize: 36,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: -2,
  },
  addImageLabel: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },

  mapPreview: {
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  mapIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  mapTextContainer: {
    flex: 1,
  },
  mapTitle: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 4,
    fontWeight: '600',
  },
  mapSubtitle: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  currentLocationButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
  },
  currentLocationText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  toggleButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
  },
  typeButtonText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 14,
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },

  dropdownContainer: {
    marginTop: 8,
    zIndex: 1000,
  },
  dropdown: {
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: colors.background,
    minHeight: 52,
  },
  dropdownList: {
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: 12,
  },

  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  dateTimeItem: {
    flex: 1,
  },
  dateTimeButton: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.background,
  },
  dateTimeText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },

  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 2,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginRight: 10,
    backgroundColor: colors.background,
    fontSize: 15,
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
  },
  addTagText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },

  tagsDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginRight: 8,
  },
  removeTagText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '800',
  },

  submitButton: {
    marginTop: 6,
  },
});
