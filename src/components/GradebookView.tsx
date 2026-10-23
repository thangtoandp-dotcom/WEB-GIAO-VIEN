import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Search,
  Filter,
  Download,
  Save,
  RotateCcw,
  History,
  CheckCircle,
  AlertCircle,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GradeRecord, GradeChangeLog } from '../types';

export const GradebookView: React.FC = () => {
  const {
    gradeRecords,
    classes,
    updateGrade,
    selectedSchoolYear,
    selectedSemester,
    setSelectedSemester,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'avg_desc' | 'avg_asc'>('name');

  // History popup state
  const [selectedHistory, setSelectedHistory] = useState<{
    studentName: string;
    logs: GradeChangeLog[];
  } | null>(null);

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
    }

    return list;
  }, [gradeRecords, searchQuery, selectedClassId, sortBy]);

  // Handle live inline edit
  const handleCellBlur = (
    studentId: string,
    field: 'tx1' | 'tx2' | 'tx3' | 'gk' | 'ck',
    currentVal: number | undefined,
    inputValStr: string
  ) => {
    const parsed = parseFloat(inputValStr);
    if (isNaN(parsed)) return;
    if (parsed < 0 || parsed > 10) {
      alert('Điểm số phải nằm trong khoảng từ 0,0 đến 10,0!');
      return;
    }
    if (currentVal !== parsed) {
      updateGrade(studentId, field, parsed, 'Cập nhật trực tiếp trên bảng điểm');
    }
  };

  // Export to Excel with UTF-8 BOM
  const handleExportExcel = () => {
    const headers = [
      'STT',
      'Mã HS',
      'Họ và tên',
      'Lớp',
      'TX1 (15p)',
      'TX2 (15p)',
      'TX3',
      'Giữa kỳ (HS2)',
      'Cuối kỳ (HS3)',
      'Điểm TB môn',
      'Xếp loại',
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
      r.gk ?? '',
      r.ck ?? '',
      r.avgScore.toFixed(1),
      r.rank,
      `"${(r.teacherRemarks || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BangDiem_ToanHoc_ThayThang_${selectedClassId}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#0878D1]" />
            <h2 className="text-lg font-bold text-[#064A87]">
              Sổ điểm điện tử & Quản lý kết quả học tập
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Nhập điểm trực tiếp, tự động tính điểm trung bình môn theo quy chế và lưu nhật ký chỉnh sửa
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất bảng điểm Excel</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã HS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
          />
        </div>

        {/* Filter by Class */}
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white text-gray-700"
        >
          <option value="all">Tất cả các lớp</option>
          {classes.map((c) => (
            <option key={c.id} value={c.name}>
              Lớp {c.name}
            </option>
          ))}
        </select>

        {/* Semester */}
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white text-gray-700"
        >
          <option value="Học kỳ 1">Học kỳ 1 (2025-2026)</option>
          <option value="Học kỳ 2">Học kỳ 2 (2025-2026)</option>
          <option value="Cả năm">Cả năm học</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white text-gray-700"
        >
          <option value="name">Sắp xếp theo Họ tên (A - Z)</option>
          <option value="avg_desc">Điểm trung bình (Cao xuống thấp)</option>
          <option value="avg_asc">Điểm trung bình (Thấp lên cao)</option>
        </select>
      </div>

      {/* Grade Table */}
      <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-500 pb-1">
          <span>
            Quy tắc tính: <span className="font-semibold text-gray-700">ĐTB = (TX1 + TX2 + TX3 + GK×2 + CK×3) / 8</span>
          </span>
          <span className="italic text-blue-600">
            * Thầy có thể nhấp trực tiếp vào ô điểm để sửa và bấm Enter để lưu
          </span>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#EAF5FF] text-[#064A87] font-bold border-b border-blue-200">
              <tr>
                <th className="py-2.5 px-3">STT</th>
                <th className="py-2.5 px-3">Mã HS</th>
                <th className="py-2.5 px-3">Họ và tên</th>
                <th className="py-2.5 px-2">Lớp</th>
                <th className="py-2.5 px-2 text-center bg-blue-100/50">TX1 (15p)</th>
                <th className="py-2.5 px-2 text-center bg-blue-100/50">TX2 (15p)</th>
                <th className="py-2.5 px-2 text-center bg-blue-100/50">TX3</th>
                <th className="py-2.5 px-2 text-center bg-purple-100/50">GK (x2)</th>
                <th className="py-2.5 px-2 text-center bg-amber-100/50">CK (x3)</th>
                <th className="py-2.5 px-3 text-center bg-blue-200/50 text-[#064A87]">ĐTB Môn</th>
                <th className="py-2.5 px-3 text-center">Xếp loại</th>
                <th className="py-2.5 px-2 text-center">Nhật ký</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {processedRecords.map((r, idx) => (
                <tr key={r.studentId} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-2 px-3 text-gray-500 font-medium">{idx + 1}</td>
                  <td className="py-2 px-3 font-semibold text-[#0878D1] font-mono">{r.studentCode}</td>
                  <td className="py-2 px-3 font-bold text-gray-800">{r.studentName}</td>
                  <td className="py-2 px-2 text-gray-600">{r.className}</td>

                  {/* TX1 */}
                  <td className="py-1 px-1 text-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      defaultValue={r.tx1 ?? ''}
                      onBlur={(e) => handleCellBlur(r.studentId, 'tx1', r.tx1, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                      className="w-12 p-1 text-center font-bold text-gray-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-gray-300 focus:border-[#0878D1] rounded focus:outline-none"
                    />
                  </td>

                  {/* TX2 */}
                  <td className="py-1 px-1 text-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      defaultValue={r.tx2 ?? ''}
                      onBlur={(e) => handleCellBlur(r.studentId, 'tx2', r.tx2, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                      className="w-12 p-1 text-center font-bold text-gray-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-gray-300 focus:border-[#0878D1] rounded focus:outline-none"
                    />
                  </td>

                  {/* TX3 */}
                  <td className="py-1 px-1 text-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      defaultValue={r.tx3 ?? ''}
                      onBlur={(e) => handleCellBlur(r.studentId, 'tx3', r.tx3, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                      className="w-12 p-1 text-center font-bold text-gray-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-gray-300 focus:border-[#0878D1] rounded focus:outline-none"
                    />
                  </td>

                  {/* GK */}
                  <td className="py-1 px-1 text-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      defaultValue={r.gk ?? ''}
                      onBlur={(e) => handleCellBlur(r.studentId, 'gk', r.gk, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                      className="w-12 p-1 text-center font-bold text-purple-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-gray-300 focus:border-[#0878D1] rounded focus:outline-none"
                    />
                  </td>

                  {/* CK */}
                  <td className="py-1 px-1 text-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      defaultValue={r.ck ?? ''}
                      onBlur={(e) => handleCellBlur(r.studentId, 'ck', r.ck, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                      className="w-12 p-1 text-center font-bold text-amber-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-gray-300 focus:border-[#0878D1] rounded focus:outline-none"
                    />
                  </td>

                  {/* AVG SCORE */}
                  <td className="py-2 px-3 text-center font-bold text-base text-[#064A87]">
                    {r.avgScore > 0 ? r.avgScore.toFixed(1) : '-'}
                  </td>

                  {/* RANK */}
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        r.rank === 'Giỏi'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : r.rank === 'Khá'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : r.rank === 'Trung bình'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {r.rank}
                    </span>
                  </td>

                  {/* AUDIT LOG BUTTON */}
                  <td className="py-2 px-2 text-center">
                    <button
                      onClick={() =>
                        setSelectedHistory({
                          studentName: r.studentName,
                          logs: r.history || [],
                        })
                      }
                      className="p-1 rounded text-gray-400 hover:text-[#0878D1] hover:bg-blue-50"
                      title="Xem nhật ký sửa điểm"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AUDIT LOG MODAL */}
      {selectedHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-blue-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#064A87]">
                Nhật ký chỉnh sửa điểm: {selectedHistory.studentName}
              </h3>
              <button
                onClick={() => setSelectedHistory(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 max-h-72 overflow-y-auto text-xs">
              {selectedHistory.logs.length === 0 ? (
                <p className="text-center text-gray-400 py-4">Chưa có lịch sử thay đổi điểm số.</p>
              ) : (
                selectedHistory.logs.map((log, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                    <div className="flex items-center justify-between font-semibold text-gray-700">
                      <span>Cột điểm: {log.field.toUpperCase()}</span>
                      <span className="text-[10px] text-gray-400">{log.timestamp}</span>
                    </div>
                    <p className="text-gray-600">
                      Điểm cũ: <span className="font-bold text-red-500">{log.oldVal}</span> → Điểm mới:{' '}
                      <span className="font-bold text-emerald-600">{log.newVal}</span>
                    </p>
                    <p className="text-[11px] text-gray-500">Người thực hiện: {log.changedBy}</p>
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
