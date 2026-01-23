import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import {
  initializeFirestore,
  CACHE_SIZE_UNLIMITED
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAou-nMvj4Awjf6L-SXPwE9bAdJJniu5VE",
  authDomain: "lostandfound-d124f.firebaseapp.com",
  projectId: "lostandfound-d124f",
  storageBucket: "lostandfound-d124f.appspot.com",
  messagingSenderId: "1076821259668",
  appId: "1:1076821259668:web:2aed719e07f248cdd74b81"
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

/* 🔐 AUTH — React Native safe, persistent */
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

/* 📦 FIRESTORE — Expo / mobile safe */
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  experimentalForceLongPolling: true,
  useFetchStreams: false
});

/* 🖼️ STORAGE */
const storage = getStorage(app);

export { auth, db, storage };
