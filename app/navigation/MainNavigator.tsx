import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import CreatePostScreen from '../screens/Posts/CreatePostScreen';
import EditPostScreen from '../screens/Posts/EditPostScreen';
import ViewPostScreen from '../screens/Posts/ViewPostScreen';
import ChatScreen from '../screens/Messaging/ChatScreen';
import ConfirmClaimScreen from '../screens/ClaimReturn/ConfirmClaimScreen';
import VerifyReturnScreen from '../screens/ClaimReturn/VerifyReturnScreen';
import ProfileDetailsScreen from '../screens/Profile/ProfileDetailsScreen';
import NotificationSettingsScreen from '../screens/Profile/NotificationScreen';
import SettingsScreen from '../screens/Profile/SettingsScreen';
import MapCreatePost from '../screens/Posts/Maps/MapCreatePost';
import MapViewPost from '../screens/Posts/Maps/MapViewPost';
import AdvancedSearchScreen from '../screens/Search/AdvancedSearchScreen';
import SearchResultsScreen from '../screens/Search/SearchResultsScreen';
import { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainNavigator() {
  return (
    <Stack.Navigator id="MainNavigator" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeTabs" component={BottomTabs} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="EditPost" component={EditPostScreen} />
      <Stack.Screen name="ViewPost" component={ViewPostScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="ConfirmClaim" component={ConfirmClaimScreen} />
      <Stack.Screen name="VerifyReturn" component={VerifyReturnScreen} />
      <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="MapCreatePost" component={MapCreatePost} />
      <Stack.Screen name="MapViewPost" component={MapViewPost} />
      <Stack.Screen name="AdvancedSearch" component={AdvancedSearchScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
    </Stack.Navigator>
  );
}