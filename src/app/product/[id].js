import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, Pressable, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getProductById } from '../../services/products';
import { useShop } from '../../context/ShopContext';
import { notifyAddedToCart } from '../../services/notifications';

// Màn hình chi tiết lấy ID từ URL, tải sản phẩm tương ứng và cho phép thao tác cart/favorite.
export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { addToCart, favorites, toggleFavorite } = useShop();
  const [product, setProduct] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => {
    // Cờ alive ngăn cập nhật state nếu người dùng rời màn hình trước khi request xong.
    let alive = true;
    getProductById(String(id)).then((data) => { if (alive) setProduct(data); }).catch((e) => { if (alive) setError(e.message); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);
  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /><Text>Đang tải chi tiết...</Text></View>;
  if (error || !product) return <View style={styles.center}><Text style={styles.error}>{error || 'Không tìm thấy sản phẩm.'}</Text></View>;
  const favorite = favorites.some((item) => item.id === product.id);
  return <ScrollView contentContainerStyle={styles.container}>
    <Image source={{ uri: product.thumbnail }} style={styles.image} resizeMode="contain" />
    <Text style={styles.title}>{product.title}</Text><Text style={styles.price}>${Number(product.price).toFixed(2)}</Text>
    <Text style={styles.meta}>Danh mục: {product.category || 'Chưa phân loại'}</Text>
    <Text style={styles.meta}>Đánh giá: {product.rating ?? 'N/A'} · Còn hàng: {product.stock ?? 'N/A'}</Text>
    <Text style={styles.description}>{product.description}</Text>
    {/* Thêm vào cart trước; notification chỉ là phản hồi bổ sung, không phải điều kiện thành công. */}
    <Pressable style={styles.primary} onPress={async () => { addToCart(product); await notifyAddedToCart(product.title); Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng.'); }}><Text style={styles.primaryText}>Thêm vào giỏ hàng</Text></Pressable>
    <Pressable style={styles.secondary} onPress={() => toggleFavorite(product)}><Text style={styles.secondaryText}>{favorite ? '♥ Bỏ yêu thích' : '♡ Thêm yêu thích'}</Text></Pressable>
  </ScrollView>;
}
const styles = StyleSheet.create({ container: { padding: 18, paddingBottom: 30 }, image: { width: '100%', height: 260, backgroundColor: '#fff', borderRadius: 14 }, title: { fontSize: 23, fontWeight: '700', marginTop: 16, color: '#111827' }, price: { fontSize: 22, fontWeight: '700', color: '#2563eb', marginTop: 8 }, meta: { color: '#475569', marginTop: 8 }, description: { fontSize: 15, lineHeight: 23, marginTop: 14, color: '#334155' }, primary: { backgroundColor: '#2563eb', padding: 14, borderRadius: 10, marginTop: 20, alignItems: 'center' }, primaryText: { color: '#fff', fontWeight: '700' }, secondary: { borderWidth: 1, borderColor: '#2563eb', padding: 13, borderRadius: 10, marginTop: 10, alignItems: 'center' }, secondaryText: { color: '#2563eb', fontWeight: '600' }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 }, error: { color: '#b91c1c' } });
