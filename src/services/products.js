import { fetchWithTimeout } from './fetchWithTimeout';

// DummyJSON là nguồn catalog; các hàm bên dưới chuẩn hóa response cho screen dùng.
const BASE_URL = 'https://dummyjson.com/products';

async function readJson(url) {
  const response = await fetchWithTimeout(url);
  // fetch không tự reject khi server trả HTTP 4xx/5xx nên cần kiểm tra response.ok.
  if (!response.ok) throw new Error(`Máy chủ trả về lỗi HTTP ${response.status}`);
  return response.json();
}

export async function getProducts({ skip = 0, limit = 10, query = '' } = {}) {
  const safeQuery = query.trim();
  // Có từ khóa thì dùng endpoint search; nếu không thì lấy trang bình thường.
  const url = safeQuery
    ? `${BASE_URL}/search?q=${encodeURIComponent(safeQuery)}&limit=${limit}&skip=${skip}`
    : `${BASE_URL}?limit=${limit}&skip=${skip}`;
  const data = await readJson(url);
  return {
    products: Array.isArray(data.products) ? data.products : [],
    total: Number(data.total) || 0,
    skip: Number(data.skip) || 0,
    limit: Number(data.limit) || limit,
  };
}

export async function getProductById(id) {
  // Chặn ID rỗng/ký tự lạ trước khi đưa vào URL request.
  if (!id || !/^\d+$/.test(String(id))) throw new Error('Mã sản phẩm không hợp lệ.');
  return readJson(`${BASE_URL}/${encodeURIComponent(id)}`);
}
