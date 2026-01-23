import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { createUserProfile, uploadProfilePhoto, uploadIDDocument } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

export default function ProfileSetupScreen() {
  const { user, setUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [contactNumber, setContactNumber] = useState('');
  const [label, setLabel] = useState('Student');
  
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);

  const pickImage = async (type) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'profile' ? [1, 1] : [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      switch (type) {
        case 'profile':
          setProfilePhoto(result.assets[0].uri);
          break;
        case 'idFront':
          setIdFront(result.assets[0].uri);
          break;
        case 'idBack':
          setIdBack(result.assets[0].uri);
          break;
      }
    }
  };

  const handleSubmit = async () => {
    if (!name || !age || !contactNumber) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!profilePhoto || !idFront || !idBack) {
      Alert.alert('Error', 'Please upload profile photo and both sides of your ID');
      return;
    }

    setLoading(true);

    try {
      // Upload images
      const profileResult = await uploadProfilePhoto(user.uid, profilePhoto);
      const idFrontResult = await uploadIDDocument(user.uid, idFront, 'front');
      const idBackResult = await uploadIDDocument(user.uid, idBack, 'back');

      if (!profileResult.success || !idFrontResult.success || !idBackResult.success) {
        throw new Error('Failed to upload images');
      }

      // Create profile
      const profileData = {
        email: user.email,
        name,
        age: parseInt(age),
        gender,
        contactNumber,
        label,
        profilePhoto: profileResult.url,
        idFront: idFrontResult.url,
        idBack: idBackResult.url
      };

      const result = await createUserProfile(user.uid, profileData);

      if (result.success) {
        setUserProfile({
          exists: true,
          verified: false,
          profileComplete: true
        });
        Alert.alert('Success', 'Profile created! Your account will be verified shortly.');
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>We need some information to verify your account</Text>

        {/* Profile Photo */}
        <TouchableOpacity onPress={() => pickImage('profile')} style={styles.photoContainer}>
          {profilePhoto ? (
            <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>Upload Profile Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Form Fields */}
        <TextInput
          style={styles.input}
          placeholder="Full Name *"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Age *"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={gender}
            onValueChange={setGender}
            style={styles.picker}
          >
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Contact Number *"
          value={contactNumber}
          onChangeText={setContactNumber}
          keyboardType="phone-pad"
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={label}
            onValueChange={setLabel}
            style={styles.picker}
          >
            <Picker.Item label="Student" value="Student" />
            <Picker.Item label="Civilian" value="Civilian" />
            <Picker.Item label="Blue-collar" value="Blue-collar" />
            <Picker.Item label="White-collar" value="White-collar" />
            <Picker.Item label="Official" value="Official" />
          </Picker>
        </View>

        {/* ID Upload */}
        <Text style={styles.sectionTitle}>Upload Identification</Text>
        
        <TouchableOpacity onPress={() => pickImage('idFront')} style={styles.idContainer}>
          {idFront ? (
            <Image source={{ uri: idFront }} style={styles.idImage} />
          ) : (
            <View style={styles.idPlaceholder}>
              <Text style={styles.idPlaceholderText}>Front ID</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => pickImage('idBack')} style={styles.idContainer}>
          {idBack ? (
            <Image source={{ uri: idBack }} style={styles.idImage} />
          ) : (
            <View style={styles.idPlaceholder}>
              <Text style={styles.idPlaceholderText}>Back ID</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleSubmit} 
          style={styles.button}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>SUBMIT</Text>
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
  scrollContent: {
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#50A296',
    textAlign: 'center',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30
  },
  photoContainer: {
    alignSelf: 'center',
    marginBottom: 20
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#50A296'
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#50A296',
    borderStyle: 'dashed'
  },
  photoPlaceholderText: {
    color: '#50A296',
    textAlign: 'center',
    fontSize: 12
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden'
  },
  picker: {
    height: 50
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#50A296',
    marginTop: 10,
    marginBottom: 15
  },
  idContainer: {
    marginBottom: 15
  },
  idImage: {
    width: '100%',
    height: 200,
    borderRadius: 10
  },
  idPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#50A296',
    borderStyle: 'dashed'
  },
  idPlaceholderText: {
    color: '#50A296',
    fontSize: 16
  },
  button: {
    backgroundColor: '#50A296',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});