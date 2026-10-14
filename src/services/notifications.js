import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

// Nếu runtime thiếu native notification module, phần còn lại của app vẫn hoạt động.
let Notifications = null;

try {
  // Nạp riêng API local notification, tránh barrel entrypoint có side effect đăng ký push token.
  Notifications = {
    ...require('expo-notifications/build/NotificationPermissions'),
    ...require('expo-notifications/build/NotificationsHandler'),
    ...require('expo-notifications/build/scheduleNotificationAsync'),
    ...require('expo-notifications/build/setNotificationChannelAsync'),
    ...require('expo-notifications/build/NotificationChannelManager.types'),
  };
} catch (error) {
  console.warn('Local notifications are unavailable in this runtime:', error.message);
}

if (Notifications) {
  // Cấu hình cách hiển thị thông báo khi app đang mở ở foreground.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function requestNotificationPermission() {
  if (!Notifications || Platform.OS === 'web') return false;

  try {
    // Expo Go có thể không cung cấp channel manager; development build vẫn tạo channel riêng.
    if (Platform.OS === 'android' && !isRunningInExpoGo()) {
      await Notifications.setNotificationChannelAsync('orders', {
        name: 'Order updates', importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await Notifications.requestPermissionsAsync();
    return Boolean(asked.granted);
  } catch (error) {
    console.warn('Notification permission request failed:', error.message);
    return false;
  }
}

export async function notifyAddedToCart(productName) {
  return scheduleLocalNotification(
    'Đã thêm vào giỏ hàng',
    `${productName} đã được thêm vào giỏ hàng.`,
  );
}

export async function sendTestNotification() {
  return scheduleLocalNotification(
    'Thông báo thử',
    'Thông báo trên thiết bị đã hoạt động.',
  );
}

async function scheduleLocalNotification(title, body) {
  if (!Notifications || Platform.OS === 'web') {
    return { sent: false, reason: 'notifications-unavailable' };
  }
  try {
    const allowed = await requestNotificationPermission();
    if (!allowed) return { sent: false, reason: 'permission-denied' };
    // trigger: null có nghĩa gửi thông báo ngay thay vì lên lịch trong tương lai.
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
    return { sent: true };
  } catch (error) {
    console.warn('Local notification failed:', error.message);
    return { sent: false, reason: 'notification-error' };
  }
}

export async function getNotificationPermissionStatus() {
  if (Platform.OS === 'web') return 'Thông báo native không hỗ trợ trên web';
  if (!Notifications) return 'Không khả dụng; hãy dùng development build';

  try {
    const result = await Notifications.getPermissionsAsync();
    return result.granted ? 'Đã cấp quyền' : 'Chưa cấp quyền';
  } catch (error) {
    console.warn('Could not read notification permission status:', error.message);
    return 'Runtime không hỗ trợ; hãy dùng development build';
  }
}
