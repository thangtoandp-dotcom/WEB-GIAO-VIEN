import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  FileText,
  Video,
  Image as ImageIcon,
  Pin,
  Heart,
  Share2,
  Trash2,
  Edit,
  Search,
  Filter,
  Calendar,
  Users,
  Award,
  ExternalLink,
  Play,
  X,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  Printer,
  Download,
  BookOpen,
  School,
  GraduationCap,
  Star,
  Film,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClassActivity, ActivityCategory, GradeLevel } from '../types';
import { compressImageFile, readFileAsDataUrl } from '../lib/fileUtils';

export const ClassActivitiesView: React.FC = () => {
  const {
    activities,
    addActivity,
    updateActivity,
    deleteActivity,
    toggleLikeActivity,
    togglePinActivity,
    classes,
    teacherProfile,
    selectedSchoolYear,
    selectedSemester,
  } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedDetailActivity, setSelectedDetailActivity] = useState<ClassActivity | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

  // Form state for creating / editing activity
  const [formTitle, setFormTitle] = useState('');
  const [formClassId, setFormClassId] = useState(classes[0]?.id || 'c11a1');
  const [formCategory, setFormCategory] = useState<ActivityCategory>('stem');
  const [formDate, setFormDate] = useState(new Date().toLocaleDateString('vi-VN'));
  const [formDescription, setFormDescription] = useState('');
  const [formTeacherRemarks, setFormTeacherRemarks] = useState('');
  const [formFeaturedStudents, setFormFeaturedStudents] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formVideoTitle, setFormVideoTitle] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formNewImageUrl, setFormNewImageUrl] = useState('');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [videoInputType, setVideoInputType] = useState<'link' | 'file'>('link');

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchSearch =
        act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (act.featuredStudents &&
          act.featuredStudents.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchClass =
        selectedClassFilter === 'all' ||
        act.classId === selectedClassFilter ||
        act.className === selectedClassFilter;

      const matchCategory =
        selectedCategoryFilter === 'all' || act.category === selectedCategoryFilter;

      const matchGrade =
        selectedGradeFilter === 'all' || act.grade.toString() === selectedGradeFilter;

      return matchSearch && matchClass && matchCategory && matchGrade;
    }).sort((a, b) => {
      // Pinned items first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [activities, searchTerm, selectedClassFilter, selectedCategoryFilter, selectedGradeFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = activities.length;
    const stemCount = activities.filter((a) => a.category === 'stem').length;
    const withVideos = activities.filter((a) => Boolean(a.videoUrl)).length;
    const allCommended = new Set(
      activities.flatMap((a) => a.featuredStudents || [])
    ).size;
    return { total, stemCount, withVideos, allCommended };
  }, [activities]);

  // Reset and open form for new creation
  const handleOpenCreateModal = () => {
    setEditingActivityId(null);
    setFormTitle('');
    setFormClassId(classes[0]?.id || 'c11a1');
    setFormCategory('stem');
    setFormDate(new Date().toLocaleDateString('vi-VN'));
    setFormDescription('');
    setFormTeacherRemarks('');
    setFormFeaturedStudents('');
    setFormVideoUrl('');
    setFormVideoTitle('');
    setFormImages([]);
    setFormNewImageUrl('');
    setFormIsPinned(false);
    setIsUploadModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (act: ClassActivity) => {
    setEditingActivityId(act.id);
    setFormTitle(act.title);
    setFormClassId(act.classId);
    setFormCategory(act.category);
    setFormDate(act.date);
    setFormDescription(act.description);
    setFormTeacherRemarks(act.teacherRemarks || '');
    setFormFeaturedStudents((act.featuredStudents || []).join(', '));
    setFormVideoUrl(act.videoUrl || '');
    setFormVideoTitle(act.videoTitle || '');
    setFormImages(act.images || []);
    setFormNewImageUrl('');
    setFormIsPinned(Boolean(act.isPinned));
    setIsUploadModalOpen(true);
  };

  // Save form
  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const selectedCls = classes.find((c) => c.id === formClassId) || classes[0];
    const categoryLabels: Record<ActivityCategory, string> = {
      stem: 'Chuyên đề STEM & Toán học',
      academic: 'Thành tích & Bảng vàng',
      presentation: 'Thuyết trình & Dự án nhóm',
      extracurricular: 'Ngoại khóa & Trải nghiệm',
      competition: 'Hội thi & Giải đấu',
    };

    const studentsList = formFeaturedStudents
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const imagesToSave = formImages.length > 0 ? formImages : [
      'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1000&q=80'
    ];

    if (editingActivityId) {
      updateActivity(editingActivityId, {
        title: formTitle,
        classId: selectedCls?.id || formClassId,
        className: selectedCls?.name || '11A1',
        grade: selectedCls?.grade || 11,
        category: formCategory,
        categoryLabel: categoryLabels[formCategory],
        date: formDate,
        description: formDescription,
        teacherRemarks: formTeacherRemarks,
        featuredStudents: studentsList,
        videoUrl: formVideoUrl,
        videoTitle: formVideoTitle,
        images: imagesToSave,
        isPinned: formIsPinned,
      });
    } else {
      addActivity({
        title: formTitle,
        classId: selectedCls?.id || formClassId,
        className: selectedCls?.name || '11A1',
        grade: selectedCls?.grade || 11,
        schoolYear: selectedSchoolYear,
        semester: selectedSemester,
        category: formCategory,
        categoryLabel: categoryLabels[formCategory],
        date: formDate,
        description: formDescription,
        teacherRemarks: formTeacherRemarks,
        featuredStudents: studentsList,
        videoUrl: formVideoUrl,
        videoTitle: formVideoTitle,
        images: imagesToSave,
        isPinned: formIsPinned,
        author: teacherProfile.name,
      });
    }

    setIsUploadModalOpen(false);
  };

  // Handle image upload from computer with automatic high-quality compression
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        const compressedBase64 = await compressImageFile(file, 1200, 1200, 0.82);
        if (compressedBase64) {
          setFormImages((prev) => [...prev, compressedBase64]);
        }
      } catch (err) {
        console.warn('Lỗi xử lý ảnh:', err);
      }
    }
  };

  // Handle video upload from computer (with persistence across browsers)
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!formVideoTitle) {
      setFormVideoTitle(`Video hoạt động: ${file.name.replace(/\.[^/.]+$/, '')}`);
    }

    const sizeInMb = file.size / (1024 * 1024);
    if (sizeInMb > 8) {
      alert(
        `Tệp video "${file.name}" có dung lượng khá lớn (${sizeInMb.toFixed(1)} MB). Để video tải nhanh và xem mượt mà trên tất cả thiết bị và trình duyệt khác, thầy vui lòng tải lên YouTube hoặc Google Drive rồi dán link vào ô "Đường dẫn video" nhé!`
      );
      // Still set temporary URL for immediate test preview
      const tempUrl = URL.createObjectURL(file);
      setFormVideoUrl(tempUrl);
      return;
    }

    try {
      // Read small video clips (< 8MB) as Data URL so they persist on Supabase and other browsers
      const videoDataUrl = await readFileAsDataUrl(file);
      setFormVideoUrl(videoDataUrl);
    } catch {
      const tempUrl = URL.createObjectURL(file);
      setFormVideoUrl(tempUrl);
    }
  };

  // Add image URL manually
  const handleAddImageUrl = () => {
    if (!formNewImageUrl.trim()) return;
    setFormImages((prev) => [...prev, formNewImageUrl.trim()]);
    setFormNewImageUrl('');
  };

  // Helper to render YouTube iframe or HTML5 video
  const renderVideoPlayer = (url: string, title?: string) => {
    // If YouTube
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-md border border-gray-200">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${ytMatch[1]}`}
            title={title || 'Video hoạt động lớp học'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    // HTML5 video or direct video link
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-md border border-gray-200">
        <video controls className="w-full h-full object-contain">
          <source src={url} type="video/mp4" />
          Trình duyệt không hỗ trợ phát trực tiếp video này.
        </video>
      </div>
    );
  };

  // Print summary report
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#064A87] via-[#075FAD] to-[#0878D1] rounded-2xl p-5 sm:p-6 text-white shadow-lg border border-[#053d70] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold tracking-wide uppercase flex items-center gap-1">
                <School className="w-3.5 h-3.5" />
                <span>THPT Đan Phượng • Môn Toán học</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-[#064A87] text-[11px] font-bold">
                {selectedSchoolYear} - {selectedSemester}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-300" />
              <span>Hoạt động nổi bật các lớp học</span>
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mt-1">
              Lưu trữ và chia sẻ các chuyên đề STEM, bài giảng thực tế, video thuyết trình, hội thi và tôn vinh học sinh tiêu biểu của từng lớp.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/25 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-amber-300" />
              <span>Xuất báo cáo tổng kết cuối kỳ</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-[#064A87] text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng tải hoạt động & Video</span>
            </button>
          </div>
        </div>

        {/* Statistical Highlights Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/15 text-white">
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/15">
            <p className="text-[11px] text-blue-200">Tổng hoạt động</p>
            <p className="text-xl font-black mt-0.5 text-white">{stats.total}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/15">
            <p className="text-[11px] text-blue-200">Chuyên đề STEM & Toán</p>
            <p className="text-xl font-black mt-0.5 text-amber-300">{stats.stemCount}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/15">
            <p className="text-[11px] text-blue-200">Video & Phóng sự</p>
            <p className="text-xl font-black mt-0.5 text-emerald-300">{stats.withVideos}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/15">
            <p className="text-[11px] text-blue-200">Học sinh được biểu dương</p>
            <p className="text-xl font-black mt-0.5 text-purple-200">{stats.allCommended} em</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên hoạt động, học sinh..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Class Filter */}
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0878D1] text-gray-700 font-medium"
          >
            <option value="all">Tất cả các lớp</option>
            {classes.map((c) => (
              <option key={c.id} value={c.name}>
                Lớp {c.name}
              </option>
            ))}
          </select>

          {/* Grade Filter */}
          <select
            value={selectedGradeFilter}
            onChange={(e) => setSelectedGradeFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0878D1] text-gray-700 font-medium"
          >
            <option value="all">Tất cả các khối</option>
            <option value="10">Khối 10</option>
            <option value="11">Khối 11</option>
            <option value="12">Khối 12</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0878D1] text-gray-700 font-medium"
          >
            <option value="all">Tất cả chủ đề</option>
            <option value="stem">Chuyên đề STEM & Toán học</option>
            <option value="academic">Thành tích & Bảng vàng</option>
            <option value="presentation">Thuyết trình & Dự án nhóm</option>
            <option value="competition">Hội thi & Giải đấu</option>
            <option value="extracurricular">Ngoại khóa & Trải nghiệm</option>
          </select>

          {(searchTerm || selectedClassFilter !== 'all' || selectedCategoryFilter !== 'all' || selectedGradeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedClassFilter('all');
                setSelectedCategoryFilter('all');
                setSelectedGradeFilter('all');
              }}
              className="px-3 py-2 text-[#0878D1] hover:bg-blue-50 rounded-lg font-semibold"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Activities Grid */}
      {filteredActivities.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300 space-y-3">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0878D1] flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-gray-800 text-base">Chưa tìm thấy hoạt động nào phù hợp</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Thầy có thể thử điều chỉnh lại bộ lọc tìm kiếm hoặc đăng tải ngay hoạt động mới cho các lớp học.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-2 px-4 py-2 bg-[#0878D1] text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-[#064A87]"
          >
            Đăng tải hoạt động mới ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredActivities.map((act) => (
            <div
              key={act.id}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md ${
                act.isPinned ? 'border-amber-300 ring-2 ring-amber-100' : 'border-blue-100'
              }`}
            >
              {/* Media Preview (Video or Image Gallery) */}
              <div className="relative bg-gray-900 group">
                {act.videoUrl ? (
                  /* Video Embed / Player */
                  <div className="p-2 bg-gray-950">
                    {renderVideoPlayer(act.videoUrl, act.videoTitle || act.title)}
                    {act.videoTitle && (
                      <p className="text-[11px] text-gray-300 mt-1.5 px-1 truncate flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{act.videoTitle}</span>
                      </p>
                    )}
                  </div>
                ) : act.images && act.images.length > 0 ? (
                  /* Image Preview */
                  <div className="relative h-56 sm:h-64 w-full overflow-hidden">
                    <img
                      src={act.images[0]}
                      alt={act.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {act.images.length > 1 && (
                      <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/20">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>+{act.images.length - 1} ảnh</span>
                      </span>
                    )}
                  </div>
                ) : null}

                {/* Top Badges over Card */}
                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
                  {act.isPinned && (
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 border border-amber-300">
                      <Pin className="w-3 h-3 fill-white" />
                      <span>Ghim nổi bật</span>
                    </span>
                  )}
                  <span className="bg-[#064A87]/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                    Lớp {act.className}
                  </span>
                  <span className="bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/20">
                    {act.categoryLabel}
                  </span>
                </div>
              </div>

              {/* Card Content Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span className="flex items-center gap-1 text-gray-600 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#0878D1]" />
                      <span>{act.date}</span>
                    </span>
                    <span className="text-[10px] bg-blue-50 text-[#064A87] font-semibold px-2 py-0.5 rounded">
                      {act.schoolYear} • {act.semester}
                    </span>
                  </div>

                  <h3
                    onClick={() => setSelectedDetailActivity(act)}
                    className="text-base font-bold text-[#064A87] hover:text-[#0878D1] cursor-pointer transition-colors line-clamp-2"
                  >
                    {act.title}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                    {act.description}
                  </p>

                  {/* Teacher remarks quote box */}
                  {act.teacherRemarks && (
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 italic font-serif">
                      <p className="font-semibold text-amber-950 not-italic font-sans text-[11px] mb-0.5 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-700" />
                        <span>Lời khen của Thầy Bùi Ngọc Thắng:</span>
                      </p>
                      “{act.teacherRemarks}”
                    </div>
                  )}

                  {/* Featured students */}
                  {act.featuredStudents && act.featuredStudents.length > 0 && (
                    <div className="pt-1">
                      <p className="text-[11px] font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>Học sinh được biểu dương:</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {act.featuredStudents.map((st, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium bg-blue-50 text-[#064A87] border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1"
                          >
                            <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                            <span>{st}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  {/* Left: Like & View Details */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleLikeActivity(act.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Thả tim hoạt động"
                    >
                      <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                      <span className="font-bold text-[11px]">{act.likesCount}</span>
                    </button>

                    <button
                      onClick={() => setSelectedDetailActivity(act)}
                      className="px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 font-medium text-[11px] transition-colors cursor-pointer"
                    >
                      Xem chi tiết
                    </button>
                  </div>

                  {/* Right: Pin, Edit, Delete */}
                  <div className="flex items-center gap-1 text-gray-500">
                    <button
                      onClick={() => togglePinActivity(act.id)}
                      className={`p-1.5 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer ${
                        act.isPinned ? 'text-amber-500 font-bold' : 'text-gray-400 hover:text-amber-500'
                      }`}
                      title={act.isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
                    >
                      <Pin className={`w-3.5 h-3.5 ${act.isPinned ? 'fill-amber-500' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(act)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 hover:text-[#0878D1] transition-colors cursor-pointer"
                      title="Chỉnh sửa hoạt động"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Thầy có chắc chắn muốn xóa hoạt động "${act.title}" không?`)) {
                          deleteActivity(act.id);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                      title="Xóa hoạt động"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ĐĂNG TẢI HOẠT ĐỘNG & VIDEO MỚI                                   */}
      {/* ========================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-blue-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0878D1] flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#064A87] text-base">
                    {editingActivityId ? 'Chỉnh sửa hoạt động lớp học' : 'Đăng tải hoạt động & Video mới'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Cập nhật hình ảnh, video chuyên đề và biểu dương học sinh THPT Đan Phượng
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-4 mt-4 text-xs">
              {/* Tiêu đề & Chọn lớp */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Tiêu đề hoạt động *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="VD: Chuyên đề STEM Khối lăng trụ lớp 11A1..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Lớp tham gia *</label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — Khối {c.grade}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Chủ đề & Ngày diễn ra */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Chủ đề phân loại *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ActivityCategory)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
                  >
                    <option value="stem">Chuyên đề STEM & Toán học</option>
                    <option value="academic">Thành tích & Bảng vàng</option>
                    <option value="presentation">Thuyết trình & Dự án nhóm</option>
                    <option value="competition">Hội thi & Giải đấu</option>
                    <option value="extracurricular">Ngoại khóa & Trải nghiệm</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Thời gian diễn ra</label>
                  <input
                    type="text"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    placeholder="VD: 18/04/2025"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
                  />
                </div>
              </div>

              {/* Mô tả hoạt động */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nội dung tóm tắt sự kiện</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Mô tả tóm tắt quá trình triển khai, nội dung tiết học hoặc dự án..."
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
                />
              </div>

              {/* Nhận xét của Thầy Thắng */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Nhận xét & Lời khen của Thầy Bùi Ngọc Thắng (Hiển thị nổi bật)
                </label>
                <textarea
                  rows={2}
                  value={formTeacherRemarks}
                  onChange={(e) => setFormTeacherRemarks(e.target.value)}
                  placeholder="VD: Biểu dương tinh thần làm việc nhóm và tư duy sáng tạo của cả lớp..."
                  className="w-full p-2.5 border border-amber-200 bg-amber-50/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 font-serif"
                />
              </div>

              {/* Học sinh tuyên dương */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Học sinh tiêu biểu được biểu dương (cách nhau bởi dấu phẩy)
                </label>
                <input
                  type="text"
                  value={formFeaturedStudents}
                  onChange={(e) => setFormFeaturedStudents(e.target.value)}
                  placeholder="VD: Nguyễn Hoàng Long, Trần Thu Hà, Lê Minh Đức"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
                />
              </div>

              {/* VIDEO SECTION */}
              <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#064A87] flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-[#0878D1]" />
                    <span>Đính kèm Video hoạt động (YouTube / MP4 / Tệp từ máy tính)</span>
                  </span>

                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-blue-200 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setVideoInputType('link')}
                      className={`px-2 py-0.5 rounded font-semibold ${
                        videoInputType === 'link' ? 'bg-[#0878D1] text-white' : 'text-gray-600'
                      }`}
                    >
                      Dán liên kết
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoInputType('file')}
                      className={`px-2 py-0.5 rounded font-semibold ${
                        videoInputType === 'file' ? 'bg-[#0878D1] text-white' : 'text-gray-600'
                      }`}
                    >
                      Tải tệp video
                    </button>
                  </div>
                </div>

                {videoInputType === 'link' ? (
                  <div>
                    <input
                      type="url"
                      value={formVideoUrl}
                      onChange={(e) => setFormVideoUrl(e.target.value)}
                      placeholder="Dán link YouTube hoặc link file MP4 trực tiếp..."
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      Hỗ trợ link YouTube (VD: https://www.youtube.com/watch?v=...) hoặc link video MP4.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="flex items-center justify-center gap-2 p-3 bg-white border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:bg-blue-50/50">
                      <Film className="w-4 h-4 text-[#0878D1]" />
                      <span className="font-semibold text-gray-700">Chọn tệp Video từ máy tính (.mp4, .mov, .webm)</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {formVideoUrl && (
                  <div className="pt-1 space-y-1.5">
                    <input
                      type="text"
                      value={formVideoTitle}
                      onChange={(e) => setFormVideoTitle(e.target.value)}
                      placeholder="Tiêu đề video mô tả (tùy chọn)..."
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-[11px]"
                    />
                    <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đã gắn video thành công. Trình phát sẽ tự động hiển thị trên bài viết.</span>
                    </p>
                  </div>
                )}
              </div>

              {/* IMAGES SECTION */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2.5">
                <span className="font-bold text-gray-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>Album hình ảnh hoạt động</span>
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-3 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 cursor-pointer font-semibold text-gray-700 flex items-center gap-1.5 shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-[#0878D1]" />
                    <span>Tải ảnh từ máy tính (chọn nhiều ảnh)</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>

                  <div className="flex-1 min-w-[200px] flex gap-1.5">
                    <input
                      type="url"
                      value={formNewImageUrl}
                      onChange={(e) => setFormNewImageUrl(e.target.value)}
                      placeholder="Hoặc dán link ảnh trực tuyến..."
                      className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 py-1.5 bg-[#0878D1] text-white rounded-lg font-semibold"
                    >
                      Thêm
                    </button>
                  </div>
                </div>

                {/* Previews of images */}
                {formImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formImages.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 group">
                        <img src={img} alt="preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormImages(formImages.filter((_, i) => i !== idx))}
                          className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ghim hoạt động */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={formIsPinned}
                  onChange={(e) => setFormIsPinned(e.target.checked)}
                  className="rounded text-[#0878D1] focus:ring-[#0878D1] w-4 h-4"
                />
                <label htmlFor="pinCheck" className="text-gray-700 font-medium cursor-pointer">
                  Ghim hoạt động này lên vị trí đầu trang (Highlight ưu tiên)
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#064A87] to-[#0878D1] hover:from-[#053c6d] hover:to-[#0768b5] text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {editingActivityId ? 'Lưu thay đổi' : 'Đăng tải hoạt động ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: BÁO CÁO TỔNG KẾT HOẠT ĐỘNG CUỐI KỲ                               */}
      {/* ========================================================================= */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-blue-100 my-8 max-h-[90vh] overflow-y-auto">
            {/* Action Bar inside Report */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#0878D1]" />
                <h3 className="font-extrabold text-[#064A87] text-base">
                  Báo cáo Tổng kết Phong trào & Hoạt động các lớp
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintReport}
                  className="px-3.5 py-1.5 bg-[#0878D1] hover:bg-[#064A87] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In / Lưu PDF báo cáo</span>
                </button>
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Report Document Body */}
            <div id="printable-report" className="mt-6 p-6 sm:p-8 border border-gray-300 rounded-2xl bg-white text-gray-900 font-serif space-y-6">
              {/* Header Standard */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b-2 border-gray-800 text-xs text-center sm:text-left">
                <div>
                  <p className="font-bold uppercase tracking-wider text-gray-700">SỞ GIÁO DỤC VÀ ĐÀO TẠO HÀ NỘI</p>
                  <p className="font-bold uppercase text-[#064A87] text-sm">TRƯỜNG THPT ĐAN PHƯỢNG</p>
                  <p className="italic text-gray-500 font-sans text-[11px]">Tổ bộ môn Toán học - Thầy Bùi Ngọc Thắng</p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="font-bold uppercase tracking-wider text-gray-700">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                  <p className="font-bold text-gray-800">Độc lập - Tự do - Hạnh phúc</p>
                  <p className="italic text-gray-500 text-[11px] font-sans mt-1">Đan Phượng, ngày {new Date().toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center py-2 space-y-1 font-sans">
                <h2 className="text-lg sm:text-xl font-black uppercase text-[#064A87] tracking-tight">
                  BÁO CÁO TỔNG KẾT HOẠT ĐỘNG CHUYÊN ĐỀ STEM, PHONG TRÀO THI ĐUA VÀ NGOẠI KHÓA MÔN TOÁN
                </h2>
                <p className="text-xs font-semibold text-gray-600">
                  Năm học: {selectedSchoolYear} • {selectedSemester}
                </p>
              </div>

              {/* Section 1: Thống kê số liệu */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold uppercase text-[#064A87] font-sans text-sm border-b border-gray-200 pb-1">
                  I. TỔNG HỢP SỐ LIỆU PHONG TRÀO & HOẠT ĐỘNG
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 font-sans">
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
                    <p className="text-gray-500 text-[11px]">Tổng số sự kiện/chuyên đề</p>
                    <p className="text-lg font-bold text-[#064A87] mt-0.5">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                    <p className="text-gray-500 text-[11px]">Chuyên đề STEM & Ứng dụng</p>
                    <p className="text-lg font-bold text-amber-700 mt-0.5">{stats.stemCount}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                    <p className="text-gray-500 text-[11px]">Tư liệu Video & Phóng sự</p>
                    <p className="text-lg font-bold text-emerald-700 mt-0.5">{stats.withVideos}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-center">
                    <p className="text-gray-500 text-[11px]">Lượt học sinh tuyên dương</p>
                    <p className="text-lg font-bold text-purple-700 mt-0.5">{stats.allCommended}</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Bảng danh mục các hoạt động */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold uppercase text-[#064A87] font-sans text-sm border-b border-gray-200 pb-1">
                  II. DANH MỤC CÁC HOẠT ĐỘNG TIÊU BIỂU TRONG KỲ
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-[11px] font-sans">
                    <thead className="bg-gray-100 text-gray-800">
                      <tr>
                        <th className="border border-gray-300 px-2.5 py-1.5 text-center w-10">STT</th>
                        <th className="border border-gray-300 px-3 py-1.5 text-left">Tên hoạt động / Chuyên đề</th>
                        <th className="border border-gray-300 px-2 py-1.5 text-center w-16">Lớp</th>
                        <th className="border border-gray-300 px-2.5 py-1.5 text-left">Chủ đề</th>
                        <th className="border border-gray-300 px-2.5 py-1.5 text-center w-24">Ngày diễn ra</th>
                        <th className="border border-gray-300 px-3 py-1.5 text-left">Học sinh tiêu biểu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {activities.map((act, index) => (
                        <tr key={act.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2.5 py-1.5 text-center font-medium">{index + 1}</td>
                          <td className="border border-gray-300 px-3 py-1.5 font-semibold text-[#064A87]">
                            {act.title}
                          </td>
                          <td className="border border-gray-300 px-2 py-1.5 text-center font-bold">{act.className}</td>
                          <td className="border border-gray-300 px-2.5 py-1.5">{act.categoryLabel}</td>
                          <td className="border border-gray-300 px-2.5 py-1.5 text-center">{act.date}</td>
                          <td className="border border-gray-300 px-3 py-1.5 text-gray-700">
                            {(act.featuredStudents || []).join(', ') || 'Cả tập thể lớp'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 3: Đánh giá chung của giáo viên */}
              <div className="space-y-2 text-xs leading-relaxed">
                <h4 className="font-bold uppercase text-[#064A87] font-sans text-sm border-b border-gray-200 pb-1">
                  III. ĐÁNH GIÁ CHUYÊN MÔN & ĐỊNH HƯỚNG CỦA GIÁO VIÊN BỘ MÔN
                </h4>
                <p>
                  Trong {selectedSemester} năm học {selectedSchoolYear}, các lớp thuộc khối 10, khối 11 và khối 12 Trường THPT Đan Phượng đã thể hiện tinh thần chủ động, tích cực tiếp cận phương pháp học tập trải nghiệm môn Toán. Việc kết hợp kiến thức hình học, giải tích, lượng giác vào các dự án mô hình thực tế và video thuyết trình đã nâng cao rõ rệt hứng thú học tập và năng lực hợp tác của các em.
                </p>
                <p>
                  - <strong>Khen ngợi đặc biệt:</strong> Tập thể các lớp 11A1, 12A1, 10A1 đã có sự đầu tư công phu về cả hàm lượng tri thức toán học lẫn kỹ năng số hóa và báo cáo trực quan.
                </p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 pt-8 text-center text-xs font-sans">
                <div>
                  <p className="font-bold uppercase text-gray-700">HIỆU TRƯỞNG / PHÓ HIỆU TRƯỞNG</p>
                  <p className="text-[11px] text-gray-400 italic mt-0.5">(Ký và đóng dấu)</p>
                  <div className="h-16" />
                </div>
                <div>
                  <p className="font-bold uppercase text-gray-700">GIÁO VIÊN PHỤ TRÁCH BỘ MÔN</p>
                  <p className="text-[11px] text-gray-400 italic mt-0.5">(Ký và ghi rõ họ tên)</p>
                  <div className="h-16 flex items-center justify-center">
                    <span className="font-serif italic text-blue-900 font-bold text-sm">Thắng</span>
                  </div>
                  <p className="font-bold text-[#064A87]">{teacherProfile.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: XEM CHI TIẾT TOÀN DIỆN MỘT HOẠT ĐỘNG                           */}
      {/* ========================================================================= */}
      {selectedDetailActivity && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-blue-100 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#064A87] text-white text-[10px] font-bold">
                    Lớp {selectedDetailActivity.className}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#064A87] text-[10px] font-semibold">
                    {selectedDetailActivity.categoryLabel}
                  </span>
                  <span className="text-gray-400 text-xs">• {selectedDetailActivity.date}</span>
                </div>
                <h2 className="text-lg font-bold text-[#064A87] pt-1">
                  {selectedDetailActivity.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedDetailActivity(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              {/* Video Player if present */}
              {selectedDetailActivity.videoUrl && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-gray-800 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-emerald-600" />
                    <span>Video phóng sự & tư liệu hoạt động</span>
                  </h4>
                  {renderVideoPlayer(selectedDetailActivity.videoUrl, selectedDetailActivity.videoTitle)}
                </div>
              )}

              {/* Full Image Gallery */}
              {selectedDetailActivity.images && selectedDetailActivity.images.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-gray-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#0878D1]" />
                    <span>Hình ảnh sự kiện ({selectedDetailActivity.images.length} ảnh)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedDetailActivity.images.map((img, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border border-gray-200 shadow-sm aspect-video">
                        <img src={img} alt={`ảnh ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-1">Chi tiết nội dung</h4>
                <p className="text-gray-700 leading-relaxed text-xs">
                  {selectedDetailActivity.description}
                </p>
              </div>

              {/* Remarks */}
              {selectedDetailActivity.teacherRemarks && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950">
                  <p className="font-bold mb-1 flex items-center gap-1.5 text-xs text-amber-900">
                    <GraduationCap className="w-4 h-4 text-amber-700" />
                    <span>Nhận xét chuyên môn của Thầy Bùi Ngọc Thắng</span>
                  </p>
                  <p className="font-serif italic text-xs leading-relaxed">
                    “{selectedDetailActivity.teacherRemarks}”
                  </p>
                </div>
              )}

              {/* Commended Students */}
              {selectedDetailActivity.featuredStudents && selectedDetailActivity.featuredStudents.length > 0 && (
                <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200">
                  <h4 className="font-bold text-[#064A87] mb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Gương mặt học sinh tiêu biểu</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDetailActivity.featuredStudents.map((st, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-white text-[#064A87] font-semibold border border-blue-200 rounded-full shadow-xs flex items-center gap-1.5"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{st}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-5">
              <button
                onClick={() => toggleLikeActivity(selectedDetailActivity.id)}
                className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-xl font-bold flex items-center gap-1.5 border border-pink-200"
              >
                <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                <span>{selectedDetailActivity.likesCount} Yêu thích</span>
              </button>

              <button
                onClick={() => setSelectedDetailActivity(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
