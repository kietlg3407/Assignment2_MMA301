import { getAuth } from 'firebase/auth';

// Fallback cho nền tảng web, nơi Firebase tự chọn persistence phù hợp trình duyệt.
export function initializeFirebaseAuth(app) {
  return getAuth(app);
}
