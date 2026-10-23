import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API endpoint for Gemini Math Assistant
app.post('/api/gemini/assistant', async (req: Request, res: Response) => {
  try {
    const { action, grade, topic, level, quantity, prompt, contextData } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Chưa cấu hình GEMINI_API_KEY trong hệ thống. Vui lòng cấu hình khóa API trong mục Settings > Secrets.',
      });
    }

    let systemInstruction = `Bạn là Trợ lý AI chuyên trách môn Toán THPT của thầy Bùi Ngọc Thắng (Trường THPT Đan Phượng).
Nhiệm vụ của bạn là hỗ trợ thầy Thắng trong các công tác sư phạm môn Toán:
1. Soạn câu hỏi trắc nghiệm (4 lựa chọn, Đúng/Sai, trả lời ngắn) chuẩn chương trình GDPT 2018 (Kết nối tri thức, Cánh diều, Chân trời sáng tạo).
2. Xây dựng ma trận đề kiểm tra, bản đặc tả và thang điểm.
3. Giải chi tiết các bài toán khó với công thức toán học định dạng LaTeX (sử dụng dấu $...$ cho công thức nội dòng và $$...$$ cho công thức khối).
4. Phân tích kết quả học tập của học sinh, đề xuất chiến lược phụ đạo cho học sinh yếu và bồi dưỡng học sinh giỏi.
5. Viết nhận xét sư phạm học bạ chân thành, cụ thể, giàu tính động viên và chuẩn mực đạo đức nhà giáo.
Luôn trả lời bằng tiếng Việt trang trọng, chuẩn xác về mặt toán học và sư phạm.`;

    let userPrompt = prompt || '';

    if (action === 'generate_questions') {
      userPrompt = `Thầy Bùi Ngọc Thắng yêu cầu soạn ${quantity || 3} câu hỏi Toán THPT:
- Khối lớp: ${grade || 'Lớp 12'}
- Chủ đề: ${topic || 'Hàm số và Đồ thị'}
- Mức độ nhận thức: ${level || 'Vận dụng'}
- Yêu cầu chi tiết: ${prompt || 'Soạn câu hỏi trắc nghiệm khách quan 4 phương án, có đáp án đúng và lời giải chi tiết từng bước bằng LaTeX.'}

Định dạng trả về:
Hãy trả lời đầy đủ, chi tiết từng câu:
- Câu hỏi (kèm LaTeX)
- 4 Phương án A, B, C, D (nếu là trắc nghiệm)
- Đáp án đúng
- Lời giải chi tiết`;
    } else if (action === 'solve_step_by_step') {
      userPrompt = `Hãy giải chi tiết từng bước bài toán sau cho thầy Bùi Ngọc Thắng và học sinh THPT Đan Phượng:
"${prompt}"
Trình bày rõ ràng:
1. Phương pháp tư duy / Định hướng giải nhanh
2. Các bước biến đổi chi tiết có công thức LaTeX
3. Kết luận và các lỗi sai học sinh thường gặp`;
    } else if (action === 'matrix_spec') {
      userPrompt = `Xây dựng khung ma trận đề kiểm tra định kỳ môn Toán THPT:
- Khối: ${grade || 'Lớp 11'}
- Chủ đề / Chương: ${topic || 'Đạo hàm và Ứng dụng'}
- Thời lượng: 45 hoặc 90 phút
- Chi tiết các mức độ: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao
- Phân bố dạng câu: Trắc nghiệm nhiều lựa chọn, Đúng/Sai, Trả lời ngắn`;
    } else if (action === 'student_feedback') {
      userPrompt = `Soạn lời nhận xét sư phạm cho học sinh môn Toán THPT Đan Phượng:
Thông tin học sinh và kết quả:
${JSON.stringify(contextData || {})}
Yêu cầu: ${prompt || 'Viết nhận xét vừa khích lệ nỗ lực, vừa chỉ ra điểm cần khắc phục trong phương pháp học tập.'}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({
      text: response.text || 'Không có phản hồi từ mô hình.',
      success: true,
    });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    return res.status(500).json({
      error: err.message || 'Lỗi khi kết nối với Trợ lý AI Gemini.',
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', teacher: 'Bùi Ngọc Thắng', school: 'Trường THPT Đan Phượng', time: new Date().toISOString() });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
