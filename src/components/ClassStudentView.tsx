import React, { useState, useMemo, useRef } from 'react';
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
  FileCheck2,
  HelpCircle,
  Layers,
} from 'lucide-react';
import * as XLSX from 'xlsx';
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
  const [newClassYear, setNewClassYear] = useState('2026-2027');
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

  // Excel & CSV Import States
  const [importTab, setImportTab] = useState<'excel' | 'paste'>('excel');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFileSize, setUploadedFileSize] = useState<string>('');
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [rawWorkbook, setRawWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [targetImportClassId, setTargetImportClassId] = useState<string>('auto');
  const [importCsvText, setImportCsvText] = useState('');
  const [importPreviewList, setImportPreviewList] = useState<Partial<Student>[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Download Genuine Excel (.xlsx) Template with styling & widths
  const handleDownloadSampleExcel = () => {
    const wsData = [
      ['TRƯỜNG THPT ĐAN PHƯỢNG - HỆ THỐNG QUẢN LÝ TOÁN HỌC'],
      ['DANH SÁCH HỌC SINH MẪU NHẬP EXCEL (DÙNG ĐỂ TẢI LÊN)'],
      ['Lưu ý: Thầy/cô có thể giữ nguyên cột hoặc thay đổi lớp. Hệ thống tự động nhận diện các cột.'],
      [''],
      ['Mã học sinh', 'Họ và tên', 'Lớp', 'Giới tính', 'Ngày sinh', 'Số điện thoại', 'Điểm TB', 'Ghi chú sư phạm'],
      ['HS1201', 'Vũ Đức Trí', '12A3', 'Nam', '2008-04-15', '0912345678', 8.2, 'Nắm vững kiến thức giải tích và hàm số'],
      ['HS1202', 'Ngô Bảo Ngọc', '12A4', 'Nữ', '2008-09-22', '0923456789', 9.0, 'Đội tuyển HSG Toán THPT Đan Phượng'],
      ['HS1203', 'Hoàng Mai Anh', '12A12', 'Nữ', '2008-01-10', '0934567890', 7.5, 'Cần rèn thêm kỹ năng tính nhẩm tích phân'],
      ['HS1204', 'Đặng Tuấn Kiệt', '12A13', 'Nam', '2008-11-05', '0945678901', 7.4, 'Tích cực xây dựng bài, chăm chỉ'],
      ['HS1205', 'Bùi Phương Thảo', '12A14', 'Nữ', '2008-06-18', '0956789012', 7.8, 'Học lực Khá, tư duy hình học không gian tốt'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = [
      { wch: 14 }, // Mã học sinh
      { wch: 24 }, // Họ và tên
      { wch: 10 }, // Lớp
      { wch: 12 }, // Giới tính
      { wch: 14 }, // Ngày sinh
      { wch: 15 }, // SĐT
      { wch: 10 }, // Điểm TB
      { wch: 45 }, // Ghi chú
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DanhSachHocSinh');
    XLSX.writeFile(wb, 'Mau_DanhSach_HocSinh_THPT_DanPhuong.xlsx');
  };

  // Download Sample Template CSV
  const handleDownloadSampleTemplate = () => {
    const sampleHeaders = ['Mã HS', 'Họ và tên', 'Lớp', 'Giới tính', 'Số điện thoại', 'Điểm TB ban đầu', 'Ghi chú'];
    const sampleData = [
      ['HS1201', 'Vũ Đức Trí', '12A3', 'Nam', '0912345678', '8.2', 'Nắm chắc kiến thức giải tích'],
      ['HS1202', 'Ngô Bảo Ngọc', '12A4', 'Nữ', '0923456789', '9.0', 'Đội tuyển HSG Toán'],
      ['HS1203', 'Hoàng Mai Anh', '12A12', 'Nữ', '0934567890', '7.5', 'Chăm chỉ, tích cực'],
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

  // Smart Row Processor for 2D Array from Excel or CSV
  const processRowsToStudents = (rows: any[][], overrideClassId: string = targetImportClassId) => {
    if (!rows || rows.length === 0) {
      setImportPreviewList([]);
      setImportErrors(['Tệp Excel không chứa dữ liệu hàng nào.']);
      setImportWarnings([]);
      return;
    }

    // 1. Locate Header Row (inspect first 15 rows for header keywords)
    let headerRowIdx = -1;
    const colMap: Record<string, number> = {};

    for (let r = 0; r < Math.min(rows.length, 15); r++) {
      const row = rows[r] || [];
      const rowStr = row.map((cell) => String(cell || '').trim().toLowerCase());

      const hasName = rowStr.some(
        (c) =>
          c.includes('họ và tên') ||
          c.includes('họ tên') ||
          c.includes('tên học sinh') ||
          c === 'tên' ||
          c.includes('full name')
      );
      const hasCode = rowStr.some(
        (c) =>
          c.includes('mã hs') ||
          c.includes('mã học sinh') ||
          c.includes('mã định danh') ||
          c.includes('mã số') ||
          c === 'sbd' ||
          c.includes('stt')
      );

      if (hasName || (hasCode && rowStr.some((c) => c.includes('lớp') || c.includes('giới tính')))) {
        headerRowIdx = r;
        break;
      }
    }

    if (headerRowIdx === -1) {
      headerRowIdx = 0;
    }

    const headerRow = rows[headerRowIdx] || [];
    headerRow.forEach((cell, idx) => {
      const colTitle = String(cell || '').trim().toLowerCase();
      if (!colTitle) return;

      if (
        (colTitle.includes('họ và tên') ||
          colTitle.includes('họ tên') ||
          colTitle.includes('tên học sinh') ||
          colTitle === 'tên' ||
          colTitle.includes('full name')) &&
        colMap.name === undefined
      ) {
        colMap.name = idx;
      }
      if (
        (colTitle.includes('họ và chữ đệm') || colTitle.includes('họ đệm') || colTitle === 'họ') &&
        colMap.ho === undefined
      ) {
        colMap.ho = idx;
      }
      if ((colTitle === 'tên' || colTitle === 'tên riêng') && colMap.ten === undefined) {
        colMap.ten = idx;
      }
      if (
        (colTitle.includes('mã hs') ||
          colTitle.includes('mã học sinh') ||
          colTitle.includes('mã định danh') ||
          colTitle.includes('mã số') ||
          colTitle === 'sbd' ||
          colTitle.includes('số báo danh') ||
          colTitle === 'code') &&
        colMap.code === undefined
      ) {
        colMap.code = idx;
      }
      if (
        (colTitle.includes('lớp') ||
          colTitle.includes('tên lớp') ||
          colTitle.includes('khối lớp') ||
          colTitle === 'class') &&
        colMap.className === undefined
      ) {
        colMap.className = idx;
      }
      if (
        (colTitle.includes('giới tính') ||
          colTitle.includes('phái') ||
          colTitle.includes('nam/nữ') ||
          colTitle === 'gender') &&
        colMap.gender === undefined
      ) {
        colMap.gender = idx;
      }
      if (
        (colTitle.includes('ngày sinh') ||
          colTitle.includes('năm sinh') ||
          colTitle.includes('ngày tháng năm sinh') ||
          colTitle === 'ns' ||
          colTitle === 'dob') &&
        colMap.birthDate === undefined
      ) {
        colMap.birthDate = idx;
      }
      if (
        (colTitle.includes('điện thoại') ||
          colTitle.includes('sđt') ||
          colTitle.includes('số điện thoại') ||
          colTitle.includes('sđt ph') ||
          colTitle.includes('phone')) &&
        colMap.phone === undefined
      ) {
        colMap.phone = idx;
      }
      if (
        (colTitle.includes('điểm tb') ||
          colTitle.includes('điểm trung bình') ||
          colTitle.includes('điểm') ||
          colTitle.includes('score')) &&
        colMap.avgScore === undefined
      ) {
        colMap.avgScore = idx;
      }
      if (
        (colTitle.includes('ghi chú') ||
          colTitle.includes('nhận xét') ||
          colTitle.includes('đặc điểm') ||
          colTitle.includes('notes')) &&
        colMap.notes === undefined
      ) {
        colMap.notes = idx;
      }
    });

    const parsed: Partial<Student>[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    const seenCodes = new Set<string>();

    const targetClass = overrideClassId !== 'auto' ? classes.find((c) => c.id === overrideClassId) : null;

    for (let r = headerRowIdx + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      // Extract Name
      let name = '';
      if (colMap.name !== undefined && row[colMap.name] !== undefined) {
        name = String(row[colMap.name]).trim();
      } else if (colMap.ho !== undefined || colMap.ten !== undefined) {
        const ho = colMap.ho !== undefined ? String(row[colMap.ho] || '').trim() : '';
        const ten = colMap.ten !== undefined ? String(row[colMap.ten] || '').trim() : '';
        name = `${ho} ${ten}`.trim();
      }

      // Skip non-student or title/summary rows
      if (
        !name ||
        name.toLowerCase().includes('tổng số') ||
        name.toLowerCase().includes('giáo viên') ||
        name.toLowerCase().includes('ghi chú') ||
        name.toLowerCase().startsWith('thpt')
      ) {
        continue;
      }

      // Extract Code
      let code = '';
      if (colMap.code !== undefined && row[colMap.code] !== undefined) {
        code = String(row[colMap.code]).trim();
      }
      if (!code) {
        code = `HS${Math.floor(1000 + Math.random() * 9000)}`;
      }

      if (seenCodes.has(code)) {
        warnings.push(`Dòng ${r + 1}: Trùng lặp mã "${code}". Đã tự động tạo mã bổ sung cho học sinh "${name}".`);
        code = `${code}_${Math.floor(Math.random() * 90 + 10)}`;
      }
      seenCodes.add(code);

      // Determine Class
      let className = targetClass ? targetClass.name : '';
      let classId = targetClass ? targetClass.id : '';

      if (!targetClass) {
        if (colMap.className !== undefined && row[colMap.className] !== undefined) {
          className = String(row[colMap.className]).trim();
        }
        if (!className) {
          className = selectedClassFilter !== 'all' ? (classes.find((c) => c.id === selectedClassFilter)?.name || '12A3') : '12A3';
        }
        const matched = classes.find((c) => c.name.toLowerCase() === className.toLowerCase());
        if (matched) {
          classId = matched.id;
          className = matched.name;
        } else {
          classId = classes[0]?.id || 'c12a3';
        }
      }

      // Determine Gender
      let gender: 'Nam' | 'Nữ' = 'Nam';
      if (colMap.gender !== undefined && row[colMap.gender] !== undefined) {
        const gRaw = String(row[colMap.gender]).trim().toLowerCase();
        if (gRaw === 'nữ' || gRaw === 'nu' || gRaw === 'female' || gRaw === 'f' || gRaw === 'gái') {
          gender = 'Nữ';
        }
      }

      // Determine Birthdate
      let birthDate = '2008-01-01';
      if (colMap.birthDate !== undefined && row[colMap.birthDate] !== undefined) {
        const bRaw = row[colMap.birthDate];
        if (typeof bRaw === 'number' && bRaw > 20000) {
          try {
            const dateObj = XLSX.SSF.parse_date_code(bRaw);
            const m = String(dateObj.m).padStart(2, '0');
            const d = String(dateObj.d).padStart(2, '0');
            birthDate = `${dateObj.y}-${m}-${d}`;
          } catch {
            birthDate = String(bRaw);
          }
        } else {
          birthDate = String(bRaw).trim();
        }
      }

      // Determine Phone
      let phone = '';
      if (colMap.phone !== undefined && row[colMap.phone] !== undefined) {
        phone = String(row[colMap.phone]).trim();
      }

      // Determine Avg Score
      let avgScore = 0;
      if (colMap.avgScore !== undefined && row[colMap.avgScore] !== undefined) {
        const sVal = parseFloat(String(row[colMap.avgScore]).replace(',', '.'));
        if (!isNaN(sVal) && sVal >= 0 && sVal <= 10) {
          avgScore = Math.round(sVal * 10) / 10;
        }
      }

      // Determine Notes
      let notes = 'Nhập từ file Excel';
      if (colMap.notes !== undefined && row[colMap.notes] !== undefined) {
        notes = String(row[colMap.notes]).trim() || 'Nhập từ file Excel';
      }

      parsed.push({
        code,
        name,
        classId,
        className,
        gender,
        birthDate,
        phone,
        avgScore,
        notes,
      });
    }

    if (parsed.length === 0) {
      errors.push('Không tìm thấy bản ghi học sinh hợp lệ nào từ tệp. Vui lòng kiểm tra lại tiêu đề cột.');
    }

    setImportErrors(errors);
    setImportWarnings(warnings);
    setImportPreviewList(parsed);
  };

  // Handle uploaded file (Excel .xlsx, .xls, .csv)
  const handleFileUpload = (file: File) => {
    if (!file) return;
    setUploadedFileName(file.name);
    setUploadedFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: 'array' });
        setRawWorkbook(workbook);
        setSheetNames(workbook.SheetNames);
        const firstSheet = workbook.SheetNames[0];
        setSelectedSheet(firstSheet);

        const worksheet = workbook.Sheets[firstSheet];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
        processRowsToStudents(rows);
      } catch (err: any) {
        setImportErrors([`Lỗi khi đọc file Excel: ${err.message || 'Định dạng file không được hỗ trợ.'}`]);
        setImportPreviewList([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle sheet change in multi-sheet Excel
  const handleSheetChange = (sheetName: string) => {
    setSelectedSheet(sheetName);
    if (!rawWorkbook) return;
    const worksheet = rawWorkbook.Sheets[sheetName];
    if (!worksheet) return;
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
    processRowsToStudents(rows);
  };

  // Handle target class selection change
  const handleTargetClassChange = (clsId: string) => {
    setTargetImportClassId(clsId);
    if (rawWorkbook && selectedSheet) {
      const worksheet = rawWorkbook.Sheets[selectedSheet];
      if (worksheet) {
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
        processRowsToStudents(rows, clsId);
      }
    } else if (importCsvText.trim()) {
      handleParseCsv(importCsvText, clsId);
    }
  };

  // Parse CSV on paste/input
  const handleParseCsv = (rawText: string, overrideClassId: string = targetImportClassId) => {
    setImportCsvText(rawText);
    const lines = rawText.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      setImportPreviewList([]);
      setImportErrors(['Dữ liệu dán chưa có đủ dòng tiêu đề và dữ liệu học sinh.']);
      setImportWarnings([]);
      return;
    }

    const rows = lines.map((l) => l.split(',').map((p) => p.trim().replace(/^["']|["']$/g, '')));
    processRowsToStudents(rows, overrideClassId);
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
                onClick={() => {
                  setImportTab('excel');
                  setIsImportStudentsOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer"
                title="Tải lên tệp Excel (.xlsx, .xls) hoặc CSV để nạp danh sách học sinh"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Nhập từ file Excel</span>
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
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#0878D1]">
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-700">
                            {students.length === 0
                              ? 'Danh sách học sinh đang trống (Đã xóa theo thao tác của thầy)'
                              : 'Không tìm thấy học sinh nào phù hợp với bộ lọc tìm kiếm.'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                            {students.length === 0
                              ? 'Trạng thái trống đã được lưu cố định trên Supabase Cloud và trình duyệt. Thầy tải lại trang web (F5) dữ liệu vẫn được bảo toàn nguyên vẹn.'
                              : 'Hãy thử thay đổi từ khóa hoặc bộ lọc lớp/khối.'}
                          </p>
                        </div>
                        {students.length === 0 && (
                          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                            <button
                              onClick={() => setIsAddStudentOpen(true)}
                              className="px-3.5 py-1.5 bg-[#0878D1] text-white rounded-lg text-xs font-semibold hover:bg-[#064A87] cursor-pointer flex items-center gap-1.5 shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Thêm học sinh mới</span>
                            </button>
                            <button
                              onClick={() => setIsImportStudentsOpen(true)}
                              className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 cursor-pointer flex items-center gap-1.5 shadow-xs"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Nhập từ Excel / CSV</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Thầy có muốn nạp lại dữ liệu mẫu 10 học sinh THPT Đan Phượng để tham khảo không?')) {
                                  resetToDefaultData();
                                  showFeedback('Đã nạp lại dữ liệu mẫu!');
                                }
                              }}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 cursor-pointer flex items-center gap-1.5 border border-gray-200"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Nạp lại 10 HS mẫu</span>
                            </button>
                          </div>
                        )}
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

      {/* IMPORT STUDENTS EXCEL & CSV MODAL */}
      {isImportStudentsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl border border-blue-100 max-h-[92vh] overflow-y-auto flex flex-col justify-between">
            {/* Modal Header */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#064A87]">
                      Nhập học sinh từ file Excel tải lên
                    </h3>
                    <p className="text-xs text-gray-500">
                      Hỗ trợ tệp bảng tính Excel (.xlsx, .xls) và .CSV xuất từ SMAS, VnEdu, eNetViet của THPT Đan Phượng
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsImportStudentsOpen(false);
                    setUploadedFileName('');
                    setUploadedFileSize('');
                    setRawWorkbook(null);
                    setSheetNames([]);
                    setImportPreviewList([]);
                    setImportErrors([]);
                    setImportWarnings([]);
                    setImportCsvText('');
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                  title="Đóng cửa sổ"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sample Templates & Guidelines Bar */}
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-gradient-to-r from-emerald-50/70 to-blue-50/60 p-3 rounded-xl border border-emerald-200 text-xs">
                <div>
                  <p className="font-bold text-[#064A87] flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tải tệp mẫu chuẩn của trường:</span>
                  </p>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    Bao gồm các cột: <strong>Mã HS, Họ và tên, Lớp, Giới tính, Ngày sinh, Số điện thoại, Điểm TB, Ghi chú</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadSampleExcel}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer text-xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Tải mẫu Excel (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSampleTemplate}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 shadow-xs transition-colors cursor-pointer text-xs"
                  >
                    <Download className="w-3 h-3 text-gray-500" />
                    <span>Mẫu CSV</span>
                  </button>
                </div>
              </div>

              {/* Import Method Tabs */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <button
                  type="button"
                  onClick={() => setImportTab('excel')}
                  className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    importTab === 'excel'
                      ? 'bg-[#0878D1] text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>1. Tải lên tệp Excel / CSV (Khuyên dùng)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImportTab('paste')}
                  className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    importTab === 'paste'
                      ? 'bg-[#0878D1] text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>2. Dán dữ liệu trực tiếp (Copy-Paste)</span>
                </button>
              </div>

              {/* Destination Class Selection Option */}
              <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#0878D1]" />
                  <span className="font-semibold text-gray-700">Lớp học nhận dữ liệu:</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={targetImportClassId}
                    onChange={(e) => handleTargetClassChange(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
                  >
                    <option value="auto">⚡ Tự động nhận diện theo cột "Lớp" trong file</option>
                    <optgroup label="Hoặc gán toàn bộ học sinh vào lớp cụ thể:">
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          Lớp {cls.name} (Khối {cls.grade} - Sĩ số: {cls.totalStudents} HS)
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Tab 1: File Upload */}
              {importTab === 'excel' && (
                <div className="mt-3 space-y-3">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      isDragOver
                        ? 'border-emerald-500 bg-emerald-50/70 scale-[0.99]'
                        : 'border-gray-300 hover:border-emerald-500 hover:bg-emerald-50/20 bg-gray-50/50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          Kéo và thả tệp Excel vào đây, hoặc <span className="text-[#0878D1] underline">Bấm để chọn tệp</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Hỗ trợ định dạng: <strong>.xlsx, .xls, .csv</strong> (từ SMAS, VnEdu hoặc Excel cá nhân)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded File Details Card */}
                  {uploadedFileName && (
                    <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2.5">
                        <FileCheck2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-bold text-emerald-900 truncate max-w-xs sm:max-w-md">
                            {uploadedFileName}
                          </p>
                          <p className="text-[11px] text-emerald-700">
                            Dung lượng: {uploadedFileSize} • Đã phân tích thành công
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {sheetNames.length > 1 && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-emerald-800 font-semibold text-[11px]">Chọn Sheet:</span>
                            <select
                              value={selectedSheet}
                              onChange={(e) => handleSheetChange(e.target.value)}
                              className="px-2 py-1 bg-white border border-emerald-300 rounded text-xs font-semibold text-emerald-900 focus:outline-none"
                            >
                              {sheetNames.map((sheet) => (
                                <option key={sheet} value={sheet}>
                                  {sheet}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs cursor-pointer"
                        >
                          Đổi tệp khác
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Paste Raw Data */}
              {importTab === 'paste' && (
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-gray-700">
                      Dán nội dung bảng tính / CSV tại đây:
                    </label>
                    <span className="text-gray-400 text-[11px]">Cách nhau bằng dấu phẩy hoặc tab</span>
                  </div>
                  <textarea
                    rows={6}
                    value={importCsvText}
                    onChange={(e) => handleParseCsv(e.target.value)}
                    placeholder="Mã HS, Họ và tên, Lớp, Giới tính, Số điện thoại, Điểm TB, Ghi chú&#10;HS1201, Vũ Đức Trí, 12A3, Nam, 0912345678, 8.2, Nắm chắc giải tích&#10;HS1202, Ngô Bảo Ngọc, 12A4, Nữ, 0923456789, 9.0, Đội tuyển HSG Toán&#10;HS1203, Hoàng Mai Anh, 12A12, Nữ, 0934567890, 7.5, Chăm chỉ"
                    className="w-full p-2.5 font-mono text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
                  />
                </div>
              )}

              {/* Warnings & Notices */}
              {importWarnings.length > 0 && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Lưu ý tự động xử lý ({importWarnings.length}):</span>
                  </div>
                  <div className="max-h-24 overflow-y-auto space-y-0.5 pl-5 text-[11px]">
                    {importWarnings.map((warn, i) => (
                      <p key={i}>• {warn}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors List */}
              {importErrors.length > 0 && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Lỗi cần kiểm tra:</span>
                  </div>
                  <div className="space-y-0.5 pl-5 text-[11px]">
                    {importErrors.map((err, i) => (
                      <p key={i}>• {err}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Table */}
              {importPreviewList.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">
                        Xem trước dữ liệu học sinh hợp lệ:
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                        {importPreviewList.length} học sinh
                      </span>
                    </div>
                    <span className="text-gray-500 text-[11px]">
                      Kiểm tra danh sách trước khi nhấn lưu
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-xl shadow-inner">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-gray-100 text-gray-700 font-bold sticky top-0 z-10">
                        <tr>
                          <th className="p-2 w-10 text-center">STT</th>
                          <th className="p-2">Mã HS</th>
                          <th className="p-2">Họ và tên</th>
                          <th className="p-2">Lớp</th>
                          <th className="p-2">Giới tính</th>
                          <th className="p-2">Ngày sinh</th>
                          <th className="p-2">Số điện thoại</th>
                          <th className="p-2 text-center">Điểm TB</th>
                          <th className="p-2">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {importPreviewList.map((st, i) => (
                          <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                            <td className="p-2 text-center text-gray-400 font-medium">{i + 1}</td>
                            <td className="p-2 font-semibold text-[#0878D1]">{st.code}</td>
                            <td className="p-2 font-bold text-gray-800">{st.name}</td>
                            <td className="p-2">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-[#0878D1]">
                                {st.className}
                              </span>
                            </td>
                            <td className="p-2">
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${
                                  st.gender === 'Nữ' ? 'bg-pink-100 text-pink-700' : 'bg-blue-50 text-blue-700'
                                }`}
                              >
                                {st.gender}
                              </span>
                            </td>
                            <td className="p-2 text-gray-600">{st.birthDate || '2008-01-01'}</td>
                            <td className="p-2 text-gray-600 font-mono text-[10px]">{st.phone || '—'}</td>
                            <td className="p-2 text-center font-bold text-emerald-700">{st.avgScore || 0}</td>
                            <td className="p-2 text-gray-500 truncate max-w-[140px]">{st.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-2">
              <div className="text-xs text-gray-500 hidden sm:block">
                {importPreviewList.length > 0 ? (
                  <span className="text-emerald-700 font-medium">
                    ✓ Đã sẵn sàng nạp <strong>{importPreviewList.length}</strong> học sinh vào cơ sở dữ liệu
                  </span>
                ) : (
                  <span>Hãy chọn file Excel hoặc dán dữ liệu để xem trước</span>
                )}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportStudentsOpen(false);
                    setUploadedFileName('');
                    setUploadedFileSize('');
                    setRawWorkbook(null);
                    setSheetNames([]);
                    setImportPreviewList([]);
                    setImportErrors([]);
                    setImportWarnings([]);
                    setImportCsvText('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={importPreviewList.length === 0}
                  onClick={() => {
                    importStudentsList(importPreviewList);
                    showFeedback(
                      `Đã nhập thành công ${importPreviewList.length} học sinh từ file Excel vào hệ thống!`
                    );
                    setIsImportStudentsOpen(false);
                    setUploadedFileName('');
                    setUploadedFileSize('');
                    setRawWorkbook(null);
                    setSheetNames([]);
                    setImportPreviewList([]);
                    setImportErrors([]);
                    setImportWarnings([]);
                    setImportCsvText('');
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5 text-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Xác nhận nhập {importPreviewList.length} học sinh</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
