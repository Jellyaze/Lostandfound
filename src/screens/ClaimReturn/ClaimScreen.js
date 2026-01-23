import React, { useState, useEffect } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import { 
  createClaimReturn, 
  getClaimReturnByPostId, 
  uploadClaimProof, 
  verifyClaimCode,
  regenerateCodes
} from '../../services/claimReturnService';
import { useAuth } from '../../context/AuthContext';

export default function ClaimScreen({ route, navigation }) {
  const { post } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [claimReturn, setClaimReturn] = useState(null);
  const [proofImage, setProofImage] = useState(null);
  const [code, setCode] = useState('');

  useEffect(() => {
    loadClaimReturn();
  }, []);

  const loadClaimReturn = async () => {
    let result = await getClaimReturnByPostId(post.postId);
    
    if (!result.success) {
      // Create new claim/return record
      const createResult = await createClaimReturn(post.postId);
      if (createResult.success) {
        result = await getClaimReturnByPostId(post.postId);
      }
    }

    if (result.success) {
      setClaimReturn(result.data);
    }
  };

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
      setProofImage(result.assets[0].uri);
    }
  };

  const handleUploadProof = async () => {
    if (!proofImage) {
      Alert.alert('Error', 'Please upload proof of claim');
      return;
    }

    setLoading(true);
    const result = await uploadClaimProof(claimReturn.claimReturnId, proofImage, user.uid);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Proof uploaded successfully');
      loadClaimReturn();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      Alert.alert('Error', 'Please enter the claim code');
      return;
    }

    setLoading(true);
    const result = await verifyClaimCode(post.postId, code);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Item claimed successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('HomeTab') }
      ]);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleRegenerateCodes = async () => {
    Alert.alert(
      'Regenerate Codes',
      'Are you sure you want to regenerate the claim and return codes?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          onPress: async () => {
            setLoading(true);
            const result = await regenerateCodes(post.postId);
            setLoading(false);

            if (result.success) {
              Alert.alert('Success', 'Codes regenerated successfully');
              loadClaimReturn();
            } else {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  if (!claimReturn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#50A296" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Claim Item</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Claim: {post.title}</Text>

        {/* Claim Code Display */}
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Claim Code</Text>
          <Text style={styles.codeText}>{claimReturn.claimCode}</Text>
          <TouchableOpacity onPress={handleRegenerateCodes} style={styles.regenerateButton}>
            <Text style={styles.regenerateButtonText}>Regenerate Codes</Text>
          </TouchableOpacity>
        </View>

        {/* Upload Proof */}
        <Text style={styles.sectionTitle}>Upload Proof of Claim</Text>
        <TouchableOpacity onPress={pickImage} style={styles.photoContainer}>
          {proofImage || claimReturn.claimProof ? (
            <Image 
              source={{ uri: proofImage || claimReturn.claimProof }} 
              style={styles.photoPreview} 
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>+ Upload Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {proofImage && !claimReturn.claimProof && (
          <TouchableOpacity 
            onPress={handleUploadProof} 
            style={styles.uploadButton}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.uploadButtonText}>Upload Proof</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Verify Code */}
        {claimReturn.claimProof && !claimReturn.claimConfirmed && (
          <>
            <Text style={styles.sectionTitle}>Enter Claim Code to Verify</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Claim Code"
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity 
              onPress={handleVerifyCode} 
              style={styles.verifyButton}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify & Claim</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {claimReturn.claimConfirmed && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>✓ Item Claimed Successfully</Text>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Instructions:</Text>
          <Text style={styles.instructionText}>1. Upload a photo as proof of claim</Text>
          <Text style={styles.instructionText}>2. Share the claim code with the item owner</Text>
          <Text style={styles.instructionText}>3. Enter the code to verify and complete the claim</Text>
          <Text style={styles.instructionText}>4. Codes expire after 24 hours</Text>
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20
  },
  codeContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center'
  },
  codeLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10
  },
  codeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#50A296',
    letterSpacing: 4,
    marginBottom: 15
  },
  regenerateButton: {
    padding: 10
  },
  regenerateButtonText: {
    color: '#50A296',
    fontSize: 14,
    textDecorationLine: 'underline'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15
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
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 2
  },
  uploadButton: {
    backgroundColor: '#50A296',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  verifyButton: {
    backgroundColor: '#FF9800',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  successContainer: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20
  },
  successText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  instructionsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20
  }
});