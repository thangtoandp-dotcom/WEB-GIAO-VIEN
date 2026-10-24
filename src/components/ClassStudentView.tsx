import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  UserCheck,
  AlertTriangle,
  FileSpreadsheet,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  User,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Save,
  X,
  FileText,
  CheckSquare,
  Square,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student, ClassRoom, GradeLevel } from '../types';

export const ClassStudentView: React.FC = () => {
  const {
    classes,
    students,
    addClass,
    updateClass,
    deleteClass,
    addStudent,
    updateStudent,
    deleteStudent,
    deleteStudentsBatch,
    clearClassStudents,
    clearAllStudents,
    resetToDefaultData,
    importStudentsList,
    selectedStudent,
    setSelectedStudent,
    updateTeacherRemarks,
    isCreateClassOpen,
    setIsCreateClassOpen,
    isAddStudentOpen,
    setIsAddStudentOpen,
    isImportStudentsOpen,
    setIsImportStudentsOpen,
    setAiInitialPrompt,
    setActiveTab,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'students' | 'classes'>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<'all' | '10' | '11' | '12'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'good' | 'warning' | 'danger'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected student IDs for batch actions
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // New Class Form State
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState<GradeLevel>(10);
  const [newClassYear, setNewClassYear] = useState('2025-2026');
  const [newClassRoom, setNewClassRoom] = useState('Phòng 205');
  const [newClassDesc, setNewClassDesc] = useState('');

  // Edit Class Form State
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);

  // New Student Form State
  const [newStCode, setNewStCode] = useState('');
  const [newStName, setNewStName] = useState('');
  const [newStClassId, setNewStClassId] = useState(classes[0]?.id || 'c10a1');
  const [newStGender, setNewStGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [newStPhone, setNewStPhone] = useState('');
  const [newStNotes, setNewStNotes] = useState('');

  // Edit Student Form State
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editStName, setEditStName] = useState('');
  const [editStCode, setEditStCode] = useState('');
  const [editStClassId, setEditStClassId] = useState('');
  const [editStGender, setEditStGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [editStPhone, setEditStPhone] = useState('');
  const [editStNotes, setEditStNotes] = useState('');

  // Import Modal State
  const [importCsvText, setImportCsvText] = useState('');
  const [importPreviewList, setImportPreviewList] = useState<Partial<Student>[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  // Remarks edit state in Dossier
  const [editingRemarks, setEditingRemarks] = useState('');

  // Toast feedback
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchClass = selectedClassFilter === 'all' || s.classId === selectedClassFilter;
      const matchGrade =
        selectedGradeFilter === 'all' ||
        s.className.startsWith(selectedGradeFilter);
      const matchStatus = selectedStatusFilter === 'all' || s.status === selectedStatusFilter;
      return matchSearch && matchClass && matchGrade && matchStatus;
    });
  }, [students, searchQuery, selectedClassFilter, selectedGradeFilter, selectedStatusFilter]);

  // Paginated students
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage]);

  // Handle Select All on current page
  const allCurrentPageSelected =
    paginatedStudents.length > 0 &&
    paginatedStudents.every((s) => selectedStudentIds.includes(s.id));

  const handleToggleSelectAll = () => {
    if (allCurrentPageSelected) {
      const currentPageIds = new Set(paginatedStudents.map((s) => s.id));
      setSelectedStudentIds((prev) => prev.filter((id) => !currentPageIds.has(id)));
    } else {
      const currentPageIds = paginatedStudents.map((s) => s.id);
      setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const handleToggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Open Edit Student Modal
  const handleOpenEditStudent = (st: Student) => {
    setEditingStudent(st);
    setEditStName(st.name);
    setEditStCode(st.code);
    setEditStClassId(st.classId);
    setEditStGender(st.gender);
    setEditStPhone(st.phone || '');
    setEditStNotes(st.notes || '');
  };

  const handleSaveStudentEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editStName.trim()) return;

    const targetClass = classes.find((c) => c.id === editStClassId) || classes[0];
    updateStudent(editingStudent.id, {
      name: editStName.trim(),
      code: editStCode.trim(),
      classId: targetClass.id,
      className: targetClass.name,
      gender: editStGender,
      phone: editStPhone.trim(),
      notes: editStNotes.trim(),
    });

    setEditingStudent(null);
    showFeedback(`Đã cập nhật thông tin học sinh "${editStName.trim()}" thành công!`);
  };

  // Batch delete selected
  const handleDeleteSelected = () => {
    if (selectedStudentIds.length === 0) return;
    if (
      confirm(
        `Thầy có chắc chắn muốn xóa ${selectedStudentIds.length} học sinh đã chọn khỏi hệ thống? Dữ liệu sẽ được lưu cố định và không bị phục hồi lại khi tải lại trang.`
      )
    ) {
      deleteStudentsBatch(selectedStudentIds);
      const count = selectedStudentIds.length;
      setSelectedStudentIds([]);
      showFeedback(`Đã xóa vĩnh viễn ${count} học sinh thành công!`);
    }
  };

  // Clear students in current class filter
  const handleClearCurrentClass = () => {
    if (selectedClassFilter === 'all') {
      alert('Vui lòng chọn một lớp cụ thể ở bộ lọc lớp bên dưới để xóa học sinh lớp đó.');
      return;
    }
    const targetClass = classes.find((c) => c.id === selectedClassFilter);
    const classStudentsCount = students.filter((s) => s.classId === selectedClassFilter).length;
    if (classStudentsCount === 0) {
      alert(`Lớp ${targetClass?.name || ''} hiện tại không có học sinh nào.`);
      return;
    }
    if (
      confirm(
        `CẢNH BÁO: Thầy có chắc chắn muốn xóa toàn bộ ${classStudentsCount} học sinh của lớp ${
          targetClass?.name || ''
        }? Dữ liệu sẽ được lưu cố định và không xuất hiện lại.`
      )
    ) {
      clearClassStudents(selectedClassFilter);
      setSelectedStudentIds([]);
      showFeedback(`Đã xóa sạch toàn bộ học sinh lớp ${targetClass?.name}!`);
    }
  };

  // Clear all students in system
  const handleClearAll = () => {
    if (students.length === 0) {
      alert('Danh sách học sinh hiện đã trống.');
      return;
    }
    if (
      confirm(
        `CẢNH BÁO: Thầy có chắc chắn muốn xóa TOÀN BỘ ${students.length} học sinh trong hệ thống để bắt đầu nhập danh sách thực tế của trường? Khi vào lại trang web dữ liệu sẽ không bị hoàn tác.`
      )
    ) {
      clearAllStudents();
      setSelectedStudentIds([]);
      showFeedback('Đã làm trống toàn bộ danh sách học sinh thành công!');
    }
  };

  // Export to CSV with UTF-8 BOM
  const handleExportCSV = () => {
    const headers = ['Mã học sinh', 'Họ và tên', 'Lớp', 'Giới tính', 'Điểm trung bình', 'Trạng thái', 'Ghi chú sư phạm'];
    const rows = filteredStudents.map((s) => [
      s.code,
      `"${s.name}"`,
      s.className,
      s.gender,
      s.avgScore,
      s.status === 'good' ? 'Tốt' : s.status === 'warning' ? 'Cần theo dõi' : 'Cần hỗ trợ',
      `"${(s.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DanhSachHocSinh_THPT_DanPhuong_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download Sample Template CSV
  const handleDownloadSampleTemplate = () => {
    const sampleHeaders = ['Mã HS', 'Họ và tên', 'Lớp', 'Giới tính', 'Số điện thoại', 'Điểm TB ban đầu', 'Ghi chú'];
    const sampleData = [
      ['HS1021', 'Trần Bảo Anh', '10A1', 'Nữ', '0912345678', '7.5', 'Chăm chỉ, tích cực phát biểu'],
      ['HS1022', 'Lê Tuấn Hưng', '10A1', 'Nam', '0923456789', '4.8', 'Cần phụ đạo thêm phần vectơ'],
      ['HS1123', 'Đặng Thu Trang', '11A1', 'Nữ', '0934567890', '8.2', 'Nắm chắc kiến thức đạo hàm'],
    ];
    const csvContent = '\uFEFF' + [sampleHeaders.join(','), ...sampleData.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Mau_DanhSach_HocSinh_THPT_DanPhuong.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Parse CSV on paste/input
  const handleParseCsv = (rawText: string) => {
    setImportCsvText(rawText);
    const lines = rawText.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      setImportPreviewList([]);
      setImportErrors(['Tệp hoặc dữ liệu chưa có đủ dòng dữ liệu.']);
      return;
    }

    const errors: string[] = [];
    const parsed: Partial<Student>[] = [];
    const seenCodes = new Set<string>();

    lines.slice(1).forEach((line, index) => {
      const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length < 2) {
        errors.push(`Dòng ${index + 2}: Thiếu cột thông tin họ tên.`);
        return;
      }
      const code = parts[0] || `HS${1000 + Math.floor(Math.random() * 9000)}`;
      const name = parts[1];
      const className = parts[2] || '10A1';
      const gender = parts[3] === 'Nữ' ? 'Nữ' : 'Nam';
      const phone = parts[4] || '';
      const avgScore = parseFloat(parts[5]) || 0;
      const notes = parts[6] || '';

      if (seenCodes.has(code)) {
        errors.push(`Dòng ${index + 2}: Trùng lặp mã học sinh "${code}".`);
      }
      seenCodes.add(code);

      parsed.push({
        code,
        name,
        className,
        gender,
        phone,
        avgScore,
        notes,
      });
    });

    setImportErrors(errors);
    setImportPreviewList(parsed);
  };

  // Submit Add Class
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    addClass({
      name: newClassName.trim(),
      grade: newClassGrade,
      schoolYear: newClassYear,
      room: newClassRoom,
      teacher: 'Bùi Ngọc Thắng',
      description: newClassDesc,
      status: 'active',
    });
    setNewClassName('');
    setNewClassDesc('');
    setIsCreateClassOpen(false);
    showFeedback(`Đã tạo lớp học "${newClassName.trim()}" thành công!`);
  };

  // Submit Add Student
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStName.trim()) return;
    const targetClass = classes.find((c) => c.id === newStClassId) || classes[0];
    const generatedCode = newStCode.trim() || `HS${1000 + Math.floor(Math.random() * 9000)}`;

    addStudent({
      code: generatedCode,
      name: newStName.trim(),
      classId: targetClass.id,
      className: targetClass.name,
      gender: newStGender,
      phone: newStPhone.trim(),
      notes: newStNotes.trim(),
      status: 'good',
    });

    setNewStCode('');
    setNewStName('');
    setNewStPhone('');
    setNewStNotes('');
    setIsAddStudentOpen(false);
    showFeedback(`Đã thêm học sinh "${newStName.trim()}" vào lớp ${targetClass.name}!`);
  };

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub Tabs & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('students')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'students'
                ? 'bg-[#0878D1] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Danh sách học sinh ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('classes')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'classes'
                ? 'bg-[#0878D1] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Quản lý lớp học ({classes.length})</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {activeSubTab === 'students' ? (
            <>
              {/* Clear Options Button */}
              {students.length > 0 && (
                <div className="flex items-center gap-1.5">
                  {selectedClassFilter !== 'all' && (
                    <button
                      onClick={handleClearCurrentClass}
                      className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                      title="Xóa toàn bộ học sinh của lớp đang chọn"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa HS lớp này</span>
                    </button>
                  )}
                  <button
                    onClick={handleClearAll}
                    className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-300 transition-colors cursor-pointer"
                    title="Xóa toàn bộ danh sách để bắt đầu trống"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Làm trống toàn bộ HS</span>
                  </button>
                </div>
              )}

              {students.length === 0 && (
                <button
                  onClick={() => {
                    if (confirm('Thầy có muốn nạp lại dữ liệu mẫu 10 học sinh chuẩn THPT Đan Phượng không?')) {
                      resetToDefaultData();
                      showFeedback('Đã khôi phục dữ liệu mẫu!');
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-50 text-[#0878D1] hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Khôi phục dữ liệu mẫu</span>
                </button>
              )}

              <button
                onClick={() => setIsImportStudentsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Nhập Excel / CSV</span>
              </button>

              <button
                onClick={handleExportCSV}
                disabled={students.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-50 text-[#0878D1] hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất CSV</span>
              </button>

              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0878D1] hover:bg-[#064A87] text-white shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm học sinh</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsCreateClassOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0878D1] hover:bg-[#064A87] text-white shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo lớp học mới</span>
            </button>
          )}
        </div>
      </div>

      {activeSubTab === 'students' ? (
        /* STUDENTS MANAGEMENT VIEW */
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-4 space-y-4">
          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm họ tên hoặc mã HS..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
              />
            </div>

            {/* Filter by Grade */}
            <select
              value={selectedGradeFilter}
              onChange={(e) => {
                setSelectedGradeFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0878D1] bg-white text-gray-700"
            >
              <option value="all">Tất cả khối (Khối 10, 11, 12)</option>
              <option value="10">Khối 10</option>
              <option value="11">Khối 11</option>
              <option value="12">Khối 12</option>
            </select>

            {/* Filter by Class */}
            <select
              value={selectedClassFilter}
              onChange={(e) => {
                setSelectedClassFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0878D1] bg-white text-gray-700"
            >
              <option value="all">Tất cả các lớp</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  Lớp {c.name} ({c.totalStudents} HS)
                </option>
              ))}
            </select>

            {/* Filter by Status */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => {
                setSelectedStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0878D1] bg-white text-gray-700"
            >
              <option value="all">Tất cả trạng thái học tập</option>
              <option value="good">Kết quả tốt (≥ 6.5)</option>
              <option value="warning">Cần theo dõi (5.0 - 6.4)</option>
              <option value="danger">Cần hỗ trợ (&lt; 5.0)</option>
            </select>
          </div>

          {/* Batch Action Bar if items selected */}
          {selectedStudentIds.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs animate-fade-in">
              <div className="flex items-center gap-2 font-semibold text-red-800">
                <CheckSquare className="w-4 h-4 text-red-600" />
                <span>Đã chọn {selectedStudentIds.length} học sinh</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedStudentIds([])}
                  className="px-3 py-1.5 text-gray-600 hover:bg-white rounded-lg cursor-pointer"
                >
                  Bỏ chọn
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa vĩnh viễn {selectedStudentIds.length} học sinh đã chọn</span>
                </button>
              </div>
            </div>
          )}

          {/* Students Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#EAF5FF] text-[#064A87] font-bold border-b border-blue-200">
                <tr>
                  <th className="py-2.5 px-3 w-8">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="text-gray-500 hover:text-[#0878D1] cursor-pointer"
                      title={allCurrentPageSelected ? 'Bỏ chọn trang này' : 'Chọn tất cả trang này'}
                    >
                      {allCurrentPageSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#0878D1]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-2.5 px-3">STT</th>
                  <th className="py-2.5 px-3">Mã HS</th>
                  <th className="py-2.5 px-3">Họ và tên học sinh</th>
                  <th className="py-2.5 px-2">Lớp</th>
                  <th className="py-2.5 px-2">Giới tính</th>
                  <th className="py-2.5 px-3">Điểm TB</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3">Ghi chú sư phạm</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Users className="w-8 h-8 text-gray-300" />
                        <p className="font-semibold text-gray-600">
                          {students.length === 0
                            ? 'Danh sách học sinh đang trống (Bạn đã xóa sạch danh sách).'
                            : 'Không tìm thấy học sinh nào phù hợp với bộ lọc tìm kiếm.'}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {students.length === 0
                            ? 'Thầy có thể bấm "Thêm học sinh" hoặc "Nhập Excel / CSV" để đưa học sinh thực tế vào hệ thống.'
                            : 'Hãy thử thay đổi từ khóa hoặc bộ lọc lớp/khối.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((st, index) => {
                    const stt = (currentPage - 1) * pageSize + index + 1;
                    const isSelected = selectedStudentIds.includes(st.id);
                    return (
                      <tr
                        key={st.id}
                        className={`hover:bg-blue-50/50 transition-colors cursor-pointer group ${
                          isSelected ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td
                          className="py-2.5 px-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelectStudent(st.id);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectStudent(st.id)}
                            className="w-4 h-4 rounded text-[#0878D1] cursor-pointer"
                          />
                        </td>
                        <td
                          className="py-2.5 px-3 text-gray-500 font-medium"
                          onClick={() => setSelectedStudent(st)}
                        >
                          {stt}
                        </td>
                        <td
                          className="py-2.5 px-3 font-semibold text-[#0878D1]"
                          onClick={() => setSelectedStudent(st)}
                        >
                          {st.code}
                        </td>
                        <td
                          className="py-2.5 px-3 font-bold text-gray-800 group-hover:text-[#0878D1]"
                          onClick={() => setSelectedStudent(st)}
                        >
                          {st.name}
                        </td>
                        <td
                          className="py-2.5 px-2 font-medium text-gray-700"
                          onClick={() => setSelectedStudent(st)}
                        >
                          {st.className}
                        </td>
                        <td
                          className="py-2.5 px-2 text-gray-600"
                          onClick={() => setSelectedStudent(st)}
                        >
                          {st.gender}
                        </td>
                        <td
                          className="py-2.5 px-3 font-bold text-base text-[#12345A]"
                          onClick={() => setSelectedStudent(st)}
                        >
                          {st.avgScore > 0 ? st.avgScore.toFixed(1) : '-'}
                        </td>
                        <td
                          className="py-2.5 px-3"
                          onClick={() => setSelectedStudent(st)}
                        >
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                              st.status === 'danger'
                                ? 'bg-red-50 text-red-600 border border-red-200'
                                : st.status === 'warning'
                                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            }`}
                          >
                            {st.status === 'danger'
                              ? 'Cần hỗ trợ'
                              : st.status === 'warning'
                              ? 'Theo dõi'
                              : 'Kết quả tốt'}
                          </span>
                        </td>
                        <td
                          className="py-2.5 px-3 text-gray-500 truncate max-w-[200px]"
                          title={st.notes || st.statusReason}
                          onClick={() => setSelectedStudent(st)}
                        >
                          {st.notes || st.statusReason || 'Chưa có ghi chú'}
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                          {/* Sửa tên và thông tin */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditStudent(st);
                            }}
                            className="px-2 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold cursor-pointer inline-flex items-center gap-1"
                            title="Sửa tên hoặc thông tin học sinh"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Sửa</span>
                          </button>

                          {/* Xem hồ sơ */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudent(st);
                            }}
                            className="px-2 py-1 rounded bg-blue-50 text-[#0878D1] hover:bg-blue-100 font-semibold cursor-pointer"
                            title="Xem hồ sơ chi tiết"
                          >
                            Hồ sơ
                          </button>

                          {/* Xóa học sinh */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Thầy có chắc chắn muốn xóa học sinh "${st.name}" (${st.code}) khỏi hệ thống? Dữ liệu sẽ được lưu vĩnh viễn và không hồi lại khi tải lại trang.`)) {
                                deleteStudent(st.id);
                                showFeedback(`Đã xóa vĩnh viễn học sinh "${st.name}"!`);
                              }
                            }}
                            className="p-1 rounded text-red-500 hover:bg-red-50 cursor-pointer"
                            title="Xóa học sinh này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredStudents.length > 0 && (
            <div className="flex items-center justify-between text-xs text-gray-600 pt-2">
              <span>
                Hiển thị {(currentPage - 1) * pageSize + 1} -{' '}
                {Math.min(currentPage * pageSize, filteredStudents.length)} trên tổng số{' '}
                {filteredStudents.length} học sinh
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold text-gray-800">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* CLASSES MANAGEMENT VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#EAF5FF] text-[#0878D1] flex items-center justify-center font-bold text-lg">
                      {cls.name}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-[#064A87]">Lớp {cls.name}</h4>
                      <p className="text-xs text-gray-500">Khối {cls.grade} • Năm học {cls.schoolYear}</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                    Đang giảng dạy
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Sĩ số:</span>{' '}
                    <span className="font-bold text-gray-800">{cls.totalStudents} HS</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phòng học:</span>{' '}
                    <span className="font-semibold text-gray-800">{cls.room}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Điểm TB lớp:</span>{' '}
                    <span className="font-bold text-[#0878D1]">{cls.avgScore.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">GV phụ trách:</span>{' '}
                    <span className="font-semibold text-gray-800">{cls.teacher}</span>
                  </div>
                </div>

                {cls.description && (
                  <p className="text-xs text-gray-500 italic mt-3 bg-gray-50 p-2 rounded">
                    "{cls.description}"
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setSelectedClassFilter(cls.id);
                    setActiveSubTab('students');
                  }}
                  className="text-[#0878D1] font-semibold hover:underline cursor-pointer"
                >
                  Xem danh sách HS ({cls.totalStudents}) →
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingClass(cls)}
                    className="p-1 rounded text-blue-600 hover:bg-blue-50 cursor-pointer"
                    title="Chỉnh sửa lớp"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Thầy có chắc chắn muốn xóa lớp ${cls.name}?`)) {
                        deleteClass(cls.id);
                        showFeedback(`Đã xóa lớp ${cls.name}!`);
                      }
                    }}
                    className="p-1 rounded text-red-500 hover:bg-red-50 cursor-pointer"
                    title="Xóa lớp"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-blue-100 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-[#0878D1]" />
                <h3 className="text-base font-bold text-[#064A87]">
                  Chỉnh sửa thông tin học sinh
                </h3>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentEdit} className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Họ và tên học sinh *
                </label>
                <input
                  type="text"
                  required
                  value={editStName}
                  onChange={(e) => setEditStName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0878D1] font-semibold text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Mã học sinh *</label>
                  <input
                    type="text"
                    required
                    value={editStCode}
                    onChange={(e) => setEditStCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Lớp học</label>
                  <select
                    value={editStClassId}
                    onChange={(e) => setEditStClassId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Giới tính</label>
                  <select
                    value={editStGender}
                    onChange={(e) => setEditStGender(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={editStPhone}
                    onChange={(e) => setEditStPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Ghi chú sư phạm
                </label>
                <textarea
                  rows={2}
                  value={editStNotes}
                  onChange={(e) => setEditStNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0878D1] hover:bg-[#064A87] text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT DETAILED DOSSIER MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-blue-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#064A87] to-[#0878D1] text-white flex items-center justify-center font-bold text-xl shadow-md">
                  {selectedStudent.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-[#064A87]">{selectedStudent.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded font-bold bg-blue-100 text-[#0878D1]">
                      Lớp {selectedStudent.className}
                    </span>
                    <span className="text-xs text-gray-400">Mã: {selectedStudent.code}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Trường THPT Đan Phượng • Giới tính: {selectedStudent.gender} • SĐT: {selectedStudent.phone || '098...'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenEditStudent(selectedStudent);
                    setSelectedStudent(null);
                  }}
                  className="px-3 py-1.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Sửa thông tin</span>
                </button>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="py-4 space-y-5">
              {/* Top Stats of Student */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-center">
                  <p className="text-[11px] text-gray-500">Điểm trung bình</p>
                  <p className="text-2xl font-bold text-[#0878D1]">{selectedStudent.avgScore.toFixed(1)}</p>
                </div>
                <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-center">
                  <p className="text-[11px] text-gray-500">Số bài kiểm tra</p>
                  <p className="text-2xl font-bold text-gray-800">{selectedStudent.totalTests || 5}</p>
                </div>
                <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-center">
                  <p className="text-[11px] text-gray-500">Tỷ lệ nộp bài</p>
                  <p className="text-2xl font-bold text-emerald-600">95%</p>
                </div>
                <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-center">
                  <p className="text-[11px] text-gray-500">Xếp loại môn</p>
                  <p className="text-xl font-bold text-[#064A87]">
                    {selectedStudent.avgScore >= 8
                      ? 'Giỏi'
                      : selectedStudent.avgScore >= 6.5
                      ? 'Khá'
                      : selectedStudent.avgScore >= 5
                      ? 'Trung bình'
                      : 'Cần hỗ trợ'}
                  </p>
                </div>
              </div>

              {/* Progress Scores Trend */}
              <div>
                <h4 className="font-bold text-sm text-[#064A87] mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#0878D1]" />
                  <span>Tiến trình điểm số qua các bài kiểm tra gần đây</span>
                </h4>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                  {(selectedStudent.recentScores && selectedStudent.recentScores.length > 0
                    ? selectedStudent.recentScores
                    : [5.0, 5.5, 6.0, 6.5, selectedStudent.avgScore]
                  ).map((sc, i) => (
                    <div key={i} className="flex-1 text-center bg-white p-2 rounded-lg border border-gray-200">
                      <p className="text-[10px] text-gray-400 font-medium">Bài {i + 1}</p>
                      <p className="text-base font-bold text-[#0878D1]">{sc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Topic Strengths Breakdown */}
              {selectedStudent.topicStrengths && (
                <div>
                  <h4 className="font-bold text-sm text-[#064A87] mb-2">
                    Năng lực theo từng chuyên đề môn Toán
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(selectedStudent.topicStrengths).map(([topic, score]) => (
                      <div key={topic} className="flex items-center gap-3 text-xs">
                        <span className="w-40 font-medium text-gray-700 truncate">{topic}</span>
                        <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              score >= 8
                                ? 'bg-[#10B981]'
                                : score >= 6.5
                                ? 'bg-[#0878D1]'
                                : score >= 5
                                ? 'bg-[#F59E0B]'
                                : 'bg-[#EF4444]'
                            }`}
                            style={{ width: `${(score / 10) * 100}%` }}
                          />
                        </div>
                        <span className="w-8 font-bold text-gray-800 text-right">{score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pedagogical Remarks & AI Assistant Note */}
              <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#064A87] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#0878D1]" />
                    <span>Nhận xét sư phạm của thầy Bùi Ngọc Thắng</span>
                  </h4>
                  <button
                    onClick={() => {
                      setAiInitialPrompt(
                        `Viết lời nhận xét sư phạm chi tiết cho học sinh ${selectedStudent.name} (Lớp ${selectedStudent.className}), điểm trung bình ${selectedStudent.avgScore}, tình trạng: ${selectedStudent.statusReason || selectedStudent.notes}. Nhận xét cần mang tính khích lệ, chỉ ra phương pháp ôn tập hiệu quả.`
                      );
                      setSelectedStudent(null);
                      setActiveTab('ai');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white text-[#0878D1] border border-blue-300 shadow-xs hover:bg-blue-50 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gợi ý nhận xét bằng AI</span>
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={editingRemarks !== '' ? editingRemarks : selectedStudent.notes || ''}
                  onChange={(e) => setEditingRemarks(e.target.value)}
                  placeholder="Nhập ghi chú sư phạm, định hướng phụ đạo hoặc lời khuyên cho học sinh..."
                  className="w-full p-2.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
                />

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      const remarksToSave =
                        editingRemarks !== '' ? editingRemarks : selectedStudent.notes || '';
                      updateTeacherRemarks(selectedStudent.id, remarksToSave);
                      showFeedback('Đã lưu nhận xét sư phạm cho học sinh thành công!');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0878D1] hover:bg-[#064A87] text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu nhận xét</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer"
              >
                Đóng hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE CLASS MODAL */}
      {isCreateClassOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-blue-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#064A87]">Tạo lớp học mới</h3>
              <button
                onClick={() => setIsCreateClassOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="py-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tên lớp (ví dụ: 10A5, 11A5, 12A5) *</label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Nhập tên lớp..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Khối lớp</label>
                  <select
                    value={newClassGrade}
                    onChange={(e) => setNewClassGrade(Number(e.target.value) as GradeLevel)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value={10}>Khối 10</option>
                    <option value={11}>Khối 11</option>
                    <option value={12}>Khối 12</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Năm học</label>
                  <input
                    type="text"
                    value={newClassYear}
                    onChange={(e) => setNewClassYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Phòng học</label>
                <input
                  type="text"
                  value={newClassRoom}
                  onChange={(e) => setNewClassRoom(e.target.value)}
                  placeholder="Ví dụ: Phòng 304, Khu A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mô tả định hướng của lớp</label>
                <textarea
                  rows={2}
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  placeholder="Ví dụ: Lớp chọn định hướng thi ĐH khối A, A1..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateClassOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0878D1] hover:bg-[#064A87] text-white font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  Tạo lớp học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-blue-100 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#064A87]">Thêm học sinh mới</h3>
              <button
                onClick={() => setIsAddStudentOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="py-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Họ và tên học sinh *</label>
                <input
                  type="text"
                  required
                  value={newStName}
                  onChange={(e) => setNewStName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Mã học sinh</label>
                  <input
                    type="text"
                    value={newStCode}
                    onChange={(e) => setNewStCode(e.target.value)}
                    placeholder="Tự sinh nếu để trống"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Lớp học *</label>
                  <select
                    value={newStClassId}
                    onChange={(e) => setNewStClassId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Giới tính</label>
                  <select
                    value={newStGender}
                    onChange={(e) => setNewStGender(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Số điện thoại liên hệ</label>
                  <input
                    type="text"
                    value={newStPhone}
                    onChange={(e) => setNewStPhone(e.target.value)}
                    placeholder="098..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Ghi chú sư phạm ban đầu</label>
                <textarea
                  rows={2}
                  value={newStNotes}
                  onChange={(e) => setNewStNotes(e.target.value)}
                  placeholder="Ghi chú năng lực hoặc yêu cầu hỗ trợ..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0878D1] hover:bg-[#064A87] text-white font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  Lưu học sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMPORT STUDENTS CSV MODAL */}
      {isImportStudentsOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-blue-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-[#064A87]">
                  Nhập danh sách học sinh từ tệp CSV / Excel
                </h3>
              </div>
              <button
                onClick={() => setIsImportStudentsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="flex items-center justify-between bg-blue-50/70 p-3 rounded-xl border border-blue-200">
                <div>
                  <p className="font-bold text-[#064A87]">Tải tệp mẫu chuẩn</p>
                  <p className="text-gray-500">Mẫu định dạng chuẩn gồm các cột: Mã HS, Họ tên, Lớp, Giới tính...</p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSampleTemplate}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#0878D1] border border-blue-300 rounded-lg font-semibold hover:bg-blue-50 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải tệp mẫu</span>
                </button>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Dán nội dung CSV hoặc kéo thả tệp vào đây
                </label>
                <textarea
                  rows={6}
                  value={importCsvText}
                  onChange={(e) => handleParseCsv(e.target.value)}
                  placeholder="Dán các dòng CSV tại đây... Ví dụ:&#10;Mã HS,Họ và tên,Lớp,Giới tính,SĐT,Điểm TB,Ghi chú&#10;HS1021,Trần Bảo Anh,10A1,Nữ,0912345678,7.5,Chăm chỉ"
                  className="w-full p-2.5 font-mono text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
                />
              </div>

              {/* Error messages if any */}
              {importErrors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Phát hiện cảnh báo dữ liệu:</span>
                  </div>
                  {importErrors.map((err, i) => (
                    <p key={i} className="text-[11px] pl-5">• {err}</p>
                  ))}
                </div>
              )}

              {/* Preview table */}
              {importPreviewList.length > 0 && (
                <div>
                  <p className="font-bold text-gray-700 mb-1.5">
                    Xem trước ({importPreviewList.length} dòng hợp lệ):
                  </p>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-gray-100 text-gray-700 font-bold">
                        <tr>
                          <th className="p-1.5">Mã</th>
                          <th className="p-1.5">Họ tên</th>
                          <th className="p-1.5">Lớp</th>
                          <th className="p-1.5">Giới tính</th>
                          <th className="p-1.5">Điểm TB</th>
                          <th className="p-1.5">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {importPreviewList.map((st, i) => (
                          <tr key={i}>
                            <td className="p-1.5 font-semibold text-[#0878D1]">{st.code}</td>
                            <td className="p-1.5 font-bold text-gray-800">{st.name}</td>
                            <td className="p-1.5">{st.className}</td>
                            <td className="p-1.5">{st.gender}</td>
                            <td className="p-1.5 font-bold">{st.avgScore}</td>
                            <td className="p-1.5 text-gray-500 truncate max-w-[150px]">{st.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportStudentsOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={importPreviewList.length === 0}
                  onClick={() => {
                    importStudentsList(importPreviewList);
                    showFeedback(`Đã nhập thành công ${importPreviewList.length} học sinh vào hệ thống!`);
                    setIsImportStudentsOpen(false);
                    setImportCsvText('');
                    setImportPreviewList([]);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  Xác nhận nhập {importPreviewList.length} học sinh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
