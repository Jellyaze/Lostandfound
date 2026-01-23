import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableHighlight,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { registerWithEmail } from '../../services/authService';
import { createUserProfile, uploadProfilePhoto, uploadIDDocument } from '../../services/userService';

export default function RegisterScreen({ navigation }) {
  const [profileImage, setProfileImage] = useState(null);
  const [frontIdImage, setFrontIdImage] = useState(null);
  const [backIdImage, setBackIdImage] = useState(null);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: 'Civilian', value: 'Civilian' },
    { label: 'Blue-collar', value: 'Blue-collar' },
    { label: 'White-collar', value: 'White-collar' },
    { label: 'Official', value: 'Official' },
  ]);

  const [open2, setOpen2] = useState(false);
  const [value2, setValue2] = useState(null);
  const [items2, setItems2] = useState([
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
  ]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async (setImage) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please grant permission to access photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    // Validation
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (!name || !age || !contact || !value || !value2) {
      Alert.alert('Error', 'Please fill in all profile information');
      return;
    }

    if (!frontIdImage || !backIdImage) {
      Alert.alert('Error', 'Please upload both front and back ID photos');
      return;
    }

    setLoading(true);

    try {
      // 1. Register user with email/password
      const authResult = await registerWithEmail(email, password);
      
      if (!authResult.success) {
        Alert.alert('Registration Failed', authResult.error);
        setLoading(false);
        return;
      }

      const userId = authResult.user.uid;

      // 2. Upload profile photo if provided
      let profilePhotoURL = null;
      if (profileImage) {
        const photoResult = await uploadProfilePhoto(userId, profileImage);
        if (photoResult.success) {
          profilePhotoURL = photoResult.url;
        }
      }

      // 3. Upload ID documents
      const frontIdResult = await uploadIDDocument(userId, frontIdImage, 'front');
      const backIdResult = await uploadIDDocument(userId, backIdImage, 'back');

      if (!frontIdResult.success || !backIdResult.success) {
        Alert.alert('Warning', 'ID upload failed, but account was created. Please update your ID later.');
      }

      // 4. Create user profile
      const profileData = {
        email,
        name,
        age: parseInt(age),
        gender: value2,
        contactNumber: contact,
        label: value,
        profilePhoto: profilePhotoURL,
        idFront: frontIdResult.url,
        idBack: backIdResult.url,
        profileComplete: true,
      };

      const profileResult = await createUserProfile(userId, profileData);

      if (!profileResult.success) {
        Alert.alert('Warning', 'Profile creation failed. Please complete your profile later.');
      }

      setLoading(false);
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);

    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Registration failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Create Account</Text>

        {/* Email and Password Section */}
        <View style={styles.authSection}>
          <Text style={styles.sectionTitle}>Account Credentials</Text>
          
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password (min 6 characters)"
            secureTextEntry
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm Password"
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        {/* Profile Section */}
        <Text style={styles.sectionTitle}>Profile Information</Text>

        <View style={styles.circle}>
          <Image
            source={
              profileImage
                ? { uri: profileImage }
                : require('../../../app/assets/proflogo.png')
            }
            style={styles.image}
          />
        </View>

        <TouchableHighlight
          onPress={() => pickImage(setProfileImage)}
          underlayColor="#58b1a3"
        >
          <View style={styles.addp}>
            <Text>Add photo (optional)</Text>
          </View>
        </TouchableHighlight>

        <View style={styles.bastalabel}>
          <Text style={styles.labeltxt}>Label</Text>
          <View style={styles.dpb}>
            <DropDownPicker
              open={open}
              value={value}
              items={items}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setItems}
              placeholder="Select"
              listMode="SCROLLVIEW"
            />
          </View>

          <Text style={styles.labeltxt}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Full Name"
          />

          <View style={styles.aggentxt}>
            <Text style={styles.labeltxt}>Age</Text>
            <Text style={styles.labeltxt}>Gender</Text>
          </View>

          <View style={styles.aggen}>
            <View style={styles.agItem}>
              <TextInput
                style={styles.inputSmall}
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
                placeholder="Age"
              />
            </View>

            <View style={styles.agItem}>
              <DropDownPicker
                open={open2}
                value={value2}
                items={items2}
                setOpen={setOpen2}
                setValue={setValue2}
                setItems={setItems2}
                placeholder="Select"
                listMode="SCROLLVIEW"
              />
            </View>
          </View>

          <Text style={styles.labeltxt}>Contact no.</Text>
          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            value={contact}
            onChangeText={setContact}
            placeholder="Contact Number"
          />

          <Text style={styles.labeltxt}>ID Verification (Required)</Text>
          <View style={styles.idencss}>
            <View style={styles.idenitem}>
              <Text style={styles.identxt}>Front</Text>
              <Image
                source={
                  frontIdImage
                    ? { uri: frontIdImage }
                    : require('../../../app/assets/idenlogo.png')
                }
                style={styles.idenp}
              />
              <TouchableHighlight
                onPress={() => pickImage(setFrontIdImage)}
                underlayColor="#58b1a3"
              >
                <View style={styles.addp}>
                  <Text>Add photo</Text>
                </View>
              </TouchableHighlight>
            </View>

            <View style={styles.idenitem}>
              <Text style={styles.identxt}>Back</Text>
              <Image
                source={
                  backIdImage
                    ? { uri: backIdImage }
                    : require('../../../app/assets/idenlogo.png')
                }
                style={styles.idenp}
              />
              <TouchableHighlight
                onPress={() => pickImage(setBackIdImage)}
                underlayColor="#58b1a3"
              >
                <View style={styles.addp}>
                  <Text>Add photo</Text>
                </View>
              </TouchableHighlight>
            </View>
          </View>
        </View>

        <TouchableHighlight
          onPress={handleRegister}
          underlayColor="#45927f"
          style={styles.registerButton}
          disabled={loading}
        >
          <View style={styles.registerButtonInner}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.registerButtonText}>CREATE ACCOUNT</Text>
            )}
          </View>
        </TouchableHighlight>

        <TouchableHighlight
          onPress={() => navigation.navigate('Login')}
          underlayColor="transparent"
        >
          <Text style={styles.loginLink}>Already have an account? Login</Text>
        </TouchableHighlight>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D0E1D7' },
  scrollContent: { alignItems: 'center', paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 10 },
  authSection: {
    width: 340,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  circle: {
    marginTop: 10,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#50A296',
    overflow: 'hidden',
    marginBottom: 10,
  },
  image: { width: '100%', height: '100%' },
  addp: {
    alignItems: 'center',
    width: 150,
    borderWidth: 2,
    borderColor: '#50A296',
    borderRadius: 5,
    padding: 5,
    marginTop: 5,
  },
  bastalabel: {
    backgroundColor: '#50A296',
    width: 340,
    borderRadius: 10,
    marginTop: 20,
    padding: 15,
  },
  labeltxt: { marginTop: 10, marginLeft: 15, color: '#fff', fontWeight: '500' },
  dpb: { width: 310, alignSelf: 'center', marginTop: 5 },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    width: 310,
    backgroundColor: '#fff',
    alignSelf: 'center',
    marginTop: 5,
    borderColor: '#ddd',
  },
  aggentxt: {
    flexDirection: 'row',
    width: 310,
    justifyContent: 'space-between',
    alignSelf: 'center',
  },
  aggen: {
    flexDirection: 'row',
    width: 310,
    justifyContent: 'space-between',
    alignSelf: 'center',
    marginTop: 5,
  },
  agItem: { width: '48%' },
  inputSmall: {
    height: 50,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  idencss: {
    flexDirection: 'row',
    width: 310,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'center',
    padding: 10,
  },
  idenitem: { alignItems: 'center' },
  idenp: { height: 140, width: 110, marginVertical: 10, borderRadius: 5 },
  identxt: { fontWeight: 'bold', fontSize: 14 },
  registerButton: {
    width: 340,
    backgroundColor: '#50A296',
    borderRadius: 10,
    marginTop: 30,
    overflow: 'hidden',
  },
  registerButtonInner: {
    padding: 15,
    alignItems: 'center',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    color: '#50A296',
    fontSize: 14,
    marginTop: 15,
    textDecorationLine: 'underline',
  },
});