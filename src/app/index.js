import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, ActivityIndicator, RefreshControl, StyleSheet, Alert } from 'react-native';
import { Link } from 'expo-router';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../services/products';
import { useShop } from '../context/ShopContext';
import { notifyAddedToCart } from '../services/notifications';

const PAGE_SIZE = 10;

// Màn hình danh mục: tải từng trang, tìm kiếm và làm mới danh sách từ DummyJSON.
export default function ProductListScreen() {
  const { addToCart, favorites, toggleFavorite, cartCount, ready } = useShop();
  // query là nội dung đang gõ; search là từ khóa chỉ được áp dụng khi bấm Tìm.
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  // skip là vị trí bắt đầu lấy trang tiếp theo; total báo tổng số kết quả từ API.
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadFirstPage = useCallback(async (term = search, refresh = false) => {
    setError('');
    if (refresh) setRefreshing(true); else setLoading(true);
    try {
      const result = await getProducts({ skip: 0, limit: PAGE_SIZE, query: term });
      setProducts(result.products); setTotal(result.total); setSkip(result.products.length);
    } catch (e) { setError(e.message || 'Không thể tải sản phẩm.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, [search]);

  useEffect(() => { loadFirstPage(search); }, [search, loadFirstPage]);

  const loadMore = async () => {
    // Chặn tải lặp khi request trước chưa xong, hết dữ liệu hoặc đang có lỗi.
    if (loadingMore || loading || products.length >= total || error) return;
    setLoadingMore(true);
    try {
      const result = await getProducts({ skip, limit: PAGE_SIZE, query: search });
      setProducts((old) => {
        // Một số lần onEndReached có thể xảy ra sát nhau; lọc ID trùng trước khi nối trang.
        const seen = new Set(old.map((item) => item.id));
        return [...old, ...result.products.filter((item) => !seen.has(item.id))];
      });
      setSkip((old) => old + result.products.length); setTotal(result.total);
    } catch (e) { setError(e.message || 'Không thể tải thêm sản phẩm.'); }
    finally { setLoadingMore(false); }
  };

  const handleAdd = async (product) => {
    // Cập nhật giỏ không phụ thuộc quyền notification; từ chối quyền không chặn thao tác mua.
    addToCart(product);
    await notifyAddedToCart(product.title);
    Alert.alert('Giỏ hàng', `Đã thêm “${product.title}” vào giỏ hàng.`);
  };

  if (!ready) return <View style={styles.center}><ActivityIndicator size="large" /><Text>Đang khôi phục dữ liệu...</Text></View>;
  return (
    <View style={styles.container}>
      <View style={styles.nav}>
        <Link href="/cart" asChild><Pressable style={styles.navButton}><Text style={styles.navText}>Giỏ hàng ({cartCount})</Text></Pressable></Link>
        <Link href="/wishlist" asChild><Pressable style={styles.navButton}><Text style={styles.navText}>Yêu thích</Text></Pressable></Link>
        <Link href="/ai" asChild><Pressable style={styles.navButton}><Text style={styles.navText}>AI</Text></Pressable></Link>
        <Link href="/settings" asChild><Pressable style={styles.navButton}><Text style={styles.navText}>Cài đặt</Text></Pressable></Link>
      </View>
      <Text style={styles.heading}>Khám phá sản phẩm</Text>
      <View style={styles.searchRow}>
        <TextInput value={query} onChangeText={setQuery} onSubmitEditing={() => setSearch(query.trim())} placeholder="Tìm sản phẩm..." style={styles.input} returnKeyType="search" />
        <Pressable style={styles.searchButton} onPress={() => setSearch(query.trim())}><Text style={{ color: '#fff', fontWeight: '600' }}>Tìm</Text></Pressable>
      </View>
      {!!search && <Pressable onPress={() => { setQuery(''); setSearch(''); }}><Text style={styles.clearSearch}>Xóa tìm kiếm “{search}”</Text></Pressable>}
      {/* Chỉ render một trong các trạng thái: loading, lỗi, rỗng hoặc danh sách. */}
      {loading ? <View style={styles.center}><ActivityIndicator size="large" /><Text>Đang tải sản phẩm...</Text></View> : error ? (
        <View style={styles.center}><Text style={styles.error}>{error}</Text><Pressable style={styles.searchButton} onPress={() => loadFirstPage(search)}><Text style={{ color: '#fff' }}>Thử lại</Text></Pressable></View>
      ) : products.length === 0 ? <View style={styles.center}><Text>Không tìm thấy sản phẩm.</Text><Pressable onPress={() => loadFirstPage(search, true)}><Text style={styles.linkText}>Tải lại</Text></Pressable></View> : (
        <FlatList
          data={products} numColumns={2} keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ProductCard product={item} onAdd={handleAdd} isFavorite={favorites.some((fav) => fav.id === item.id)} onFavorite={toggleFavorite} />}
          contentContainerStyle={{ paddingBottom: 20 }} onEndReached={loadMore} onEndReachedThreshold={0.4}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadFirstPage(search, true)} />}
          ListFooterComponent={loadingMore ? <ActivityIndicator style={{ margin: 16 }} /> : products.length < total ? <Text style={styles.footer}>Cuộn xuống để tải thêm</Text> : <Text style={styles.footer}>Đã hiển thị hết sản phẩm</Text>}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 10, paddingTop: 8 }, nav: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }, navButton: { backgroundColor: '#dbeafe', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 }, navText: { color: '#1d4ed8', fontSize: 12, fontWeight: '600' },
  heading: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 10 }, searchRow: { flexDirection: 'row', gap: 8, marginBottom: 8 }, input: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 12, minHeight: 44 }, searchButton: { backgroundColor: '#2563eb', paddingHorizontal: 16, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20 }, error: { color: '#b91c1c', textAlign: 'center' }, clearSearch: { color: '#2563eb', marginBottom: 8 }, linkText: { color: '#2563eb', padding: 10 }, footer: { textAlign: 'center', padding: 14, color: '#64748b' }
});
