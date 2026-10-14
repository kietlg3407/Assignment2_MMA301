import { fetchWithTimeout } from './fetchWithTimeout';

// URL backend không bí mật; API key Gemini chỉ nằm ở backend, không đưa vào app.
const BACKEND_URL = process.env.EXPO_PUBLIC_GEMINI_BACKEND_URL;

// Gửi nhu cầu + một phần catalog tới backend; trả về ID đã được đối chiếu với catalog.
export async function getProductRecommendations({ products, userNeed }) {
  if (!BACKEND_URL || BACKEND_URL.includes('YOUR_COMPUTER_LAN_IP')) {
    throw new Error('Chưa cấu hình EXPO_PUBLIC_GEMINI_BACKEND_URL trong file .env.');
  }
  const response = await fetchWithTimeout(
    `${BACKEND_URL.replace(/\/$/, '')}/api/recommendations`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userNeed,
        products: products.map((p) => ({ id: p.id, title: p.title, category: p.category, price: p.price, description: p.description })),
      }),
    },
    75_000,
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `AI backend error (${response.status})`);

  // Không hiển thị ID do AI bịa ra hoặc ID không nằm trong danh mục đã gửi.
  const validIds = new Set(products.map((p) => Number(p.id)));
  const ids = Array.isArray(data.productIds) ? data.productIds.map(Number).filter((id) => validIds.has(id)) : [];
  return { productIds: [...new Set(ids)], explanation: String(data.explanation || 'Gợi ý dựa trên nhu cầu bạn nhập.') };
}
