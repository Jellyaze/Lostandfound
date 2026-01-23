import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Colors } from '../../../constants/Colors';
import { OLONGAPO_CENTER, OLONGAPO_BOUNDS, isWithinOlongapo } from '../../../utils/mapHelpers';

interface MapCreatePostProps {
  navigation: any;
  route: any;
}

export default function MapCreatePost({ navigation, route }: MapCreatePostProps) {
  const { onLocationSelect } = route.params || {};
  const [region, setRegion] = useState({
    latitude: OLONGAPO_CENTER.latitude,
    longitude: OLONGAPO_CENTER.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    locationName: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      setLoading(true);
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      if (isWithinOlongapo(latitude, longitude)) {
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error getting location:', error);
    }
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    if (!isWithinOlongapo(latitude, longitude)) {
      Alert.alert('Invalid Location', 'Please select a location within Olongapo City');
      return;
    }

    try {
      const address = await Location.reverseGeocodeAsync({ latitude, longitude });
      let locationName = 'Olongapo City';
      
      if (address.length > 0) {
        const addr = address[0];
        locationName = `${addr.street || ''}, ${addr.city || 'Olongapo City'}, ${addr.region || 'Zambales'}`.trim();
      }

      setSelectedLocation({
        latitude,
        longitude,
        locationName,
      });
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setSelectedLocation({
        latitude,
        longitude,
        locationName: 'Olongapo City, Zambales',
      });
    }
  };

  const handleConfirm = () => {
    if (!selectedLocation) {
      Alert.alert('No Location Selected', 'Please tap on the map to select a location');
      return;
    }

    if (onLocationSelect) {
      onLocationSelect(selectedLocation);
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
        <TouchableOpacity onPress={getCurrentLocation}>
          <Text style={styles.locationButton}>📍</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          Tap on the map to select where the item was last seen within Olongapo City
        </Text>
      </View>

      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={region}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={false}
            maxZoomLevel={18}
            minZoomLevel={11}
          >
            {selectedLocation && (
              <Marker
                coordinate={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                }}
                title="Selected Location"
                description={selectedLocation.locationName}
                pinColor={Colors.primary}
              />
            )}
          </MapView>
        )}
      </View>

      {selectedLocation && (
        <View style={styles.selectedLocationContainer}>
          <Text style={styles.selectedLocationLabel}>Selected Location:</Text>
          <Text style={styles.selectedLocationText}>{selectedLocation.locationName}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.confirmButton, !selectedLocation && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={!selectedLocation}
        >
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
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
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  backButton: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  locationButton: {
    fontSize: 24,
  },
  instructionContainer: {
    backgroundColor: Colors.primaryLight,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.white,
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.lightGray,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedLocationContainer: {
    backgroundColor: Colors.white,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  selectedLocationLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  selectedLocationText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  buttonContainer: {
    padding: 16,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.lightGray,
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});