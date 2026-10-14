import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Link } from 'expo-router';
import { useShop } from '../context/ShopContext';

// Màn hình hiển thị wishlist đã gộp giữa AsyncStorage trên máy và Firestore.
export default function WishlistScreen() {
  const { favorites, toggleFavorite, syncFavoritesFromFirebase, firebaseMessage } = useShop();
  const [syncing, setSyncing] = useState(false);
  // Khóa nút trong lúc sync để tránh gửi nhiều request cùng lúc.
  const sync = async () => { setSyncing(true); await syncFavoritesFromFirebase(); setSyncing(false); };
  return <View style={styles.container}>
    <Pressable style={styles.sync} onPress={sync} disabled={syncing}><Text style={styles.syncText}>{syncing ? 'Đang đồng bộ...' : 'Tải / đồng bộ từ Firebase'}</Text></Pressable>
    <Text style={styles.message}>{firebaseMessage}</Text>
    {favorites.length === 0 ? <View style={styles.empty}><Text>Chưa có sản phẩm yêu thích.</Text></View> : <FlatList data={favorites} keyExtractor={(item) => String(item.id)} renderItem={({ item }) => <View style={styles.row}>
      <Link href={`/product/${item.id}`} asChild><Pressable style={styles.product}><Image source={{ uri: item.thumbnail }} style={styles.image} /><View style={{ flex: 1 }}><Text style={styles.name}>{item.title}</Text><Text>${Number(item.price).toFixed(2)}</Text></View></Pressable></Link>
      {/* Bỏ favorite gọi toggleFavorite; context cập nhật local và xóa document cloud. */}
      <Pressable onPress={() => Alert.alert('Bỏ yêu thích', 'Xóa sản phẩm này?', [{ text: 'Hủy', style: 'cancel' }, { text: 'Xóa', onPress: () => toggleFavorite(item) }])}><Text style={styles.remove}>Xóa</Text></Pressable>
    </View>} />}
  </View>;
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 12 }, sync: { backgroundColor: '#2563eb', padding: 12, borderRadius: 9, alignItems: 'center' }, syncText: { color: '#fff', fontWeight: '700' }, message: { color: '#475569', marginVertical: 10 }, empty: { flex: 1, alignItems: 'center', justifyContent: 'center' }, row: { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }, product: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }, image: { width: 60, height: 60, resizeMode: 'contain' }, name: { fontWeight: '600', marginBottom: 5 }, remove: { color: '#dc2626', padding: 8 } });
