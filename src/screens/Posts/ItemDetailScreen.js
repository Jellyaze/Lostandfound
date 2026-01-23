import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { createOrGetChat } from '../../services/messageService';
import { getUserProfile } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

export default function ItemDetailScreen({ route, navigation }) {
  const { post } = route.params;
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const result = await getUserProfile(user.uid);
    if (result.success) {
      setUserProfile(result.data);
    }
  };

  const handleContact = async () => {
    if (!userProfile) {
      Alert.alert('Error', 'Please complete your profile first');
      return;
    }

    if (post.userId === user.uid) {
      Alert.alert('Info', 'This is your own post');
      return;
    }

    try {
      const result = await createOrGetChat(
        user.uid,
        post.userId,
        userProfile.name,
        post.userName,
        userProfile.profilePhoto,
        post.userPhoto
      );

      if (result.success) {
        navigation.navigate('Chat', { 
          chatId: result.chatId,
          otherUserName: post.userName,
          otherUserPhoto: post.userPhoto
        });
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start chat');
    }
  };

  const handleClaim = () => {
    if (post.status !== 'Active') {
      Alert.alert('Info', `This item is already ${post.status.toLowerCase()}`);
      return;
    }
    navigation.navigate('Claim', { post });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Item Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Item Image */}
        <Image source={{ uri: post.photo }} style={styles.itemImage} />

        {/* Status Badge */}
        <View style={[styles.statusBadge, 
          post.status === 'Active' && styles.statusActive,
          post.status === 'Claimed' && styles.statusClaimed,
          post.status === 'Returned' && styles.statusReturned
        ]}>
          <Text style={styles.statusText}>{post.status}</Text>
        </View>

        {/* Title & Category */}
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.category}>{post.category} • {post.caseType}</Text>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{post.description}</Text>
        </View>

        {/* Date & Time */}
        <View style={styles.infoRow}>
          <Image source={require('../../../app/assets/datelogo.png')} style={styles.icon} />
          <Text style={styles.infoText}>{post.date} at {post.time}</Text>
        </View>

        {/* Location */}
        <View style={styles.infoRow}>
          <Image source={require('../../../app/assets/loclogo.png')} style={styles.icon} />
          <Text style={styles.infoText}>{post.location}</Text>
        </View>

        {/* Map */}
        {post.coordinates && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: post.coordinates.latitude,
                longitude: post.coordinates.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: post.coordinates.latitude,
                  longitude: post.coordinates.longitude,
                }}
                title={post.title}
              />
            </MapView>
          </View>
        )}

        {/* Found/Lost By */}
        <View style={styles.userSection}>
          <Image source={{ uri: post.userPhoto }} style={styles.userPhoto} />
          <View style={styles.userInfo}>
            <Text style={styles.userLabel}>{post.caseType === 'Lost' ? 'Lost by' : 'Found by'}</Text>
            <Text style={styles.userName}>{post.userName}</Text>
          </View>
        </View>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {post.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Claiming Methods */}
        {post.claimingMethods && post.claimingMethods.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Claiming Methods</Text>
            {post.claimingMethods.map((method, index) => (
              <Text key={index} style={styles.claimingMethod}>• {method}</Text>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        {post.userId !== user.uid && (
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={handleContact} style={styles.contactButton}>
              <Text style={styles.contactButtonText}>Contact</Text>
            </TouchableOpacity>
            {post.caseType === 'Found' && post.status === 'Active' && (
              <TouchableOpacity onPress={handleClaim} style={styles.claimButton}>
                <Text style={styles.claimButtonText}>Claim Item</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
    paddingBottom: 40
  },
  itemImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0'
  },
  statusBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20
  },
  statusActive: {
    backgroundColor: '#4CAF50'
  },
  statusClaimed: {
    backgroundColor: '#FF9800'
  },
  statusReturned: {
    backgroundColor: '#2196F3'
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    padding: 20,
    paddingBottom: 5
  },
  category: {
    fontSize: 16,
    color: '#50A296',
    paddingHorizontal: 20,
    marginBottom: 20
  },
  section: {
    padding: 20,
    paddingTop: 10
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: '#666'
  },
  infoText: {
    fontSize: 16,
    color: '#666'
  },
  mapContainer: {
    height: 200,
    margin: 20,
    borderRadius: 10,
    overflow: 'hidden'
  },
  map: {
    flex: 1
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20
  },
  userPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15
  },
  userInfo: {
    flex: 1
  },
  userLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 2
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  tag: {
    backgroundColor: '#50A296',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8
  },
  tagText: {
    color: 'white',
    fontSize: 14
  },
  claimingMethod: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#50A296',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  claimButton: {
    flex: 1,
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  claimButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});