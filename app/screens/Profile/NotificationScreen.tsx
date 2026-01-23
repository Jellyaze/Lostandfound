import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

export default function NotificationSettingsScreen({ navigation }: any) {
  const [messageEmail, setMessageEmail] = useState(true);
  const [messagePhone, setMessagePhone] = useState(true);
  const [postsEmail, setPostsEmail] = useState(true);
  const [postsPhone, setPostsPhone] = useState(false);
  const [claimEmail, setClaimEmail] = useState(true);
  const [claimPhone, setClaimPhone] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message notifications</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>On Email</Text>
            <Switch
              value={messageEmail}
              onValueChange={setMessageEmail}
              trackColor={{ false: Colors.lightGray, true: Colors.primaryLight }}
              thumbColor={messageEmail ? Colors.primary : Colors.gray}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>On Phone</Text>
            <Switch
              value={messagePhone}
              onValueChange={setMessagePhone}
              trackColor={{ false: Colors.lightGray, true: Colors.primaryLight }}
              thumbColor={messagePhone ? Colors.primary : Colors.gray}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Relevant Posts</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>On Email</Text>
            <Switch
              value={postsEmail}
              onValueChange={setPostsEmail}
              trackColor={{ false: Colors.lightGray, true: Colors.primaryLight }}
              thumbColor={postsEmail ? Colors.primary : Colors.gray}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>On Phone</Text>
            <Switch
              value={postsPhone}
              onValueChange={setPostsPhone}
              trackColor={{ false: Colors.lightGray, true: Colors.primaryLight }}
              thumbColor={postsPhone ? Colors.primary : Colors.gray}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Return / Claim Confirmation</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>On Email</Text>
            <Switch
              value={claimEmail}
              onValueChange={setClaimEmail}
              trackColor={{ false: Colors.lightGray, true: Colors.primaryLight }}
              thumbColor={claimEmail ? Colors.primary : Colors.gray}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>On Phone</Text>
            <Switch
              value={claimPhone}
              onValueChange={setClaimPhone}
              trackColor={{ false: Colors.lightGray, true: Colors.primaryLight }}
              thumbColor={claimPhone ? Colors.primary : Colors.gray}
            />
          </View>
        </View>
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  settingLabel: {
    fontSize: 14,
    color: Colors.text.primary,
  },
});