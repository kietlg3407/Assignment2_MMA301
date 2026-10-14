import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { getProducts } from '../services/products';
import { getProductRecommendations } from '../services/gemini';
import { Link } from 'expo-router';

// Màn hình gợi ý sản phẩm: lấy catalog thật, gửi nhu cầu cho backend Gemini,
// rồi chỉ hiển thị các sản phẩm có ID nằm trong catalog vừa tải.
export default function AIScreen() {
  const [need, setNeed] = useState('Tôi cần sản phẩm giá hợp lý để sử dụng hằng ngày');
  // Các state này điều khiển nút, trạng thái chờ, thông báo lỗi và kết quả.
  const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const [explanation, setExplanation] = useState(''); const [matches, setMatches] = useState([]);
  const recommend = async () => {
    setLoading(true); setError(''); setMatches([]); setExplanation('');
    try {
      // Giới hạn số sản phẩm gửi lên để prompt và request không quá lớn.
      const result = await getProducts({ skip: 0, limit: 30 });
      const ai = await getProductRecommendations({ products: result.products, userNeed: need.trim() });
      // Dùng Map để đổi ID Gemini trả về thành đối tượng sản phẩm đã tải từ API.
      const byId = new Map(result.products.map((p) => [Number(p.id), p]));
      setMatches(ai.productIds.map((id) => byId.get(id)).filter(Boolean));
      setExplanation(ai.explanation);
      if (!ai.productIds.length) setError('AI không trả về sản phẩm phù hợp trong danh sách đã gửi. Thử mô tả nhu cầu khác.');
    } catch (e) { setError(e.message || 'Không thể lấy gợi ý AI.'); }
    // Luôn tắt loading, kể cả khi API catalog hoặc backend AI trả lỗi.
    finally { setLoading(false); }
  };
  return <View style={styles.container}>
    <Text style={styles.heading}>Tìm sản phẩm phù hợp với nhu cầu</Text>
    <Text style={styles.help}>Nhập nhu cầu. AI chỉ được chọn ID từ danh mục sản phẩm thật được gửi lên backend.</Text>
    <TextInput multiline value={need} onChangeText={setNeed} style={styles.input} placeholder="Ví dụ: quà tặng dưới 50 USD" />
    <Pressable style={styles.button} onPress={recommend} disabled={loading || !need.trim()}><Text style={styles.buttonText}>{loading ? 'Đang phân tích...' : 'Nhận gợi ý từ Gemini'}</Text></Pressable>
    {loading && <ActivityIndicator style={{ margin: 16 }} />}
    {!!error && <Text style={styles.error}>{error}</Text>}
    {!!explanation && <Text style={styles.explanation}>{explanation}</Text>}
    <FlatList data={matches} keyExtractor={(item) => String(item.id)} renderItem={({ item }) => <Link href={`/product/${item.id}`} style={styles.result}>{item.title} — ${Number(item.price).toFixed(2)}</Link>} />
  </View>;
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, heading: { fontSize: 22, fontWeight: '700', marginBottom: 8 }, help: { color: '#475569', lineHeight: 21, marginBottom: 12 }, input: { minHeight: 100, textAlignVertical: 'top', backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12 }, button: { backgroundColor: '#2563eb', borderRadius: 9, padding: 13, alignItems: 'center', marginTop: 10 }, buttonText: { color: '#fff', fontWeight: '700' }, error: { color: '#b91c1c', marginTop: 12 }, explanation: { marginTop: 12, color: '#334155' }, result: { padding: 12, backgroundColor: '#fff', borderRadius: 8, marginTop: 8, color: '#1d4ed8' } });
