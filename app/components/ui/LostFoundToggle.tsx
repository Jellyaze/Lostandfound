import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

interface LostFoundToggleProps {
  isLost: boolean;
  setIsLost: (value: boolean) => void;
}

export default function LostFoundToggle({ isLost, setIsLost }: LostFoundToggleProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isLost && styles.activeButton]}
        onPress={() => setIsLost(true)}
      >
        <Text style={[styles.buttonText, isLost && styles.activeText]}>Lost</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, !isLost && styles.activeButton]}
        onPress={() => setIsLost(false)}
      >
        <Text style={[styles.buttonText, !isLost && styles.activeText]}>Found</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  activeText: {
    color: Colors.white,
  },
});