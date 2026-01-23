import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { createPost } from '../../services/postService';
import { getUserProfile } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

export default function PostItemScreen({ navigation }) {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [photo, setPhoto] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [caseType, setCaseType] = useState('Lost');
  const [category, setCategory] = useState('Device');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [claimingMethods, setClaimingMethods] = useState([]);
  const [tags, setTags] = useState('');

  const categories = ['Device', 'Clothing', 'Accessory', 'Bag', 'Wallet', 'Vehicle', 'Pet'];
  const claimingMethodOptions = ['Meet-up', 'Hand over to station', 'Barangay'];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const pickLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need location permissions');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;

      // Olongapo City bounds (approximate)
      const olongapoBounds = {
        minLat: 14.7,
        maxLat: 14.9,
        minLng: 120.2,
        maxLng: 120.4
      };

      if (
        latitude < olongapoBounds.minLat || latitude > olongapoBounds.maxLat ||
        longitude < olongapoBounds.minLng || longitude > olongapoBounds.maxLng
      ) {
        Alert.alert('Location Error', 'Location must be within Olongapo City');
        return;
      }

      setCoordinates({ latitude, longitude });
      
      // Reverse geocoding
      const address = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address.length > 0) {
        const locationString = `${address[0].street || ''}, ${address[0].city || 'Olongapo City'}`;
        setLocation(locationString);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const toggleClaimingMethod = (method) => {
    if (claimingMethods.includes(method)) {
      setClaimingMethods(claimingMethods.filter(m => m !== method));
    } else {
      setClaimingMethods([...claimingMethods, method]);
    }
  };

  const handleSubmit = async () => {
    if (!userProfile?.verified) {
      Alert.alert('Verification Required', 'Your account must be verified before posting');
      return;
    }

    if (!photo || !title || !description || !location || claimingMethods.length === 0) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const userProfileData = await getUserProfile(user.uid);
      if (!userProfileData.success) {
        throw new Error('Failed to get user profile');
      }

      const postData = {
        title,
        description,
        caseType,
        category,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        location,
        coordinates,
        claimingMethods,
        date: date.toLocaleDateString(),
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      const result = await createPost(
        postData,
        photo,
        user.uid,
        userProfileData.data.name,
        userProfileData.data.profilePhoto
      );

      if (result.success) {
        Alert.alert('Success', 'Post created successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('HomeTab') }
        ]);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Photo Upload */}
        <TouchableOpacity onPress={pickImage} style={styles.photoContainer}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>+ Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Title */}
        <TextInput
          style={styles.input}
          placeholder="Title *"
          value={title}
          onChangeText={setTitle}
        />

        {/* Description */}
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description *"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        {/* Case Type */}
        <Text style={styles.label}>Case Type *</Text>
        <View style={styles.caseTypeContainer}>
          <TouchableOpacity
            style={[styles.caseTypeButton, caseType === 'Lost' && styles.caseTypeButtonActive]}
            onPress={() => setCaseType('Lost')}
          >
            <Text style={[styles.caseTypeText, caseType === 'Lost' && styles.caseTypeTextActive]}>Lost</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.caseTypeButton, caseType === 'Found' && styles.caseTypeButtonActive]}
            onPress={() => setCaseType('Found')}
          >
            <Text style={[styles.caseTypeText, caseType === 'Found' && styles.caseTypeTextActive]}>Found</Text>
          </TouchableOpacity>
        </View>

        {/* Category */}
        <Text style={styles.label}>Category *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={setCategory}
            style={styles.picker}
          >
            {categories.map(cat => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>

        {/* Date & Time */}
        <Text style={styles.label}>Date & Time *</Text>
        <View style={styles.dateTimeContainer}>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateTimeButton}>
            <Text>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.dateTimeButton}>
            <Text>{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
          </TouchableOpacity>
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
            value={time}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) setTime(selectedTime);
            }}
          />
        )}

        {/* Location */}
        <Text style={styles.label}>Location *</Text>
        <TouchableOpacity onPress={pickLocation} style={styles.locationButton}>
          <Text style={styles.locationButtonText}>
            {location || 'Pick Location (Olongapo City only)'}
          </Text>
        </TouchableOpacity>

        {/* Claiming Methods */}
        <Text style={styles.label}>Claiming Method *</Text>
        {claimingMethodOptions.map(method => (
          <TouchableOpacity
            key={method}
            style={styles.checkboxContainer}
            onPress={() => toggleClaimingMethod(method)}
          >
            <View style={[styles.checkbox, claimingMethods.includes(method) && styles.checkboxChecked]}>
              {claimingMethods.includes(method) && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>{method}</Text>
          </TouchableOpacity>
        ))}

        {/* Tags */}
        <TextInput
          style={styles.input}
          placeholder="Tags (comma separated)"
          value={tags}
          onChangeText={setTags}
        />

        {/* Submit Button */}
        <TouchableOpacity 
          onPress={handleSubmit} 
          style={styles.submitButton}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>POST</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  photoContainer: {
    marginBottom: 20
  },
  photoPreview: {
    width: '100%',
    height: 250,
    borderRadius: 10
  },
  photoPlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#50A296',
    borderStyle: 'dashed'
  },
  photoPlaceholderText: {
    color: '#50A296',
    fontSize: 18,
    fontWeight: 'bold'
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
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
  dateTimeContainer: {
    flexDirection: 'row',
    marginBottom: 20
  },
  dateTimeButton: {
    flex: 1,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center'
  },
  locationButton: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center'
  },
  locationButtonText: {
    color: '#50A296',
    fontSize: 16
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#50A296',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxChecked: {
    backgroundColor: '#50A296'
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333'
  },
  submitButton: {
    backgroundColor: '#50A296',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  }
});