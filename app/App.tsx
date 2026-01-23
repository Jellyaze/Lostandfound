import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../app/context/AuthContext';
import RootNavigator from '../app/navigation/RootNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}