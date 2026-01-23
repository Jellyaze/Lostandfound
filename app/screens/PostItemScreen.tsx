import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

export default function PostItemScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>What would you like to post?</Text>
        
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📢</Text>
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Report Lost or Found Item</Text>
            <Text style={styles.optionDescription}>
              Create a post about an item you've lost or found
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Tips for posting:</Text>
            <Text style={styles.infoText}>• Add clear photos of the item</Text>
            <Text style={styles.infoText}>• Provide accurate location details</Text>
            <Text style={styles.infoText}>• Include date and time</Text>
            <Text style={styles.infoText}>• Add relevant tags for better visibility</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Image source={require('../assets/homelogo.png')} style={styles.footerIcon}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('PostItem')}>
            <Image source={require('../assets/storyplogo.png')} style={styles.footerIcon}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Messages')}>
            <Image source={require('../assets/messlogo.png')} style={styles.footerIcon}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image source={require('../assets/taologo.png')} style={styles.footerIcon}/>
          </TouchableOpacity>
        </View>
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
    padding: 20,
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
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 30,
    textAlign: 'center',
  },
  optionCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    fontSize: 32,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  arrow: {
    fontSize: 28,
    color: Colors.text.secondary,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  infoIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: Colors.white,
    marginBottom: 5,
  },
  footer: {
    height: 60,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    justifyContent: 'center',
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerIcon: {
    height: 30,
    width: 30,
  },
});