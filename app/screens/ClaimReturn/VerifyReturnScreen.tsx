import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/Colors';
import PrimaryButton from '../../components/ui/PrimaryButton';

export default function VerifyReturnScreen({ route, navigation }: any) {
  const { claimId } = route.params;
  const [returnCode, setReturnCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [timer, setTimer] = useState(300);

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

  const handleVerify = () => {
    if (returnCode.length !== 4) {
      Alert.alert('Error', 'Please enter the 4-digit return code');
      return;
    }

    if (returnCode !== generatedCode) {
      Alert.alert('Error', 'Invalid code. Please check and try again.');
      return;
    }

    Alert.alert('Success', 'Return verified successfully!', [
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
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Return</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.noteContainer}>
          <Text style={styles.noteIcon}>📌</Text>
          <Text style={styles.noteText}>
            Type the generated claim code to verify the return of the item.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type the Generated Claim Code</Text>
          <View style={styles.codeInputContainer}>
            <TextInput
              style={styles.codeInput}
              value={returnCode}
              onChangeText={(text) => setReturnCode(text.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="numeric"
              maxLength={4}
              placeholder="0000"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity onPress={() => setReturnCode('')} activeOpacity={0.7}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Generated Return Code</Text>
          <View style={styles.generatedCodeContainer}>
            <Text style={styles.generatedCode}>{generatedCode}</Text>
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>Time remaining: {formatTime(timer)}</Text>
              <TouchableOpacity onPress={generateCode} activeOpacity={0.7}>
                <Text style={styles.regenerateButton}>Regenerate Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <PrimaryButton
          title="Verify"
          onPress={handleVerify}
          style={styles.verifyButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primarySoft,
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
    lineHeight: 18,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 14,
  },
  codeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 10,
    marginRight: 10,
    backgroundColor: colors.background,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  clearButton: {
    color: colors.accent,
    fontWeight: '700',
  },
  generatedCodeContainer: {
    alignItems: 'center',
  },
  generatedCode: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 10,
    marginBottom: 12,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
    fontWeight: '500',
  },
  regenerateButton: {
    color: colors.primary,
    fontWeight: '700',
  },
  verifyButton: {
    marginTop: 8,
  },
});
