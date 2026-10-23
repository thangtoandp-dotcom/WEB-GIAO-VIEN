import React, { useState, useMemo } from 'react';
import {
  FileQuestion,
  Plus,
  Search,
  Filter,
  Copy,
  Edit,
  Trash2,
  CheckCircle,
  Eye,
  Download,
  BookOpen,
  X,
  FileText,
  Printer,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Question, GradeLevel, CognitiveLevel, QuestionType } from '../types';
import { MathRenderer } from './MathRenderer';
import { UploadExamModal } from './UploadExamModal';

export const QuestionBankView: React.FC = () => {
  const { questions, addQuestion, updateQuestion, deleteQuestion, setActiveTab, setAiInitialPrompt } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<'all' | '10' | '11' | '12'>('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState<'all' | CognitiveLevel>('all');
  const [selectedType, setSelectedType] = useState<'all' | QuestionType>('all');

  // Question Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadExamOpen, setIsUploadExamOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form Fields
  const [qGrade, setQGrade] = useState<GradeLevel>(12);
  const [qTopic, setQTopic] = useState('Hàm số và Đồ thị');
  const [qLevel, setQLevel] = useState<CognitiveLevel>('Thông hiểu');
  const [qType, setQType] = useState<QuestionType>('single_choice');
  const [qContent, setQContent] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [qAnswer, setQAnswer] = useState('A');
  const [qSolution, setQSolution] = useState('');
  const [qPoints, setQPoints] = useState(0.25);

  // Print Exam Modal
  const [isPrintExamOpen, setIsPrintExamOpen] = useState(false);
  const [selectedQuestionIdsForExam, setSelectedQuestionIdsForExam] = useState<string[]>([]);

  const topicsList = [
    'Hàm số và Đồ thị',
    'Đạo hàm',
    'Mũ và Logarit',
    'Nguyên hàm và Tích phân',
    'Hình học không gian',
    'Hình học Oxyz',
    'Vectơ',
    'Hàm số bậc hai',
    'Xác suất và Thống kê',
  ];

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSearch =
        q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchQuery.toLowerCase());
      const matchGrade = selectedGrade === 'all' || q.grade.toString() === selectedGrade;
      const matchTopic = selectedTopic === 'all' || q.topic === selectedTopic;
      const matchLevel = selectedLevel === 'all' || q.level === selectedLevel;
      const matchType = selectedType === 'all' || q.type === selectedType;
      return matchSearch && matchGrade && matchTopic && matchLevel && matchType;
    });
  }, [questions, searchQuery, selectedGrade, selectedTopic, selectedLevel, selectedType]);

  const handleOpenCreateModal = () => {
    setEditingQuestion(null);
    setQGrade(12);
    setQTopic('Hàm số và Đồ thị');
    setQLevel('Thông hiểu');
    setQType('single_choice');
    setQContent('Tìm tập xác định của hàm số $y = \\sqrt{x - 2}$.');
    setOptA('$D = [2; +\\infty)$');
    setOptB('$D = (2; +\\infty)$');
    setOptC('$D = (-\\infty; 2]$');
    setOptD('$D = \\mathbb{R} \\setminus \\{2\\}$');
    setQAnswer('A');
    setQSolution('Điều kiện xác định: $x - 2 \\ge 0 \\Leftrightarrow x \\ge 2$. Do đó $D = [2; +\\infty)$. Chọn A.');
    setQPoints(0.25);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (q: Question) => {
    setEditingQuestion(q);
    setQGrade(q.grade);
    setQTopic(q.topic);
    setQLevel(q.level);
    setQType(q.type);
    setQContent(q.content);
    setOptA(q.options?.find((o) => o.key === 'A')?.content || '');
    setOptB(q.options?.find((o) => o.key === 'B')?.content || '');
    setOptC(q.options?.find((o) => o.key === 'C')?.content || '');
    setOptD(q.options?.find((o) => o.key === 'D')?.content || '');
    setQAnswer(q.correctAnswer);
    setQSolution(q.solution);
    setQPoints(q.points);
    setIsModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qContent.trim()) return;

    const options =
      qType === 'single_choice'
        ? [
            { key: 'A' as const, content: optA },
            { key: 'B' as const, content: optB },
            { key: 'C' as const, content: optC },
            { key: 'D' as const, content: optD },
          ]
        : undefined;

    if (editingQuestion) {
      updateQuestion(editingQuestion.id, {
        grade: qGrade,
        topic: qTopic,
        level: qLevel,
        type: qType,
        content: qContent,
        options,
        correctAnswer: qAnswer,
        solution: qSolution,
        points: qPoints,
      });
    } else {
      addQuestion({
        code: `CH${qGrade}-${Math.floor(10 + Math.random() * 90)}`,
        grade: qGrade,
        topic: qTopic,
        level: qLevel,
        type: qType,
        content: qContent,
        options,
        correctAnswer: qAnswer,
        solution: qSolution,
        points: qPoints,
      });
    }

    setIsModalOpen(false);
  };

  const handleCloneQuestion = (q: Question) => {
    addQuestion({
      code: `${q.code}-CP`,
      grade: q.grade,
      topic: q.topic,
      level: q.level,
      type: q.type,
      content: `${q.content} (Bản sao)`,
      options: q.options,
      correctAnswer: q.correctAnswer,
      solution: q.solution,
      points: q.points,
    });
  };

  const toggleSelectForExam = (id: string) => {
    setSelectedQuestionIdsForExam((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedQuestionsObjects = useMemo(() => {
    return questions.filter((q) => selectedQuestionIdsForExam.includes(q.id));
  }, [questions, selectedQuestionIdsForExam]);

  return (
    <div className="space-y-4">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#0878D1]" />
            <h2 className="text-lg font-bold text-[#064A87]">
              Ngân hàng đề & Câu hỏi Toán THPT
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Quản lý kho câu hỏi, công thức KaTeX, giải chi tiết và tạo ma trận đề kiểm tra
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedQuestionIdsForExam.length > 0 && (
            <button
              onClick={() => setIsPrintExamOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In đề ({selectedQuestionIdsForExam.length} câu)</span>
            </button>
          )}

          <button
            onClick={() => {
              setAiInitialPrompt('Thầy Thắng muốn soạn 5 câu hỏi trắc nghiệm Toán 12 về chủ đề Cực trị của hàm số, mức độ Vận dụng.');
              setActiveTab('ai');
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-50 text-[#0878D1] hover:bg-blue-100 border border-blue-200"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Soạn câu hỏi bằng AI</span>
          </button>

          <button
            onClick={() => setIsUploadExamOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:scale-105"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Tải Đề thi & Bài tập lên</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0878D1] hover:bg-[#064A87] text-white shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm câu hỏi mới</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo nội dung, mã câu, chủ đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
          />
        </div>

        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value as any)}
          className="px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white text-gray-700"
        >
          <option value="all">Tất cả khối lớp</option>
          <option value="10">Khối 10</option>
          <option value="11">Khối 11</option>
          <option value="12">Khối 12</option>
        </select>

        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white text-gray-700"
        >
          <option value="all">Tất cả chuyên đề Toán</option>
          {topicsList.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value as any)}
          className="px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white text-gray-700"
        >
          <option value="all">Tất cả mức độ</option>
          <option value="Nhận biết">Nhận biết</option>
          <option value="Thông hiểu">Thông hiểu</option>
          <option value="Vận dụng">Vận dụng</option>
          <option value="Vận dụng cao">Vận dụng cao</option>
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as any)}
          className="px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white text-gray-700"
        >
          <option value="all">Tất cả dạng câu hỏi</option>
          <option value="single_choice">Trắc nghiệm 4 lựa chọn</option>
          <option value="true_false">Đúng / Sai</option>
          <option value="short_answer">Trả lời ngắn</option>
          <option value="essay">Tự luận</option>
        </select>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-blue-100 text-center text-gray-400 text-sm">
            Không tìm thấy câu hỏi nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isSelected = selectedQuestionIdsForExam.includes(q.id);
            return (
              <div
                key={q.id}
                className={`bg-white rounded-xl border p-4 shadow-sm transition-all ${
                  isSelected ? 'border-[#0878D1] bg-blue-50/20 ring-1 ring-[#0878D1]' : 'border-blue-100'
                }`}
              >
                {/* Header bar of question */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-gray-100 text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectForExam(q.id)}
                      className="w-4 h-4 text-[#0878D1] rounded border-gray-300 focus:ring-[#0878D1] cursor-pointer"
                      title="Chọn để tạo đề thi"
                    />
                    <span className="font-bold text-[#064A87]">Câu {idx + 1}</span>
                    <span className="font-mono bg-blue-50 text-[#0878D1] px-2 py-0.5 rounded font-semibold text-[11px]">
                      {q.code}
                    </span>
                    <span className="px-2 py-0.5 rounded font-medium bg-gray-100 text-gray-700 text-[11px]">
                      Khối {q.grade}
                    </span>
                    <span className="px-2 py-0.5 rounded font-medium bg-blue-100 text-[#064A87] text-[11px]">
                      {q.topic}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                        q.level === 'Nhận biết'
                          ? 'bg-gray-100 text-gray-700'
                          : q.level === 'Thông hiểu'
                          ? 'bg-blue-50 text-blue-700'
                          : q.level === 'Vận dụng'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {q.level}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="font-medium">{q.points} điểm</span>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => handleCloneQuestion(q)}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                      title="Sao chép câu hỏi"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(q)}
                      className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                      title="Chỉnh sửa câu hỏi"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Thầy có chắc chắn muốn xóa câu hỏi ${q.code}?`)) {
                          deleteQuestion(q.id);
                        }
                      }}
                      className="p-1.5 rounded hover:bg-red-50 text-red-600"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question Content */}
                <div className="py-3 text-sm text-gray-900 font-serif">
                  <MathRenderer content={q.content} />
                </div>

                {/* Multiple choice options */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2 text-xs">
                    {q.options.map((opt) => {
                      const isCorrect = q.correctAnswer === opt.key;
                      return (
                        <div
                          key={opt.key}
                          className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                            isCorrect
                              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-medium'
                              : 'bg-gray-50/70 border-gray-200 text-gray-800'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {opt.key}
                          </span>
                          <div className="flex-1">
                            <MathRenderer content={opt.content} />
                          </div>
                          {isCorrect && (
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Detailed Solution Accordion */}
                {q.solution && (
                  <details className="mt-2.5 pt-2 border-t border-gray-100 group">
                    <summary className="text-xs font-semibold text-[#0878D1] cursor-pointer hover:underline flex items-center gap-1 select-none">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem hướng dẫn giải chi tiết & đáp án</span>
                    </summary>
                    <div className="mt-2 p-3 bg-blue-50/40 rounded-lg border border-blue-100 text-xs text-gray-800 leading-relaxed font-serif">
                      <p className="font-bold text-[#064A87] mb-1">
                        Đáp án đúng: <span className="text-emerald-700">{q.correctAnswer}</span>
                      </p>
                      <MathRenderer content={q.solution} />
                    </div>
                  </details>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT QUESTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-blue-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#064A87]">
                {editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới vào ngân hàng'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="py-4 space-y-4 text-xs">
              {/* Category selections */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Khối lớp</label>
                  <select
                    value={qGrade}
                    onChange={(e) => setQGrade(Number(e.target.value) as GradeLevel)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value={10}>Lớp 10</option>
                    <option value={11}>Lớp 11</option>
                    <option value={12}>Lớp 12</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Chuyên đề</label>
                  <select
                    value={qTopic}
                    onChange={(e) => setQTopic(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    {topicsList.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Mức độ nhận thức</label>
                  <select
                    value={qLevel}
                    onChange={(e) => setQLevel(e.target.value as CognitiveLevel)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="Nhận biết">Nhận biết</option>
                    <option value="Thông hiểu">Thông hiểu</option>
                    <option value="Vận dụng">Vận dụng</option>
                    <option value="Vận dụng cao">Vận dụng cao</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Dạng câu hỏi</label>
                  <select
                    value={qType}
                    onChange={(e) => setQType(e.target.value as QuestionType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="single_choice">Trắc nghiệm 4 lựa chọn</option>
                    <option value="true_false">Đúng / Sai</option>
                    <option value="short_answer">Trả lời ngắn</option>
                    <option value="essay">Tự luận</option>
                  </select>
                </div>
              </div>

              {/* Question Content */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Nội dung câu hỏi (sử dụng công thức LaTeX dạng $công thức$) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={qContent}
                  onChange={(e) => setQContent(e.target.value)}
                  placeholder="Ví dụ: Cho hàm số $y = x^3 - 3x^2 + 2$. Tìm khoảng đồng biến của hàm số..."
                  className="w-full p-2.5 font-mono text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
                />
              </div>

              {/* Live Preview of Question */}
              {qContent && (
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200">
                  <p className="text-[11px] font-bold text-[#064A87] mb-1">Xem trước công thức hiển thị:</p>
                  <MathRenderer content={qContent} className="text-sm font-serif" />
                </div>
              )}

              {/* 4 Options if Single Choice */}
              {qType === 'single_choice' && (
                <div className="space-y-2">
                  <p className="font-semibold text-gray-700">Các phương án lựa chọn:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="font-bold text-gray-600 text-xs">Phương án A:</span>
                      <input
                        type="text"
                        value={optA}
                        onChange={(e) => setOptA(e.target.value)}
                        placeholder="Nội dung đáp án A..."
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-gray-600 text-xs">Phương án B:</span>
                      <input
                        type="text"
                        value={optB}
                        onChange={(e) => setOptB(e.target.value)}
                        placeholder="Nội dung đáp án B..."
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-gray-600 text-xs">Phương án C:</span>
                      <input
                        type="text"
                        value={optC}
                        onChange={(e) => setOptC(e.target.value)}
                        placeholder="Nội dung đáp án C..."
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-gray-600 text-xs">Phương án D:</span>
                      <input
                        type="text"
                        value={optD}
                        onChange={(e) => setOptD(e.target.value)}
                        placeholder="Nội dung đáp án D..."
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Đáp án đúng</label>
                      <select
                        value={qAnswer}
                        onChange={(e) => setQAnswer(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Điểm số</label>
                      <input
                        type="number"
                        step="0.05"
                        value={qPoints}
                        onChange={(e) => setQPoints(parseFloat(e.target.value) || 0.25)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Solution */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Hướng dẫn giải chi tiết (LaTeX)
                </label>
                <textarea
                  rows={3}
                  value={qSolution}
                  onChange={(e) => setQSolution(e.target.value)}
                  placeholder="Các bước biến đổi toán học chi tiết..."
                  className="w-full p-2.5 font-mono text-xs border border-gray-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0878D1] hover:bg-[#064A87] text-white font-semibold rounded-lg shadow-sm"
                >
                  Lưu vào ngân hàng đề
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT EXAM MODAL */}
      {isPrintExamOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-8 shadow-2xl border border-blue-100 max-h-[90vh] overflow-y-auto">
            {/* Header for print preview */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 no-print">
              <h3 className="text-base font-bold text-[#064A87] flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#0878D1]" />
                <span>Xem bản in đề thi chính thức ({selectedQuestionsObjects.length} câu)</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#0878D1] hover:bg-[#064A87] text-white font-semibold rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>In ra giấy / Lưu PDF</span>
                </button>
                <button
                  onClick={() => setIsPrintExamOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Printable Exam Paper */}
            <div className="pt-6 font-serif text-black leading-relaxed">
              {/* Header Box */}
              <div className="grid grid-cols-2 gap-4 pb-6 border-b-2 border-black text-center text-sm">
                <div>
                  <p className="font-bold uppercase tracking-wider">SỞ GIÁO DỤC VÀ ĐÀO TẠO HÀ NỘI</p>
                  <p className="font-bold uppercase text-base">TRƯỜNG THPT ĐAN PHƯỢNG</p>
                  <p className="italic text-xs mt-1">Giáo viên ra đề: Thầy Bùi Ngọc Thắng</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-base">ĐỀ KIỂM TRA ĐỊNH KỲ MÔN TOÁN</p>
                  <p className="font-bold">NĂM HỌC 2025 - 2026</p>
                  <p className="italic text-xs mt-1">Thời gian làm bài: 45 phút (không kể thời gian phát đề)</p>
                </div>
              </div>

              {/* Student info lines */}
              <div className="flex justify-between py-3 border-b border-gray-300 text-xs">
                <span>Họ và tên học sinh: ..........................................................................</span>
                <span>Lớp: ......................... Mã đề: 101</span>
              </div>

              {/* Questions body */}
              <div className="py-6 space-y-5">
                {selectedQuestionsObjects.map((q, i) => (
                  <div key={q.id} className="text-sm">
                    <p className="font-bold">
                      Câu {i + 1} ({q.points} điểm):{' '}
                      <span className="font-normal font-serif">
                        <MathRenderer content={q.content} />
                      </span>
                    </p>

                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2 ml-4 text-xs font-serif">
                        {q.options.map((opt) => (
                          <div key={opt.key} className="flex items-start gap-1">
                            <span className="font-bold">{opt.key}.</span>
                            <MathRenderer content={opt.content} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Answer Key Table */}
              <div className="pt-6 mt-8 border-t-2 border-dashed border-gray-400">
                <p className="font-bold text-center text-sm uppercase mb-3">
                  BẢNG ĐÁP ÁN DÀNH CHO GIÁO VIÊN
                </p>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 text-center text-xs">
                  {selectedQuestionsObjects.map((q, i) => (
                    <div key={q.id} className="border border-gray-400 p-1 rounded">
                      <p className="font-bold text-gray-500">C{i + 1}</p>
                      <p className="font-bold text-blue-700">{q.correctAnswer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Exam & Questions Modal with 3 integrated methods */}
      <UploadExamModal
        isOpen={isUploadExamOpen}
        onClose={() => setIsUploadExamOpen(false)}
      />
    </div>
  );
};
