import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/Colors';
import PrimaryButton from '../../components/ui/PrimaryButton';

export default function ConfirmClaimScreen({ route, navigation }: any) {
  const { postId, claimId } = route.params;
  const [claimImage, setClaimImage] = useState<string | null>(null);
  const [claimCode, setClaimCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes

  useEffect(() => {
    generateCode();
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const generateCode = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);
    setTimer(300);
  };

  const pickImage = async () => {
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
      setClaimImage(result.assets[0].uri);
    }
  };

  const handleComplete = () => {
    if (!claimImage) {
      Alert.alert('Error', 'Please upload an image of the item');
      return;
    }

    if (claimCode.length !== 4) {
      Alert.alert('Error', 'Please enter the 4-digit code');
      return;
    }

    if (claimCode !== generatedCode) {
      Alert.alert('Error', 'Invalid code. Please check and try again.');
      return;
    }

    Alert.alert('Success', 'Claim confirmed successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Claim</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.noteContainer}>
          <Text style={styles.noteIcon}>📌</Text>
          <Text style={styles.noteText}>
            Upload a clear photo of the item and enter the generated code to confirm your claim.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Image</Text>
          <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
            {claimImage ? (
              <Image source={{ uri: claimImage }} style={styles.uploadedImage} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadIcon}>+</Text>
                <Text style={styles.uploadText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enter 4-Digit Code</Text>
          <View style={styles.codeInputContainer}>
            <TextInput
              style={styles.codeInput}
              value={claimCode}
              onChangeText={(text) => setClaimCode(text.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="numeric"
              maxLength={4}
              placeholder="0000"
            />
            <TouchableOpacity onPress={() => setClaimCode('')}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Generated Code</Text>
          <View style={styles.generatedCodeContainer}>
            <Text style={styles.generatedCode}>{generatedCode}</Text>
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>Time remaining: {formatTime(timer)}</Text>
              <TouchableOpacity onPress={generateCode}>
                <Text style={styles.regenerateButton}>Regenerate Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <PrimaryButton
          title="Complete"
          onPress={handleComplete}
          style={styles.completeButton}
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
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  noteIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: Colors.white,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 15,
  },
  imageUpload: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  uploadIcon: {
    fontSize: 40,
    color: Colors.primary,
  },
  uploadText: {
    fontSize: 16,
    color: Colors.primary,
    marginTop: 10,
  },
  codeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 15,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 10,
    marginRight: 10,
  },
  clearButton: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  generatedCodeContainer: {
    alignItems: 'center',
  },
  generatedCode: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 10,
    marginBottom: 15,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 10,
  },
  regenerateButton: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  completeButton: {
    marginTop: 10,
  },
});