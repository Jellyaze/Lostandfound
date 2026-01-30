import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import PrimaryButton from '../../components/ui/PrimaryButton';

export default function CreateProfileScreen({ navigation }: any) {
  const auth = useAuth() as any;
  const { user, updateProfile } = auth;
  const [loading, setLoading] = useState(false);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [idFrontImage, setIdFrontImage] = useState<string | null>(null);
  const [idBackImage, setIdBackImage] = useState<string | null>(null);

  const [labelOpen, setLabelOpen] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [labelItems] = useState([
    { label: 'Student', value: 'Student' },
    { label: 'Civilian', value: 'Civilian' },
    { label: 'Blue-collar', value: 'Blue-collar' },
    { label: 'White-collar', value: 'White-collar' },
    { label: 'Official', value: 'Official' },
  ]);

  const [genderOpen, setGenderOpen] = useState(false);
  const [gender, setGender] = useState<string | null>(null);
  const [genderItems] = useState([
    { label: 'Female', value: 'Female' },
    { label: 'Male', value: 'Male' },
    { label: 'Prefer not to say', value: 'Prefer not to say' },
    { label: 'Other', value: 'Other' },
  ]);

  const pickProfileImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Permission to access gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const pickIdImage = async (type: 'front' | 'back') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Permission to access gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled) {
      if (type === 'front') {
        setIdFrontImage(result.assets[0].uri);
      } else {
        setIdBackImage(result.assets[0].uri);
      }
    }
  };

  const handleCreate = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!label) {
      Alert.alert('Error', 'Please select your label/role');
      return;
    }

    if (!age || parseInt(age) < 1) {
      Alert.alert('Error', 'Please enter a valid age');
      return;
    }

    if (!gender) {
      Alert.alert('Error', 'Please select your gender');
      return;
    }

    if (!contactNumber.trim()) {
      Alert.alert('Error', 'Please enter your contact number');
      return;
    }

    setLoading(true);

    const { error } = await updateProfile({
      full_name: fullName.trim(),
      label,
      age: parseInt(age),
      gender,
      contact_number: contactNumber.trim(),
      profile_image_url: profileImage,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to create profile');
    } else {
      Alert.alert('Success', 'Profile created successfully!', [
        { text: 'OK', onPress: () => navigation.replace('HomeTabs') }
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={pickProfileImage} style={styles.profileImageContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImagePlaceholderText}>Add photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Label</Text>
          <View style={styles.dropdownWrapper}>
            <DropDownPicker
              listMode="MODAL"
              open={labelOpen}
              value={label}
              items={labelItems}
              setOpen={setLabelOpen}
              setValue={setLabel}
              placeholder="Select"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              zIndex={3000}
              zIndexInverse={1000}
            />
          </View>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="name"
          />

          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="age"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.dropdownWrapper}>
            <DropDownPicker
              listMode="MODAL"
              open={genderOpen}
              value={gender}
              items={genderItems}
              setOpen={setGenderOpen}
              setValue={setGender}
              placeholder="Select"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              zIndex={2000}
              zIndexInverse={2000}
            />
          </View>

          <Text style={styles.label}>Contact no.</Text>
          <TextInput
            style={styles.input}
            value={contactNumber}
            onChangeText={setContactNumber}
            placeholder="contact"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Identification</Text>
          <View style={styles.idImagesContainer}>
            <View style={styles.idImageWrapper}>
              <Text style={styles.idLabel}>Front</Text>
              <TouchableOpacity onPress={() => pickIdImage('front')} style={styles.idImageBox}>
                {idFrontImage ? (
                  <Image source={{ uri: idFrontImage }} style={styles.idImage} />
                ) : (
                  <Text style={styles.idImagePlaceholder}>Add photo</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.idImageWrapper}>
              <Text style={styles.idLabel}>Back</Text>
              <TouchableOpacity onPress={() => pickIdImage('back')} style={styles.idImageBox}>
                {idBackImage ? (
                  <Image source={{ uri: idBackImage }} style={styles.idImage} />
                ) : (
                  <Text style={styles.idImagePlaceholder}>Add photo</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <PrimaryButton
            title="Create"
            onPress={handleCreate}
            loading={loading}
            style={styles.createButton}
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
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  scrollContent: {
    padding: 20,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 30,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  profileImagePlaceholderText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: Colors.white,
  },
  dropdownWrapper: {
    marginBottom: 10,
  },
  dropdown: {
    borderColor: Colors.border,
  },
  dropdownContainer: {
    borderColor: Colors.border,
  },
  idImagesContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
  },
  idImageWrapper: {
    flex: 1,
  },
  idLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  idImageBox: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
  },
  idImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  idImagePlaceholder: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  createButton: {
    marginTop: 30,
  },
});
