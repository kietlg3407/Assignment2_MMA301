const path = require('node:path');
require('dotenv').config({ path: path.join(path.dirname(require.resolve('./server.js')), '.env') });
const express = require('express');
const cors = require('cors');

// Backend giữ Gemini API key; client app chỉ gọi endpoint recommendations.
const app = express();
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.get('/health', (_req, res) => res.json({
  // Báo trạng thái cấu hình mà không bao giờ trả API key về client.
  ok: true,
  geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
}));

app.post('/api/recommendations', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(503).json({ message: 'Backend chưa cấu hình GEMINI_API_KEY.' });
    const userNeed = String(req.body.userNeed || '').trim().slice(0, 500);
    const products = Array.isArray(req.body.products) ? req.body.products.slice(0, 50) : [];
    if (!userNeed || products.length === 0) return res.status(400).json({ message: 'Cần userNeed và danh sách products.' });

    // Chỉ gửi các trường cần thiết và giới hạn độ dài để prompt không quá lớn.
    const catalog = products.map((p) => ({ id: Number(p.id), title: String(p.title || '').slice(0, 100), category: String(p.category || ''), price: Number(p.price) || 0, description: String(p.description || '').slice(0, 250) }));
    const prompt = `You are a shopping assistant. Select up to 5 products ONLY from this catalog for the user's need. Do not invent IDs. Return JSON only with shape {"productIds":[number],"explanation":"short explanation"}. The explanation must be concise. User need: ${userNeed}\nCatalog JSON: ${JSON.stringify(catalog)}`;
    const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    // Gọi Gemini từ server để key không bị nhúng vào bundle mobile.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.2 } }),
      signal: AbortSignal.timeout(60_000),
    });
    const raw = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(502).json({ message: raw.error?.message || `Gemini returned ${response.status}` });
    const text = raw.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
    let parsed;
    // Chỉ tiếp tục nếu model trả JSON hợp lệ theo format yêu cầu.
    try { parsed = JSON.parse(text); } catch { return res.status(502).json({ message: 'Gemini trả về định dạng JSON không hợp lệ.' }); }
    const validIds = new Set(catalog.map((p) => p.id));
    // Kiểm tra lại ID phía server: không tin tuyệt đối nội dung sinh bởi model.
    const productIds = Array.isArray(parsed.productIds) ? [...new Set(parsed.productIds.map(Number).filter((id) => validIds.has(id)))].slice(0, 5) : [];
    return res.json({ productIds, explanation: String(parsed.explanation || 'Gợi ý dựa trên nhu cầu và danh mục hiện có.').slice(0, 500) });
  } catch (error) {
    console.error('Recommendation error:', error.name, error.message);
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return res.status(504).json({
        message: 'Gemini phản hồi quá chậm. Hãy thử lại sau một lúc.',
      });
    }
    return res.status(500).json({ message: 'Không thể tạo gợi ý lúc này. Vui lòng thử lại.' });
  }
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, '0.0.0.0', () => console.log(`Gemini proxy listening on port ${port}`));
