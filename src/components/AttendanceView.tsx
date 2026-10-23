import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Search,
  Filter,
  Save,
  Download,
  Printer,
  Send,
  Sparkles,
  Phone,
  FileSpreadsheet,
  CheckCheck,
  RotateCcw,
  BookOpen,
  Users,
  ChevronRight,
  TrendingUp,
  AlertOctagon,
  CalendarDays,
  FileText,
  UserX,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AttendanceSession, AttendanceStatus, StudentAttendanceEntry } from '../types';

export const AttendanceView: React.FC = () => {
  const {
    classes,
    students,
    attendanceSessions,
    saveAttendanceSession,
    deleteAttendanceSession,
  } = useApp();

  // Active sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'matrix' | 'warnings'>('daily');

  // Selected Class and Date for Daily Session
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    return classes.length > 0 ? classes[0].id : '';
  });
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-23');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Tiết 1 - 2 (Buổi sáng)');
  const [sessionTopic, setSessionTopic] = useState<string>('Phương trình và Hệ phương trình');
  const [sessionNote, setSessionNote] = useState<string>('');

  // Search & Filter within daily list
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all');

  // Success toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // SMS Modal
  const [smsModalStudent, setSmsModalStudent] = useState<{
    name: string;
    code: string;
    phone?: string;
    parentPhone?: string;
    status: AttendanceStatus;
    date: string;
    className: string;
  } | null>(null);

  // Find currently selected class object
  const currentClass = useApp().classes.find((c) => c.id === selectedClassId) || classes[0];

  // Students belonging to current class
  const classStudents = useMemo(() => {
    if (!currentClass) return [];
    return students.filter((s) => s.classId === currentClass.id || s.className === currentClass.name);
  }, [students, currentClass]);

  // Existing session for this class & date & period (if any)
  const existingSession = useMemo(() => {
    return attendanceSessions.find(
      (s) =>
        (s.classId === selectedClassId || s.className === currentClass?.name) &&
        s.date === selectedDate &&
        s.period === selectedPeriod
    );
  }, [attendanceSessions, selectedClassId, currentClass, selectedDate, selectedPeriod]);

  // Local draft state for records in the current session
  const [draftRecords, setDraftRecords] = useState<{ [studentId: string]: StudentAttendanceEntry }>({});

  // Sync draft state whenever class, date, or period changes
  React.useEffect(() => {
    const recordsMap: { [studentId: string]: StudentAttendanceEntry } = {};

    if (existingSession && existingSession.records.length > 0) {
      existingSession.records.forEach((rec) => {
        recordsMap[rec.studentId] = { ...rec };
      });
      // also fill in any students not in recorded list
      classStudents.forEach((st) => {
        if (!recordsMap[st.id]) {
          recordsMap[st.id] = {
            studentId: st.id,
            studentCode: st.code,
            studentName: st.name,
            status: 'present',
          };
        }
      });
      setSessionTopic(existingSession.topic || '');
      setSessionNote(existingSession.note || '');
    } else {
      // Default all to 'present' for convenient quick-marking
      classStudents.forEach((st) => {
        recordsMap[st.id] = {
          studentId: st.id,
          studentCode: st.code,
          studentName: st.name,
          status: 'present',
        };
      });
    }

    setDraftRecords(recordsMap);
  }, [selectedClassId, selectedDate, selectedPeriod, existingSession, classStudents]);

  // Handler to change single student status
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setDraftRecords((prev) => {
      const current = prev[studentId] || {
        studentId,
        studentCode: '',
        studentName: '',
        status: 'present',
      };
      return {
        ...prev,
        [studentId]: {
          ...current,
          status,
          lateMinutes: status === 'late' ? current.lateMinutes || 10 : undefined,
        },
      };
    });
  };

  // Handler to change note for single student
  const handleNoteChange = (studentId: string, note: string) => {
    setDraftRecords((prev) => {
      const current = prev[studentId];
      if (!current) return prev;
      return {
        ...prev,
        [studentId]: {
          ...current,
          note,
        },
      };
    });
  };

  // Batch action: Mark all present
  const handleMarkAllPresent = () => {
    setDraftRecords((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        updated[id] = { ...updated[id], status: 'present', note: '' };
      });
      return updated;
    });
    showToast('Đã đánh dấu tất cả học sinh CÓ MẶT!');
  };

  // Save session
  const handleSaveSession = () => {
    if (!currentClass) return;

    const recordList: StudentAttendanceEntry[] = Object.values(draftRecords);
    const presentCount = recordList.filter((r) => r.status === 'present').length;
    const lateCount = recordList.filter((r) => r.status === 'late').length;
    const excusedCount = recordList.filter((r) => r.status === 'excused').length;
    const unexcusedCount = recordList.filter((r) => r.status === 'unexcused').length;

    const sessionId =
      existingSession?.id || `att-${currentClass.id}-${selectedDate.replace(/-/g, '')}-${Date.now().toString().slice(-4)}`;

    const newSession: AttendanceSession = {
      id: sessionId,
      classId: currentClass.id,
      className: currentClass.name,
      date: selectedDate,
      period: selectedPeriod,
      topic: sessionTopic,
      teacher: currentClass.teacher || 'Bùi Ngọc Thắng',
      totalStudents: recordList.length,
      presentCount,
      lateCount,
      excusedCount,
      unexcusedCount,
      records: recordList,
      note: sessionNote,
      createdAt: existingSession ? existingSession.createdAt : new Date().toISOString(),
    };

    saveAttendanceSession(newSession);
    showToast(`Đã lưu dữ liệu điểm danh lớp ${currentClass.name} ngày ${selectedDate} thành công!`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Calculations for KPI in Daily View
  const recordList = Object.values(draftRecords);
  const totalCount = recordList.length;
  const presentCount = recordList.filter((r) => r.status === 'present').length;
  const lateCount = recordList.filter((r) => r.status === 'late').length;
  const excusedCount = recordList.filter((r) => r.status === 'excused').length;
  const unexcusedCount = recordList.filter((r) => r.status === 'unexcused').length;
  const attendanceRate = totalCount > 0 ? Math.round(((presentCount + lateCount) / totalCount) * 100) : 100;

  // Filtered students for table view
  const displayedStudents = classStudents.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.code.toLowerCase().includes(searchTerm.toLowerCase());
    const studentRecord = draftRecords[st.id];
    const matchesStatus =
      statusFilter === 'all' || (studentRecord && studentRecord.status === statusFilter);
    return matchesSearch && matchesStatus;
  });

  // Export CSV function
  const handleExportCSV = () => {
    if (!currentClass) return;
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += `BẢNG ĐIỂM DANH LỚP ${currentClass.name} - NGÀY ${selectedDate} - ${selectedPeriod}\n`;
    csvContent += `Giáo viên phụ trách: ${currentClass.teacher} | Bài học: ${sessionTopic || 'Toán học'}\n\n`;
    csvContent += 'STT,Mã Học Sinh,Họ và Tên,Giới Tính,Trạng Thái,Lý Do / Ghi Chú\n';

    classStudents.forEach((st, idx) => {
      const rec = draftRecords[st.id];
      const statusText =
        rec?.status === 'present'
          ? 'Có mặt'
          : rec?.status === 'late'
          ? `Đi muộn (${rec.lateMinutes || 10}p)`
          : rec?.status === 'excused'
          ? 'Nghỉ có phép'
          : 'Nghỉ không phép';
      csvContent += `${idx + 1},${st.code},"${st.name}",${st.gender},"${statusText}","${rec?.note || ''}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DiemDanh_${currentClass.name}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã xuất file CSV điểm danh thành công!');
  };

  // Monthly Matrix data
  const classSessions = useMemo(() => {
    return attendanceSessions
      .filter((s) => s.classId === selectedClassId || s.className === currentClass?.name)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [attendanceSessions, selectedClassId, currentClass]);

  // Warning List (Students with >= 2 absences across all sessions of this class)
  const studentAbsenceStats = useMemo(() => {
    const stats: {
      [studentId: string]: {
        student: (typeof students)[0];
        unexcused: number;
        excused: number;
        late: number;
        totalSessions: number;
        history: { date: string; status: AttendanceStatus; note?: string }[];
      };
    } = {};

    classStudents.forEach((st) => {
      stats[st.id] = {
        student: st,
        unexcused: 0,
        excused: 0,
        late: 0,
        totalSessions: 0,
        history: [],
      };
    });

    classSessions.forEach((sess) => {
      sess.records.forEach((rec) => {
        if (stats[rec.studentId]) {
          stats[rec.studentId].totalSessions += 1;
          if (rec.status === 'unexcused') stats[rec.studentId].unexcused += 1;
          if (rec.status === 'excused') stats[rec.studentId].excused += 1;
          if (rec.status === 'late') stats[rec.studentId].late += 1;

          if (rec.status !== 'present') {
            stats[rec.studentId].history.push({
              date: sess.date,
              status: rec.status,
              note: rec.note,
            });
          }
        }
      });
    });

    return Object.values(stats);
  }, [classStudents, classSessions]);

  const atRiskStudents = useMemo(() => {
    return studentAbsenceStats
      .filter((s) => s.unexcused + s.excused >= 1 || s.late >= 2)
      .sort((a, b) => b.unexcused * 2 + b.excused - (a.unexcused * 2 + a.excused));
  }, [studentAbsenceStats]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#064A87] text-white px-5 py-3 rounded-lg shadow-2xl border border-blue-400 flex items-center gap-3 animate-fade-in text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#064A87] via-[#0878D1] to-[#0A88EA] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider text-blue-100 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
                Hệ thống chuyên cần THPT Đan Phượng
              </span>
              <span className="text-xs bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-medium">
                Năm học 2025 - 2026
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold font-serif tracking-tight">
              Quản lý Điểm danh & Chuyên cần môn Toán
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Theo dõi sĩ số lớp, điểm danh từng tiết học, cảnh báo học sinh vắng muộn và gửi thông tin đến phụ huynh một cách nhanh chóng.
            </p>
          </div>

          {/* Quick Sub-Tab Switcher */}
          <div className="flex items-center bg-black/20 p-1 rounded-xl backdrop-blur-sm border border-white/10 shrink-0">
            <button
              onClick={() => setActiveSubTab('daily')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSubTab === 'daily'
                  ? 'bg-white text-[#064A87] shadow-sm font-semibold'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Điểm danh buổi học</span>
            </button>
            <button
              onClick={() => setActiveSubTab('matrix')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSubTab === 'matrix'
                  ? 'bg-white text-[#064A87] shadow-sm font-semibold'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Ma trận tháng</span>
            </button>
            <button
              onClick={() => setActiveSubTab('warnings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all relative ${
                activeSubTab === 'warnings'
                  ? 'bg-white text-[#064A87] shadow-sm font-semibold'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <span>Cảnh báo chuyên cần</span>
              {atRiskStudents.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-400 absolute top-1.5 right-1.5 animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Class & Date Selector Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Class Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#0878D1]" />
              Chọn lớp học
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-[#F4F8FC] border border-blue-200 rounded-lg px-3 py-2 text-sm font-semibold text-[#12345A] focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  Lớp {cls.name} (Khối {cls.grade} - {cls.room})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#0878D1]" />
              Ngày điểm danh
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-[#F4F8FC] border border-blue-200 rounded-lg px-3 py-2 text-sm font-medium text-[#12345A] focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
            />
          </div>

          {/* Period Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0878D1]" />
              Tiết học / Buổi học
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full bg-[#F4F8FC] border border-blue-200 rounded-lg px-3 py-2 text-sm font-medium text-[#12345A] focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
            >
              <option value="Tiết 1 - 2 (Buổi sáng)">Tiết 1 - 2 (Buổi sáng)</option>
              <option value="Tiết 3 - 4 (Buổi sáng)">Tiết 3 - 4 (Buổi sáng)</option>
              <option value="Tiết 5 (Buổi sáng)">Tiết 5 (Buổi sáng)</option>
              <option value="Tiết 1 - 2 (Buổi chiều)">Tiết 1 - 2 (Buổi chiều)</option>
              <option value="Tiết 3 - 4 (Buổi chiều)">Tiết 3 - 4 (Buổi chiều)</option>
              <option value="Bồi dưỡng HSG / Phụ đạo">Bồi dưỡng HSG / Phụ đạo</option>
            </select>
          </div>

          {/* Lesson Topic */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#0878D1]" />
              Nội dung bài học
            </label>
            <input
              type="text"
              placeholder="VD: Định lý Vi-et, Vectơ..."
              value={sessionTopic}
              onChange={(e) => setSessionTopic(e.target.value)}
              className="w-full bg-[#F4F8FC] border border-blue-200 rounded-lg px-3 py-2 text-sm text-[#12345A] focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
            />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: DAILY ATTENDANCE SHEET */}
      {/* ======================================================== */}
      {activeSubTab === 'daily' && (
        <div className="space-y-5">
          {/* KPI Statistics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Total Students */}
            <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Sĩ số lớp</span>
                <Users className="w-4 h-4 text-[#064A87]" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#12345A]">{totalCount}</span>
                <span className="text-xs text-slate-400">học sinh</span>
              </div>
              <div className="text-[11px] text-blue-600 mt-1 font-medium truncate">
                Lớp {currentClass?.name}
              </div>
            </div>

            {/* Present */}
            <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
                <span>Có mặt</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-emerald-700">{presentCount}</span>
                <span className="text-xs text-emerald-600">/ {totalCount}</span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-1.5 mt-2">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{ width: `${totalCount > 0 ? (presentCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Late */}
            <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-800 text-xs font-semibold">
                <span>Đi muộn</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-amber-700">{lateCount}</span>
                <span className="text-xs text-amber-600">học sinh</span>
              </div>
              <div className="text-[11px] text-amber-700 mt-1">
                {lateCount > 0 ? 'Cần nhắc nhở tác phong' : 'Đúng giờ 100%'}
              </div>
            </div>

            {/* Excused Absences */}
            <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-blue-800 text-xs font-semibold">
                <span>Nghỉ có phép</span>
                <FileText className="w-4 h-4 text-[#0878D1]" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#0878D1]">{excusedCount}</span>
                <span className="text-xs text-blue-600">học sinh</span>
              </div>
              <div className="text-[11px] text-blue-600 mt-1">
                {excusedCount > 0 ? 'Có đơn/điện thoại PH' : 'Không có'}
              </div>
            </div>

            {/* Unexcused Absences */}
            <div className="bg-rose-50/60 rounded-xl p-4 border border-rose-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-rose-800 text-xs font-semibold">
                <span>Nghỉ không phép</span>
                <XCircle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-rose-700">{unexcusedCount}</span>
                <span className="text-xs text-rose-600">học sinh</span>
              </div>
              <div className="text-[11px] text-rose-600 mt-1 font-semibold">
                {unexcusedCount > 0 ? '⚠️ Cần gọi PH ngay' : 'Không có'}
              </div>
            </div>

            {/* Attendance Rate */}
            <div className="bg-gradient-to-br from-[#064A87] to-[#0878D1] text-white rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-blue-200 text-xs font-semibold">
                <span>Tỷ lệ chuyên cần</span>
                <TrendingUp className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">{attendanceRate}%</span>
              </div>
              <div className="text-[11px] text-blue-100 mt-1">
                {attendanceRate >= 95 ? 'Tốt xuất sắc' : attendanceRate >= 85 ? 'Đạt yêu cầu' : 'Cần chấn chỉnh'}
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100 flex flex-wrap items-center justify-between gap-3">
            {/* Left Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleMarkAllPresent}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-sm"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Đánh dấu tất cả Có mặt</span>
              </button>

              <button
                onClick={() => {
                  const recordsMap: { [studentId: string]: StudentAttendanceEntry } = {};
                  classStudents.forEach((st) => {
                    recordsMap[st.id] = {
                      studentId: st.id,
                      studentCode: st.code,
                      studentName: st.name,
                      status: 'present',
                    };
                  });
                  setDraftRecords(recordsMap);
                  showToast('Đã đặt lại dữ liệu buổi điểm danh.');
                }}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-[#064A87] border border-blue-200 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#0878D1]" />
                <span>Xuất file Excel / CSV</span>
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>In sổ điểm danh</span>
              </button>
            </div>

            {/* Right Save Action */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveSession}
                className="flex items-center gap-2 bg-[#0878D1] hover:bg-[#064A87] text-white text-sm font-semibold px-5 py-2 rounded-lg shadow-md transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Lưu buổi điểm danh</span>
              </button>
            </div>
          </div>

          {/* Filter & Search Controls */}
          <div className="bg-white rounded-xl p-3 shadow-sm border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tên hoặc mã học sinh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F4F8FC] border border-blue-200 rounded-lg text-[#12345A] focus:outline-none focus:ring-1 focus:ring-[#0878D1]"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Lọc:
              </span>
              {(
                [
                  { key: 'all', label: 'Tất cả' },
                  { key: 'present', label: `Có mặt (${presentCount})` },
                  { key: 'late', label: `Muộn (${lateCount})` },
                  { key: 'excused', label: `Có phép (${excusedCount})` },
                  { key: 'unexcused', label: `Không phép (${unexcusedCount})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors whitespace-nowrap ${
                    statusFilter === tab.key
                      ? 'bg-[#0878D1] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Student Attendance Table */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#064A87]/5 text-[#064A87] font-semibold text-xs border-b border-blue-100 uppercase tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">STT</th>
                    <th className="py-3 px-4 w-28">Mã HS</th>
                    <th className="py-3 px-4">Họ và Tên</th>
                    <th className="py-3 px-4 w-24 text-center">Giới tính</th>
                    <th className="py-3 px-4 min-w-[320px] text-center">Trạng thái điểm danh</th>
                    <th className="py-3 px-4 min-w-[200px]">Ghi chú / Lý do</th>
                    <th className="py-3 px-4 w-28 text-center">Tác vụ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                  {displayedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        <UserX className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        Không tìm thấy học sinh nào phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    displayedStudents.map((st, idx) => {
                      const rec = draftRecords[st.id] || {
                        studentId: st.id,
                        studentCode: st.code,
                        studentName: st.name,
                        status: 'present',
                      };
                      const currentStatus = rec.status;

                      return (
                        <tr
                          key={st.id}
                          className={`hover:bg-blue-50/40 transition-colors ${
                            currentStatus === 'unexcused'
                              ? 'bg-rose-50/30'
                              : currentStatus === 'late'
                              ? 'bg-amber-50/20'
                              : currentStatus === 'excused'
                              ? 'bg-blue-50/20'
                              : ''
                          }`}
                        >
                          <td className="py-3 px-4 text-center text-xs font-semibold text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4 text-xs font-mono font-semibold text-slate-700">
                            {st.code}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[#12345A]">{st.name}</div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2">
                              <span>Lớp: {st.className}</span>
                              {st.phone && <span>SĐT: {st.phone}</span>}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                                st.gender === 'Nữ'
                                  ? 'bg-pink-100 text-pink-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {st.gender}
                            </span>
                          </td>

                          {/* 4-Button Segmented Status Controller */}
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1 bg-[#F4F8FC] p-1 rounded-xl border border-blue-100">
                              {/* Present Button */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(st.id, 'present')}
                                className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  currentStatus === 'present'
                                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                                    : 'text-slate-600 hover:bg-white hover:text-emerald-700'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Có mặt</span>
                              </button>

                              {/* Late Button */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(st.id, 'late')}
                                className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  currentStatus === 'late'
                                    ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300'
                                    : 'text-slate-600 hover:bg-white hover:text-amber-700'
                                }`}
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>Muộn</span>
                                {currentStatus === 'late' && rec.lateMinutes && (
                                  <span className="text-[10px] bg-black/20 px-1 rounded">
                                    {rec.lateMinutes}p
                                  </span>
                                )}
                              </button>

                              {/* Excused Button */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(st.id, 'excused')}
                                className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  currentStatus === 'excused'
                                    ? 'bg-[#0878D1] text-white shadow-sm ring-2 ring-blue-300'
                                    : 'text-slate-600 hover:bg-white hover:text-[#0878D1]'
                                }`}
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Có phép</span>
                              </button>

                              {/* Unexcused Button */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(st.id, 'unexcused')}
                                className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  currentStatus === 'unexcused'
                                    ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300'
                                    : 'text-slate-600 hover:bg-white hover:text-rose-700'
                                }`}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Không phép</span>
                              </button>
                            </div>
                          </td>

                          {/* Inline Note / Reason */}
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              placeholder={
                                currentStatus === 'late'
                                  ? 'VD: Hỏng xe, muộn 10p...'
                                  : currentStatus === 'excused'
                                  ? 'VD: Ốm sốt, phụ huynh gọi...'
                                  : currentStatus === 'unexcused'
                                  ? 'Lý do vắng (nếu có)...'
                                  : 'Ghi chú thêm...'
                              }
                              value={rec.note || ''}
                              onChange={(e) => handleNoteChange(st.id, e.target.value)}
                              className="w-full text-xs px-2.5 py-1.5 bg-[#F4F8FC] border border-blue-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0878D1]"
                            />
                          </td>

                          {/* Quick Actions (e.g. Call / SMS parent) */}
                          <td className="py-3 px-4 text-center">
                            {currentStatus === 'unexcused' || currentStatus === 'late' || currentStatus === 'excused' ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setSmsModalStudent({
                                    name: st.name,
                                    code: st.code,
                                    phone: st.phone,
                                    status: currentStatus,
                                    date: selectedDate,
                                    className: currentClass?.name || '',
                                  })
                                }
                                title="Gửi tin nhắn hoặc gọi điện cho phụ huynh"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0878D1] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded-md transition-colors"
                              >
                                <Send className="w-3 h-3" />
                                <span>Báo PH</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-emerald-600 font-medium">✓ Đủ</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Session Notes */}
            <div className="bg-[#F8FAFC] border-t border-blue-100 p-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Ghi chú chung cho buổi học (vệ sinh lớp, kỷ luật, bài tập về nhà):
              </label>
              <textarea
                rows={2}
                placeholder="Nhập ghi chú chung của thầy Thắng cho buổi học này..."
                value={sessionNote}
                onChange={(e) => setSessionNote(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-blue-200 rounded-lg text-[#12345A] focus:outline-none focus:ring-1 focus:ring-[#0878D1]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: MONTHLY ATTENDANCE MATRIX */}
      {/* ======================================================== */}
      {activeSubTab === 'matrix' && (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#064A87]">
                Bảng Ma trận Chuyên cần Lớp {currentClass?.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tổng hợp tình trạng điểm danh của tất cả học sinh theo từng buổi học đã ghi nhận trong hệ thống.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Có mặt
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Muộn
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
                  <FileText className="w-3.5 h-3.5 text-blue-500" /> Có phép (P)
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-rose-700">
                  <XCircle className="w-3.5 h-3.5 text-rose-500" /> Không phép (K)
                </span>
              </div>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 bg-[#0878D1] text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm hover:bg-[#064A87]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất bảng tổng hợp</span>
              </button>
            </div>
          </div>

          {classSessions.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CalendarDays className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p>Chưa có buổi điểm danh nào được lưu cho lớp {currentClass?.name}.</p>
              <button
                onClick={() => setActiveSubTab('daily')}
                className="mt-3 text-xs bg-[#0878D1] text-white px-4 py-2 rounded-lg font-semibold"
              >
                Tạo buổi điểm danh ngay
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#064A87]/5 text-[#064A87] font-semibold border-b border-blue-100">
                    <th className="py-2.5 px-3 w-10 text-center">STT</th>
                    <th className="py-2.5 px-3 w-24">Mã HS</th>
                    <th className="py-2.5 px-3 min-w-[150px]">Họ và Tên</th>
                    {classSessions.map((sess) => (
                      <th key={sess.id} className="py-2.5 px-3 text-center min-w-[75px]">
                        <div>{sess.date.slice(5)}</div>
                        <div className="text-[10px] text-slate-400 font-normal truncate max-w-[70px]">
                          {sess.period.split(' ')[0]}
                        </div>
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-center font-bold text-rose-700">Vắng (K)</th>
                    <th className="py-2.5 px-3 text-center font-bold text-blue-700">Phép (P)</th>
                    <th className="py-2.5 px-3 text-center font-bold text-amber-700">Muộn</th>
                    <th className="py-2.5 px-3 text-center font-bold text-[#064A87]">Tỷ lệ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                  {classStudents.map((st, idx) => {
                    let unexcusedCount = 0;
                    let excusedCount = 0;
                    let lateCount = 0;
                    let recordedCount = 0;

                    const rowCells = classSessions.map((sess) => {
                      const rec = sess.records.find((r) => r.studentId === st.id);
                      if (rec) {
                        recordedCount++;
                        if (rec.status === 'unexcused') unexcusedCount++;
                        if (rec.status === 'excused') excusedCount++;
                        if (rec.status === 'late') lateCount++;
                      }
                      return { sessionId: sess.id, rec };
                    });

                    const rate =
                      recordedCount > 0
                        ? Math.round(((recordedCount - unexcusedCount - excusedCount) / recordedCount) * 100)
                        : 100;

                    return (
                      <tr key={st.id} className="hover:bg-blue-50/30">
                        <td className="py-2.5 px-3 text-center text-slate-500 font-semibold">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">{st.code}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#12345A]">{st.name}</td>

                        {rowCells.map(({ sessionId, rec }) => {
                          if (!rec) {
                            return (
                              <td key={sessionId} className="py-2.5 px-3 text-center text-slate-300">
                                -
                              </td>
                            );
                          }

                          if (rec.status === 'present') {
                            return (
                              <td key={sessionId} className="py-2.5 px-3 text-center">
                                <span className="inline-block text-emerald-600 font-bold">✓</span>
                              </td>
                            );
                          }
                          if (rec.status === 'late') {
                            return (
                              <td key={sessionId} className="py-2.5 px-3 text-center">
                                <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                                  M
                                </span>
                              </td>
                            );
                          }
                          if (rec.status === 'excused') {
                            return (
                              <td key={sessionId} className="py-2.5 px-3 text-center">
                                <span className="inline-block px-1.5 py-0.5 rounded bg-blue-100 text-[#0878D1] font-bold text-[10px]">
                                  P
                                </span>
                              </td>
                            );
                          }
                          return (
                            <td key={sessionId} className="py-2.5 px-3 text-center">
                              <span className="inline-block px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px]">
                                K
                              </span>
                            </td>
                          );
                        })}

                        <td className="py-2.5 px-3 text-center font-bold text-rose-600">
                          {unexcusedCount > 0 ? unexcusedCount : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-blue-600">
                          {excusedCount > 0 ? excusedCount : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-amber-600">
                          {lateCount > 0 ? lateCount : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-[#064A87]">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] ${
                              rate >= 90
                                ? 'bg-emerald-100 text-emerald-800'
                                : rate >= 75
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {rate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: WARNINGS & STUDENT ATTENDANCE DOSSIER */}
      {/* ======================================================== */}
      {activeSubTab === 'warnings' && (
        <div className="space-y-6">
          {/* Warning Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">Quy chế chuyên cần THPT:</span> Học sinh nghỉ học quá 45 buổi trong một năm học (nghỉ có phép hoặc không phép) sẽ không được lên lớp. Học sinh vắng từ 3 buổi không phép trong tháng cần được giáo viên thông báo trực tiếp cho phụ huynh và Ban giám hiệu.
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#064A87] flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-rose-600" />
                  Danh sách học sinh có nguy cơ chuyên cần (Lớp {currentClass?.name})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tự động lọc những học sinh đã vắng học (có phép/không phép) hoặc đi muộn nhiều lần.
                </p>
              </div>

              <span className="text-xs bg-rose-100 text-rose-800 font-semibold px-3 py-1 rounded-full">
                {atRiskStudents.length} học sinh cần lưu ý
              </span>
            </div>

            {atRiskStudents.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">Tuyệt vời! Không có học sinh nào bị cảnh báo chuyên cần.</p>
                <p className="text-xs text-slate-400 mt-1">Tất cả các em học sinh lớp {currentClass?.name} đều tham gia học tập đầy đủ.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {atRiskStudents.map(({ student, unexcused, excused, late, history }) => {
                  const totalAbsence = unexcused + excused;
                  const isSevere = unexcused >= 2 || totalAbsence >= 3;

                  return (
                    <div
                      key={student.id}
                      className={`rounded-xl p-4 border transition-all ${
                        isSevere
                          ? 'bg-rose-50/40 border-rose-200'
                          : 'bg-amber-50/30 border-amber-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#12345A]">{student.name}</span>
                            <span className="font-mono text-xs text-slate-500">({student.code})</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Lớp {student.className} • Điểm TB: <span className="font-bold">{student.avgScore}</span>
                          </div>
                        </div>

                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                            isSevere
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-amber-500 text-white shadow-xs'
                          }`}
                        >
                          {isSevere ? 'Báo động đỏ' : 'Cần nhắc nhở'}
                        </span>
                      </div>

                      {/* Stat badging */}
                      <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <div className="text-slate-400 text-[10px]">Không phép</div>
                          <div className="font-bold text-rose-600 text-sm">{unexcused} buổi</div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <div className="text-slate-400 text-[10px]">Có phép</div>
                          <div className="font-bold text-blue-600 text-sm">{excused} buổi</div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <div className="text-slate-400 text-[10px]">Đi muộn</div>
                          <div className="font-bold text-amber-600 text-sm">{late} lần</div>
                        </div>
                      </div>

                      {/* Absence history preview */}
                      {history.length > 0 && (
                        <div className="mt-3 bg-white/80 p-2.5 rounded-lg border border-slate-200 text-xs">
                          <div className="text-[11px] font-semibold text-slate-600 mb-1">
                            Lịch sử vắng / muộn gần đây:
                          </div>
                          <div className="space-y-1">
                            {history.slice(0, 3).map((h, i) => (
                              <div key={i} className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-500">{h.date}</span>
                                <span
                                  className={`font-semibold ${
                                    h.status === 'unexcused'
                                      ? 'text-rose-600'
                                      : h.status === 'late'
                                      ? 'text-amber-600'
                                      : 'text-blue-600'
                                  }`}
                                >
                                  {h.status === 'unexcused'
                                    ? 'Không phép'
                                    : h.status === 'late'
                                    ? 'Đi muộn'
                                    : 'Có phép'}
                                  {h.note ? ` (${h.note})` : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Contact Actions */}
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60">
                        <span className="text-xs text-slate-500">
                          SĐT PH: <span className="font-mono font-semibold">{student.phone || '0345 888 999'}</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSmsModalStudent({
                                name: student.name,
                                code: student.code,
                                phone: student.phone || '0345 888 999',
                                status: unexcused > 0 ? 'unexcused' : 'excused',
                                date: selectedDate,
                                className: student.className,
                              })
                            }
                            className="flex items-center gap-1 text-xs bg-[#0878D1] hover:bg-[#064A87] text-white px-3 py-1 rounded-md font-semibold transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            <span>Nhắn tin PH</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* POPUP / MODAL: SEND SMS / CALL PARENT */}
      {/* ======================================================== */}
      {smsModalStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-blue-200 animate-scale-up space-y-4">
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#0878D1]" />
                <h3 className="font-bold text-base text-[#064A87]">
                  Thông báo chuyên cần tới Phụ huynh
                </h3>
              </div>
              <button
                onClick={() => setSmsModalStudent(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <div>
                Học sinh: <span className="font-bold text-[#12345A]">{smsModalStudent.name}</span> (Mã: {smsModalStudent.code})
              </div>
              <div>
                Lớp: <span className="font-semibold text-[#064A87]">{smsModalStudent.className}</span> • Ngày: {smsModalStudent.date}
              </div>
              <div>
                Tình trạng: <span className="font-bold text-rose-600 uppercase">
                  {smsModalStudent.status === 'unexcused'
                    ? 'Vắng học không phép'
                    : smsModalStudent.status === 'late'
                    ? 'Đi học muộn'
                    : 'Nghỉ học có phép'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nội dung tin nhắn mẫu (SMS / Zalo):
              </label>
              <textarea
                rows={4}
                defaultValue={`[THPT Đan Phượng] Kính gửi phụ huynh em ${smsModalStudent.name} (Lớp ${smsModalStudent.className}), hôm nay ngày ${smsModalStudent.date}, thầy Bùi Ngọc Thắng ghi nhận em ${smsModalStudent.status === 'unexcused' ? 'vắng mặt không phép' : smsModalStudent.status === 'late' ? 'đến lớp muộn' : 'nghỉ học có phép'} trong giờ học môn Toán. Kính đề nghị phụ huynh kiểm tra và trao đổi lại với thầy qua số điện thoại 0988 123 456.`}
                className="w-full text-xs p-3 bg-[#F4F8FC] border border-blue-200 rounded-lg text-[#12345A] focus:outline-none focus:ring-1 focus:ring-[#0878D1] leading-relaxed font-sans"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={`tel:${smsModalStudent.phone || '0988123456'}`}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-lg font-semibold transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Gọi điện ({smsModalStudent.phone || '0345...'})</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSmsModalStudent(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      `[THPT Đan Phượng] Kính gửi phụ huynh em ${smsModalStudent.name} (Lớp ${smsModalStudent.className}), hôm nay ngày ${smsModalStudent.date}, thầy Bùi Ngọc Thắng ghi nhận em ${smsModalStudent.status === 'unexcused' ? 'vắng mặt không phép' : 'nghỉ học'} trong giờ học môn Toán.`
                    );
                    setSmsModalStudent(null);
                    showToast('Đã sao chép tin nhắn vào bộ nhớ tạm để gửi Zalo/SMS!');
                  }}
                  className="flex items-center gap-1.5 bg-[#0878D1] hover:bg-[#064A87] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Sao chép & Gửi tin</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
