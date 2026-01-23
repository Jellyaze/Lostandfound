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
  getClaimReturnByPostId, 
  uploadReturnProof, 
  verifyReturnCode
} from '../../services/claimReturnService';
import { useAuth } from '../../context/AuthContext';

export default function ReturnScreen({ route, navigation }) {
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
    const result = await getClaimReturnByPostId(post.postId);
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
      Alert.alert('Error', 'Please upload proof of return');
      return;
    }

    setLoading(true);
    const result = await uploadReturnProof(claimReturn.claimReturnId, proofImage, user.uid);
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
      Alert.alert('Error', 'Please enter the return code');
      return;
    }

    setLoading(true);
    const result = await verifyReturnCode(post.postId, code);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Item returned successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('HomeTab') }
      ]);
    } else {
      Alert.alert('Error', result.error);
    }
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
        <Text style={styles.headerTitle}>Return Item</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Return: {post.title}</Text>

        {/* Return Code Display */}
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Return Code</Text>
          <Text style={styles.codeText}>{claimReturn.returnCode}</Text>
        </View>

        {/* Upload Proof */}
        <Text style={styles.sectionTitle}>Upload Proof of Return</Text>
        <TouchableOpacity onPress={pickImage} style={styles.photoContainer}>
          {proofImage || claimReturn.returnProof ? (
            <Image 
              source={{ uri: proofImage || claimReturn.returnProof }} 
              style={styles.photoPreview} 
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>+ Upload Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {proofImage && !claimReturn.returnProof && (
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
        {claimReturn.returnProof && !claimReturn.returnConfirmed && (
          <>
            <Text style={styles.sectionTitle}>Enter Return Code to Verify</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Return Code"
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
                <Text style={styles.verifyButtonText}>Verify & Complete Return</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {claimReturn.returnConfirmed && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>✓ Item Returned Successfully</Text>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Instructions:</Text>
          <Text style={styles.instructionText}>1. Upload a photo as proof of return</Text>
          <Text style={styles.instructionText}>2. Share the return code with the original owner</Text>
          <Text style={styles.instructionText}>3. Enter the code to verify and complete the return</Text>
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
    color: '#2196F3',
    letterSpacing: 4
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
    backgroundColor: '#2196F3',
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