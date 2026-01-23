import React, { useState } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Image, TouchableHighlight, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from "expo-image-picker";
import DropDownPicker from 'react-native-dropdown-picker';
import { useAuth } from '../../context/AuthContext';
import { uploadImage } from '../../services/authService';
import { Colors } from '../../constants/Colors';
import { validateEmail, validatePassword, validatePhoneNumber, validateRequired } from '../../utils/validation';

export default function RegisterScreen({ navigation }: any) {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [frontIdImage, setFrontIdImage] = useState<string | null>(null);
  const [backIdImage, setBackIdImage] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [items, setItems] = useState([
    {label: 'Student', value: 'Student'},
    {label: 'Civilian', value: 'Civilian'},
    {label: 'Blue-collar', value: 'Blue-collar'},
    {label: 'White-collar', value: 'White-collar'},
    {label: 'Official', value: 'Official'}
  ]);

  const [open2, setOpen2] = useState(false);
  const [value2, setValue2] = useState<string | null>(null);
  const [items2, setItems2] = useState([
    {label: 'Male', value: 'Male'},
    {label: 'Female', value: 'Female'},
    {label: 'Other', value: 'Other'}
  ]);

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const numMo = (text: string) => {
    const numericValue = text.replace(/[^0-9-]/g, ''); 
    setContactNumber(numericValue);
  };

  const pickImage = async (setImage: (uri: string) => void) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Permission to access gallery is required!");
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
    if (!validateRequired(fullName)) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      Alert.alert('Error', passwordValidation.message || 'Invalid password');
      return;
    }

    if (!value) {
      Alert.alert('Error', 'Please select your label');
      return;
    }

    if (!age || parseInt(age) < 1) {
      Alert.alert('Error', 'Please enter a valid age');
      return;
    }

    if (!value2) {
      Alert.alert('Error', 'Please select your gender');
      return;
    }

    if (!validatePhoneNumber(contactNumber)) {
      Alert.alert('Error', 'Please enter a valid contact number');
      return;
    }

    if (!profileImage || !frontIdImage || !backIdImage) {
      Alert.alert('Error', 'Please upload all required images (profile, front ID, back ID)');
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await signUp(email, password, {
        full_name: fullName,
        label: value,
        age: parseInt(age),
        gender: value2,
        contact_number: contactNumber,
        profile_image_url: '',
        front_id_image_url: '',
        back_id_image_url: '',
      });

      if (signUpError) {
        throw signUpError;
      }

      Alert.alert(
        'Success', 
        'Account created successfully! Please check your email to verify your account.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.una}>Create Profile</Text>

      <View style={styles.circle}>
        <Image
         source={
         profileImage
          ? { uri: profileImage }
          : require("../../assets/proflogo.png")
        }
        style={styles.image}
        />
      </View>

      <TouchableHighlight onPress={() => pickImage(setProfileImage)} underlayColor={Colors.primaryLight}>
       <View style={styles.addp}>
        <Text>Add photo</Text>
       </View>
      </TouchableHighlight>

      <View style={styles.bastalabel}>
        <Text style={styles.labeltxt}>Email</Text>
        <TextInput
          style={styles.input}
          onChangeText={setEmail}
          value={email}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.labeltxt}>Password</Text>
        <TextInput
          style={styles.input}
          onChangeText={setPassword}
          value={password}
          placeholder="Password (min 6 characters)"
          secureTextEntry
        />

        <Text style={styles.labeltxt}>Label</Text>
        <View style={styles.dpb}>
        <DropDownPicker style={styles.dp1}
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={setValue}
          setItems={setItems}
          listMode="SCROLLVIEW"
          placeholder="Select"
        /></View>

        <Text style={styles.labeltxt}>Name</Text>
        <TextInput
        style={styles.input}
        onChangeText={setFullName}
        value={fullName}
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
            onChangeText={setAge}
            value={age}
            placeholder="Age"
          />
          </View>
        <View style={styles.agItem}>
          <DropDownPicker style={styles.dpSmall}
        open={open2}
        value={value2}
        items={items2}
        setOpen={setOpen2}
        setValue={setValue2}
        setItems={setItems2}
        listMode="SCROLLVIEW"
        placeholder="Select"
        />
        </View>
        </View>

        <Text style={styles.labeltxt}>Contact no.</Text>
        <TextInput
        style={styles.input}
        keyboardType="numeric"
        onChangeText={numMo}
        value={contactNumber}
        placeholder="Contact no."
        />

        <View style={styles.idencss}>
          <View style={styles.idenitem}>
            <Text style={styles.identxt}>Front ID</Text>
            <Image
             source={
             frontIdImage
              ? { uri: frontIdImage }
              : require("../../assets/idenlogo.png")
            }
            style={styles.idenp}
            />
            <TouchableHighlight onPress={() => pickImage(setFrontIdImage)} underlayColor={Colors.primaryLight}>
             <View style={styles.addp}>
              <Text>Add photo</Text>
             </View>
            </TouchableHighlight>
          </View>
          <View style={styles.idenitem}>
            <Text style={styles.identxt}>Back ID</Text>
            <Image
            source={
             backIdImage
             ? { uri: backIdImage }
             : require("../../assets/idenlogo.png")
            }
            style={styles.idenp}
            />
            <TouchableHighlight onPress={() => pickImage(setBackIdImage)} underlayColor={Colors.primaryLight}>
             <View style={styles.addp}>
              <Text>Add photo</Text>
             </View>
            </TouchableHighlight>
          </View>
        </View>

     </View>

     <View>
      <TouchableHighlight 
        onPress={handleRegister} 
        underlayColor={Colors.primaryLight}
        disabled={loading}
      >
        <View style={styles.createbtn}>
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.createbtnText}>CREATE ACCOUNT</Text>
          )}
        </View>
      </TouchableHighlight>
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
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  una: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  circle: {
    marginTop: 10,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    overflow: "hidden",
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: "cover",
  },
  addp: {
    alignItems: 'center',
    width: 120,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 5,
    padding: 5,
    marginTop: 5,
  },
  bastalabel: {
    backgroundColor: Colors.primary,
    width: 340,
    borderRadius: 5,
    marginTop: 20,
    paddingBottom: 20,
  },
  labeltxt: {
    marginTop: 5,
    marginLeft: 30,
    color: Colors.white,
  },
  dp1: {
    width: '100%',
    zIndex: 2000
  },
  dpb: {
    width: 280,
    alignSelf: 'center',
  },
  input: {
    height: 50,
    borderColor: Colors.black,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    width: 280,
    backgroundColor: Colors.white,
    alignSelf: 'center',
  },
  aggentxt: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: 280,
    gap: 95,
    marginLeft: 30,
  },
  aggen: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignSelf: 'center', 
    width: 280,
    marginTop: 10,
  },
  agItem: {
    width: '48%',
  },
  inputSmall: {
    height: 50,
    borderColor: Colors.black,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    width: '100%',
    backgroundColor: Colors.white,
  },
  dpSmall: {
    width: '100%',
    height: 40,
    zIndex: 1000
  },
  idencss: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    width: 280,
    backgroundColor: Colors.white,
    borderRadius: 5,
    marginTop: 10,
  },
  idenp: {
    height: 190,
    width: 120,
    resizeMode: "cover"
  },
  identxt: {
    alignSelf: 'center',
  },
  idenitem: {
    margin: 10,
  },
  createbtn: {
    height: 50,
    width: 300,
    marginTop: 30,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createbtnText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});