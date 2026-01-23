import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

import {
  doc,
  getDoc,
  enableNetwork
} from 'firebase/firestore';

import { auth, db } from '../config/firebase';

// 🔴 FORCE FIRESTORE ONLINE (CRITICAL)
enableNetwork(db).catch(() => {});

// Email/Password Registration
export const registerWithEmail = async (email, password) => {
  try {
    const userCredential =
      await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Email/Password Login
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential =
      await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Google Sign In (React Native - requires additional setup)
export const signInWithGoogle = async () => {
  try {
    // Note: Google Sign-In in React Native requires @react-native-google-signin/google-signin
    // and proper configuration in Firebase Console and app.json
    // For now, return an error message directing users to email/password login
    return { 
      success: false, 
      error: 'Google Sign-In requires additional native configuration. Please use email/password registration or contact support.' 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Facebook Sign In (React Native - requires additional setup)
export const signInWithFacebook = async () => {
  try {
    // Note: Facebook Sign-In in React Native requires react-native-fbsdk-next
    // and proper configuration in Firebase Console and app.json
    return { 
      success: false, 
      error: 'Facebook Sign-In requires additional native configuration. Please use email/password registration or contact support.' 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Apple Sign In (React Native - requires additional setup)
export const signInWithApple = async () => {
  try {
    // Note: Apple Sign-In in React Native requires @invertase/react-native-apple-authentication
    // and proper configuration in Firebase Console and app.json (iOS only)
    return { 
      success: false, 
      error: 'Apple Sign-In requires additional native configuration. Please use email/password registration or contact support.' 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Logout
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Auth State Observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Check if user profile is complete
export const checkUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        exists: true,
        verified: data.verified || false,
        profileComplete: !!(
          data.name &&
          data.age &&
          data.gender &&
          data.contactNumber
        )
      };
    }

    return { exists: false, verified: false, profileComplete: false };
  } catch (error) {
    console.error('Error checking user profile:', error);
    return { exists: false, verified: false, profileComplete: false };
  }
};