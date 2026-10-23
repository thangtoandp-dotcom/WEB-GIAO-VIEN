import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Gamepad2,
  Trophy,
  Sparkles,
  Play,
  RotateCcw,
  Clock,
  Flame,
  Award,
  Zap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Filter,
  Users,
  Search,
  Star,
  ChevronRight,
  BookOpen,
  Dice5,
  Brain,
  Grid3X3,
  Lightbulb,
  X,
  Volume2,
  VolumeX,
  Shield,
  Layers,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  PhoneCall,
  Bot,
  Plus,
  Upload,
  Link,
  Code,
  FileCode,
  ExternalLink,
  Trash2,
  Check,
  AlertCircle,
  Maximize2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { GameItem, GameCategory, GameLeaderboardEntry, GameSourceType, GradeLevel } from '../types';
import { MathRenderer } from './MathRenderer';

// Leaderboard sample data
const DEFAULT_LEADERBOARD: GameLeaderboardEntry[] = [
  { id: 'lb1', studentName: 'Vũ Đức Trí', className: '11A1', gameId: 'game-speed-math', gameTitle: 'Đấu trường tính nhanh', score: 320, unit: 'điểm', date: 'Hôm nay', badge: 'Quán quân' },
  { id: 'lb2', studentName: 'Ngô Bảo Ngọc', className: '12A1', gameId: 'game-math-millionaire', gameTitle: 'Ai là triệu phú Toán', score: 15, unit: 'câu đúng', date: 'Hôm qua', badge: 'Triệu phú' },
  { id: 'lb3', studentName: 'Hoàng Mai Anh', className: '10A1', gameId: 'game-math-match', gameTitle: 'Lật thẻ công thức', score: 42, unit: 'giây', date: '22/04', badge: 'Siêu trí nhớ' },
  { id: 'lb4', studentName: 'Đặng Tuấn Kiệt', className: '10A2', gameId: 'game-caro', gameTitle: 'Cờ Caro Đan Phượng', score: 18, unit: 'trận thắng', date: '21/04', badge: 'Kỳ thủ' },
  { id: 'lb5', studentName: 'Bùi Phương Thảo', className: '12A2', gameId: 'game-2048-math', gameTitle: 'Toán học 2048', score: 2480, unit: 'điểm', date: '20/04' },
];

export const GameBankView: React.FC = () => {
  const { games, addGame, deleteGame, updateGame, questions } = useApp();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | GameCategory>('all');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<'all' | '10' | '11' | '12'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGame, setActiveGame] = useState<GameItem | null>(null);

  // Upload / Create Game Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTab, setUploadTab] = useState<'embed' | 'file' | 'quiz'>('embed');
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields for new game
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<GameCategory>('learning');
  const [newGrade, setNewGrade] = useState<'all' | GradeLevel>('all');
  const [newDifficulty, setNewDifficulty] = useState<'Dễ' | 'Trung bình' | 'Thử thách'>('Trung bình');
  const [newEstimatedMinutes, setNewEstimatedMinutes] = useState(5);
  const [newTagsStr, setNewTagsStr] = useState('Toán học, Trò chơi');
  const [newThumbnailColor, setNewThumbnailColor] = useState('from-blue-600 to-indigo-700');

  // Tab 1: Embed URL
  const [embedUrlInput, setEmbedUrlInput] = useState('');

  // Tab 2: HTML Content
  const [htmlContentInput, setHtmlContentInput] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Tab 3: Quiz Builder
  const [selectedQuestionIdsForGame, setSelectedQuestionIdsForGame] = useState<string[]>([]);

  // Filter games
  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      const matchCategory = activeCategoryFilter === 'all' || g.category === activeCategoryFilter;
      const matchGrade =
        selectedGradeFilter === 'all' ||
        g.grade === 'all' ||
        g.grade.toString() === selectedGradeFilter;
      const matchSearch =
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchGrade && matchSearch;
    });
  }, [games, activeCategoryFilter, selectedGradeFilter, searchQuery]);

  // Handle file upload (.html)
  const handleHtmlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    if (!newTitle) {
      setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setHtmlContentInput(content);
    };
    reader.readAsText(file);
  };

  // Helper to extract URL from <iframe> or direct link
  const sanitizeEmbedUrl = (raw: string): string => {
    const trimmed = raw.trim();
    // Check if user pasted an iframe tag
    const iframeMatch = trimmed.match(/src=["'](.*?)["']/i);
    if (iframeMatch && iframeMatch[1]) {
      return iframeMatch[1];
    }
    return trimmed;
  };

  // Quick fill sample templates
  const handleSelectSample = (sampleType: 'wordwall' | 'geogebra' | 'quizizz') => {
    if (sampleType === 'wordwall') {
      setNewTitle('Vòng quay may mắn - Công thức Đạo hàm');
      setNewSubtitle('Trò chơi vòng quay gọi tên công thức và tính nhanh');
      setNewDescription('Game vòng quay may mắn tương tác trên nền tảng Wordwall, kiểm tra phản xạ học sinh đầu giờ học.');
      setNewCategory('learning');
      setNewGrade(11);
      setEmbedUrlInput('https://wordwall.net/embed/41a2430c50d44b58b4337bfa5da5009f?themeId=1&templateId=5&fontStackId=0');
      setNewTagsStr('Wordwall, Đạo hàm, Vòng quay, Toán 11');
      setNewThumbnailColor('from-purple-600 to-indigo-700');
    } else if (sampleType === 'geogebra') {
      setNewTitle('Mô phỏng 3D Hình không gian & Mặt cầu');
      setNewSubtitle('Khám phá tương tác trực quan hình chóp và khối đa diện');
      setNewDescription('Ứng dụng mô phỏng không gian 3 chiều GeoGebra cho học sinh xoay hình, quan sát góc và khoảng cách.');
      setNewCategory('learning');
      setNewGrade(12);
      setEmbedUrlInput('https://www.geogebra.org/material/iframe/id/b4kg75e6/width/800/height/500/border/888888');
      setNewTagsStr('GeoGebra, Hình không gian, 3D, Toán 12');
      setNewThumbnailColor('from-emerald-600 to-teal-700');
    } else {
      setNewTitle('Đấu trường trắc nghiệm Quizizz Toán');
      setNewSubtitle('Thi đấu đối kháng thời gian thực giữa các học sinh');
      setNewDescription('Bộ câu hỏi trắc nghiệm nhanh trên Quizizz kiểm tra độ hiểu bài cuối tiết học.');
      setNewCategory('learning');
      setNewGrade('all');
      setEmbedUrlInput('https://quizizz.com/join');
      setNewTagsStr('Quizizz, Đấu trường, Trắc nghiệm, Thi đấu');
      setNewThumbnailColor('from-amber-600 to-orange-700');
    }
  };

  const handleSaveNewGame = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newTitle.trim()) {
      setFormError('Vui lòng nhập tên trò chơi.');
      return;
    }

    let sourceType: GameSourceType = 'embed_url';
    let finalEmbedUrl: string | undefined = undefined;
    let finalHtmlContent: string | undefined = undefined;
    let finalQuizQuestions: any[] | undefined = undefined;

    if (uploadTab === 'embed') {
      sourceType = 'embed_url';
      finalEmbedUrl = sanitizeEmbedUrl(embedUrlInput);
      if (!finalEmbedUrl) {
        setFormError('Vui lòng nhập đường dẫn URL hoặc mã nhúng iFrame hợp lệ.');
        return;
      }
    } else if (uploadTab === 'file') {
      sourceType = 'html_content';
      finalHtmlContent = htmlContentInput.trim();
      if (!finalHtmlContent) {
        setFormError('Vui lòng tải lên tệp HTML hoặc dán mã HTML5 của game.');
        return;
      }
    } else if (uploadTab === 'quiz') {
      sourceType = 'quiz_game';
      const selectedQs = questions.filter((q) => selectedQuestionIdsForGame.includes(q.id));
      if (selectedQs.length === 0) {
        setFormError('Vui lòng chọn ít nhất 1 câu hỏi từ ngân hàng đề để tạo game.');
        return;
      }
      finalQuizQuestions = selectedQs.map((q) => ({
        question: q.content,
        options: q.options?.map((o) => `${o.key}. ${o.content}`) || [],
        correctAnswer: q.options?.findIndex((o) => o.key === q.correctAnswer) ?? 0,
        explanation: q.solution,
      }));
    }

    const tags = newTagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addGame({
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'Trò chơi tương tác do thầy Thắng tải lên',
      description: newDescription.trim() || 'Trò chơi học tập hỗ trợ củng cố kiến thức và tư duy logic.',
      category: newCategory,
      categoryName: newCategory === 'learning' ? 'Toán học & Tư duy' : 'Giải trí & Logic',
      grade: newGrade,
      difficulty: newDifficulty,
      estimatedMinutes: Number(newEstimatedMinutes) || 5,
      thumbnailColor: newThumbnailColor,
      tags: tags.length > 0 ? tags : ['Tự tạo', 'Toán học'],
      gameSourceType: sourceType,
      embedUrl: finalEmbedUrl,
      htmlContent: finalHtmlContent,
      quizQuestions: finalQuizQuestions,
      author: 'Thầy Bùi Ngọc Thắng',
      badge: 'Game mới',
    });

    // Reset Form
    setNewTitle('');
    setNewSubtitle('');
    setNewDescription('');
    setEmbedUrlInput('');
    setHtmlContentInput('');
    setUploadedFileName('');
    setSelectedQuestionIdsForGame([]);
    setFormError(null);
    setIsUploadModalOpen(false);

    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } catch {}
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 lg:p-5 rounded-2xl shadow-sm border border-blue-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0878D1] to-[#064A87] text-white flex items-center justify-center shadow-sm">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#064A87]">
                Ngân hàng Game Toán học & Giải trí
              </h2>
              <p className="text-xs text-gray-500">
                Ứng dụng Gamification (Trò chơi hóa giáo dục) – Rèn luyện tư duy, củng cố công thức và thư giãn lành mạnh
              </p>
            </div>
          </div>
        </div>

        {/* Action Button: Tải Game lên */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0878D1] hover:bg-[#064A87] text-white shadow-sm transition-all hover:scale-105"
          >
            <Upload className="w-4 h-4" />
            <span>Tải Game lên / Thêm Game mới</span>
          </button>
        </div>
      </div>

      {/* 2. Top Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveCategoryFilter('all')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeCategoryFilter === 'all'
                ? 'bg-[#0878D1] text-white shadow-sm'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Tất cả Game ({games.length})</span>
          </button>

          <button
            onClick={() => setActiveCategoryFilter('learning')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeCategoryFilter === 'learning'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 hover:bg-blue-100 text-[#064A87]'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-blue-500" />
            <span>📐 Game học tập & Tư duy ({games.filter((g) => g.category === 'learning').length})</span>
          </button>

          <button
            onClick={() => setActiveCategoryFilter('entertainment')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeCategoryFilter === 'entertainment'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
            }`}
          >
            <Dice5 className="w-3.5 h-3.5 text-emerald-600" />
            <span>🎲 Game giải trí & Xả stress ({games.filter((g) => g.category === 'entertainment').length})</span>
          </button>
        </div>

        {/* Right: Grade filter & Search */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedGradeFilter}
            onChange={(e) => setSelectedGradeFilter(e.target.value as any)}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white text-gray-700"
          >
            <option value="all">Tất cả khối lớp</option>
            <option value="10">Khối 10</option>
            <option value="11">Khối 11</option>
            <option value="12">Khối 12</option>
          </select>

          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm game..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
            />
          </div>
        </div>
      </div>

      {/* 3. Main Content: Games Grid (8 cols) & Leaderboard (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Games Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                className="bg-white rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-[#0878D1]"
              >
                {/* Top Card Gradient Header */}
                <div className={`p-4 bg-gradient-to-r ${game.thumbnailColor} text-white relative`}>
                  {game.badge && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-xs">
                      {game.badge}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/80 uppercase tracking-wider mb-1">
                    <span>{game.categoryName}</span>
                    <span>•</span>
                    <span>{game.grade === 'all' ? 'Mọi khối lớp' : `Lớp ${game.grade}`}</span>
                    {game.isCustomUpload && (
                      <>
                        <span>•</span>
                        <span className="bg-yellow-400 text-yellow-950 font-bold px-1.5 py-0.2 rounded text-[9px]">
                          Tải lên
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white drop-shadow-sm group-hover:underline">
                    {game.title}
                  </h3>
                  <p className="text-xs text-white/90 mt-1 line-clamp-1 italic font-serif">
                    {game.subtitle}
                  </p>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                  <p className="text-gray-600 line-clamp-2 leading-relaxed">
                    {game.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {game.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer Bar */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-gray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>~{game.estimatedMinutes} phút</span>
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{game.rating}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {game.isCustomUpload && (
                        <button
                          onClick={() => {
                            if (confirm(`Thầy có chắc chắn muốn xóa game "${game.title}"?`)) {
                              deleteGame(game.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                          title="Xóa game tải lên"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => setActiveGame(game)}
                        className="px-3 py-1.5 rounded-lg bg-[#0878D1] hover:bg-[#064A87] text-white font-semibold text-xs flex items-center gap-1 shadow-sm transition-colors group-hover:scale-105"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Chơi ngay</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredGames.length === 0 && (
            <div className="bg-white p-8 rounded-xl border border-blue-100 text-center text-gray-400 text-sm">
              Không tìm thấy game nào phù hợp với bộ lọc hiện tại.
            </div>
          )}
        </div>

        {/* Leaderboard & Pedagogical Guide (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Bảng vàng vinh danh */}
          <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-[#064A87] text-sm flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Bảng vàng kỷ lục tuần này</span>
              </h3>
              <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold border border-amber-200">
                THPT Đan Phượng
              </span>
            </div>

            <div className="space-y-2">
              {DEFAULT_LEADERBOARD.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50/70 hover:bg-blue-50/60 transition-colors text-xs border border-gray-100"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        idx === 0
                          ? 'bg-amber-400 text-white shadow-xs'
                          : idx === 1
                          ? 'bg-gray-300 text-gray-700'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-gray-800 leading-tight">
                        {item.studentName} <span className="font-normal text-gray-500">({item.className})</span>
                      </p>
                      <p className="text-[10px] text-gray-400">{item.gameTitle}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-[#0878D1]">
                      {item.score} <span className="text-[10px] font-normal text-gray-500">{item.unit}</span>
                    </p>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px] text-gray-600 space-y-1">
              <p className="font-bold text-[#064A87]">💡 Hướng dẫn cho thầy Bùi Ngọc Thắng:</p>
              <p>• Dùng nút <strong>"Tải Game lên"</strong> để bổ sung nhanh các game từ Wordwall, GeoGebra hoặc Quizizz của thầy.</p>
              <p>• Tuyên dương học sinh có điểm game cao nhất tuần trong giờ sinh hoạt lớp.</p>
              <p>• Giao game làm bài khởi động 5 phút đầu tiết học môn Toán.</p>
            </div>
          </div>

          {/* Gamification Badges Info */}
          <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-4 space-y-2.5 text-xs">
            <h4 className="font-bold text-[#064A87] text-xs uppercase tracking-wider">
              Danh hiệu Toán học trao thưởng
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-900 border border-purple-200">
                <p className="font-bold">⚡ Vua Đạo hàm</p>
                <p className="text-[10px] text-purple-700 mt-0.5">Đạt trên 250 điểm Đấu trường tính nhanh</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                <p className="font-bold">🏆 Triệu phú Toán</p>
                <p className="text-[10px] text-amber-700 mt-0.5">Vượt qua câu số 15 của Ai là triệu phú</p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
                <p className="font-bold">🧠 Siêu trí nhớ</p>
                <p className="text-[10px] text-emerald-700 mt-0.5">Hoàn thành lật thẻ dưới 45 giây</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 text-[#064A87] border border-blue-200">
                <p className="font-bold">👑 Đại kiện tướng</p>
                <p className="text-[10px] text-[#0878D1] mt-0.5">Thắng máy AI cấp độ Thử thách cờ Caro</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ACTIVE GAME MODAL RUNNER */}
      {activeGame && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl border border-blue-200 max-h-[95vh] overflow-y-auto flex flex-col justify-between">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-[#0878D1]">
                  {activeGame.categoryName}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#064A87]">
                  {activeGame.title}
                </h3>
                {activeGame.author && (
                  <span className="text-xs text-gray-400 hidden sm:inline">
                    • Tác giả: {activeGame.author}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeGame.embedUrl && (
                  <a
                    href={activeGame.embedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-gray-500 hover:text-[#0878D1] hover:bg-gray-100 flex items-center gap-1 text-xs"
                    title="Mở trong tab mới"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">Tab mới</span>
                  </a>
                )}
                <button
                  onClick={() => setActiveGame(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                  title="Đóng game"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Game Component Switcher */}
            <div className="py-4 flex-1">
              {/* Case 1: Custom Embed URL */}
              {activeGame.gameSourceType === 'embed_url' && activeGame.embedUrl && (
                <div className="space-y-3">
                  <div className="w-full h-[520px] rounded-xl overflow-hidden border border-gray-300 shadow-inner bg-gray-50">
                    <iframe
                      src={activeGame.embedUrl}
                      title={activeGame.title}
                      className="w-full h-full border-0"
                      allow="fullscreen; autoplay; clipboard-write; encrypted-media"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Nguồn game: Nhúng trực tiếp từ liên kết ngoài an toàn</span>
                    <a
                      href={activeGame.embedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0878D1] font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Nếu không tải được, nhấn vào đây để mở trực tiếp</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Case 2: Custom HTML content */}
              {activeGame.gameSourceType === 'html_content' && activeGame.htmlContent && (
                <div className="w-full h-[520px] rounded-xl overflow-hidden border border-gray-300 shadow-inner bg-white">
                  <iframe
                    srcDoc={activeGame.htmlContent}
                    title={activeGame.title}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              )}

              {/* Case 3: Custom Quiz Game */}
              {activeGame.gameSourceType === 'quiz_game' && activeGame.quizQuestions && (
                <CustomQuizGame questions={activeGame.quizQuestions} title={activeGame.title} />
              )}

              {/* Case 4: Built-in Games */}
              {(!activeGame.gameSourceType || activeGame.gameSourceType === 'built_in') && (
                <>
                  {activeGame.id === 'game-speed-math' && <SpeedMathGame onClose={() => setActiveGame(null)} />}
                  {activeGame.id === 'game-math-match' && <MemoryMatchGame onClose={() => setActiveGame(null)} />}
                  {activeGame.id === 'game-math-millionaire' && <MillionaireGame onClose={() => setActiveGame(null)} />}
                  {activeGame.id === 'game-caro' && <CaroGame onClose={() => setActiveGame(null)} />}
                  {activeGame.id === 'game-2048-math' && <Game2048 onClose={() => setActiveGame(null)} />}
                  {activeGame.id === 'game-sudoku' && <SudokuGame onClose={() => setActiveGame(null)} />}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. UPLOAD & CREATE GAME MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-blue-100 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#064A87]">
                  Tải Game lên / Thêm trò chơi mới vào Ngân hàng
                </h3>
                <p className="text-xs text-gray-500">
                  Hỗ trợ nhúng link Wordwall/GeoGebra/Quizizz, tải file HTML5 hoặc tạo game từ câu hỏi Toán
                </p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Method Tabs */}
            <div className="grid grid-cols-3 gap-2 py-3 border-b border-gray-100 text-xs">
              <button
                type="button"
                onClick={() => setUploadTab('embed')}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  uploadTab === 'embed'
                    ? 'bg-[#0878D1] text-white shadow-sm'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                <span>1. Dán Link / iFrame (Khuyên dùng)</span>
              </button>

              <button
                type="button"
                onClick={() => setUploadTab('file')}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  uploadTab === 'file'
                    ? 'bg-[#0878D1] text-white shadow-sm'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>2. Tải tệp HTML5 (.html)</span>
              </button>

              <button
                type="button"
                onClick={() => setUploadTab('quiz')}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  uploadTab === 'quiz'
                    ? 'bg-[#0878D1] text-white shadow-sm'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>3. Tạo từ Ngân hàng đề</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveNewGame} className="py-4 space-y-4 text-xs">
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span className="font-medium">{formError}</span>
                </div>
              )}

              {/* Tab 1: Embed URL Content */}
              {uploadTab === 'embed' && (
                <div className="space-y-3 p-3 bg-blue-50/50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-gray-800">
                      Đường dẫn URL hoặc Mã nhúng iFrame *
                    </label>
                    <span className="text-[11px] text-gray-500">
                      Hỗ trợ: Wordwall, GeoGebra, Quizizz, Blooket, Scratch...
                    </span>
                  </div>

                  <input
                    type="text"
                    required
                    value={embedUrlInput}
                    onChange={(e) => setEmbedUrlInput(e.target.value)}
                    placeholder="Ví dụ: https://wordwall.net/embed/... hoặc <iframe src='...'></iframe>"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
                  />

                  {/* Sample Links Quick Selector */}
                  <div className="pt-1">
                    <p className="text-[11px] font-bold text-[#064A87] mb-1.5">
                      Hoặc chọn thử mẫu game có sẵn để điền nhanh:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectSample('wordwall')}
                        className="px-2.5 py-1 rounded-md bg-purple-100 hover:bg-purple-200 text-purple-900 text-[11px] font-medium transition-colors"
                      >
                        🎲 Wordwall: Vòng quay may mắn Đạo hàm
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectSample('geogebra')}
                        className="px-2.5 py-1 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[11px] font-medium transition-colors"
                      >
                        📐 GeoGebra: Mô phỏng không gian 3D
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectSample('quizizz')}
                        className="px-2.5 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-medium transition-colors"
                      >
                        ⚡ Quizizz: Đấu trường Toán học
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: HTML File Content */}
              {uploadTab === 'file' && (
                <div className="space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1">
                      Tải lên tệp HTML5 (.html) từ máy tính của thầy:
                    </label>
                    <input
                      type="file"
                      accept=".html,.htm"
                      onChange={handleHtmlFileUpload}
                      className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0878D1] file:text-white hover:file:bg-[#064A87] cursor-pointer"
                    />
                    {uploadedFileName && (
                      <p className="text-[11px] text-emerald-700 mt-1 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã tải tệp: {uploadedFileName}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-800 mb-1">
                      Hoặc dán trực tiếp mã HTML5/Canvas của game:
                    </label>
                    <textarea
                      rows={5}
                      value={htmlContentInput}
                      onChange={(e) => setHtmlContentInput(e.target.value)}
                      placeholder="<!DOCTYPE html><html>...</html>"
                      className="w-full p-2.5 font-mono text-xs border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Quiz Builder from Questions */}
              {uploadTab === 'quiz' && (
                <div className="space-y-3 p-3 bg-purple-50/50 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[#064A87]">
                      Chọn câu hỏi từ Ngân hàng đề của thầy ({selectedQuestionIdsForGame.length} câu đã chọn):
                    </p>
                    <span className="text-[11px] text-gray-500">
                      Hệ thống sẽ tự động tạo game trắc nghiệm tương tác
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2 border border-purple-200 rounded-lg p-2 bg-white">
                    {questions.map((q) => {
                      const isChecked = selectedQuestionIdsForGame.includes(q.id);
                      return (
                        <label
                          key={q.id}
                          className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer border text-xs transition-colors ${
                            isChecked ? 'bg-purple-50 border-purple-300' : 'hover:bg-gray-50 border-gray-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedQuestionIdsForGame((prev) =>
                                isChecked ? prev.filter((id) => id !== q.id) : [...prev, q.id]
                              );
                            }}
                            className="mt-1 rounded text-purple-600 focus:ring-purple-500"
                          />
                          <div className="flex-1 font-serif">
                            <span className="font-bold text-gray-700 mr-2 font-mono text-[11px]">[{q.code}]</span>
                            <MathRenderer content={q.content} />
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* General Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tên trò chơi *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ví dụ: Vòng quay may mắn Toán 11"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phụ đề / Câu giới thiệu ngắn</label>
                  <input
                    type="text"
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    placeholder="Ví dụ: Thử thách tính đạo hàm trong 30 giây"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phân loại game</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as GameCategory)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="learning">📐 Game học tập (Toán)</option>
                    <option value="entertainment">🎲 Game giải trí (Logic)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Khối lớp áp dụng</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="all">Mọi khối lớp</option>
                    <option value={10}>Khối 10</option>
                    <option value={11}>Khối 11</option>
                    <option value={12}>Khối 12</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Mức độ thử thách</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="Dễ">Dễ</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Thử thách">Thử thách</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Thời lượng (phút)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={newEstimatedMinutes}
                    onChange={(e) => setNewEstimatedMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mô tả chi tiết và luật chơi</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Mô tả tóm tắt cách chơi và mục tiêu rèn luyện..."
                  className="w-full p-2.5 text-xs border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Từ khóa gắn nhãn (ngăn cách bằng dấu phẩy)</label>
                  <input
                    type="text"
                    value={newTagsStr}
                    onChange={(e) => setNewTagsStr(e.target.value)}
                    placeholder="Wordwall, Đạo hàm, Khối 11, Tự tạo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Màu sắc thẻ giao diện</label>
                  <select
                    value={newThumbnailColor}
                    onChange={(e) => setNewThumbnailColor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="from-blue-600 to-indigo-700">Xanh lam - Indigo (Toán học)</option>
                    <option value="from-purple-600 to-pink-700">Tím - Hồng (Sáng tạo)</option>
                    <option value="from-emerald-600 to-teal-700">Xanh lục - Ngọc bích (Tươi mới)</option>
                    <option value="from-amber-600 to-orange-700">Hổ phách - Cam (Năng động)</option>
                    <option value="from-rose-600 to-red-700">Đỏ hồng (Thử thách)</option>
                    <option value="from-cyan-600 to-blue-700">Cyan - Đại dương (Chiến thuật)</option>
                  </select>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0878D1] hover:bg-[#064A87] text-white font-semibold rounded-lg shadow-sm transition-all"
                >
                  Lưu & Thêm vào Ngân hàng Game
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   CUSTOM QUIZ RUNNER (FOR QUESTIONS IMPORTED TO GAME)
========================================================================= */
const CustomQuizGame: React.FC<{
  questions: { question: string; options: string[]; correctAnswer: number; explanation?: string }[];
  title: string;
}> = ({ questions, title }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const currentQ = questions[currentIdx] || questions[0];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctAnswer) {
      setScore((s) => s + 10);
      try {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      } catch {}
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((c) => c + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      setGameOver(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setScore(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setGameOver(false);
  };

  if (gameOver) {
    return (
      <div className="py-12 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <Trophy className="w-8 h-8" />
        </div>
        <h4 className="text-xl font-bold text-[#064A87]">Chúc mừng em đã hoàn thành game!</h4>
        <p className="text-sm text-gray-600">
          Điểm số đạt được: <strong className="text-emerald-600 text-lg">{score}</strong> / {questions.length * 10} điểm.
        </p>
        <button
          onClick={handleRestart}
          className="px-6 py-2.5 rounded-xl bg-[#0878D1] text-white font-bold text-xs"
        >
          Chơi lại trò này
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center justify-between text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
        <span className="font-bold text-[#064A87]">
          Câu hỏi {currentIdx + 1} / {questions.length}
        </span>
        <span className="font-bold text-emerald-600">Điểm: {score}</span>
      </div>

      <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-200 text-base font-serif leading-relaxed text-gray-800">
        <MathRenderer content={currentQ.question} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {currentQ.options.map((opt, idx) => {
          const isCorrect = isAnswered && idx === currentQ.correctAnswer;
          const isWrong = isAnswered && selectedOpt === idx && idx !== currentQ.correctAnswer;
          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              disabled={isAnswered}
              className={`p-3 rounded-xl border text-left text-xs font-serif transition-all ${
                isCorrect
                  ? 'bg-emerald-100 border-emerald-500 font-bold text-emerald-900'
                  : isWrong
                  ? 'bg-red-100 border-red-500 font-bold text-red-900'
                  : 'bg-white hover:bg-blue-50 border-gray-200 text-gray-800'
              }`}
            >
              <MathRenderer content={opt} />
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="space-y-3 pt-2">
          {currentQ.explanation && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-serif">
              <strong>Hướng dẫn giải: </strong>
              <MathRenderer content={currentQ.explanation} />
            </div>
          )}

          <div className="text-right">
            <button
              onClick={handleNext}
              className="px-5 py-2 bg-[#0878D1] hover:bg-[#064A87] text-white font-bold text-xs rounded-xl shadow-sm"
            >
              {currentIdx + 1 < questions.length ? 'Câu tiếp theo →' : 'Xem kết quả tổng kết'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   GAME 1: ĐẤU TRƯỜNG TÍNH NHANH 60 GIÂY (SPEED MATH CHALLENGE)
========================================================================= */
const SpeedMathGame: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<{
    latex: string;
    options: number[];
    correct: number;
  }>({
    latex: 'y = x^2 - 4x \\Rightarrow y\'(3) = ?',
    options: [2, 4, 6, 8],
    correct: 2,
  });
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Generate dynamic high school math problem
  const generateProblem = () => {
    const type = Math.floor(Math.random() * 4);
    if (type === 0) {
      const a = Math.floor(Math.random() * 3) + 1;
      const b = Math.floor(Math.random() * 6) - 3;
      const x0 = Math.floor(Math.random() * 4) + 1;
      const ans = 2 * a * x0 + b;
      const opts = Array.from(new Set([ans, ans + 2, ans - 2, ans + 4])).slice(0, 4).sort(() => Math.random() - 0.5);
      return {
        latex: `\\text{Đạo hàm của } y = ${a > 1 ? a : ''}x^2 ${b >= 0 ? '+' : ''}${b}x \\text{ tại } x_0 = ${x0} \\text{ là: }`,
        options: opts.length === 4 ? opts : [ans, ans + 1, ans - 1, ans + 3],
        correct: ans,
      };
    } else if (type === 1) {
      const k = Math.floor(Math.random() * 5) + 2;
      const val = Math.pow(2, k);
      const opts = [k, k - 1, k + 1, k + 2].sort(() => Math.random() - 0.5);
      return {
        latex: `\\log_2(${val}) = ?`,
        options: opts,
        correct: k,
      };
    } else if (type === 2) {
      const r1 = Math.floor(Math.random() * 4) + 1;
      const r2 = Math.floor(Math.random() * 4) + 2;
      const sum = r1 + r2;
      const prod = r1 * r2;
      const opts = [sum, prod, sum + 1, sum - 1].sort(() => Math.random() - 0.5);
      return {
        latex: `\\text{Tổng 2 nghiệm của } x^2 - ${sum}x + ${prod} = 0 \\text{ là: }`,
        options: opts,
        correct: sum,
      };
    } else {
      const n = Math.floor(Math.random() * 3) + 1;
      const ans = n + 1;
      const opts = [ans, ans + 1, ans - 1, ans + 2].sort(() => Math.random() - 0.5);
      return {
        latex: `\\int x^${n} \\, dx = \\frac{x^k}{k} + C \\Rightarrow k = ?`,
        options: opts,
        correct: ans,
      };
    }
  };

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsPlaying(false);
          try {
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          } catch {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleStart = () => {
    setScore(0);
    setCombo(0);
    setTimeLeft(60);
    setCurrentProblem(generateProblem());
    setIsPlaying(true);
  };

  const handleChoose = (opt: number) => {
    if (!isPlaying) return;
    if (opt === currentProblem.correct) {
      const multiplier = combo >= 5 ? 3 : combo >= 2 ? 2 : 1;
      setScore((s) => s + 10 * multiplier);
      setCombo((c) => c + 1);
      setFeedback('correct');
    } else {
      setCombo(0);
      setFeedback('wrong');
    }
    setTimeout(() => {
      setFeedback(null);
      setCurrentProblem(generateProblem());
    }, 250);
  };

  return (
    <div className="space-y-4 text-center max-w-lg mx-auto">
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-[11px] text-gray-500">Thời gian còn lại</p>
          <p className={`text-2xl font-bold font-mono ${timeLeft < 10 ? 'text-red-600 animate-pulse' : 'text-[#0878D1]'}`}>
            {timeLeft}s
          </p>
        </div>
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
          <p className="text-[11px] text-gray-500">Điểm số hiện tại</p>
          <p className="text-2xl font-bold text-emerald-600 font-mono">{score}</p>
        </div>
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
          <p className="text-[11px] text-gray-500">Combo Streak</p>
          <p className="text-2xl font-bold text-amber-600 font-mono">
            {combo > 0 ? `x${combo}` : '-'}
          </p>
        </div>
      </div>

      {!isPlaying ? (
        <div className="py-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-[#0878D1] flex items-center justify-center mx-auto shadow-md">
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-[#064A87]">
              {timeLeft === 0 ? 'Hết giờ thi đấu!' : 'Sẵn sàng chinh phục 60 giây?'}
            </h4>
            <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">
              {timeLeft === 0
                ? `Thầy / Em đã đạt tổng điểm xuất sắc: ${score} điểm!`
                : 'Mỗi câu trả lời đúng được +10 điểm. Đúng liên tục được nhân x2, x3 điểm combo.'}
            </p>
          </div>

          <button
            onClick={handleStart}
            className="px-6 py-2.5 bg-[#0878D1] hover:bg-[#064A87] text-white font-bold text-sm rounded-xl shadow-md transition-all hover:scale-105"
          >
            {timeLeft === 0 ? 'Chơi lại trận mới' : 'Bắt đầu ngay'}
          </button>
        </div>
      ) : (
        <div className="py-4 space-y-5">
          <div className={`p-6 bg-gray-50 rounded-2xl border-2 transition-all min-h-[120px] flex items-center justify-center ${
            feedback === 'correct' ? 'border-emerald-500 bg-emerald-50' : feedback === 'wrong' ? 'border-red-500 bg-red-50' : 'border-blue-200'
          }`}>
            <div className="text-lg font-serif">
              <MathRenderer content={`$${currentProblem.latex}$`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {currentProblem.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleChoose(opt)}
                className="p-4 rounded-xl border border-gray-200 bg-white hover:bg-blue-50 text-base font-bold text-gray-800 hover:border-[#0878D1] hover:text-[#064A87] shadow-sm transition-all"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   GAME 2: LẬT THẺ TÌM CẶP CÔNG THỨC TOÁN (MATH MEMORY MATCH)
========================================================================= */
interface MemoryCard {
  uid: string;
  pairId: number;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MEMORY_PAIRS = [
  { pairId: 1, c1: '$(x^3)\'$', c2: '$3x^2$' },
  { pairId: 2, c1: '$\\int \\cos x dx$', c2: '$\\sin x + C$' },
  { pairId: 3, c1: '$\\log_a(xy)$', c2: '$\\log_a x + \\log_a y$' },
  { pairId: 4, c1: '$\\vec{GA} + \\vec{GB} + \\vec{GC}$', c2: '$\\vec{0}$' },
  { pairId: 5, c1: '$(\\sin x)\'$', c2: '$\\cos x$' },
  { pairId: 6, c1: '$V_{\\text{chóp}}$', c2: '$\\frac{1}{3} S \\cdot h$' },
  { pairId: 7, c1: '$\\sin^2 x + \\cos^2 x$', c2: '$1$' },
  { pairId: 8, c1: '$e^{\\ln x}$', c2: '$x$' },
];

const MemoryMatchGame: React.FC<{ onClose: () => void }> = () => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const initGame = () => {
    const deck: MemoryCard[] = [];
    MEMORY_PAIRS.forEach((p, idx) => {
      deck.push({ uid: `${idx}-a`, pairId: p.pairId, content: p.c1, isFlipped: false, isMatched: false });
      deck.push({ uid: `${idx}-b`, pairId: p.pairId, content: p.c2, isFlipped: false, isMatched: false });
    });
    setCards(deck.sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setMoves(0);
    setMatchedPairs(0);
    setElapsedSecs(0);
    setIsCompleted(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    if (isCompleted || matchedPairs === MEMORY_PAIRS.length) return;
    const timer = setInterval(() => setElapsedSecs((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isCompleted, matchedPairs]);

  const handleCardClick = (idx: number) => {
    if (cards[idx].isFlipped || cards[idx].isMatched || flippedCards.length === 2) return;

    const newCards = [...cards];
    newCards[idx].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, idx];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newFlipped;
      if (cards[firstIdx].pairId === cards[secondIdx].pairId) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) => (i === firstIdx || i === secondIdx ? { ...c, isMatched: true } : c))
          );
          setFlippedCards([]);
          setMatchedPairs((mp) => {
            const next = mp + 1;
            if (next === MEMORY_PAIRS.length) {
              setIsCompleted(true);
              try {
                confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
              } catch {}
            }
            return next;
          });
        }, 400);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) => (i === firstIdx || i === secondIdx ? { ...c, isFlipped: false } : c))
          );
          setFlippedCards([]);
        }, 900);
      }
    }
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <div className="flex items-center justify-between text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
        <div>
          <span>Thời gian: </span>
          <strong className="text-[#0878D1] font-mono text-sm">{elapsedSecs}s</strong>
        </div>
        <div>
          <span>Số lượt lật: </span>
          <strong className="text-gray-800 font-mono text-sm">{moves}</strong>
        </div>
        <div>
          <span>Đã ghép: </span>
          <strong className="text-emerald-600 font-mono text-sm">{matchedPairs} / {MEMORY_PAIRS.length} cặp</strong>
        </div>
        <button
          onClick={initGame}
          className="p-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center gap-1"
          title="Chơi lại ván mới"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Chơi lại</span>
        </button>
      </div>

      {isCompleted && (
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
          <p className="text-emerald-700 font-bold text-base">🎉 Xuất sắc! Em đã hoàn thành bảng công thức!</p>
          <p className="text-xs text-gray-600">Thời gian: {elapsedSecs} giây với {moves} lượt lật thẻ.</p>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2.5">
        {cards.map((card, idx) => (
          <button
            key={card.uid}
            onClick={() => handleCardClick(idx)}
            className={`h-20 sm:h-24 rounded-xl border-2 flex items-center justify-center p-2 text-center text-xs transition-all duration-200 select-none ${
              card.isMatched
                ? 'bg-emerald-100 border-emerald-400 text-emerald-900 opacity-90'
                : card.isFlipped
                ? 'bg-white border-[#0878D1] shadow-md ring-2 ring-blue-200'
                : 'bg-gradient-to-br from-[#064A87] to-[#0878D1] border-[#064A87] text-white hover:brightness-110 shadow-sm cursor-pointer'
            }`}
          >
            {card.isFlipped || card.isMatched ? (
              <div className="font-serif font-bold text-xs sm:text-sm">
                <MathRenderer content={card.content} />
              </div>
            ) : (
              <Brain className="w-6 h-6 text-blue-200/60" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

/* =========================================================================
   GAME 3: AI LÀ TRIỆU PHÚ TOÁN HỌC (MATH MILLIONAIRE)
========================================================================= */
const MILLIONAIRE_QUESTIONS = [
  {
    q: 'Đạo hàm của hàm số hằng $y = 5$ là:',
    options: ['$y\' = 0$', '$y\' = 5$', '$y\' = 1$', '$y\' = 5x$'],
    correct: 0,
    aiHint: 'Đạo hàm của mọi hằng số luôn bằng 0 theo công thức $(c)\' = 0$.',
    thangHint: 'Thầy Thắng nhắc: Đạo hàm của hằng số c luôn bằng 0 nhé em! Chọn phương án đầu tiên.',
  },
  {
    q: 'Tập xác định của hàm số $y = \\log_3(x - 1)$ là:',
    options: ['$D = (1; +\\infty)$', '$D = [1; +\\infty)$', '$D = (0; +\\infty)$', '$D = \\mathbb{R}$'],
    correct: 0,
    aiHint: 'Biểu thức dưới dấu logarit phải dương: $x - 1 > 0 \\Leftrightarrow x > 1$.',
    thangHint: 'Thầy Thắng dặn: Điều kiện của logarit là biểu thức bên trong phải dương ngặt (lớn hơn 0).',
  },
  {
    q: 'Cho tam giác $ABC$ có trọng tâm $G$. Đẳng thức nào sau đây là đúng?',
    options: [
      '$\\vec{GA} + \\vec{GB} + \\vec{GC} = \\vec{0}$',
      '$\\vec{GA} = \\vec{GB} = \\vec{GC}$',
      '$\\vec{AB} + \\vec{AC} = \\vec{AG}$',
      '$\\vec{GA} + \\vec{GB} = \\vec{GC}$',
    ],
    correct: 0,
    aiHint: 'Tổng các vectơ từ trọng tâm $G$ tới 3 đỉnh tam giác luôn bằng vectơ không.',
    thangHint: 'Thầy Thắng: Tính chất trọng tâm cơ bản của hình học 10, tổng 3 vectơ bằng vectơ không!',
  },
  {
    q: 'Tính nguyên hàm $\\int e^{2x} dx$:',
    options: [
      '$\\frac{1}{2} e^{2x} + C$',
      '$2 e^{2x} + C$',
      '$e^{2x} + C$',
      '$\\frac{1}{2} e^x + C$',
    ],
    correct: 0,
    aiHint: 'Theo công thức $\\int e^{ax+b} dx = \\frac{1}{a} e^{ax+b} + C$ với $a = 2$.',
    thangHint: 'Thầy Thắng: Nhớ chia cho hệ số a trước x, ở đây là chia cho 2 nhé.',
  },
];

const MillionaireGame: React.FC<{ onClose: () => void }> = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [lifeline50, setLifeline50] = useState(true);
  const [lifelineAI, setLifelineAI] = useState(true);
  const [lifelineThang, setLifelineThang] = useState(true);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [hintText, setHintText] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const q = MILLIONAIRE_QUESTIONS[currentIdx] || MILLIONAIRE_QUESTIONS[0];

  const handleChoose = (idx: number) => {
    if (idx === q.correct) {
      if (currentIdx + 1 < MILLIONAIRE_QUESTIONS.length) {
        setCurrentIdx((prev) => prev + 1);
        setHiddenOptions([]);
        setHintText(null);
      } else {
        setWon(true);
        setGameOver(true);
        try {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        } catch {}
      }
    } else {
      setGameOver(true);
    }
  };

  const use5050 = () => {
    if (!lifeline50) return;
    setLifeline50(false);
    const wrongs = [0, 1, 2, 3].filter((i) => i !== q.correct);
    setHiddenOptions([wrongs[0], wrongs[1]]);
  };

  const useAI = () => {
    if (!lifelineAI) return;
    setLifelineAI(false);
    setHintText(`🤖 Trợ lý AI phân tích: "${q.aiHint}"`);
  };

  const useThang = () => {
    if (!lifelineThang) return;
    setLifelineThang(false);
    setHintText(`👨‍🏫 Thầy Bùi Ngọc Thắng tư vấn: "${q.thangHint}"`);
  };

  const resetGame = () => {
    setCurrentIdx(0);
    setLifeline50(true);
    setLifelineAI(true);
    setLifelineThang(true);
    setHiddenOptions([]);
    setHintText(null);
    setGameOver(false);
    setWon(false);
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <div className="flex items-center justify-between bg-[#064A87] text-white p-3 rounded-xl">
        <span className="font-bold text-xs uppercase">
          Câu số {currentIdx + 1} / {MILLIONAIRE_QUESTIONS.length}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={use5050}
            disabled={!lifeline50 || gameOver}
            className="px-2.5 py-1 rounded bg-blue-500 hover:bg-blue-600 disabled:opacity-30 text-[11px] font-bold"
            title="Quyền 50:50"
          >
            50:50
          </button>
          <button
            onClick={useAI}
            disabled={!lifelineAI || gameOver}
            className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-700 disabled:opacity-30 text-[11px] font-bold flex items-center gap-1"
            title="Hỏi ý kiến AI"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI</span>
          </button>
          <button
            onClick={useThang}
            disabled={!lifelineThang || gameOver}
            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-[11px] font-bold flex items-center gap-1"
            title="Gọi điện cho thầy Thắng"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Thầy Thắng</span>
          </button>
        </div>
      </div>

      {hintText && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
          {hintText}
        </div>
      )}

      {gameOver ? (
        <div className="py-8 text-center space-y-3">
          <p className="text-xl font-bold text-[#064A87]">
            {won ? '🏆 Chúc mừng tân Triệu phú Toán học!' : 'Rất tiếc! Câu trả lời chưa chính xác.'}
          </p>
          <p className="text-xs text-gray-500">
            {won
              ? 'Em đã xuất sắc vượt qua toàn bộ câu hỏi đỉnh cao của chương trình!'
              : `Em đã dừng chân tại câu hỏi số ${currentIdx + 1}. Hãy ôn tập lại và thử lại nhé!`}
          </p>
          <button
            onClick={resetGame}
            className="px-5 py-2 rounded-xl bg-[#0878D1] text-white font-bold text-xs"
          >
            Chơi lại từ đầu
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl text-center font-serif text-base text-[#064A87] font-semibold min-h-[90px] flex items-center justify-center">
            <MathRenderer content={q.q} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt, idx) => {
              if (hiddenOptions.includes(idx)) {
                return <div key={idx} className="p-3 rounded-xl border border-transparent" />;
              }
              const label = ['A', 'B', 'C', 'D'][idx];
              return (
                <button
                  key={idx}
                  onClick={() => handleChoose(idx)}
                  className="p-3 rounded-xl border border-gray-300 bg-white hover:bg-blue-100 hover:border-[#0878D1] text-left text-xs font-serif flex items-center gap-2 transition-all shadow-xs"
                >
                  <span className="w-5 h-5 rounded-full bg-[#0878D1] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    {label}
                  </span>
                  <div className="flex-1">
                    <MathRenderer content={opt} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   GAME 4: CỜ CARO HỌC TRÒ (GOMOKU ĐAN PHƯỢNG)
========================================================================= */
const BOARD_SIZE = 15;

const CaroGame: React.FC<{ onClose: () => void }> = () => {
  const [board, setBoard] = useState<(string | null)[][]>(() =>
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );
  const [turn, setTurn] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<string | null>(null);

  const resetBoard = () => {
    setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
    setTurn('X');
    setWinner(null);
  };

  const checkWin = (b: (string | null)[][], r: number, c: number, player: string) => {
    const dirs = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];
    for (const [dr, dc] of dirs) {
      let count = 1;
      let nr = r + dr;
      let nc = c + dc;
      while (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && b[nr][nc] === player) {
        count++;
        nr += dr;
        nc += dc;
      }
      nr = r - dr;
      nc = c - dc;
      while (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && b[nr][nc] === player) {
        count++;
        nr -= dr;
        nc -= dc;
      }
      if (count >= 5) return true;
    }
    return false;
  };

  const makeAiMove = (currentBoard: (string | null)[][]) => {
    const empties: { r: number; c: number }[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (!currentBoard[r][c]) {
          empties.push({ r, c });
        }
      }
    }
    if (empties.length === 0) return;

    for (const { r, c } of empties) {
      currentBoard[r][c] = 'O';
      if (checkWin(currentBoard, r, c, 'O')) {
        setBoard(currentBoard);
        setWinner('O');
        return;
      }
      currentBoard[r][c] = null;
    }

    for (const { r, c } of empties) {
      currentBoard[r][c] = 'X';
      if (checkWin(currentBoard, r, c, 'X')) {
        currentBoard[r][c] = 'O';
        setBoard(currentBoard);
        setTurn('X');
        return;
      }
      currentBoard[r][c] = null;
    }

    empties.sort((a, b) => {
      const distA = Math.hypot(a.r - 7, a.c - 7);
      const distB = Math.hypot(b.r - 7, b.c - 7);
      return distA - distB + (Math.random() - 0.5) * 4;
    });

    const chosen = empties[0];
    currentBoard[chosen.r][chosen.c] = 'O';
    setBoard([...currentBoard]);
    if (checkWin(currentBoard, chosen.r, chosen.c, 'O')) {
      setWinner('O');
    } else {
      setTurn('X');
    }
  };

  const handleCellClick = (r: number, c: number) => {
    if (board[r][c] || winner || turn !== 'X') return;

    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = 'X';
    setBoard(newBoard);

    if (checkWin(newBoard, r, c, 'X')) {
      setWinner('X');
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}
      return;
    }

    setTurn('O');
    setTimeout(() => {
      makeAiMove(newBoard);
    }, 300);
  };

  return (
    <div className="space-y-3 max-w-lg mx-auto text-center">
      <div className="flex items-center justify-between text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-200">
        <span className="font-semibold text-gray-700">
          Lượt đi: <strong className={turn === 'X' ? 'text-blue-600' : 'text-red-600'}>
            {winner ? 'Kết thúc' : turn === 'X' ? 'Học sinh (X)' : 'Máy AI (O)'}
          </strong>
        </span>

        {winner && (
          <span className="font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
            {winner === 'X' ? '🎉 Bạn đã chiến thắng!' : 'Máy AI đã thắng!'}
          </span>
        )}

        <button
          onClick={resetBoard}
          className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Ván mới</span>
        </button>
      </div>

      <div className="bg-[#E2D5B7] p-2 rounded-xl shadow-inner border-4 border-[#8B5A2B] inline-block">
        <div
          className="grid gap-[1px] bg-[#B08D57]"
          style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className="w-5 h-5 sm:w-7 sm:h-7 bg-[#EFE3C3] hover:bg-[#FAF2DB] flex items-center justify-center font-bold text-xs sm:text-sm select-none transition-colors"
              >
                {cell === 'X' ? (
                  <span className="text-blue-700">✕</span>
                ) : cell === 'O' ? (
                  <span className="text-red-600">◯</span>
                ) : null}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   GAME 5: TOÁN HỌC 2048 (MATH 2048 POWERS)
========================================================================= */
const Game2048: React.FC<{ onClose: () => void }> = () => {
  const [grid, setGrid] = useState<number[][]>([
    [0, 2, 0, 0],
    [0, 0, 4, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 2],
  ]);
  const [score, setScore] = useState(0);

  const addRandomTile = (g: number[][]) => {
    const empties: { r: number; c: number }[] = [];
    g.forEach((row, r) =>
      row.forEach((val, c) => {
        if (val === 0) empties.push({ r, c });
      })
    );
    if (empties.length === 0) return g;
    const { r, c } = empties[Math.floor(Math.random() * empties.length)];
    g[r][c] = Math.random() < 0.9 ? 2 : 4;
    return g;
  };

  const restart2048 = () => {
    const initial = [
      [0, 0, 0, 0],
      [0, 2, 0, 0],
      [0, 0, 4, 0],
      [0, 0, 0, 0],
    ];
    setGrid(initial);
    setScore(0);
  };

  const slideLeft = (row: number[]) => {
    const filtered = row.filter((v) => v !== 0);
    let pts = 0;
    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i] === filtered[i + 1]) {
        filtered[i] *= 2;
        pts += filtered[i];
        filtered[i + 1] = 0;
      }
    }
    const merged = filtered.filter((v) => v !== 0);
    while (merged.length < 4) merged.push(0);
    return { row: merged, pts };
  };

  const moveLeft = () => {
    let totalPts = 0;
    const newGrid = grid.map((r) => {
      const res = slideLeft(r);
      totalPts += res.pts;
      return res.row;
    });
    setScore((s) => s + totalPts);
    setGrid(addRandomTile(newGrid));
  };

  const moveRight = () => {
    let totalPts = 0;
    const newGrid = grid.map((r) => {
      const reversed = [...r].reverse();
      const res = slideLeft(reversed);
      totalPts += res.pts;
      return res.row.reverse();
    });
    setScore((s) => s + totalPts);
    setGrid(addRandomTile(newGrid));
  };

  const moveUp = () => {
    let totalPts = 0;
    const newGrid = Array(4).fill(0).map(() => Array(4).fill(0));
    for (let c = 0; c < 4; c++) {
      const col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
      const res = slideLeft(col);
      totalPts += res.pts;
      for (let r = 0; r < 4; r++) {
        newGrid[r][c] = res.row[r];
      }
    }
    setScore((s) => s + totalPts);
    setGrid(addRandomTile(newGrid));
  };

  const moveDown = () => {
    let totalPts = 0;
    const newGrid = Array(4).fill(0).map(() => Array(4).fill(0));
    for (let c = 0; c < 4; c++) {
      const col = [grid[3][c], grid[2][c], grid[1][c], grid[0][c]];
      const res = slideLeft(col);
      totalPts += res.pts;
      for (let r = 0; r < 4; r++) {
        newGrid[3 - r][c] = res.row[r];
      }
    }
    setScore((s) => s + totalPts);
    setGrid(addRandomTile(newGrid));
  };

  return (
    <div className="space-y-4 max-w-sm mx-auto text-center">
      <div className="flex items-center justify-between text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
        <div>
          <span>Điểm số: </span>
          <strong className="text-2xl font-bold font-mono text-[#0878D1]">{score}</strong>
        </div>
        <button
          onClick={restart2048}
          className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold text-gray-700"
        >
          Chơi lại
        </button>
      </div>

      <div className="bg-[#BBADA0] p-3 rounded-2xl grid grid-cols-4 gap-2.5 shadow-md">
        {grid.map((row, r) =>
          row.map((val, c) => (
            <div
              key={`${r}-${c}`}
              className={`h-16 sm:h-20 rounded-xl flex flex-col items-center justify-center font-bold font-mono text-base sm:text-xl transition-all shadow-xs ${
                val === 0
                  ? 'bg-[#CDC1B4]'
                  : val === 2
                  ? 'bg-[#EEE4DA] text-[#776E65]'
                  : val === 4
                  ? 'bg-[#EDE0C8] text-[#776E65]'
                  : val === 8
                  ? 'bg-[#F2B179] text-white'
                  : val === 16
                  ? 'bg-[#F59563] text-white'
                  : val === 32
                  ? 'bg-[#F67C5F] text-white'
                  : val === 64
                  ? 'bg-[#F65E3B] text-white'
                  : 'bg-[#EDCF72] text-white font-extrabold'
              }`}
            >
              <span>{val !== 0 ? val : ''}</span>
              {val > 0 && (
                <span className="text-[10px] font-normal opacity-70">
                  {val === 2 ? '2¹' : val === 4 ? '2²' : val === 8 ? '2³' : val === 16 ? '2⁴' : val === 32 ? '2⁵' : val === 64 ? '2⁶' : ''}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto pt-2">
        <div />
        <button onClick={moveUp} className="p-2.5 bg-blue-100 hover:bg-blue-200 rounded-lg flex items-center justify-center text-blue-800">
          <ArrowUp className="w-5 h-5" />
        </button>
        <div />
        <button onClick={moveLeft} className="p-2.5 bg-blue-100 hover:bg-blue-200 rounded-lg flex items-center justify-center text-blue-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button onClick={moveDown} className="p-2.5 bg-blue-100 hover:bg-blue-200 rounded-lg flex items-center justify-center text-blue-800">
          <ArrowDown className="w-5 h-5" />
        </button>
        <button onClick={moveRight} className="p-2.5 bg-blue-100 hover:bg-blue-200 rounded-lg flex items-center justify-center text-blue-800">
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

/* =========================================================================
   GAME 6: SUDOKU TRÍ TUỆ ĐAN PHƯỢNG
========================================================================= */
const INITIAL_SUDOKU = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

const SudokuGame: React.FC<{ onClose: () => void }> = () => {
  const [board, setBoard] = useState<number[][]>(INITIAL_SUDOKU.map((r) => [...r]));
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);

  const handleCellSelect = (r: number, c: number) => {
    if (INITIAL_SUDOKU[r][c] !== 0) return;
    setSelectedCell({ r, c });
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell) return;
    const { r, c } = selectedCell;
    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = num;
    setBoard(newBoard);
  };

  const resetSudoku = () => {
    setBoard(INITIAL_SUDOKU.map((r) => [...r]));
    setSelectedCell(null);
  };

  return (
    <div className="space-y-4 max-w-sm mx-auto text-center">
      <div className="flex items-center justify-between text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-200">
        <span className="font-semibold text-gray-700">Sudoku Cổ điển • Mức độ: Dễ</span>
        <button
          onClick={resetSudoku}
          className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 rounded font-semibold text-gray-700 text-xs"
        >
          Đặt lại
        </button>
      </div>

      <div className="bg-gray-800 p-1 rounded-xl inline-block shadow-md">
        <div className="grid grid-cols-9 gap-[1px] bg-gray-400">
          {board.map((row, r) =>
            row.map((val, c) => {
              const isLocked = INITIAL_SUDOKU[r][c] !== 0;
              const isSelected = selectedCell?.r === r && selectedCell?.c === c;
              const isBorderRight = (c + 1) % 3 === 0 && c < 8;
              const isBorderBottom = (r + 1) % 3 === 0 && r < 8;

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellSelect(r, c)}
                  className={`w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center font-bold text-xs sm:text-sm transition-colors ${
                    isLocked ? 'bg-gray-100 text-gray-900 font-extrabold' : 'bg-white text-blue-600'
                  } ${isSelected ? 'ring-2 ring-blue-500 bg-blue-100' : ''} ${
                    isBorderRight ? 'border-r-2 border-r-gray-800' : ''
                  } ${isBorderBottom ? 'border-b-2 border-b-gray-800' : ''}`}
                >
                  {val !== 0 ? val : ''}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 pt-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberInput(num)}
            className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-[#0878D1] font-bold text-sm border border-blue-200 transition-colors"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleNumberInput(0)}
          className="px-2.5 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold"
        >
          Xóa
        </button>
      </div>
    </div>
  );
};
