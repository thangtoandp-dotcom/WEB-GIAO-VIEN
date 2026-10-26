import React, { useState, useMemo, useRef } from 'react';
import {
  TrendingUp,
  Search,
  Filter,
  Download,
  Upload,
  Save,
  RotateCcw,
  History,
  CheckCircle2,
  AlertCircle,
  X,
  FileSpreadsheet,
  Zap,
  Award,
  Layers,
  BookOpen,
  Calculator,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GradeRecord, GradeChangeLog } from '../types';

export const GradebookView: React.FC = () => {
  const {
    gradeRecords,
    classes,
    students,
    updateGrade,
    updateGradesBatch,
    updateTeacherRemarks,
    selectedSchoolYear,
    selectedSemester,
    setSelectedSemester,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'avg_desc' | 'avg_asc' | 'code'>('name');
  const [rankingStandard, setRankingStandard] = useState<'traditional' | 'tt22'>('traditional');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // History popup state
  const [selectedHistory, setSelectedHistory] = useState<{
    studentName: string;
    studentCode: string;
    className: string;
    logs: GradeChangeLog[];
  } | null>(null);

  // Fast Batch Entry Modal state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchClass, setBatchClass] = useState<string>(classes[0]?.name || '10A1');
  const [batchField, setBatchField] = useState<'tx1' | 'tx2' | 'tx3' | 'tx4' | 'gk' | 'ck'>('tx1');
  const [batchScores, setBatchScores] = useState<Record<string, string>>({});

  // Import Modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Grid navigation refs: cell key format `${studentId}_${field}`
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const fieldsOrder: ('tx1' | 'tx2' | 'tx3' | 'tx4' | 'gk' | 'ck')[] = [
    'tx1',
    'tx2',
    'tx3',
    'tx4',
    'gk',
    'ck',
  ];

  const fieldLabels: Record<'tx1' | 'tx2' | 'tx3' | 'tx4' | 'gk' | 'ck', string> = {
    tx1: 'TX1 (HS1)',
    tx2: 'TX2 (HS1)',
    tx3: 'TX3 (HS1)',
    tx4: 'TX4 (HS1)',
    gk: 'Giữa kỳ (HS2)',
    ck: 'Cuối kỳ (HS3)',
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Filtered & sorted records
  const processedRecords = useMemo(() => {
    let list = gradeRecords.filter((rec) => {
      const matchSearch =
        rec.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.studentCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchClass = selectedClassId === 'all' || rec.className === selectedClassId;
      return matchSearch && matchClass;
    });

    if (sortBy === 'name') {
      list = [...list].sort((a, b) => a.studentName.localeCompare(b.studentName, 'vi'));
    } else if (sortBy === 'avg_desc') {
      list = [...list].sort((a, b) => b.avgScore - a.avgScore);
    } else if (sortBy === 'avg_asc') {
      list = [...list].sort((a, b) => a.avgScore - b.avgScore);
    } else if (sortBy === 'code') {
      list = [...list].sort((a, b) => a.studentCode.localeCompare(b.studentCode));
    }

    return list;
  }, [gradeRecords, searchQuery, selectedClassId, sortBy]);

  // Stats for the active class selection
  const classStats = useMemo(() => {
    const list = processedRecords;
    const total = list.length;
    if (total === 0) {
      return { total: 0, avg: 0, good: 0, fair: 0, avgCount: 0, weak: 0, completedAll: 0 };
    }

    let sum = 0;
    let good = 0;
    let fair = 0;
    let avgCount = 0;
    let weak = 0;
    let completedAll = 0;

    list.forEach((r) => {
      sum += r.avgScore;
      if (r.avgScore >= 8.0) good++;
      else if (r.avgScore >= 6.5) fair++;
      else if (r.avgScore >= 5.0) avgCount++;
      else weak++;

      if (
        r.tx1 !== undefined &&
        r.tx2 !== undefined &&
        r.tx3 !== undefined &&
        r.tx4 !== undefined &&
        r.gk !== undefined &&
        r.ck !== undefined
      ) {
        completedAll++;
      }
    });

    return {
      total,
      avg: Number((sum / total).toFixed(1)),
      good,
      fair,
      avgCount,
      weak,
      completedAll,
    };
  }, [processedRecords]);

  // Handle cell blur / edit
  const handleCellBlur = (
    studentId: string,
    field: 'tx1' | 'tx2' | 'tx3' | 'tx4' | 'gk' | 'ck',
    currentVal: number | undefined,
    inputValStr: string
  ) => {
    const trimmed = inputValStr.trim();
    if (trimmed === '') {
      return;
    }
    const parsed = parseFloat(trimmed.replace(',', '.'));
    if (isNaN(parsed)) {
      alert('Vui lòng nhập một con số hợp lệ từ 0,0 đến 10,0!');
      return;
    }
    if (parsed < 0 || parsed > 10) {
      alert('Điểm số phải nằm trong khoảng từ 0,0 đến 10,0!');
      return;
    }
    const rounded = Math.round(parsed * 10) / 10;
    if (currentVal !== rounded) {
      updateGrade(studentId, field, rounded, `Nhập điểm môn Toán: ${fieldLabels[field]}`);
      showToast('Đã lưu điểm thành công!');
    }
  };

  // Keyboard navigation across cells
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    fieldIndex: number,
    studentId: string,
    field: 'tx1' | 'tx2' | 'tx3' | 'tx4' | 'gk' | 'ck'
  ) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      // Move down to next student in same column
      const nextRow = processedRecords[rowIndex + 1];
      if (nextRow) {
        const nextInput = inputRefs.current[`${nextRow.studentId}_${field}`];
        nextInput?.focus();
        nextInput?.select();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Move up to previous student in same column
      const prevRow = processedRecords[rowIndex - 1];
      if (prevRow) {
        const prevInput = inputRefs.current[`${prevRow.studentId}_${field}`];
        prevInput?.focus();
        prevInput?.select();
      }
    } else if (e.key === 'ArrowRight' && (e.currentTarget.selectionStart === e.currentTarget.value.length || e.currentTarget.value === '')) {
      // Move right to next column
      const nextField = fieldsOrder[fieldIndex + 1];
      if (nextField) {
        e.preventDefault();
        const nextInput = inputRefs.current[`${studentId}_${nextField}`];
        nextInput?.focus();
        nextInput?.select();
      }
    } else if (e.key === 'ArrowLeft' && e.currentTarget.selectionStart === 0) {
      // Move left to previous column
      const prevField = fieldsOrder[fieldIndex - 1];
      if (prevField) {
        e.preventDefault();
        const prevInput = inputRefs.current[`${studentId}_${prevField}`];
        prevInput?.focus();
        prevInput?.select();
      }
    }
  };

  // Open fast batch entry
  const handleOpenBatchModal = () => {
    const targetClass = selectedClassId !== 'all' ? selectedClassId : classes[0]?.name || '10A1';
    setBatchClass(targetClass);
    setBatchField('tx1');
    // Pre-populate with current scores for this class & field
    const classRecords = gradeRecords.filter((g) => g.className === targetClass);
    const initialMap: Record<string, string> = {};
    classRecords.forEach((r) => {
      initialMap[r.studentId] = r.tx1 !== undefined ? String(r.tx1) : '';
    });
    setBatchScores(initialMap);
    setIsBatchModalOpen(true);
  };

  // When class or field changes in batch modal, reload current scores
  const handleBatchClassOrFieldChange = (newClass: string, newField: 'tx1' | 'tx2' | 'tx3' | 'tx4' | 'gk' | 'ck') => {
    setBatchClass(newClass);
    setBatchField(newField);
    const classRecords = gradeRecords.filter((g) => g.className === newClass);
    const initialMap: Record<string, string> = {};
    classRecords.forEach((r) => {
      const val = r[newField];
      initialMap[r.studentId] = val !== undefined ? String(val) : '';
    });
    setBatchScores(initialMap);
  };

  // Save batch entry
  const handleSaveBatch = () => {
    const classRecords = gradeRecords.filter((g) => g.className === batchClass);
    const updates: {
      studentId: string;
      field: 'tx1' | 'tx2' | 'tx3' | 'tx4' | 'gk' | 'ck';
      newVal: number;
    }[] = [];

    for (const r of classRecords) {
      const valStr = (batchScores[r.studentId] || '').trim().replace(',', '.');
      if (valStr !== '') {
        const parsed = parseFloat(valStr);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 10) {
          const rounded = Math.round(parsed * 10) / 10;
          updates.push({
            studentId: r.studentId,
            field: batchField,
            newVal: rounded,
          });
        }
      }
    }

    if (updates.length > 0) {
      updateGradesBatch(updates, `Nhập điểm hàng loạt lớp ${batchClass} cột ${fieldLabels[batchField]}`);
      showToast(`Đã lưu ${updates.length} con điểm cho lớp ${batchClass}!`);
      setIsBatchModalOpen(false);
    } else {
      alert('Chưa có con điểm hợp lệ nào được nhập để lưu!');
    }
  };

  // Export to Excel with UTF-8 BOM
  const handleExportExcel = () => {
    const headers = [
      'STT',
      'Mã học sinh',
      'Họ và tên học sinh',
      'Lớp',
      'TX1 (HS1)',
      'TX2 (HS1)',
      'TX3 (HS1)',
      'TX4 (HS1)',
      'Giữa kỳ (HS2)',
      'Cuối kỳ (HS3)',
      'Điểm tổng kết (ĐTB Môn)',
      'Xếp loại học lực',
      'Nhận xét của giáo viên',
    ];

    const rows = processedRecords.map((r, i) => [
      i + 1,
      r.studentCode,
      `"${r.studentName}"`,
      r.className,
      r.tx1 ?? '',
      r.tx2 ?? '',
      r.tx3 ?? '',
      r.tx4 ?? '',
      r.gk ?? '',
      r.ck ?? '',
      r.avgScore.toFixed(1),
      rankingStandard === 'tt22'
        ? r.avgScore >= 8.0
          ? 'Tốt'
          : r.avgScore >= 6.5
          ? 'Khá'
          : r.avgScore >= 5.0
          ? 'Đạt'
          : 'Chưa đạt'
        : r.rank,
      `"${(r.teacherRemarks || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const classTag = selectedClassId === 'all' ? 'ToanBoCacLop' : `Lop_${selectedClassId}`;
    link.download = `BangDiem_ToanHoc_${classTag}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Đã xuất file bảng điểm thành công!');
  };

  // Download Sample Template for import
  const handleDownloadTemplate = () => {
    const headers = [
      'Mã học sinh',
      'Họ và tên',
      'Lớp',
      'TX1',
      'TX2',
      'TX3',
      'TX4',
      'Giữa kỳ',
      'Cuối kỳ',
      'Nhận xét',
    ];
    const sampleRows = processedRecords.slice(0, 5).map((r) => [
      r.studentCode,
      `"${r.studentName}"`,
      r.className,
      r.tx1 ?? '8.0',
      r.tx2 ?? '7.5',
      r.tx3 ?? '8.5',
      r.tx4 ?? '8.0',
      r.gk ?? '8.0',
      r.ck ?? '8.5',
      `"${r.teacherRemarks || 'Chăm ngoan, tiến bộ tốt'}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Mau_NhapDiem_Toan_ThayThang.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          alert('File không có dữ liệu để nhập!');
          return;
        }

        const updates: {
          studentId: string;
          field: 'tx1' | 'tx2' | 'tx3' | 'tx4' | 'gk' | 'ck';
          newVal: number;
        }[] = [];

        // Parse rows (detect by student code or student name)
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
          if (cols.length < 3) continue;

          const code = cols[0];
          const name = cols[1];
          const studentRec = gradeRecords.find(
            (g) =>
              (code && g.studentCode.toLowerCase() === code.toLowerCase()) ||
              (name && g.studentName.toLowerCase() === name.toLowerCase())
          );

          if (!studentRec) continue;

          // cols[3]=tx1, cols[4]=tx2, cols[5]=tx3, cols[6]=tx4, cols[7]=gk, cols[8]=ck
          const tx1 = parseFloat(cols[3]);
          const tx2 = parseFloat(cols[4]);
          const tx3 = parseFloat(cols[5]);
          const tx4 = parseFloat(cols[6]);
          const gk = parseFloat(cols[7]);
          const ck = parseFloat(cols[8]);

          if (!isNaN(tx1) && tx1 >= 0 && tx1 <= 10) updates.push({ studentId: studentRec.studentId, field: 'tx1', newVal: Math.round(tx1 * 10) / 10 });
          if (!isNaN(tx2) && tx2 >= 0 && tx2 <= 10) updates.push({ studentId: studentRec.studentId, field: 'tx2', newVal: Math.round(tx2 * 10) / 10 });
          if (!isNaN(tx3) && tx3 >= 0 && tx3 <= 10) updates.push({ studentId: studentRec.studentId, field: 'tx3', newVal: Math.round(tx3 * 10) / 10 });
          if (!isNaN(tx4) && tx4 >= 0 && tx4 <= 10) updates.push({ studentId: studentRec.studentId, field: 'tx4', newVal: Math.round(tx4 * 10) / 10 });
          if (!isNaN(gk) && gk >= 0 && gk <= 10) updates.push({ studentId: studentRec.studentId, field: 'gk', newVal: Math.round(gk * 10) / 10 });
          if (!isNaN(ck) && ck >= 0 && ck <= 10) updates.push({ studentId: studentRec.studentId, field: 'ck', newVal: Math.round(ck * 10) / 10 });

          // Remarks in col[9]
          if (cols[9]) {
            updateTeacherRemarks(studentRec.studentId, cols[9]);
          }
        }

        if (updates.length > 0) {
          updateGradesBatch(updates, 'Nhập điểm hàng loạt từ file Excel/CSV');
          showToast(`Nhập thành công ${updates.length} điểm số từ file!`);
          setIsImportModalOpen(false);
        } else {
          alert('Không tìm thấy học sinh trùng khớp hoặc điểm số không hợp lệ trong file!');
        }
      } catch (err: any) {
        alert('Có lỗi xảy ra khi đọc file CSV: ' + err.message);
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  // Convert rank according to chosen standard
  const displayRank = (score: number, defaultRank: string) => {
    if (rankingStandard === 'tt22') {
      if (score >= 8.0) return 'Tốt';
      if (score >= 6.5) return 'Khá';
      if (score >= 5.0) return 'Đạt';
      return 'Chưa đạt';
    }
    return defaultRank;
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 lg:p-5 rounded-xl border border-blue-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#EAF5FF] text-[#0878D1] flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#064A87] leading-tight">
                Sổ điểm điện tử môn Toán THPT
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Nhập điểm các lớp riêng biệt · Chuẩn Thông tư 22/BGDĐT · 4 TX (HS1), 1 Giữa kỳ (HS2), 1 Cuối kỳ (HS3)
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Batch Entry */}
          <button
            onClick={handleOpenBatchModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-[#0878D1] text-white hover:bg-[#0662ab] transition-colors shadow-xs"
            title="Nhập nhanh điểm của cả lớp cho 1 cột bài kiểm tra"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Nhập điểm theo đợt</span>
          </button>

          {/* Import CSV */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-50 text-[#0878D1] hover:bg-blue-100 border border-blue-200 transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập file Excel/CSV</span>
          </button>

          {/* Export Excel */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất bảng điểm Excel</span>
          </button>
        </div>
      </div>

      {/* Dải chọn Lớp riêng biệt (Class Tabs Bar) */}
      <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
            <Layers className="w-4 h-4 text-[#0878D1]" />
            <span>CHỌN LỚP HỌC ĐỂ NHẬP ĐIỂM:</span>
          </div>
          <span className="text-[11px] text-gray-500">
            Đang hiển thị: <strong className="text-[#0878D1]">{selectedClassId === 'all' ? 'Toàn bộ các lớp' : `Lớp ${selectedClassId}`}</strong> ({classStats.total} học sinh)
          </span>
        </div>

        {/* Horizontal Scrollable Class Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedClassId('all')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              selectedClassId === 'all'
                ? 'bg-[#064A87] text-white shadow-sm font-bold'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>Tất cả các lớp</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedClassId === 'all' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {gradeRecords.length}
            </span>
          </button>

          {classes.map((cls) => {
            const count = gradeRecords.filter((g) => g.className === cls.name).length;
            const isSelected = selectedClassId === cls.name;
            return (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.name)}
                className={`px-3.5 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#0878D1] text-white shadow-sm font-bold'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-100'
                }`}
              >
                <span>Lớp {cls.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-blue-200/60 text-blue-900'}`}>
                  {count} HS
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Class Overview Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
          <div className="text-[11px] text-gray-500">Sĩ số xem điểm</div>
          <div className="text-lg font-bold text-gray-800 mt-0.5">{classStats.total} <span className="text-xs font-normal text-gray-400">học sinh</span></div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
          <div className="text-[11px] text-gray-500">ĐTB Toán cả lớp</div>
          <div className="text-lg font-bold text-[#064A87] mt-0.5 flex items-center gap-1">
            <span>{classStats.avg > 0 ? classStats.avg.toFixed(1) : '-'}</span>
            <span className="text-[10px] font-normal text-gray-400">/ 10</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
          <div className="text-[11px] text-emerald-700 font-medium">Học lực Giỏi / Tốt (≥ 8.0)</div>
          <div className="text-lg font-bold text-emerald-600 mt-0.5">
            {classStats.good}{' '}
            <span className="text-xs font-normal text-gray-400">
              ({classStats.total > 0 ? Math.round((classStats.good / classStats.total) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
          <div className="text-[11px] text-blue-700 font-medium">Học lực Khá (6.5 - 7.9)</div>
          <div className="text-lg font-bold text-blue-600 mt-0.5">
            {classStats.fair}{' '}
            <span className="text-xs font-normal text-gray-400">
              ({classStats.total > 0 ? Math.round((classStats.fair / classStats.total) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-sm">
          <div className="text-[11px] text-amber-700 font-medium">Trung bình (5.0 - 6.4)</div>
          <div className="text-lg font-bold text-amber-600 mt-0.5">
            {classStats.avgCount}{' '}
            <span className="text-xs font-normal text-gray-400">
              ({classStats.total > 0 ? Math.round((classStats.avgCount / classStats.total) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm">
          <div className="text-[11px] text-purple-700 font-medium">Đã đủ 6 con điểm</div>
          <div className="text-lg font-bold text-purple-600 mt-0.5">
            {classStats.completedAll} / {classStats.total}
          </div>
        </div>
      </div>

      {/* Filter and Search Row */}
      <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh hoặc mã HS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
          />
        </div>

        {/* Semester Selection */}
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
        >
          <option value="Học kỳ 1">Học kỳ 1 (2026-2027)</option>
          <option value="Học kỳ 2">Học kỳ 2 (2026-2027)</option>
          <option value="Cả năm">Cả năm học (2026-2027)</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
        >
          <option value="name">Sắp xếp: Họ và tên (A - Z)</option>
          <option value="code">Sắp xếp: Mã học sinh (Tăng dần)</option>
          <option value="avg_desc">Điểm TB môn (Cao xuống thấp)</option>
          <option value="avg_asc">Điểm TB môn (Thấp lên cao)</option>
        </select>

        {/* Ranking Display standard */}
        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
          <Award className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          <span className="text-[11px] text-gray-600 shrink-0">Chuẩn xếp loại:</span>
          <select
            value={rankingStandard}
            onChange={(e) => setRankingStandard(e.target.value as any)}
            className="text-xs bg-transparent text-gray-800 font-semibold focus:outline-none cursor-pointer w-full"
          >
            <option value="traditional">Giỏi / Khá / TB / Yếu</option>
            <option value="tt22">TT22: Tốt / Khá / Đạt / Chưa đạt</option>
          </select>
        </div>
      </div>

      {/* Grade Table */}
      <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-4 space-y-3">
        {/* Formula Explanatory Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 bg-[#EAF5FF] rounded-lg border border-blue-200 text-xs">
          <div className="flex items-center gap-2 text-[#064A87]">
            <Calculator className="w-4 h-4 text-[#0878D1] shrink-0" />
            <div>
              <span className="font-bold">Công thức tính điểm tổng kết môn Toán (Chuẩn Thông tư 22):</span>{' '}
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-blue-300 text-blue-900 font-semibold">
                ĐTB = (TX1 + TX2 + TX3 + TX4 + GK×2 + CK×3) / 9
              </span>
            </div>
          </div>
          <div className="text-[11px] text-gray-600 italic">
            * Nhập trực tiếp vào ô · Bấm <kbd className="px-1 py-0.5 bg-white border rounded text-[10px] font-mono">Enter</kbd> hoặc <kbd className="px-1 py-0.5 bg-white border rounded text-[10px] font-mono">↓</kbd> để xuống dòng học sinh tiếp theo.
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#EAF5FF] text-[#064A87] font-bold border-b border-blue-200 select-none">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center border-r border-blue-100">STT</th>
                <th className="py-2.5 px-3 w-20 text-center border-r border-blue-100">Mã HS</th>
                <th className="py-2.5 px-3 min-w-[140px] border-r border-blue-100">Họ và tên</th>
                <th className="py-2.5 px-2 w-16 text-center border-r border-blue-100">Lớp</th>

                {/* 4 Cột Thường Xuyên (HS1) */}
                <th className="py-2.5 px-1 w-16 text-center bg-blue-100/60 border-r border-blue-200 text-[#064A87]" title="Đánh giá thường xuyên 1 (Hệ số 1)">
                  TX1
                  <div className="text-[10px] font-normal text-gray-500">HS1</div>
                </th>
                <th className="py-2.5 px-1 w-16 text-center bg-blue-100/60 border-r border-blue-200 text-[#064A87]" title="Đánh giá thường xuyên 2 (Hệ số 1)">
                  TX2
                  <div className="text-[10px] font-normal text-gray-500">HS1</div>
                </th>
                <th className="py-2.5 px-1 w-16 text-center bg-blue-100/60 border-r border-blue-200 text-[#064A87]" title="Đánh giá thường xuyên 3 (Hệ số 1)">
                  TX3
                  <div className="text-[10px] font-normal text-gray-500">HS1</div>
                </th>
                <th className="py-2.5 px-1 w-16 text-center bg-blue-100/60 border-r border-blue-200 text-[#064A87]" title="Đánh giá thường xuyên 4 (Hệ số 1)">
                  TX4
                  <div className="text-[10px] font-normal text-gray-500">HS1</div>
                </th>

                {/* Giữa kỳ (HS2) */}
                <th className="py-2.5 px-1 w-20 text-center bg-purple-100/60 border-r border-purple-200 text-purple-900" title="Kiểm tra Giữa kỳ (Hệ số 2)">
                  Giữa kỳ
                  <div className="text-[10px] font-normal text-purple-700">HS2</div>
                </th>

                {/* Cuối kỳ (HS3) */}
                <th className="py-2.5 px-1 w-20 text-center bg-amber-100/60 border-r border-amber-200 text-amber-900" title="Kiểm tra Cuối kỳ (Hệ số 3)">
                  Cuối kỳ
                  <div className="text-[10px] font-normal text-amber-700">HS3</div>
                </th>

                {/* Điểm tổng kết */}
                <th className="py-2.5 px-2 w-24 text-center bg-blue-200/60 border-r border-blue-300 text-[#064A87]" title="Điểm trung bình môn = (TX1+TX2+TX3+TX4+GK*2+CK*3)/9">
                  ĐTB Môn
                  <div className="text-[10px] font-normal text-blue-700">Tổng kết</div>
                </th>

                {/* Xếp loại */}
                <th className="py-2.5 px-2 w-24 text-center border-r border-blue-100">Xếp loại</th>

                {/* Nhận xét */}
                <th className="py-2.5 px-3 min-w-[160px] border-r border-blue-100">Nhận xét của Thầy Thắng</th>

                {/* Lịch sử */}
                <th className="py-2.5 px-2 w-12 text-center" title="Nhật ký chỉnh sửa">Lịch sử</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {processedRecords.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-gray-400">
                    Không tìm thấy học sinh nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                processedRecords.map((r, rowIndex) => {
                  const isComplete =
                    r.tx1 !== undefined &&
                    r.tx2 !== undefined &&
                    r.tx3 !== undefined &&
                    r.tx4 !== undefined &&
                    r.gk !== undefined &&
                    r.ck !== undefined;

                  const enteredCount = [r.tx1, r.tx2, r.tx3, r.tx4, r.gk, r.ck].filter((v) => v !== undefined).length;

                  return (
                    <tr key={r.studentId} className="hover:bg-blue-50/40 transition-colors">
                      {/* STT */}
                      <td className="py-2 px-3 text-center text-gray-500 font-medium border-r border-gray-100">
                        {rowIndex + 1}
                      </td>

                      {/* Mã HS */}
                      <td className="py-2 px-3 text-center font-mono font-semibold text-[#0878D1] border-r border-gray-100">
                        {r.studentCode}
                      </td>

                      {/* Họ và tên */}
                      <td className="py-2 px-3 font-semibold text-gray-800 border-r border-gray-100 whitespace-nowrap">
                        {r.studentName}
                      </td>

                      {/* Lớp */}
                      <td className="py-2 px-2 text-center text-gray-600 border-r border-gray-100">
                        {r.className}
                      </td>

                      {/* TX1 */}
                      <td className="p-1 text-center border-r border-gray-100 bg-blue-50/20">
                        <input
                          ref={(el) => { inputRefs.current[`${r.studentId}_tx1`] = el; }}
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          defaultValue={r.tx1 !== undefined ? r.tx1 : ''}
                          onBlur={(e) => handleCellBlur(r.studentId, 'tx1', r.tx1, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, 0, r.studentId, 'tx1')}
                          placeholder="-"
                          className="w-12 py-1 px-0.5 text-center font-bold text-gray-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-gray-300 focus:border-[#0878D1] focus:ring-1 focus:ring-[#0878D1] rounded focus:outline-none transition-all"
                        />
                      </td>

                      {/* TX2 */}
                      <td className="p-1 text-center border-r border-gray-100 bg-blue-50/20">
                        <input
                          ref={(el) => { inputRefs.current[`${r.studentId}_tx2`] = el; }}
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          defaultValue={r.tx2 !== undefined ? r.tx2 : ''}
                          onBlur={(e) => handleCellBlur(r.studentId, 'tx2', r.tx2, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, 1, r.studentId, 'tx2')}
                          placeholder="-"
                          className="w-12 py-1 px-0.5 text-center font-bold text-gray-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-gray-300 focus:border-[#0878D1] focus:ring-1 focus:ring-[#0878D1] rounded focus:outline-none transition-all"
                        />
                      </td>

                      {/* TX3 */}
                      <td className="p-1 text-center border-r border-gray-100 bg-blue-50/20">
                        <input
                          ref={(el) => { inputRefs.current[`${r.studentId}_tx3`] = el; }}
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          defaultValue={r.tx3 !== undefined ? r.tx3 : ''}
                          onBlur={(e) => handleCellBlur(r.studentId, 'tx3', r.tx3, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, 2, r.studentId, 'tx3')}
                          placeholder="-"
                          className="w-12 py-1 px-0.5 text-center font-bold text-gray-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-gray-300 focus:border-[#0878D1] focus:ring-1 focus:ring-[#0878D1] rounded focus:outline-none transition-all"
                        />
                      </td>

                      {/* TX4 (MỚI) */}
                      <td className="p-1 text-center border-r border-gray-100 bg-blue-50/20">
                        <input
                          ref={(el) => { inputRefs.current[`${r.studentId}_tx4`] = el; }}
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          defaultValue={r.tx4 !== undefined ? r.tx4 : ''}
                          onBlur={(e) => handleCellBlur(r.studentId, 'tx4', r.tx4, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, 3, r.studentId, 'tx4')}
                          placeholder="-"
                          className="w-12 py-1 px-0.5 text-center font-bold text-gray-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-gray-300 focus:border-[#0878D1] focus:ring-1 focus:ring-[#0878D1] rounded focus:outline-none transition-all"
                        />
                      </td>

                      {/* GK (HS2) */}
                      <td className="p-1 text-center border-r border-gray-100 bg-purple-50/30">
                        <input
                          ref={(el) => { inputRefs.current[`${r.studentId}_gk`] = el; }}
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          defaultValue={r.gk !== undefined ? r.gk : ''}
                          onBlur={(e) => handleCellBlur(r.studentId, 'gk', r.gk, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, 4, r.studentId, 'gk')}
                          placeholder="-"
                          className="w-12 py-1 px-0.5 text-center font-bold text-purple-900 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-purple-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded focus:outline-none transition-all"
                        />
                      </td>

                      {/* CK (HS3) */}
                      <td className="p-1 text-center border-r border-gray-100 bg-amber-50/30">
                        <input
                          ref={(el) => { inputRefs.current[`${r.studentId}_ck`] = el; }}
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          defaultValue={r.ck !== undefined ? r.ck : ''}
                          onBlur={(e) => handleCellBlur(r.studentId, 'ck', r.ck, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, 5, r.studentId, 'ck')}
                          placeholder="-"
                          className="w-12 py-1 px-0.5 text-center font-bold text-amber-900 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-amber-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 rounded focus:outline-none transition-all"
                        />
                      </td>

                      {/* ĐTB MÔN (TỰ ĐỘNG TÍNH TOÁN) */}
                      <td className="py-2 px-2 text-center border-r border-gray-100 bg-blue-50/40">
                        <div className="font-bold text-base text-[#064A87]">
                          {r.avgScore > 0 ? r.avgScore.toFixed(1) : '-'}
                        </div>
                        <div className="text-[9px] text-gray-400">
                          {isComplete ? 'Đủ 6 điểm' : `${enteredCount}/6 điểm`}
                        </div>
                      </td>

                      {/* XẾP LOẠI */}
                      <td className="py-2 px-2 text-center border-r border-gray-100">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            r.avgScore >= 8.0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : r.avgScore >= 6.5
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : r.avgScore >= 5.0
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {displayRank(r.avgScore, r.rank)}
                        </span>
                      </td>

                      {/* NHẬN XÉT CỦA THẦY */}
                      <td className="py-1 px-2 border-r border-gray-100">
                        <input
                          type="text"
                          defaultValue={r.teacherRemarks || ''}
                          onBlur={(e) => {
                            if (e.target.value !== (r.teacherRemarks || '')) {
                              updateTeacherRemarks(r.studentId, e.target.value);
                              showToast('Đã lưu nhận xét!');
                            }
                          }}
                          placeholder="Thêm nhận xét..."
                          className="w-full text-xs text-gray-700 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-gray-300 focus:border-[#0878D1] rounded px-1.5 py-1 focus:outline-none"
                        />
                      </td>

                      {/* AUDIT LOG BUTTON */}
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() =>
                            setSelectedHistory({
                              studentName: r.studentName,
                              studentCode: r.studentCode,
                              className: r.className,
                              logs: r.history || [],
                            })
                          }
                          className="p-1 rounded text-gray-400 hover:text-[#0878D1] hover:bg-blue-50 transition-colors"
                          title="Xem lịch sử sửa điểm"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: NHẬP ĐIỂM THEO ĐỢT (FAST BATCH ENTRY) */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-blue-100 max-h-[90vh] flex flex-col animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0878D1] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#064A87]">
                    Nhập điểm nhanh theo đợt kiểm tra
                  </h3>
                  <p className="text-xs text-gray-500">
                    Nhập liên tục một cột điểm cho toàn bộ học sinh trong lớp
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-2 gap-3 py-3 bg-[#EAF5FF] p-3 rounded-xl border border-blue-100 my-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  1. Chọn Lớp học:
                </label>
                <select
                  value={batchClass}
                  onChange={(e) => handleBatchClassOrFieldChange(e.target.value, batchField)}
                  className="w-full text-xs p-2 border border-blue-200 rounded-lg bg-white font-semibold text-[#064A87] focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      Lớp {c.name} ({gradeRecords.filter((g) => g.className === c.name).length} HS)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  2. Chọn Cột điểm cần nhập:
                </label>
                <select
                  value={batchField}
                  onChange={(e) => handleBatchClassOrFieldChange(batchClass, e.target.value as any)}
                  className="w-full text-xs p-2 border border-blue-200 rounded-lg bg-white font-semibold text-[#064A87] focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
                >
                  <option value="tx1">TX1 - Kiểm tra thường xuyên 1 (HS1)</option>
                  <option value="tx2">TX2 - Kiểm tra thường xuyên 2 (HS1)</option>
                  <option value="tx3">TX3 - Kiểm tra thường xuyên 3 (HS1)</option>
                  <option value="tx4">TX4 - Kiểm tra thường xuyên 4 (HS1)</option>
                  <option value="gk">Giữa kỳ - Đánh giá giữa kỳ (HS2)</option>
                  <option value="ck">Cuối kỳ - Đánh giá cuối kỳ (HS3)</option>
                </select>
              </div>
            </div>

            {/* Student List with inputs */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 text-xs max-h-[380px]">
              <div className="text-[11px] text-gray-500 italic pb-1">
                * Thầy chỉ việc gõ số điểm và ấn phím Enter để tự động nhảy xuống học sinh tiếp theo.
              </div>

              {gradeRecords
                .filter((g) => g.className === batchClass)
                .map((st, idx) => (
                  <div
                    key={st.studentId}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50/50 border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center text-gray-400 font-medium">{idx + 1}</span>
                      <span className="font-mono text-[#0878D1] font-semibold w-16">{st.studentCode}</span>
                      <span className="font-bold text-gray-800">{st.studentName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        id={`batch_input_${idx}`}
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={batchScores[st.studentId] ?? ''}
                        onChange={(e) =>
                          setBatchScores((prev) => ({
                            ...prev,
                            [st.studentId]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const nextEl = document.getElementById(`batch_input_${idx + 1}`) as HTMLInputElement;
                            if (nextEl) {
                              nextEl.focus();
                              nextEl.select();
                            }
                          }
                        }}
                        placeholder="Điểm..."
                        className="w-20 px-2 py-1.5 text-center font-bold text-gray-800 bg-white border border-gray-300 rounded-lg focus:border-[#0878D1] focus:ring-2 focus:ring-[#0878D1] focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Lớp <strong className="text-gray-800">{batchClass}</strong> · Cột <strong className="text-[#0878D1]">{fieldLabels[batchField]}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSaveBatch}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0878D1] hover:bg-[#0662ab] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Áp dụng & Lưu điểm</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: NHẬP ĐIỂM TỪ FILE EXCEL/CSV */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-blue-100 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-[#064A87]">
                  Nhập bảng điểm từ file Excel / CSV
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-600">
              <p>
                Thầy có thể tải file bảng điểm mẫu chuẩn Thông tư 22 về, điền điểm rồi tải lại lên hệ thống để cập nhật điểm hàng loạt:
              </p>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-800">File mẫu chuẩn (Có đủ TX1, TX2, TX3, TX4, GK, CK)</div>
                  <div className="text-[11px] text-emerald-600">Định dạng file CSV UTF-8 mở được ngay bằng Excel</div>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải mẫu</span>
                </button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#0878D1] transition-colors cursor-pointer bg-gray-50/50"
                   onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-semibold text-gray-700">Bấm vào đây để chọn file bảng điểm (.csv)</p>
                <p className="text-[11px] text-gray-400 mt-1">Hệ thống sẽ tự nhận diện theo Mã học sinh hoặc Họ tên để cập nhật điểm</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv, text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: NHẬT KÝ CHỈNH SỬA ĐIỂM (AUDIT LOG) */}
      {selectedHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-blue-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-[#064A87]">
                  Nhật ký chỉnh sửa điểm
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedHistory.studentName} ({selectedHistory.studentCode}) - Lớp {selectedHistory.className}
                </p>
              </div>
              <button
                onClick={() => setSelectedHistory(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-2.5 max-h-72 overflow-y-auto text-xs">
              {selectedHistory.logs.length === 0 ? (
                <p className="text-center text-gray-400 py-6">
                  Chưa có lịch sử điều chỉnh điểm cho học sinh này.
                </p>
              ) : (
                selectedHistory.logs.map((log, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                    <div className="flex items-center justify-between font-semibold text-gray-700">
                      <span>Cột điểm: <strong className="text-[#0878D1]">{log.field.toUpperCase()}</strong></span>
                      <span className="text-[10px] text-gray-400 font-mono">{log.timestamp}</span>
                    </div>
                    <p className="text-gray-600">
                      Điểm cũ: <span className="font-bold text-red-500">{log.oldVal}</span> → Điểm mới:{' '}
                      <span className="font-bold text-emerald-600">{log.newVal}</span>
                    </p>
                    <p className="text-[11px] text-gray-500">Người cập nhật: {log.changedBy}</p>
                    {log.reason && <p className="text-[11px] text-gray-400 italic">Lý do: {log.reason}</p>}
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedHistory(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg"
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
