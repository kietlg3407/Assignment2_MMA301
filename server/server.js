const path = require('node:path');
require('dotenv').config({ path: path.join(path.dirname(require.resolve('./server.js')), '.env') });
const express = require('express');
const cors = require('cors');

// Backend giữ Gemini API key; client app chỉ gọi endpoint recommendations. (v2.1)
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

    // Rút gọn các trường và giới hạn độ dài ký tự để prompt nhỏ gọn, AI phản hồi nhanh nhất.
    const catalog = products.map((p) => ({
      id: Number(p.id),
      title: String(p.title || '').slice(0, 60),
      category: String(p.category || ''),
      price: Number(p.price) || 0,
      description: String(p.description || '').slice(0, 80),
    }));
    const prompt = `You are a shopping assistant. Select up to 5 products ONLY from this catalog for the user's need. Do not invent IDs. Return JSON only with shape {"productIds":[number],"explanation":"short explanation"}. The explanation must be concise. User need: ${userNeed}\nCatalog JSON: ${JSON.stringify(catalog)}`;
    const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    let response;
    let raw = {};
    const generationConfig = {
      responseMimeType: 'application/json',
      temperature: 0.1,
      maxOutputTokens: 300,
    };

    for (let attempt = 1; attempt <= 3; attempt++) {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig }),
        signal: AbortSignal.timeout(60_000),
      });
      raw = await response.json().catch(() => ({}));
      if (response.ok) break;

      // Nếu model không hỗ trợ thinkingConfig (HTTP 400), bỏ qua thinkingConfig rồi thử lại
      if (response.status === 400 && raw.error?.message?.includes('thinkingConfig')) {
        delete generationConfig.thinkingConfig;
        continue;
      }

      // Nếu Google bị quá tải tạm thời (503 / 429), chờ một chút rồi tự động thử lại
      if ((response.status === 503 || response.status === 429) && attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
        continue;
      }
      break;
    }
    if (!response || !response.ok) return res.status(502).json({ message: raw.error?.message || `Gemini returned ${response?.status}` });
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
