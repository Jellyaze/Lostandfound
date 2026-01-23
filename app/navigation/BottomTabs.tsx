import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet } from 'react-native';
import HomeScreen from '../screens/Home/HomeScreen';
import MyPostsScreen from '../screens/Posts/MyPostsScreen';
import MessageListScreen from '../screens/Messaging/MessageListScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import { BottomTabParamList } from './types';
import { Colors } from '../constants/Colors';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      id="BottomTabs"
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../assets/homelogo.png')}
              style={[styles.icon, focused && styles.iconFocused]}
            />
          ),
        }}
      />
      <Tab.Screen
        name="MyPosts"
        component={MyPostsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../assets/storyplogo.png')}
              style={[styles.icon, focused && styles.iconFocused]}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessageListScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../assets/messlogo.png')}
              style={[styles.icon, focused && styles.iconFocused]}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../assets/taologo.png')}
              style={[styles.icon, focused && styles.iconFocused]}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    paddingBottom: 5,
  },
  icon: {
    width: 30,
    height: 30,
  },
  iconFocused: {
    tintColor: Colors.primary,
  },
});