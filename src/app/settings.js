import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
  sendTestNotification,
} from '../services/notifications';
import { isFirebaseConfigured } from '../services/firebase';

// Màn hình cài đặt cho phép xem/xin quyền và thử thông báo, cùng trạng thái cấu hình Firebase.
export default function SettingsScreen() {
  const [status, setStatus] = useState('Đang kiểm tra...');
  const [testing, setTesting] = useState(false);
  // Đọc trạng thái mới nhất để cập nhật cả lúc mở màn hình và sau khi xin quyền.
  const refresh = async () => setStatus(await getNotificationPermissionStatus());
  useEffect(() => {
    let mounted = true;
    getNotificationPermissionStatus().then((currentStatus) => {
      if (mounted) setStatus(currentStatus);
    });
    return () => { mounted = false; };
  }, []);
  const request = async () => {
    const allowed = await requestNotificationPermission();
    const currentStatus = await getNotificationPermissionStatus();
    setStatus(currentStatus);
    Alert.alert(
      'Quyền thông báo',
      allowed ? 'Bạn đã cấp quyền.' : `${currentStatus}. Giỏ hàng vẫn dùng được bình thường.`,
    );
  };
  const testNotification = async () => {
    setTesting(true);
    try {
      const result = await sendTestNotification();
      if (result.sent) {
        Alert.alert('Thông báo thử', 'Đã gửi. Kiểm tra thanh thông báo của thiết bị.');
      } else if (result.reason === 'permission-denied') {
        Alert.alert('Thông báo thử', 'Chưa được cấp quyền thông báo. Hãy cấp quyền rồi thử lại.');
      } else if (result.reason === 'notifications-unavailable') {
        Alert.alert('Thông báo thử', 'Runtime hiện tại chưa hỗ trợ. Hãy cài development build.');
      } else {
        Alert.alert('Thông báo thử', 'Không gửi được thông báo. Kiểm tra log để biết chi tiết.');
      }
    } finally {
      setTesting(false);
      await refresh();
    }
  };
  return <View style={styles.container}>
    <Text style={styles.heading}>Cài đặt và tích hợp</Text>
    <View style={styles.card}>
      <Text style={styles.label}>Thông báo</Text>
      <Text>Trạng thái: {status}</Text>
      <Pressable style={styles.button} onPress={request}>
        <Text style={styles.buttonText}>Yêu cầu quyền thông báo</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={testNotification} disabled={testing}>
        <Text style={styles.secondaryButtonText}>{testing ? 'Đang gửi...' : 'Gửi thông báo thử'}</Text>
      </Pressable>
      <Text>Thông báo nghiệp vụ sẽ xuất hiện khi thêm sản phẩm vào giỏ hàng.</Text>
    </View>
    {/* Cờ cấu hình chỉ xác nhận có giá trị config; cần sync wishlist để thử kết nối thật. */}
    <View style={styles.card}><Text style={styles.label}>Firebase</Text><Text>{isFirebaseConfigured ? 'Đã có cấu hình Firebase (hãy thử đồng bộ wishlist để xác nhận kết nối).' : 'Chưa cấu hình. Sao chép .env.example thành .env và điền thông tin Firebase.'}</Text></View>
    <View style={styles.card}><Text style={styles.label}>Lưu dữ liệu</Text><Text>Giỏ hàng và wishlist được lưu cục bộ bằng AsyncStorage. Wishlist có thể đồng bộ lên Firestore khi Firebase được cấu hình.</Text></View>
  </View>;
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  heading: { fontSize: 22, fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, gap: 8 },
  label: { fontSize: 16, fontWeight: '700' },
  button: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { borderWidth: 1, borderColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center' },
  secondaryButtonText: { color: '#2563eb', fontWeight: '700' },
});
