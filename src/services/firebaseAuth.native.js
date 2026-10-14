import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';

// Android/iOS lưu trạng thái đăng nhập Firebase vào AsyncStorage để giữ UID qua lần mở app.
export function initializeFirebaseAuth(app) {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // Fast Refresh có thể gọi khởi tạo lần nữa; khi đó lấy Auth instance đã tồn tại.
    if (error.code !== 'auth/already-initialized') throw error;
    return getAuth(app);
  }
}
