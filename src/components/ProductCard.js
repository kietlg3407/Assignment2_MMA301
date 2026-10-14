import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

// Thẻ sản phẩm tái sử dụng trong danh sách; screen cha truyền dữ liệu và callback qua props.
export default function ProductCard({ product, onAdd, isFavorite, onFavorite }) {
  return (
    <View style={styles.card}>
      <Link href={`/product/${product.id}`} asChild>
        <Pressable>
          <Image source={{ uri: product.thumbnail }} style={styles.image} resizeMode="contain" />
          <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
          <Text style={styles.price}>${Number(product.price).toFixed(2)}</Text>
        </Pressable>
      </Link>
      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={() => onAdd(product)}><Text style={styles.buttonText}>+ Giỏ hàng</Text></Pressable>
        <Pressable style={styles.fav} onPress={() => onFavorite(product)}><Text>{isFavorite ? '♥' : '♡'}</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, margin: 6, padding: 10, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, backgroundColor: '#fff' },
  image: { width: '100%', height: 125, backgroundColor: '#f8fafc' },
  title: { marginTop: 8, minHeight: 38, fontSize: 14, fontWeight: '600', color: '#111827' },
  price: { marginTop: 6, color: '#2563eb', fontWeight: '700' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  button: { flex: 1, backgroundColor: '#2563eb', borderRadius: 8, padding: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 12, fontWeight: '600' },
  fav: { padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
});
