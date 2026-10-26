import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  FileText,
  User,
  GraduationCap,
  Calendar,
  Send,
  Upload,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { Exam, Question, ExamSubmission } from '../types';
import { MathRenderer } from './MathRenderer';
import { UploadExamModal } from './UploadExamModal';

export const OnlineExamView: React.FC = () => {
  const {
    exams,
    classes,
    questions,
    addExam,
    updateExam,
    submissions,
    submitExam,
    students,
    currentRole,
    isCreateExamOpen,
    setIsCreateExamOpen,
  } = useApp();

  // Selected Exam for taking test
  const [takingExam, setTakingExam] = useState<Exam | null>(null);
  const [isUploadExamOpen, setIsUploadExamOpen] = useState(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: string }>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(45 * 60);
  const [isExamFinished, setIsExamFinished] = useState(false);
  const [lastSubmissionResult, setLastSubmissionResult] = useState<ExamSubmission | null>(null);

  // Student identity for taking test
  const [testStudentName, setTestStudentName] = useState('Nguyễn Văn Nam (10A1)');

  // Create exam modal fields
  const [examTitle, setExamTitle] = useState('');
  const [examGrade, setExamGrade] = useState<10 | 11 | 12>(11);
  const [examClassNames, setExamClassNames] = useState<string[]>(['11A1']);
  const [examDuration, setExamDuration] = useState(45);
  const [selectedQuestionsForExam, setSelectedQuestionsForExam] = useState<string[]>([]);

  // Start exam timer countdown
  useEffect(() => {
    if (!takingExam || isExamFinished) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [takingExam, isExamFinished]);

  const handleStartExam = (exam: Exam) => {
    setTakingExam(exam);
    setActiveQuestionIdx(0);
    setUserAnswers({});
    setTimeLeftSeconds(exam.durationMinutes * 60);
    setIsExamFinished(false);
    setLastSubmissionResult(null);
  };

  const handleFinishExam = () => {
    if (!takingExam) return;

    // Get questions objects
    const examQuestions = questions.filter((q) =>
      takingExam.questionIds.length > 0 ? takingExam.questionIds.includes(q.id) : true
    );

    let correctCount = 0;
    examQuestions.forEach((q) => {
      if (userAnswers[q.id] && userAnswers[q.id] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const score = Number(((correctCount / (examQuestions.length || 1)) * 10).toFixed(1));

    const submission: ExamSubmission = {
      id: `sub_${Date.now()}`,
      examId: takingExam.id,
      studentId: 's1',
      studentName: testStudentName,
      className: takingExam.classNames[0] || '11A1',
      submittedAt: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'),
      answers: userAnswers,
      autoScore: score,
      essayScore: 0,
      totalScore: score,
      status: 'submitted',
      teacherFeedback:
        score >= 8
          ? 'Bài làm xuất sắc! Em nắm rất chắc các công thức và phương pháp giải.'
          : score >= 6.5
          ? 'Bài làm khá tốt. Cần lưu ý một số câu vận dụng để tối ưu thời gian.'
          : 'Cần ôn lại các định nghĩa và công thức cơ bản.',
    };

    submitExam(submission);
    setLastSubmissionResult(submission);
    setIsExamFinished(true);

    if (score >= 7.0) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  };

  const handleCreateNewExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) return;

    // Default question ids if none selected
    const chosenQIds =
      selectedQuestionsForExam.length > 0
        ? selectedQuestionsForExam
        : questions.filter((q) => q.grade === examGrade).slice(0, 10).map((q) => q.id);

    addExam({
      code: `KT${examGrade}-${Math.floor(10 + Math.random() * 90)}`,
      title: examTitle.trim(),
      grade: examGrade,
      classIds: ['c1'],
      classNames: examClassNames,
      durationMinutes: examDuration,
      totalQuestions: chosenQIds.length || 10,
      dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toLocaleDateString('vi-VN'),
      questionIds: chosenQIds,
      isOnline: true,
    });

    setExamTitle('');
    setIsCreateExamOpen(false);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-[#0878D1]" />
            <h2 className="text-lg font-bold text-[#064A87]">
              Kiểm tra trực tuyến & Phòng thi môn Toán
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Tổ chức kiểm tra trắc nghiệm & tự luận, phòng thi cho học sinh, tự động chấm điểm và thống kê
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUploadExamOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:scale-105"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Tải Đề thi lên</span>
          </button>

          <button
            onClick={() => setIsCreateExamOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0878D1] hover:bg-[#064A87] text-white shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo bài kiểm tra mới</span>
          </button>
        </div>
      </div>

      {/* ONLINE TEST SIMULATOR (If Taking Exam is active) */}
      {takingExam && (
        <div className="bg-white rounded-2xl border-2 border-[#0878D1] p-5 shadow-lg space-y-4 animate-in fade-in">
          {/* Exam Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200">
            <div>
              <span className="text-xs font-bold text-[#0878D1] uppercase tracking-wider">
                Phòng thi trực tuyến • THPT Đan Phượng
              </span>
              <h3 className="text-xl font-bold text-[#064A87]">{takingExam.title}</h3>
              <p className="text-xs text-gray-500">
                Thí sinh: <span className="font-semibold text-gray-800">{testStudentName}</span> • Lớp{' '}
                {takingExam.classNames.join(', ')}
              </p>
            </div>

            {/* Countdown timer */}
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-base font-mono font-bold shadow-sm ${
                  timeLeftSeconds < 300
                    ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
                    : 'bg-blue-50 text-[#0878D1] border border-blue-200'
                }`}
              >
                <Clock className="w-5 h-5" />
                <span>{formatTimer(timeLeftSeconds)}</span>
              </div>

              {!isExamFinished ? (
                <button
                  onClick={() => {
                    if (confirm('Em có chắc chắn muốn nộp bài kiểm tra không?')) {
                      handleFinishExam();
                    }
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Nộp bài thi</span>
                </button>
              ) : (
                <button
                  onClick={() => setTakingExam(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Rời phòng thi
                </button>
              )}
            </div>
          </div>

          {/* Test Screen Body */}
          {!isExamFinished ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
              {/* Question Screen (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                {(() => {
                  const examQuestions = questions.filter((q) =>
                    takingExam.questionIds.length > 0 ? takingExam.questionIds.includes(q.id) : true
                  );
                  const currentQ = examQuestions[activeQuestionIdx] || examQuestions[0];
                  if (!currentQ) return <div>Không có câu hỏi nào trong đề.</div>;

                  return (
                    <div className="bg-gray-50/70 p-5 rounded-xl border border-gray-200 space-y-4">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="font-bold text-[#064A87] text-sm">
                          Câu {activeQuestionIdx + 1} / {examQuestions.length}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-[#0878D1] font-semibold">
                          {currentQ.level} • {currentQ.points} điểm
                        </span>
                      </div>

                      {/* Content */}
                      <div className="text-base text-gray-900 leading-relaxed font-serif">
                        <MathRenderer content={currentQ.content} />
                      </div>

                      {/* Options */}
                      {currentQ.options && currentQ.options.length > 0 && (
                        <div className="space-y-2 pt-2">
                          {currentQ.options.map((opt) => {
                            const isSelected = userAnswers[currentQ.id] === opt.key;
                            return (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() =>
                                  setUserAnswers((prev) => ({
                                    ...prev,
                                    [currentQ.id]: opt.key,
                                  }))
                                }
                                className={`w-full p-3 rounded-xl border text-left text-sm flex items-start gap-3 transition-all ${
                                  isSelected
                                    ? 'bg-blue-100/70 border-[#0878D1] ring-2 ring-[#0878D1]/40 font-semibold text-[#064A87]'
                                    : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-800'
                                }`}
                              >
                                <span
                                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                    isSelected
                                      ? 'bg-[#0878D1] text-white'
                                      : 'bg-gray-200 text-gray-700'
                                  }`}
                                >
                                  {opt.key}
                                </span>
                                <div className="flex-1 font-serif">
                                  <MathRenderer content={opt.content} />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Prev / Next buttons */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <button
                          disabled={activeQuestionIdx === 0}
                          onClick={() => setActiveQuestionIdx((idx) => Math.max(0, idx - 1))}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-40 text-xs font-semibold flex items-center gap-1 hover:bg-white"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Câu trước</span>
                        </button>

                        <button
                          disabled={activeQuestionIdx === examQuestions.length - 1}
                          onClick={() =>
                            setActiveQuestionIdx((idx) =>
                              Math.min(examQuestions.length - 1, idx + 1)
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-[#0878D1] hover:bg-[#064A87] text-white text-xs font-semibold flex items-center gap-1"
                        >
                          <span>Câu tiếp theo</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Question Navigation Palette (4 cols) */}
              <div className="lg:col-span-4 bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                <h4 className="font-bold text-xs text-[#064A87] uppercase tracking-wider">
                  Bảng điều hướng câu hỏi
                </h4>

                <div className="grid grid-cols-5 gap-2">
                  {(() => {
                    const examQuestions = questions.filter((q) =>
                      takingExam.questionIds.length > 0
                        ? takingExam.questionIds.includes(q.id)
                        : true
                    );
                    return examQuestions.map((q, idx) => {
                      const isAnswered = !!userAnswers[q.id];
                      const isCurrent = activeQuestionIdx === idx;
                      return (
                        <button
                          key={q.id}
                          onClick={() => setActiveQuestionIdx(idx)}
                          className={`h-9 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                            isCurrent
                              ? 'ring-2 ring-[#0878D1] bg-[#0878D1] text-white shadow-sm'
                              : isAnswered
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold'
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    });
                  })()}
                </div>

                <div className="pt-3 border-t border-gray-200 text-[11px] text-gray-600 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-[#0878D1] inline-block" />
                    <span>Đang làm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" />
                    <span>Đã chọn đáp án</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-white border border-gray-300 inline-block" />
                    <span>Chưa làm</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* SUBMISSION RESULT CARD */
            <div className="p-6 bg-emerald-50/60 rounded-xl border border-emerald-200 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-lg">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-2xl font-bold text-[#064A87]">
                  Đã hoàn thành bài kiểm tra!
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Bài làm của em đã được ghi nhận trên hệ thống WEB QUẢN TRỊ LỚP HỌC.
                </p>
              </div>

              <div className="max-w-md mx-auto bg-white p-4 rounded-xl border border-emerald-100 shadow-sm grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-500">Điểm số đạt được:</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {lastSubmissionResult?.totalScore.toFixed(1)} / 10
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Thời gian nộp:</p>
                  <p className="font-semibold text-gray-800 mt-2">
                    {lastSubmissionResult?.submittedAt}
                  </p>
                </div>
              </div>

              {lastSubmissionResult?.teacherFeedback && (
                <div className="max-w-lg mx-auto bg-blue-50/80 p-3 rounded-lg border border-blue-200 text-xs text-[#064A87] font-serif text-left">
                  <span className="font-bold">Nhận xét của thầy Bùi Ngọc Thắng: </span>
                  {lastSubmissionResult.teacherFeedback}
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => setTakingExam(null)}
                  className="px-6 py-2.5 bg-[#0878D1] hover:bg-[#064A87] text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Trở lại danh sách bài kiểm tra
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* EXAMS LIST TABLE */}
      <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-4 space-y-4">
        <h3 className="font-bold text-[#12345A] text-base">Danh sách các bài kiểm tra đã lập</h3>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#EAF5FF] text-[#064A87] font-bold border-b border-blue-200">
              <tr>
                <th className="py-2.5 px-3">Mã đề</th>
                <th className="py-2.5 px-3">Tên bài kiểm tra</th>
                <th className="py-2.5 px-2">Khối</th>
                <th className="py-2.5 px-2">Lớp áp dụng</th>
                <th className="py-2.5 px-2">Thời lượng</th>
                <th className="py-2.5 px-2">Số câu</th>
                <th className="py-2.5 px-2">Ngày thi</th>
                <th className="py-2.5 px-2">Điểm TB</th>
                <th className="py-2.5 px-2 text-right">Phòng thi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {exams.map((ex) => (
                <tr key={ex.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-[#0878D1] font-mono">{ex.code}</td>
                  <td className="py-2.5 px-3 font-bold text-gray-800">{ex.title}</td>
                  <td className="py-2.5 px-2">Khối {ex.grade}</td>
                  <td className="py-2.5 px-2 font-medium text-gray-700">{ex.classNames.join(', ')}</td>
                  <td className="py-2.5 px-2">{ex.durationMinutes} phút</td>
                  <td className="py-2.5 px-2">{ex.totalQuestions} câu</td>
                  <td className="py-2.5 px-2 text-gray-500">{ex.createdDate}</td>
                  <td className="py-2.5 px-2 font-bold text-[#0878D1]">
                    {ex.avgScore ? ex.avgScore.toFixed(1) : '-'}
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <button
                      onClick={() => handleStartExam(ex)}
                      className="px-3 py-1.5 rounded-lg bg-[#0878D1] hover:bg-[#064A87] text-white font-semibold text-xs inline-flex items-center gap-1 shadow-xs"
                      title="Vào phòng thi thử nghiệm"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Vào thi</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE EXAM MODAL */}
      {isCreateExamOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-blue-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#064A87]">Tạo bài kiểm tra trực tuyến mới</h3>
              <button
                onClick={() => setIsCreateExamOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewExamSubmit} className="py-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tên bài kiểm tra *</label>
                <input
                  type="text"
                  required
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="Ví dụ: Kiểm tra 45 phút - Đại số & Giải tích"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Khối lớp</label>
                  <select
                    value={examGrade}
                    onChange={(e) => setExamGrade(Number(e.target.value) as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value={10}>Khối 10</option>
                    <option value={11}>Khối 11</option>
                    <option value={12}>Khối 12</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Thời lượng làm bài</label>
                  <select
                    value={examDuration}
                    onChange={(e) => setExamDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value={15}>15 phút</option>
                    <option value={45}>45 phút</option>
                    <option value={90}>90 phút</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Lớp áp dụng</label>
                <select
                  multiple
                  value={examClassNames}
                  onChange={(e) =>
                    setExamClassNames(
                      Array.from(e.target.selectedOptions, (option) => option.value)
                    )
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg h-24 bg-white"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      Lớp {c.name} ({c.totalStudents} HS)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">Giữ Ctrl / Cmd để chọn nhiều lớp</p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateExamOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0878D1] hover:bg-[#064A87] text-white font-semibold rounded-lg shadow-sm"
                >
                  Lưu & Mở phòng thi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Exam Modal */}
      <UploadExamModal
        isOpen={isUploadExamOpen}
        onClose={() => setIsUploadExamOpen(false)}
      />
    </div>
  );
};
