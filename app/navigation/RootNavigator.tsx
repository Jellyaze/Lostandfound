import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { supabase } from '../config/supabase';
import RegisterScreen from '../screens/Auth/RegisterScreen';

const Stack = createNativeStackNavigator<any>();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  const [profileLoading, setProfileLoading] = useState(false);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setNeedsProfileSetup(false);
        return;
      }

      setProfileLoading(true);

      const { data, error } = await supabase
        .from('app_d56ee_profiles')
        .select('id, full_name, label, age, gender, contact_number')
        .eq('id', user.id)
        .maybeSingle();

      if (error || !data) {
        setNeedsProfileSetup(true);
        setProfileLoading(false);
        return;
      }

      const incomplete =
        !data.full_name ||
        !data.label ||
        !data.age ||
        !data.gender ||
        !data.contact_number;

      setNeedsProfileSetup(incomplete);
      setProfileLoading(false);
    };

    checkProfile();
  }, [user]);

  if (loading || profileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator id="Root" screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : needsProfileSetup ? (
          <Stack.Screen name="ProfileSetup" component={RegisterScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
