import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { createPost } from '../../services/postService';
import { Colors } from '../../constants/Colors';
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

    const { data, error } = await createPost(postData, images, user.id);

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imagesContainer}>
          <Text style={styles.label}>Images (Max 5)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => setImages(images.filter((_, i) => i !== index))}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
                <Text style={styles.addImageText}>+</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Type title here"
          value={title}
          onChangeText={setTitle}
        />

        <View style={styles.mapPreviewContainer}>
          <Text style={styles.label}>Location</Text>
          <TouchableOpacity style={styles.mapPreview} onPress={openMapSelector}>
            <Text style={styles.mapIcon}>📍</Text>
            <View style={styles.mapTextContainer}>
              <Text style={styles.mapTitle}>
                {locationName || 'Select location it was last seen within Olongapo'}
              </Text>
              <Text style={styles.mapSubtitle}>Tap to open map</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.currentLocationButton} onPress={getCurrentLocation}>
            <Text style={styles.currentLocationText}>Use Current Location</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.typeToggle}>
          <Text style={styles.label}>Choose which case:</Text>
          <View style={styles.toggleButtons}>
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

        <View style={styles.itemTypeToggle}>
          <Text style={styles.label}>Category Type:</Text>
          <View style={styles.toggleButtons}>
            <TouchableOpacity
              style={[styles.typeButton, itemType === 'item' && styles.typeButtonActive]}
              onPress={() => setItemType('item')}
            >
              <Text style={[styles.typeButtonText, itemType === 'item' && styles.typeButtonTextActive]}>
                Item
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, itemType === 'pet' && styles.typeButtonActive]}
              onPress={() => setItemType('pet')}
            >
              <Text style={[styles.typeButtonText, itemType === 'pet' && styles.typeButtonTextActive]}>
                Pet
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>Category:</Text>
          <DropDownPicker
            open={categoryOpen}
            value={category}
            items={categories}
            setOpen={setCategoryOpen}
            setValue={setCategory}
            placeholder="Select Categories"
            style={styles.dropdown}
          />
        </View>

        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeItem}>
            <Text style={styles.label}>Date:</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.dateTimeItem}>
            <Text style={styles.label}>Time:</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text>{date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>
            </TouchableOpacity>
          </View>
        </View>

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

        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            display="default"
            onChange={(event, selectedDate) => {
              setShowTimePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        <View style={styles.detailsContainer}>
          <Text style={styles.label}>Details</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Input description here"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.claimingMethodContainer}>
          <Text style={styles.label}>Claiming Method/s</Text>
          <View style={styles.toggleButtons}>
            <TouchableOpacity
              style={[styles.typeButton, claimingMethod === 'meetup' && styles.typeButtonActive]}
              onPress={() => setClaimingMethod('meetup')}
            >
              <Text style={[styles.typeButtonText, claimingMethod === 'meetup' && styles.typeButtonTextActive]}>
                Meet-up
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, claimingMethod === 'station' && styles.typeButtonActive]}
              onPress={() => setClaimingMethod('station')}
            >
              <Text style={[styles.typeButtonText, claimingMethod === 'station' && styles.typeButtonTextActive]}>
                Hand over to station
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tagsContainer}>
          <Text style={styles.label}>Tags</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Type any tag"
              onSubmitEditing={addTag}
            />
            <TouchableOpacity onPress={addTag} style={styles.addTagButton}>
              <Text style={styles.addTagText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tagsDisplay}>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  scrollContent: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
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
  imagesContainer: {
    marginBottom: 20,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.error,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontSize: 40,
    color: Colors.primary,
  },
  mapPreviewContainer: {
    marginBottom: 15,
  },
  mapPreview: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  mapIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  mapTextContainer: {
    flex: 1,
  },
  mapTitle: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  mapSubtitle: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  currentLocationButton: {
    backgroundColor: Colors.primaryLight,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  currentLocationText: {
    color: Colors.white,
    fontWeight: '600',
  },
  typeToggle: {
    marginBottom: 15,
  },
  itemTypeToggle: {
    marginBottom: 15,
  },
  toggleButtons: {
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
  dropdownContainer: {
    marginBottom: 15,
    zIndex: 1000,
  },
  dropdown: {
    borderColor: Colors.border,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  dateTimeItem: {
    flex: 1,
  },
  dateTimeButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: Colors.white,
  },
  detailsContainer: {
    marginBottom: 15,
  },
  claimingMethodContainer: {
    marginBottom: 15,
  },
  tagsContainer: {
    marginBottom: 15,
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
  tagsDisplay: {
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
  submitButton: {
    marginTop: 10,
  },
});