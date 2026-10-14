import { initializeApp, getApp, getApps } from 'firebase/app';
import { signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeFirebaseAuth } from './firebaseAuth';

// Các giá trị EXPO_PUBLIC được Expo đọc từ file .env khi bundle ứng dụng.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const configured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
// Dùng app Firebase đã khởi tạo nếu có, tránh tạo app trùng khi reload.
const app = configured ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;
export const auth = app ? initializeFirebaseAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const isFirebaseConfigured = configured;

export async function ensureAnonymousUser() {
  if (!auth) throw new Error('Firebase chưa được cấu hình. Hãy điền file .env.');
  if (auth.currentUser) return auth.currentUser;
  // Tạo tài khoản tạm thời để Firestore Rules có UID phân quyền wishlist.
  const result = await signInAnonymously(auth);
  return result.user;
}
