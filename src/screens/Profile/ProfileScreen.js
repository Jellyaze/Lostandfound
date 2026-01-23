import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserProfile } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const result = await getUserProfile(user.uid);
    setLoading(false);

    if (result.success) {
      setProfile(result.data);
    }
  };

  if (loading) {
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
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.settingsButton}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Photo */}
        <View style={styles.profilePhotoContainer}>
          <Image source={{ uri: profile?.profilePhoto }} style={styles.profilePhoto} />
          {profile?.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓</Text>
            </View>
          )}
        </View>

        {/* User Info */}
        <Text style={styles.name}>{profile?.name}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
        <View style={styles.labelBadge}>
          <Text style={styles.labelText}>{profile?.label}</Text>
        </View>

        {/* Info Cards */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Age</Text>
          <Text style={styles.infoValue}>{profile?.age}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Gender</Text>
          <Text style={styles.infoValue}>{profile?.gender}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Contact Number</Text>
          <Text style={styles.infoValue}>{profile?.contactNumber}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Account Status</Text>
          <Text style={[styles.infoValue, profile?.verified ? styles.verified : styles.pending]}>
            {profile?.verified ? 'Verified ✓' : 'Pending Verification'}
          </Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('EditProfile')}
          style={styles.actionButton}
        >
          <Text style={styles.actionButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('MyPosts')}
          style={styles.actionButton}
        >
          <Text style={styles.actionButtonText}>My Posts</Text>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white'
  },
  settingsButton: {
    fontSize: 24
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center'
  },
  profilePhotoContainer: {
    position: 'relative',
    marginBottom: 20
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#50A296'
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white'
  },
  verifiedText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15
  },
  labelBadge: {
    backgroundColor: '#50A296',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 30
  },
  labelText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
  infoCard: {
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15
  },
  infoLabel: {
    fontSize: 14,
    color: '#000000ff',
    marginBottom: 5
  },
  infoValue: {
    fontSize: 18,
    color: '#000000ff',
    fontWeight: '600'
  },
  verified: {
    color: '#4CAF50'
  },
  pending: {
    color: '#FF9800'
  },
  actionButton: {
    width: '100%',
    backgroundColor: '#50A296',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});