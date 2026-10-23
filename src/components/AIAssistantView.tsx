import React, { useState, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  HelpCircle,
  BookmarkPlus,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Lightbulb,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MathRenderer } from './MathRenderer';

export const AIAssistantView: React.FC = () => {
  const {
    aiInitialPrompt,
    setAiInitialPrompt,
    addQuestion,
    setActiveTab,
  } = useApp();

  // Mode: 'quick_generate' | 'chat'
  const [selectedTask, setSelectedTask] = useState<
    'generate_questions' | 'solve_step_by_step' | 'matrix_spec' | 'student_feedback'
  >('generate_questions');

  const [grade, setGrade] = useState('12');
  const [topic, setTopic] = useState('Hàm số và Đồ thị');
  const [level, setLevel] = useState('Vận dụng');
  const [quantity, setQuantity] = useState(3);
  const [customPrompt, setCustomPrompt] = useState(aiInitialPrompt || '');
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync initial prompt from other tabs
  useEffect(() => {
    if (aiInitialPrompt) {
      setCustomPrompt(aiInitialPrompt);
    }
  }, [aiInitialPrompt]);

  const handleSendPrompt = async () => {
    if (loading) return;
    setLoading(true);
    setApiError(null);

    try {
      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: selectedTask,
          grade: `Lớp ${grade}`,
          topic,
          level,
          quantity,
          prompt: customPrompt,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi khi gọi API Trợ lý AI.');
      }

      setApiResponse(data.text);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Không thể kết nối với dịch vụ Gemini AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResult = () => {
    if (!apiResponse) return;
    navigator.clipboard.writeText(apiResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToBank = () => {
    if (!apiResponse) return;
    // Add raw question to bank
    addQuestion({
      code: `AI-${grade}-${Math.floor(10 + Math.random() * 90)}`,
      grade: Number(grade) as any,
      topic,
      level: level as any,
      type: 'single_choice',
      content: apiResponse.slice(0, 300),
      solution: apiResponse,
      correctAnswer: 'A',
      points: 0.25,
    });
    alert('Đã lưu nội dung do AI tạo vào Ngân hàng đề & bài tập thành công!');
    setActiveTab('bank');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#0878D1]" />
            <h2 className="text-lg font-bold text-[#064A87]">
              Trợ lý AI môn Toán - Thầy Bùi Ngọc Thắng
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Tích hợp mô hình Gemini AI chuyên sâu giải toán, soạn đề, phân tích sư phạm và tạo lời giải LaTeX
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Sẵn sàng hỗ trợ</span>
        </div>
      </div>

      {/* Task Selector Buttons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <button
          onClick={() => {
            setSelectedTask('generate_questions');
            setCustomPrompt('Soạn 3 câu hỏi trắc nghiệm khách quan có lời giải chi tiết');
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedTask === 'generate_questions'
              ? 'bg-[#0878D1] text-white border-[#0878D1] shadow-sm font-semibold'
              : 'bg-white text-gray-700 border-blue-100 hover:bg-blue-50/50'
          }`}
        >
          <span className="block text-xs font-bold">1. Soạn đề & Câu hỏi</span>
          <span className={`text-[11px] block mt-0.5 ${selectedTask === 'generate_questions' ? 'text-blue-100' : 'text-gray-400'}`}>
            Chuẩn ma trận GDPT 2018
          </span>
        </button>

        <button
          onClick={() => {
            setSelectedTask('solve_step_by_step');
            setCustomPrompt('Tìm giá trị lớn nhất và nhỏ nhất của hàm số y = x^4 - 2x^2 + 3 trên đoạn [0; 2]. Trình bày từng bước và mẹo bấm máy tính.');
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedTask === 'solve_step_by_step'
              ? 'bg-[#0878D1] text-white border-[#0878D1] shadow-sm font-semibold'
              : 'bg-white text-gray-700 border-blue-100 hover:bg-blue-50/50'
          }`}
        >
          <span className="block text-xs font-bold">2. Giải chi tiết & Mẹo Casio</span>
          <span className={`text-[11px] block mt-0.5 ${selectedTask === 'solve_step_by_step' ? 'text-blue-100' : 'text-gray-400'}`}>
            Phương pháp giải nhanh
          </span>
        </button>

        <button
          onClick={() => {
            setSelectedTask('matrix_spec');
            setCustomPrompt('Xây dựng ma trận đề kiểm tra giữa kỳ 2 môn Toán lớp 11 kèm bản đặc tả câu hỏi.');
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedTask === 'matrix_spec'
              ? 'bg-[#0878D1] text-white border-[#0878D1] shadow-sm font-semibold'
              : 'bg-white text-gray-700 border-blue-100 hover:bg-blue-50/50'
          }`}
        >
          <span className="block text-xs font-bold">3. Lập ma trận & Bản đặc tả</span>
          <span className={`text-[11px] block mt-0.5 ${selectedTask === 'matrix_spec' ? 'text-blue-100' : 'text-gray-400'}`}>
            Đúng thông tư Bộ GD&ĐT
          </span>
        </button>

        <button
          onClick={() => {
            setSelectedTask('student_feedback');
            setCustomPrompt('Soạn nhận xét sư phạm học bạ cho học sinh học lực trung bình nhưng có nhiều nỗ lực.');
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedTask === 'student_feedback'
              ? 'bg-[#0878D1] text-white border-[#0878D1] shadow-sm font-semibold'
              : 'bg-white text-gray-700 border-blue-100 hover:bg-blue-50/50'
          }`}
        >
          <span className="block text-xs font-bold">4. Nhận xét sư phạm học bạ</span>
          <span className={`text-[11px] block mt-0.5 ${selectedTask === 'student_feedback' ? 'text-blue-100' : 'text-gray-400'}`}>
            Khích lệ và định hướng
          </span>
        </button>
      </div>

      {/* Configuration & Prompt Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-blue-100 shadow-sm space-y-3.5 text-xs">
          <h3 className="font-bold text-[#064A87] text-sm">Cấu hình tham số yêu cầu</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Khối lớp</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="10">Lớp 10</option>
                <option value="11">Lớp 11</option>
                <option value="12">Lớp 12</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Số lượng câu</label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value={1}>1 câu</option>
                <option value={3}>3 câu</option>
                <option value={5}>5 câu</option>
                <option value={10}>10 câu</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Chủ đề Toán học</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="Hàm số và Đồ thị">Hàm số và Đồ thị</option>
                <option value="Đạo hàm và Ứng dụng">Đạo hàm và Ứng dụng</option>
                <option value="Mũ và Logarit">Mũ và Logarit</option>
                <option value="Nguyên hàm và Tích phân">Nguyên hàm và Tích phân</option>
                <option value="Hình học không gian cổ điển">Hình học không gian</option>
                <option value="Hình học giải tích Oxyz">Hình học Oxyz</option>
                <option value="Vectơ và Hệ thức lượng">Vectơ và Hệ thức lượng</option>
                <option value="Xác suất và Thống kê">Xác suất và Thống kê</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Mức độ nhận thức</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="Nhận biết">Nhận biết</option>
                <option value="Thông hiểu">Thông hiểu</option>
                <option value="Vận dụng">Vận dụng</option>
                <option value="Vận dụng cao">Vận dụng cao</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Yêu cầu cụ thể của thầy Bùi Ngọc Thắng:
            </label>
            <textarea
              rows={5}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Nhập đề bài hoặc yêu cầu bổ sung chi tiết..."
              className="w-full p-2.5 font-serif text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
            />
          </div>

          <button
            onClick={handleSendPrompt}
            disabled={loading}
            className="w-full py-2.5 bg-[#0878D1] hover:bg-[#064A87] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI đang phân tích và soạn thảo...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Gửi yêu cầu tới Trợ lý AI</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output Screen (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-[#064A87] text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Kết quả phản hồi từ Trợ lý AI</span>
              </h3>

              {apiResponse && (
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={handleCopyResult}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                  <button
                    onClick={handleSaveToBank}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-[#0878D1] hover:bg-blue-100 font-semibold"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Lưu vào Ngân hàng đề</span>
                  </button>
                </div>
              )}
            </div>

            {/* Error banner if any */}
            {apiError && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span>Thông báo trạng thái Trợ lý AI:</span>
                </div>
                <p>{apiError}</p>
                <p className="text-[11px] text-amber-700 italic">
                  * Hệ thống được cấu hình để bảo vệ khóa API an toàn phía server. Thầy có thể gắn khóa GEMINI_API_KEY trong bảng điều khiển AI Studio Secrets.
                </p>
              </div>
            )}

            {/* Output view */}
            <div className="py-4">
              {loading ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-10 h-10 border-3 border-[#0878D1] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-[#064A87]">
                    Trợ lý AI đang giải toán và sinh công thức KaTeX...
                  </p>
                  <p className="text-xs text-gray-400">
                    Vui lòng đợi giây lát trong khi mô hình tối ưu hóa nội dung cho thầy Thắng.
                  </p>
                </div>
              ) : apiResponse ? (
                <div className="text-sm text-gray-900 font-serif leading-relaxed max-h-[500px] overflow-y-auto p-3 bg-gray-50/60 rounded-xl border border-gray-200">
                  <MathRenderer content={apiResponse} />
                </div>
              ) : (
                <div className="py-16 text-center text-gray-400 space-y-3">
                  <Bot className="w-12 h-12 mx-auto text-blue-200" />
                  <p className="text-sm font-medium">Chưa có kết quả phản hồi.</p>
                  <p className="text-xs max-w-sm mx-auto text-gray-400">
                    Thầy vui lòng chọn tác vụ mong muốn ở cột bên trái và bấm "Gửi yêu cầu tới Trợ lý AI" để bắt đầu.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>Mô hình sử dụng: Gemini 3.8 Flash • Định dạng: Tiếng Việt & LaTeX</span>
            <span>Trường THPT Đan Phượng</span>
          </div>
        </div>
      </div>
    </div>
  );
};
