import React from 'react';
import { View, Text, FlatList, Image, Pressable, StyleSheet, Alert } from 'react-native';
import { useShop } from '../context/ShopContext';

// Giỏ hàng chỉ đọc dữ liệu từ context; các phép cộng/trừ được context xử lý.
export default function CartScreen() {
  const { cart, changeQuantity, removeFromCart, clearCart, cartTotal, cartCount } = useShop();
  return <View style={styles.container}>
    {cart.length === 0 ? <View style={styles.empty}><Text style={styles.title}>Giỏ hàng đang trống</Text><Text>Hãy quay lại danh sách và thêm sản phẩm.</Text></View> : <>
      <FlatList data={cart} keyExtractor={(item) => String(item.id)} renderItem={({ item }) => <View style={styles.row}>
        <Image source={{ uri: item.thumbnail }} style={styles.image} resizeMode="contain" />
        <View style={styles.details}><Text style={styles.name}>{item.title}</Text><Text style={styles.price}>${Number(item.price).toFixed(2)} / sản phẩm</Text>
          <View style={styles.quantity}><Pressable style={styles.qtyButton} onPress={() => changeQuantity(item.id, -1)}><Text>−</Text></Pressable><Text>{item.quantity}</Text><Pressable style={styles.qtyButton} onPress={() => changeQuantity(item.id, 1)}><Text>+</Text></Pressable><Pressable onPress={() => removeFromCart(item.id)}><Text style={styles.remove}>Xóa</Text></Pressable></View>
        </View>
      </View>} />
      {/* cartCount và cartTotal là giá trị tính từ giỏ hàng, không lưu trùng trong state. */}
      <View style={styles.summary}><Text>Số lượng: {cartCount}</Text><Text style={styles.total}>Tổng cộng: ${cartTotal.toFixed(2)}</Text>
        <Pressable style={styles.checkout} onPress={() => Alert.alert('Demo checkout', 'Đây là ứng dụng học tập; chưa tích hợp thanh toán thật.')}><Text style={{ color: '#fff', fontWeight: '700' }}>Tiến hành đặt hàng (demo)</Text></Pressable>
        {/* Hộp thoại xác nhận giúp tránh xóa toàn bộ giỏ do chạm nhầm. */}
        <Pressable onPress={() => Alert.alert('Xóa giỏ hàng', 'Bạn có chắc muốn xóa tất cả?', [{ text: 'Hủy', style: 'cancel' }, { text: 'Xóa', style: 'destructive', onPress: clearCart }])}><Text style={styles.clear}>Xóa toàn bộ giỏ hàng</Text></Pressable>
      </View>
    </>}
  </View>;
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 12 }, empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }, title: { fontSize: 20, fontWeight: '700' }, row: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 10, gap: 10 }, image: { width: 90, height: 90 }, details: { flex: 1, justifyContent: 'center' }, name: { fontWeight: '600', color: '#111827' }, price: { color: '#2563eb', marginTop: 5 }, quantity: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 }, qtyButton: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 }, remove: { color: '#dc2626' }, summary: { backgroundColor: '#fff', padding: 16, borderRadius: 12, gap: 10 }, total: { fontSize: 20, fontWeight: '700' }, checkout: { backgroundColor: '#2563eb', padding: 13, borderRadius: 9, alignItems: 'center' }, clear: { textAlign: 'center', color: '#dc2626', padding: 8 } });
