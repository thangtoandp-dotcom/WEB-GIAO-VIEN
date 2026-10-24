import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  Table,
  Paperclip,
  Sparkles,
  Check,
  AlertCircle,
  Download,
  Trash2,
  BookOpen,
  Clock,
  GraduationCap,
  Layers,
  ChevronDown,
  Eye,
  FileSpreadsheet,
  FileUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { Question, GradeLevel, CognitiveLevel, QuestionType, Exam, DocItem } from '../types';
import { MathRenderer } from './MathRenderer';
import { readFileAsDataUrl } from '../lib/fileUtils';

interface UploadExamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedQuestionItem {
  id: string;
  code: string;
  grade: GradeLevel;
  topic: string;
  level: CognitiveLevel;
  type: QuestionType;
  content: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; content: string }[];
  correctAnswer: string;
  solution: string;
  points: number;
}

export const UploadExamModal: React.FC<UploadExamModalProps> = ({ isOpen, onClose }) => {
  const { addQuestionsBatch, addExam, addDocument, classes, setActiveTab } = useApp();

  const [activeMethodTab, setActiveMethodTab] = useState<'text_parse' | 'excel_csv' | 'document_file'>('text_parse');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ================= TAB 1: DÁN VĂN BẢN / WORD / LATEX =================
  const [rawText, setRawText] = useState('');
  const [defaultGrade, setDefaultGrade] = useState<GradeLevel>(12);
  const [defaultTopic, setDefaultTopic] = useState('Hàm số và Đồ thị');
  const [defaultLevel, setDefaultLevel] = useState<CognitiveLevel>('Thông hiểu');
  const [defaultPoints, setDefaultPoints] = useState(0.25);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestionItem[]>([]);
  const [isExamSyncChecked, setIsExamSyncChecked] = useState(false);
  const [syncExamTitle, setSyncExamTitle] = useState('Đề kiểm tra trắc nghiệm Toán THPT Đan Phượng');
  const [syncExamDuration, setSyncExamDuration] = useState(45);
  const [syncSelectedClasses, setSyncSelectedClasses] = useState<string[]>(['12A1']);

  // ================= TAB 2: EXCEL / CSV =================
  const [csvFileName, setCsvFileName] = useState('');
  const [parsedCsvQuestions, setParsedCsvQuestions] = useState<ParsedQuestionItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ================= TAB 3: TỆP ĐỀ HOÀN CHỈNH (.DOCX / .PDF / .XLSX) =================
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<'exam' | 'matrix' | 'reference' | 'sgk' | 'guide'>('exam');
  const [docGrade, setDocGrade] = useState<GradeLevel>(12);
  const [docFileType, setDocFileType] = useState<'PDF' | 'DOCX' | 'XLSX'>('PDF');
  const [docDescription, setDocDescription] = useState('');
  const [docDuration, setDocDuration] = useState(45);
  const [uploadedExamFileName, setUploadedExamFileName] = useState('');
  const [uploadedExamFileSize, setUploadedExamFileSize] = useState('');
  const [uploadedFileBase64, setUploadedFileBase64] = useState<string>('');
  const [syncToOnlineTestFromDoc, setSyncToOnlineTestFromDoc] = useState(true);
  const examFileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Topics list for selection
  const topicsList = [
    'Hàm số và Đồ thị',
    'Đạo hàm',
    'Mũ và Logarit',
    'Nguyên hàm và Tích phân',
    'Hình học không gian',
    'Hình học Oxyz',
    'Vectơ',
    'Hàm số bậc hai',
    'Lượng giác',
    'Xác suất và Thống kê',
  ];

  // Helper to load sample text
  const handleLoadSampleText = () => {
    setErrorMessage(null);
    setDefaultGrade(12);
    setDefaultTopic('Hàm số và Đồ thị');
    const sample = `Câu 1: Cho hàm số y = \\frac{2x - 1}{x + 1}. Đồ thị hàm số có đường tiệm cận đứng là đường thẳng nào dưới đây?
A. x = 1
B. x = -1
C. y = 2
D. y = -1
Lời giải: Ta có \\lim_{x \\to (-1)^+} \\frac{2x - 1}{x + 1} = -\\infty nên đường thẳng x = -1 là tiệm cận đứng của đồ thị hàm số. Chọn B.

Câu 2: Tính tích phân I = \\int_{0}^{1} x e^x dx. Khẳng định nào sau đây là đúng?
A. I = 1
B. I = e - 1
C. I = e
D. I = 2e - 1
Lời giải: Đặt u = x \\Rightarrow du = dx, dv = e^x dx \\Rightarrow v = e^x. Ta có I = x e^x \\big|_0^1 - \\int_{0}^{1} e^x dx = e - (e - 1) = 1. Do đó chọn A.

Câu 3: Trong không gian với hệ tọa độ Oxyz, cho mặt cầu (S): (x - 1)^2 + (y + 2)^2 + (z - 3)^2 = 16. Tìm tọa độ tâm I và bán kính R của mặt cầu (S).
A. I(1; -2; 3), R = 16
B. I(-1; 2; -3), R = 4
C. I(1; -2; 3), R = 4
D. I(1; 2; 3), R = 4
Lời giải: Mặt cầu dạng chính tắc (x - a)^2 + (y - b)^2 + (z - c)^2 = R^2 có tâm I(1; -2; 3) và bán kính R = \\sqrt{16} = 4. Chọn C.`;

    setRawText(sample);
    parseQuestionsFromText(sample, 12, 'Hàm số và Đồ thị', 'Thông hiểu', 0.25);
  };

  // Smart Parser for Vietnamese High School Math Exam Text
  const parseQuestionsFromText = (
    text: string,
    grade: GradeLevel,
    topic: string,
    level: CognitiveLevel,
    points: number
  ) => {
    setErrorMessage(null);
    if (!text.trim()) {
      setParsedQuestions([]);
      return;
    }

    // Split text into question blocks based on "Câu X:" or "Bài X:"
    // Matches "Câu 1:", "Câu 1.", "Bài 1:", etc.
    const questionBlocks = text.split(/(?:^|\n)(?=(?:Câu|Bài)\s*\d+[\.:])/i);

    const parsed: ParsedQuestionItem[] = [];

    questionBlocks.forEach((block, index) => {
      const trimmed = block.trim();
      if (!trimmed) return;

      // Extract question number/code
      const headerMatch = trimmed.match(/^(?:Câu|Bài)\s*(\d+)[\.:]/i);
      const qNum = headerMatch ? headerMatch[1] : `${index + 1}`;
      const code = `CH${grade}-${qNum.padStart(2, '0')}`;

      // Remove the "Câu 1:" prefix from body
      let body = trimmed.replace(/^(?:Câu|Bài)\s*\d+[\.:]\s*/i, '');

      // Separate solution if present: "Lời giải:" or "Hướng dẫn giải:"
      let solution = '';
      const solMatch = body.split(/(?:Lời giải|Hướng dẫn giải|Giải chi tiết)[\.:]/i);
      if (solMatch.length > 1) {
        body = solMatch[0].trim();
        solution = solMatch.slice(1).join(' ').trim();
      }

      // Try to detect correct answer: "Chọn A", "Đáp án: A", "Đáp án A"
      let detectedAnswer = 'A';
      const ansMatch = (trimmed + ' ' + solution).match(/(?:Chọn|Đáp án|Chọn đáp án)\s*[:.]?\s*([A-D])/i);
      if (ansMatch && ansMatch[1]) {
        detectedAnswer = ansMatch[1].toUpperCase();
      }

      // Extract Options A, B, C, D
      // Common formats:
      // A. ... B. ... C. ... D. ...
      // or A) ... B) ...
      const optAMatch = body.search(/(?:^|\n|\s)[A][\.:\)]\s*/);
      const optBMatch = body.search(/(?:^|\n|\s)[B][\.:\)]\s*/);
      const optCMatch = body.search(/(?:^|\n|\s)[C][\.:\)]\s*/);
      const optDMatch = body.search(/(?:^|\n|\s)[D][\.:\)]\s*/);

      let questionContent = body;
      const options: { key: 'A' | 'B' | 'C' | 'D'; content: string }[] = [];

      if (optAMatch !== -1 && optBMatch !== -1 && optCMatch !== -1 && optDMatch !== -1) {
        questionContent = body.substring(0, optAMatch).trim();

        const optAContent = body.substring(optAMatch, optBMatch).replace(/^[A][\.:\)]\s*/, '').trim();
        const optBContent = body.substring(optBMatch, optCMatch).replace(/^[B][\.:\)]\s*/, '').trim();
        const optCContent = body.substring(optCMatch, optDMatch).replace(/^[C][\.:\)]\s*/, '').trim();
        const optDContent = body.substring(optDMatch).replace(/^[D][\.:\)]\s*/, '').trim();

        options.push({ key: 'A', content: optAContent });
        options.push({ key: 'B', content: optBContent });
        options.push({ key: 'C', content: optCContent });
        options.push({ key: 'D', content: optDContent });
      } else {
        // Fallback default choices if format wasn't standard
        options.push({ key: 'A', content: 'Phương án A' });
        options.push({ key: 'B', content: 'Phương án B' });
        options.push({ key: 'C', content: 'Phương án C' });
        options.push({ key: 'D', content: 'Phương án D' });
      }

      parsed.push({
        id: `parsed_${Date.now()}_${index}`,
        code,
        grade,
        topic,
        level,
        type: 'single_choice',
        content: questionContent,
        options,
        correctAnswer: detectedAnswer,
        solution: solution || `Chọn đáp án ${detectedAnswer}.`,
        points,
      });
    });

    if (parsed.length === 0) {
      setErrorMessage('Không nhận diện được câu hỏi nào. Vui lòng kiểm tra định dạng "Câu 1: ... A. ... B. ... C. ... D. ...".');
    } else {
      setParsedQuestions(parsed);
      setSuccessMessage(`Đã bóc tách thành công ${parsed.length} câu hỏi trắc nghiệm!`);
    }
  };

  const handleParseClick = () => {
    parseQuestionsFromText(rawText, defaultGrade, defaultTopic, defaultLevel, defaultPoints);
  };

  // Remove a parsed question from preview
  const handleRemoveParsedQuestion = (id: string) => {
    setParsedQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Save parsed questions to question bank
  const handleSaveParsedQuestions = () => {
    if (parsedQuestions.length === 0) {
      setErrorMessage('Chưa có câu hỏi nào được bóc tách để lưu.');
      return;
    }

    const newQuestions = parsedQuestions.map((q) => ({
      code: q.code,
      grade: q.grade,
      topic: q.topic,
      level: q.level,
      type: q.type,
      content: q.content,
      options: q.options,
      correctAnswer: q.correctAnswer,
      solution: q.solution,
      points: q.points,
    }));

    const createdList = addQuestionsBatch(newQuestions);

    // If user checked sync to online exam
    if (isExamSyncChecked && syncExamTitle.trim()) {
      const selectedClassObjects = classes.filter((c) => syncSelectedClasses.includes(c.name));
      const classIds = selectedClassObjects.map((c) => c.id);

      addExam({
        code: `KT${defaultGrade}-${Math.floor(100 + Math.random() * 900)}`,
        title: syncExamTitle.trim(),
        classIds: classIds.length > 0 ? classIds : [classes[0]?.id || 'c1'],
        classNames: syncSelectedClasses.length > 0 ? syncSelectedClasses : ['12A1'],
        grade: defaultGrade,
        durationMinutes: Number(syncExamDuration) || 45,
        totalQuestions: createdList.length,
        dueDate: '30/05/2026',
        questionIds: createdList.map((q) => q.id),
        isOnline: true,
        shuffleQuestions: true,
      });
    }

    try {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } catch {}

    onClose();
  };

  // ================= TAB 2: EXCEL / CSV HANDLING =================
  const handleDownloadSampleCsv = () => {
    const headers = 'Mã câu,Khối,Chủ đề,Mức độ,Nội dung câu hỏi,Đáp án A,Đáp án B,Đáp án C,Đáp án D,Đáp án đúng,Lời giải';
    const row1 = 'CH12-01,12,Hàm số và Đồ thị,Nhận biết,Đồ thị hàm số $y = x^3 - 3x + 2$ có bao nhiêu điểm cực trị?,0,1,2,3,C,Ta có $y\' = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$. Do $y\'$ đổi dấu hai lần nên có 2 cực trị. Chọn C.';
    const row2 = 'CH12-02,12,Nguyên hàm và Tích phân,Thông hiểu,Họ nguyên hàm của hàm số $f(x) = \\cos 2x$ là:,$-\\frac{1}{2}\\sin 2x + C$,$\\frac{1}{2}\\sin 2x + C$,$2\\sin 2x + C$,$-2\\sin 2x + C$,B,Ta có $\\int \\cos 2x dx = \\frac{1}{2}\\sin 2x + C$. Chọn B.';
    const row3 = 'CH11-01,11,Đạo hàm,Vận dụng,Tính đạo hàm của hàm số $y = \\sin^2(3x)$ tại $x = 0$.,0,1,3,6,A,Ta có $y\' = 2\\sin(3x) \\cdot 3\\cos(3x) = 3\\sin(6x)$. Tại $x = 0$ thì $y\'(0) = 0$. Chọn A.';

    // UTF-8 BOM so Excel opens Vietnamese characters cleanly
    const csvContent = '\uFEFF' + [headers, row1, row2, row3].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'mau_ngan_hang_cau_hoi_thay_thang.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        setErrorMessage('Tệp CSV không có dữ liệu câu hỏi hoặc chỉ có dòng tiêu đề.');
        return;
      }

      // Skip header line
      const parsed: ParsedQuestionItem[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // Parse CSV with quotes handling
        const cols: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let c = 0; c < line.length; c++) {
          const char = line[c];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            cols.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        cols.push(current.trim());

        if (cols.length >= 9) {
          const code = cols[0] || `CH-${i}`;
          const gradeNum = parseInt(cols[1]) || 12;
          const grade: GradeLevel = gradeNum === 10 ? 10 : gradeNum === 11 ? 11 : 12;
          const topic = cols[2] || 'Toán học chung';
          const level: CognitiveLevel = (cols[3] as any) || 'Thông hiểu';
          const questionContent = cols[4] || '';
          const optA = cols[5] || '';
          const optB = cols[6] || '';
          const optC = cols[7] || '';
          const optD = cols[8] || '';
          const correctAns = (cols[9] || 'A').toUpperCase();
          const solution = cols[10] || `Chọn đáp án ${correctAns}.`;

          parsed.push({
            id: `csv_q_${Date.now()}_${i}`,
            code,
            grade,
            topic,
            level,
            type: 'single_choice',
            content: questionContent,
            options: [
              { key: 'A', content: optA },
              { key: 'B', content: optB },
              { key: 'C', content: optC },
              { key: 'D', content: optD },
            ],
            correctAnswer: correctAns,
            solution,
            points: 0.25,
          });
        }
      }

      if (parsed.length === 0) {
        setErrorMessage('Không phân tích được dòng nào hợp lệ từ tệp CSV. Vui lòng tải file mẫu để kiểm tra thứ tự các cột.');
      } else {
        setParsedCsvQuestions(parsed);
        setSuccessMessage(`Đã đọc thành công ${parsed.length} câu hỏi từ tệp ${file.name}!`);
      }
    };

    reader.readAsText(file);
  };

  const handleSaveCsvQuestions = () => {
    if (parsedCsvQuestions.length === 0) {
      setErrorMessage('Chưa có câu hỏi nào từ tệp CSV để lưu.');
      return;
    }

    const newQuestions = parsedCsvQuestions.map((q) => ({
      code: q.code,
      grade: q.grade,
      topic: q.topic,
      level: q.level,
      type: q.type,
      content: q.content,
      options: q.options,
      correctAnswer: q.correctAnswer,
      solution: q.solution,
      points: q.points,
    }));

    addQuestionsBatch(newQuestions);

    try {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } catch {}

    onClose();
  };

  // ================= TAB 3: TỆP ĐỀ THI HOÀN CHỈNH (.DOCX / .PDF / .XLSX) =================
  const handleExamFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedExamFileName(file.name);
    const sizeInKb = Math.round(file.size / 1024);
    setUploadedExamFileSize(sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`);

    if (!docTitle) {
      setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const lower = file.name.toLowerCase();
    if (lower.endsWith('.docx') || lower.endsWith('.doc')) {
      setDocFileType('DOCX');
    } else if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) {
      setDocFileType('XLSX');
    } else {
      setDocFileType('PDF');
    }

    // Read real file content as base64 Data URL for persistent storage in Supabase
    readFileAsDataUrl(file)
      .then((dataUrl) => {
        setUploadedFileBase64(dataUrl);
      })
      .catch((err) => {
        console.error('Lỗi nạp tệp:', err);
      });
  };

  const handleSaveCompleteExamFile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!docTitle.trim()) {
      setErrorMessage('Vui lòng nhập tên đề thi / bài tập.');
      return;
    }

    if (!uploadedExamFileName) {
      setErrorMessage('Vui lòng chọn tệp đề thi (.PDF hoặc .DOCX) từ máy tính của thầy.');
      return;
    }

    // 1. Add to Documents library with real file content
    const categoryNames: Record<string, string> = {
      exam: 'Đề thi & Kiểm tra',
      matrix: 'Ma trận đề & Đặc tả',
      reference: 'Chuyên đề bồi dưỡng',
      sgk: 'SGK Toán điện tử',
      guide: 'Hướng dẫn sử dụng',
    };

    addDocument({
      title: docTitle.trim(),
      category: docCategory,
      categoryName: categoryNames[docCategory] || 'Tài liệu Toán học',
      fileType: docFileType,
      size: uploadedExamFileSize || '1.2 MB',
      author: 'Thầy Bùi Ngọc Thắng (THPT Đan Phượng)',
      description: docDescription.trim() || `Tài liệu môn Toán lớp ${docGrade} - Thời gian làm bài ${docDuration} phút.`,
      fileContent: uploadedFileBase64,
      downloadUrl: uploadedFileBase64,
    });

    // 2. If checked, also register in Online Exam list
    if (syncToOnlineTestFromDoc) {
      addExam({
        code: `DT-${docGrade}-${Math.floor(100 + Math.random() * 900)}`,
        title: docTitle.trim(),
        classIds: classes.map((c) => c.id),
        classNames: classes.map((c) => c.name),
        grade: docGrade,
        durationMinutes: docDuration,
        totalQuestions: 50,
        dueDate: '30/05/2026',
        questionIds: [],
        isOnline: false,
      });
    }

    try {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } catch {}

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-blue-100 max-h-[92vh] overflow-y-auto flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0878D1] to-[#064A87] text-white flex items-center justify-center shadow-sm">
                <FileUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#064A87]">
                  Tải lên Đề thi & Bài tập vào Ngân hàng
                </h3>
                <p className="text-xs text-gray-500">
                  Thầy Bùi Ngọc Thắng (THPT Đan Phượng) • Tích hợp 3 phương thức tiện lợi trên một giao diện
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Inline Alert / Messages */}
          {errorMessage && (
            <div className="mt-3 flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-3 flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Method Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 border-b border-gray-100 text-xs mt-1">
            <button
              type="button"
              onClick={() => {
                setActiveMethodTab('text_parse');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                activeMethodTab === 'text_parse'
                  ? 'bg-[#0878D1] text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. Dán Đề thi / Văn bản (Khuyên dùng)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMethodTab('excel_csv');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                activeMethodTab === 'excel_csv'
                  ? 'bg-[#0878D1] text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>2. Tệp Excel / CSV chuẩn</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMethodTab('document_file');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                activeMethodTab === 'document_file'
                  ? 'bg-[#0878D1] text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>3. Tệp Đề hoàn chỉnh (.PDF / .DOCX)</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="py-3 flex-1 overflow-y-auto">
          {/* ===================== TAB 1: TEXT PARSER ===================== */}
          {activeMethodTab === 'text_parse' && (
            <div className="space-y-4 text-xs">
              {/* Settings Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-blue-50/50 rounded-xl border border-blue-200">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Khối lớp</label>
                  <select
                    value={defaultGrade}
                    onChange={(e) => setDefaultGrade(Number(e.target.value) as GradeLevel)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value={10}>Khối 10</option>
                    <option value={11}>Khối 11</option>
                    <option value={12}>Khối 12</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Chủ đề chính</label>
                  <select
                    value={defaultTopic}
                    onChange={(e) => setDefaultTopic(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
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
                    value={defaultLevel}
                    onChange={(e) => setDefaultLevel(e.target.value as CognitiveLevel)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="Nhận biết">Nhận biết</option>
                    <option value="Thông hiểu">Thông hiểu</option>
                    <option value="Vận dụng">Vận dụng</option>
                    <option value="Vận dụng cao">Vận dụng cao</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Điểm / câu</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="10"
                    value={defaultPoints}
                    onChange={(e) => setDefaultPoints(parseFloat(e.target.value) || 0.25)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Text Input Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-[#064A87]">
                    Dán nội dung đề thi từ Word / Text vào đây:
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleLoadSampleText}
                      className="text-[11px] text-[#0878D1] hover:underline font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Dán thử mẫu Đề thi chuẩn (3 câu)</span>
                    </button>
                    {rawText && (
                      <button
                        type="button"
                        onClick={() => {
                          setRawText('');
                          setParsedQuestions([]);
                        }}
                        className="text-[11px] text-gray-400 hover:text-red-500"
                      >
                        Xóa trắng
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  rows={8}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`Định dạng chuẩn:\nCâu 1: Cho hàm số y = f(x)... Khẳng định nào sau đây là đúng?\nA. Hàm số đồng biến...\nB. Hàm số nghịch biến...\nC. Hàm số có cực đại...\nD. Không có cực trị.\nLời giải: Ta có đạo hàm y' = ... Chọn B.\n\nCâu 2: ...`}
                  className="w-full p-3 font-mono text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0878D1] bg-white leading-relaxed"
                />

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[11px] text-gray-500">
                    💡 Hỗ trợ đầy đủ công thức Toán học KaTeX / LaTeX kẹp giữa cặp dấu <code>$ ... $</code>
                  </p>
                  <button
                    type="button"
                    onClick={handleParseClick}
                    className="px-4 py-2 bg-gradient-to-r from-[#0878D1] to-[#064A87] hover:opacity-95 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Bóc tách & Phân tích câu hỏi</span>
                  </button>
                </div>
              </div>

              {/* Parsed Preview Area */}
              {parsedQuestions.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#064A87] text-sm">
                        Kết quả phân tích ({parsedQuestions.length} câu hỏi):
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        Sẵn sàng lưu vào Ngân hàng
                      </span>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
                    {parsedQuestions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-3 rounded-xl border border-blue-100 bg-blue-50/20 hover:bg-white hover:border-blue-300 transition-all space-y-2 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#0878D1] bg-blue-100 px-2 py-0.5 rounded text-[11px]">
                              Câu {idx + 1} ({q.code})
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-700">
                              Lớp {q.grade}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-50 text-purple-700 border border-purple-200">
                              {q.topic}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-800 border border-amber-200">
                              {q.level}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveParsedQuestion(q.id)}
                            className="text-gray-400 hover:text-red-500 p-1"
                            title="Loại bỏ câu này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="font-serif text-gray-800 text-xs">
                          <MathRenderer content={q.content} />
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                          {q.options.map((opt) => {
                            const isCorrect = opt.key === q.correctAnswer;
                            return (
                              <div
                                key={opt.key}
                                className={`p-1.5 rounded-lg border text-xs flex items-start gap-1.5 ${
                                  isCorrect
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
                                    : 'bg-white border-gray-200 text-gray-700'
                                }`}
                              >
                                <span className={`font-bold font-mono ${isCorrect ? 'text-emerald-700' : 'text-gray-500'}`}>
                                  {opt.key}.
                                </span>
                                <div className="font-serif">
                                  <MathRenderer content={opt.content} />
                                </div>
                                {isCorrect && (
                                  <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1 rounded">
                                    Đúng
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Solution */}
                        {q.solution && (
                          <div className="p-2 bg-gray-50 rounded-lg text-[11px] text-gray-600 border border-gray-200/60 font-serif">
                            <span className="font-bold text-gray-700">Lời giải: </span>
                            <MathRenderer content={q.solution} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Sync to Online Exam Option */}
                  <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-[#064A87]">
                      <input
                        type="checkbox"
                        checked={isExamSyncChecked}
                        onChange={(e) => setIsExamSyncChecked(e.target.checked)}
                        className="rounded text-[#0878D1] focus:ring-[#0878D1]"
                      />
                      <span>Đồng thời tạo ngay thành một Đề thi trong mục "Kiểm tra trực tuyến"</span>
                    </label>

                    {isExamSyncChecked && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                        <div>
                          <label className="block text-[11px] text-gray-700 mb-0.5">Tên bài kiểm tra</label>
                          <input
                            type="text"
                            value={syncExamTitle}
                            onChange={(e) => setSyncExamTitle(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-purple-200 rounded-lg bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-gray-700 mb-0.5">Thời gian (phút)</label>
                          <input
                            type="number"
                            min={5}
                            max={180}
                            value={syncExamDuration}
                            onChange={(e) => setSyncExamDuration(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 border border-purple-200 rounded-lg bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-gray-700 mb-0.5">Lớp giao bài</label>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {classes.map((cls) => {
                              const isSelected = syncSelectedClasses.includes(cls.name);
                              return (
                                <button
                                  key={cls.id}
                                  type="button"
                                  onClick={() => {
                                    setSyncSelectedClasses((prev) =>
                                      isSelected ? prev.filter((c) => c !== cls.name) : [...prev, cls.name]
                                    );
                                  }}
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors ${
                                    isSelected
                                      ? 'bg-purple-600 text-white border-purple-600'
                                      : 'bg-white text-gray-600 border-gray-300'
                                  }`}
                                >
                                  {cls.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================== TAB 2: EXCEL / CSV ===================== */}
          {activeMethodTab === 'excel_csv' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-emerald-900 text-sm">
                      Nhập ngân hàng câu hỏi qua tệp Excel / CSV chuẩn
                    </h4>
                    <p className="text-gray-600 text-[11px] mt-0.5">
                      Thích hợp khi thầy có kho đề lớn, muốn nhập hàng chục câu hỏi cùng lúc với độ chính xác tuyệt đối.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadSampleCsv}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải file Excel / CSV mẫu</span>
                  </button>
                </div>

                <div className="text-[11px] text-emerald-800 bg-white/80 p-2.5 rounded-lg border border-emerald-100 space-y-1">
                  <p className="font-semibold">Thứ tự các cột trong bảng:</p>
                  <p className="font-mono text-[10px] text-gray-700">
                    [1] Mã câu | [2] Khối | [3] Chủ đề | [4] Mức độ | [5] Nội dung câu hỏi | [6] Đáp án A | [7] Đáp án B | [8] Đáp án C | [9] Đáp án D | [10] Đáp án đúng (A/B/C/D) | [11] Lời giải
                  </p>
                </div>

                {/* Upload Zone */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleCsvFileUpload}
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl p-5 text-center cursor-pointer bg-white transition-all hover:shadow-sm"
                  >
                    <FileSpreadsheet className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-gray-700 text-xs">
                      Nhấp vào đây để chọn tệp CSV / Excel từ máy tính của thầy
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Định dạng hỗ trợ: .csv, .txt (mã hóa UTF-8)
                    </p>
                    {csvFileName && (
                      <p className="mt-2 text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Tệp đã chọn: {csvFileName}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* CSV Preview Table */}
              {parsedCsvQuestions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#064A87]">
                      Xem trước dữ liệu ({parsedCsvQuestions.length} câu hỏi):
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Tất cả công thức Toán được kiểm tra hợp lệ
                    </span>
                  </div>

                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl overflow-x-auto bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                        <tr>
                          <th className="p-2">Mã câu</th>
                          <th className="p-2">Khối</th>
                          <th className="p-2">Chủ đề</th>
                          <th className="p-2">Mức độ</th>
                          <th className="p-2 min-w-[200px]">Nội dung câu hỏi</th>
                          <th className="p-2 text-center">Đáp án</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {parsedCsvQuestions.map((q) => (
                          <tr key={q.id} className="hover:bg-gray-50/70">
                            <td className="p-2 font-mono font-semibold text-blue-700">{q.code}</td>
                            <td className="p-2">Lớp {q.grade}</td>
                            <td className="p-2 text-gray-600">{q.topic}</td>
                            <td className="p-2">
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-800 border border-amber-200">
                                {q.level}
                              </span>
                            </td>
                            <td className="p-2 font-serif">
                              <MathRenderer content={q.content} />
                            </td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {q.correctAnswer}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================== TAB 3: TỆP ĐỀ HOÀN CHỈNH (.DOCX / .PDF) ===================== */}
          {activeMethodTab === 'document_file' && (
            <form onSubmit={handleSaveCompleteExamFile} className="space-y-4 text-xs">
              <div className="p-4 bg-purple-50/40 rounded-xl border border-purple-200 space-y-3">
                <div>
                  <h4 className="font-bold text-[#064A87] text-sm">
                    Tải lên file Đề thi & Bài tập hoàn chỉnh (.PDF / .DOCX)
                  </h4>
                  <p className="text-gray-600 text-[11px] mt-0.5">
                    Lưu trữ các bộ đề thi học kỳ, đề kiểm tra 1 tiết, đề thi thử tốt nghiệp THPT để học sinh tải về ôn luyện hoặc làm bài.
                  </p>
                </div>

                {/* File picker */}
                <div>
                    <input
                    ref={examFileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.zip"
                    onChange={handleExamFileSelected}
                    className="hidden"
                  />

                  <div
                    onClick={() => examFileInputRef.current?.click()}
                    className="border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-xl p-5 text-center cursor-pointer bg-white transition-all hover:shadow-sm"
                  >
                    <Upload className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="font-bold text-gray-700 text-xs">
                      Nhấp vào đây để chọn tệp (.PDF, .DOCX, .XLSX, .PPTX, .ZIP)
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Tệp tải lên sẽ được lưu trữ vĩnh viễn trên Supabase Cloud và tải về được trên mọi thiết bị
                    </p>
                    {uploadedExamFileName && (
                      <div className="mt-2 text-xs font-semibold text-purple-800 bg-purple-50 p-2 rounded-lg inline-flex items-center gap-1.5 border border-purple-200">
                        <Check className="w-4 h-4 text-purple-600" />
                        <span>Đã chọn: {uploadedExamFileName} ({uploadedExamFileSize})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tên tài liệu / Đề thi *</label>
                  <input
                    type="text"
                    required
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="Ví dụ: Đề thi thử Tốt nghiệp THPT 2026 - Đan Phượng - Lần 1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Khối lớp</label>
                    <select
                      value={docGrade}
                      onChange={(e) => setDocGrade(Number(e.target.value) as GradeLevel)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    >
                      <option value={10}>Khối 10</option>
                      <option value={11}>Khối 11</option>
                      <option value={12}>Khối 12</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Thời gian (phút)</label>
                    <input
                      type="number"
                      min={15}
                      max={180}
                      value={docDuration}
                      onChange={(e) => setDocDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phân loại tài liệu</label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="exam">Đề kiểm tra & Đề thi thử</option>
                    <option value="matrix">Ma trận đề & Bản đặc tả</option>
                    <option value="reference">Chuyên đề bài tập nâng cao</option>
                    <option value="sgk">Sách giáo khoa Toán điện tử</option>
                    <option value="guide">Hướng dẫn sử dụng & Cẩm nang</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tác giả biên soạn</label>
                  <input
                    type="text"
                    readOnly
                    value="Thầy Bùi Ngọc Thắng (THPT Đan Phượng)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Ghi chú sư phạm & Hướng dẫn làm bài</label>
                <textarea
                  rows={2}
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                  placeholder="Ghi chú thời gian nộp bài, lưu ý máy tính cầm tay, yêu cầu trình bày..."
                  className="w-full p-2.5 text-xs border border-gray-300 rounded-lg"
                />
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#064A87]">
                  <input
                    type="checkbox"
                    checked={syncToOnlineTestFromDoc}
                    onChange={(e) => setSyncToOnlineTestFromDoc(e.target.checked)}
                    className="rounded text-[#0878D1] focus:ring-[#0878D1]"
                  />
                  <span>Đồng thời lưu vào mục "Tài liệu & Thư viện" cho học sinh toàn trường tải về ôn thi</span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0878D1] hover:bg-[#064A87] text-white font-semibold rounded-lg shadow-sm transition-all"
                >
                  Lưu Đề thi vào hệ thống
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions for Tab 1 & Tab 2 */}
        {activeMethodTab !== 'document_file' && (
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-[11px] text-gray-500 hidden sm:block">
              {activeMethodTab === 'text_parse'
                ? `Đã nhận diện: ${parsedQuestions.length} câu hỏi`
                : `Đã đọc từ file: ${parsedCsvQuestions.length} câu hỏi`}
            </p>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                Đóng
              </button>

              {activeMethodTab === 'text_parse' && (
                <button
                  type="button"
                  disabled={parsedQuestions.length === 0}
                  onClick={handleSaveParsedQuestions}
                  className={`px-5 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all ${
                    parsedQuestions.length > 0
                      ? 'bg-[#0878D1] hover:bg-[#064A87] text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Lưu {parsedQuestions.length} câu vào Ngân hàng
                </button>
              )}

              {activeMethodTab === 'excel_csv' && (
                <button
                  type="button"
                  disabled={parsedCsvQuestions.length === 0}
                  onClick={handleSaveCsvQuestions}
                  className={`px-5 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all ${
                    parsedCsvQuestions.length > 0
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Lưu {parsedCsvQuestions.length} câu vào Ngân hàng
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
