import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  Save,
  Download,
  Printer,
  Send,
  Phone,
  CheckCheck,
  RotateCcw,
  BookOpen,
  Users,
  TrendingUp,
  AlertOctagon,
  CalendarDays,
  FileText,
  UserX,
  Plus,
  Check,
  FileCheck,
  Award,
  Sparkles,
  Trash2,
  Info,
  CalendarRange,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  AttendanceSession,
  AttendanceStatus,
  StudentAttendanceEntry,
  AbsenceReasonCategory,
  LeaveRequesterType,
  LeaveRequest,
} from '../types';

export const ABSENCE_REASON_OPTIONS: AbsenceReasonCategory[] = [
  'Ốm đau / Sức khỏe',
  'Khám bệnh / Nhập viện',
  'Việc gia đình hiếu hỉ',
  'Thi HSG / Hoạt động Đoàn',
  'Trùng lịch thi / Bồi dưỡng',
  'Thời tiết / Hỏng xe',
  'Vắng không phép',
  'Khác',
];

export const LEAVE_REQUESTER_OPTIONS: LeaveRequesterType[] = [
  'Phụ huynh gọi điện',
  'Tin nhắn Zalo/SMS',
  'Đơn xin phép viết tay',
  'Học sinh trực tiếp',
  'Giáo viên xác nhận',
];

export const AttendanceView: React.FC = () => {
  const {
    classes,
    students,
    attendanceSessions,
    leaveRequests,
    saveAttendanceSession,
    deleteAttendanceSession,
    addLeaveRequest,
    updateLeaveRequest,
    deleteLeaveRequest,
  } = useApp();

  // Active sub-tab
  const [activeSubTab, setActiveSubTab] = useState<
    'daily' | 'matrix' | 'leave_requests' | 'warnings' | 'comparison'
  >('daily');

  // Selected Class and Date for Daily Session
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    return classes.length > 0 ? classes[0].id : '';
  });
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-23');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Tiết 1 - 2 (Buổi sáng)');
  const [sessionTopic, setSessionTopic] = useState<string>(
    'Phương pháp đổi biến số & Từng phần trong Tích phân'
  );
  const [sessionNote, setSessionNote] = useState<string>('');

  // Search & Filter within daily list
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all');

  // Success toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // SMS Modal State
  const [smsModalStudent, setSmsModalStudent] = useState<{
    name: string;
    code: string;
    phone?: string;
    parentPhone?: string;
    status: AttendanceStatus;
    reasonPreset?: string;
    note?: string;
    date: string;
    className: string;
  } | null>(null);

  // Leave Request Form Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveFormClassId, setLeaveFormClassId] = useState<string>(() => {
    return classes.length > 0 ? classes[0].id : '';
  });
  const [leaveFormStudentId, setLeaveFormStudentId] = useState<string>('');
  const [leaveFormFromDate, setLeaveFormFromDate] = useState<string>('2026-10-24');
  const [leaveFormToDate, setLeaveFormToDate] = useState<string>('2026-10-25');
  const [leaveFormReasonCategory, setLeaveFormReasonCategory] =
    useState<AbsenceReasonCategory>('Khám bệnh / Nhập viện');
  const [leaveFormDetailedReason, setLeaveFormDetailedReason] = useState<string>('');
  const [leaveFormRequesterType, setLeaveFormRequesterType] =
    useState<LeaveRequesterType>('Phụ huynh gọi điện');
  const [leaveFormParentPhone, setLeaveFormParentPhone] = useState<string>('');
  const [leaveFormNotes, setLeaveFormNotes] = useState<string>('');

  // Leave Request Detail Modal State (for viewing full note & info)
  const [viewingLeaveRequest, setViewingLeaveRequest] = useState<LeaveRequest | null>(null);

  // Filter for Leave Request Tab
  const [leaveFilterClassId, setLeaveFilterClassId] = useState<string>('all');
  const [leaveFilterStatus, setLeaveFilterStatus] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [leaveSearchTerm, setLeaveSearchTerm] = useState('');

  // Selected Month for Matrix view
  const [matrixMonth, setMatrixMonth] = useState<string>('2026-10');

  // Current selected class object
  const currentClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  // Students belonging to current class
  const classStudents = useMemo(() => {
    if (!currentClass) return [];
    return students.filter(
      (s) => s.classId === currentClass.id || s.className === currentClass.name
    );
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

  // Active advance leaves for current class and selected date
  const activeLeavesForSelectedDate = useMemo(() => {
    return leaveRequests.filter((lr) => {
      const matchClass =
        !currentClass || lr.classId === currentClass.id || lr.className === currentClass.name;
      const inDateRange = lr.fromDate <= selectedDate && selectedDate <= lr.toDate;
      const isApproved = lr.status === 'approved';
      return matchClass && inDateRange && isApproved;
    });
  }, [leaveRequests, currentClass, selectedDate]);

  // Map of studentId -> active leave request for quick lookup
  const studentActiveLeaveMap = useMemo(() => {
    const map = new Map<string, LeaveRequest>();
    activeLeavesForSelectedDate.forEach((lr) => {
      map.set(lr.studentId, lr);
    });
    return map;
  }, [activeLeavesForSelectedDate]);

  // Local draft state for records in the current session
  const [draftRecords, setDraftRecords] = useState<{ [studentId: string]: StudentAttendanceEntry }>({});

  // Sync draft state whenever class, date, period, or leaveRequests change
  React.useEffect(() => {
    const recordsMap: { [studentId: string]: StudentAttendanceEntry } = {};

    if (existingSession && existingSession.records.length > 0) {
      existingSession.records.forEach((rec) => {
        recordsMap[rec.studentId] = { ...rec };
      });
      // Fill in any student not recorded
      classStudents.forEach((st) => {
        if (!recordsMap[st.id]) {
          const leave = studentActiveLeaveMap.get(st.id);
          if (leave) {
            recordsMap[st.id] = {
              studentId: st.id,
              studentCode: st.code,
              studentName: st.name,
              status: 'excused',
              reasonPreset: leave.reasonCategory,
              requesterType: leave.requesterType,
              note: leave.detailedReason ? `[Đơn xin phép] ${leave.detailedReason}` : 'Có đơn xin phép',
            };
          } else {
            recordsMap[st.id] = {
              studentId: st.id,
              studentCode: st.code,
              studentName: st.name,
              status: 'present',
            };
          }
        }
      });
      setSessionTopic(existingSession.topic || '');
      setSessionNote(existingSession.note || '');
    } else {
      // New session: default all to 'present', except students with an approved advance leave
      classStudents.forEach((st) => {
        const leave = studentActiveLeaveMap.get(st.id);
        if (leave) {
          recordsMap[st.id] = {
            studentId: st.id,
            studentCode: st.code,
            studentName: st.name,
            status: 'excused',
            reasonPreset: leave.reasonCategory,
            requesterType: leave.requesterType,
            note: leave.detailedReason ? `[Đơn xin phép] ${leave.detailedReason}` : 'Có đơn xin phép',
          };
        } else {
          recordsMap[st.id] = {
            studentId: st.id,
            studentCode: st.code,
            studentName: st.name,
            status: 'present',
          };
        }
      });
    }

    setDraftRecords(recordsMap);
  }, [selectedClassId, selectedDate, selectedPeriod, existingSession, classStudents, studentActiveLeaveMap]);

  // Handler to change single student status
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setDraftRecords((prev) => {
      const current = prev[studentId] || {
        studentId,
        studentCode: '',
        studentName: '',
        status: 'present',
      };

      let defaultReason: AbsenceReasonCategory | undefined = current.reasonPreset as AbsenceReasonCategory;
      let defaultRequester: LeaveRequesterType | undefined = current.requesterType;

      if (status === 'unexcused') {
        defaultReason = 'Vắng không phép';
        defaultRequester = 'Giáo viên xác nhận';
      } else if (status === 'excused' && (!defaultReason || defaultReason === 'Vắng không phép')) {
        defaultReason = 'Ốm đau / Sức khỏe';
        defaultRequester = 'Phụ huynh gọi điện';
      } else if (status === 'late' && !defaultReason) {
        defaultReason = 'Thời tiết / Hỏng xe';
        defaultRequester = 'Học sinh trực tiếp';
      }

      return {
        ...prev,
        [studentId]: {
          ...current,
          status,
          lateMinutes: status === 'late' ? current.lateMinutes || 10 : undefined,
          reasonPreset: status === 'present' ? undefined : defaultReason,
          requesterType: status === 'present' ? undefined : defaultRequester,
        },
      };
    });
  };

  // Handler to change reason preset
  const handleReasonPresetChange = (studentId: string, reasonPreset: AbsenceReasonCategory) => {
    setDraftRecords((prev) => {
      const current = prev[studentId];
      if (!current) return prev;
      return {
        ...prev,
        [studentId]: {
          ...current,
          reasonPreset,
        },
      };
    });
  };

  // Handler to change requester type
  const handleRequesterTypeChange = (studentId: string, requesterType: LeaveRequesterType) => {
    setDraftRecords((prev) => {
      const current = prev[studentId];
      if (!current) return prev;
      return {
        ...prev,
        [studentId]: {
          ...current,
          requesterType,
        },
      };
    });
  };

  // Handler to change late minutes
  const handleLateMinutesChange = (studentId: string, lateMinutes: number) => {
    setDraftRecords((prev) => {
      const current = prev[studentId];
      if (!current) return prev;
      return {
        ...prev,
        [studentId]: {
          ...current,
          lateMinutes,
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
        updated[id] = {
          ...updated[id],
          status: 'present',
          note: '',
          reasonPreset: undefined,
          requesterType: undefined,
          lateMinutes: undefined,
        };
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
      existingSession?.id ||
      `att-${currentClass.id}-${selectedDate.replace(/-/g, '')}-${Date.now().toString().slice(-4)}`;

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
    showToast(`Đã lưu điểm danh lớp ${currentClass.name} ngày ${selectedDate} thành công!`);
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
  const attendanceRate =
    totalCount > 0 ? Math.round(((presentCount + lateCount) / totalCount) * 100) : 100;

  // Filtered students for daily table view
  const displayedStudents = classStudents.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.code.toLowerCase().includes(searchTerm.toLowerCase());
    const studentRecord = draftRecords[st.id];
    const matchesStatus =
      statusFilter === 'all' || (studentRecord && studentRecord.status === statusFilter);
    return matchesSearch && matchesStatus;
  });

  // Export CSV function with UTF-8 BOM
  const handleExportCSV = () => {
    if (!currentClass) return;
    let csvContent = '\uFEFF';
    csvContent += `BẢNG ĐIỂM DANH LỚP ${currentClass.name} - NGÀY ${selectedDate} - ${selectedPeriod}\r\n`;
    csvContent += `Giáo viên phụ trách: ${currentClass.teacher} | Bài học: ${sessionTopic || 'Toán học'}\r\n\r\n`;
    csvContent += 'STT,Mã Học Sinh,Họ và Tên,Giới Tính,Trạng Thái,Lý Do Vắng/Muộn,Người Xin Phép,Ghi Chú Chi Tiết\r\n';

    classStudents.forEach((st, idx) => {
      const rec = draftRecords[st.id];
      const statusText =
        rec?.status === 'present'
          ? 'Có mặt'
          : rec?.status === 'late'
          ? `Đi muộn (${rec.lateMinutes || 10} phút)`
          : rec?.status === 'excused'
          ? 'Nghỉ có phép'
          : 'Nghỉ không phép';
      const reason = rec?.reasonPreset || (rec?.status === 'present' ? '' : 'Chưa phân loại');
      const requester = rec?.requesterType || '';
      const note = rec?.note ? rec.note.replace(/"/g, '""') : '';

      csvContent += `${idx + 1},${st.code},"${st.name}",${st.gender},"${statusText}","${reason}","${requester}","${note}"\r\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DiemDanh_${currentClass.name}_${selectedDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Đã xuất file CSV điểm danh thành công!');
  };

  // Export Monthly Matrix to CSV
  const handleExportMatrixCSV = () => {
    if (!currentClass) return;
    let csvContent = '\uFEFF';
    csvContent += `BẢNG MA TRẬN CHUYÊN CẦN LỚP ${currentClass.name} - THÁNG ${matrixMonth}\r\n`;
    csvContent += `Giáo viên: ${currentClass.teacher} | Sĩ số: ${classStudents.length} học sinh\r\n\r\n`;

    const sessions = attendanceSessions
      .filter((s) => s.classId === currentClass.id || s.className === currentClass.name)
      .sort((a, b) => a.date.localeCompare(b.date));

    // Header row
    csvContent += 'STT,Mã HS,Họ và Tên';
    sessions.forEach((s) => {
      csvContent += `,${s.date.slice(5)}`;
    });
    csvContent += ',Không Phép (KP),Có Phép (P),Đi Muộn (M),Tỷ Lệ Chuyên Cần (%)\r\n';

    // Rows
    classStudents.forEach((st, idx) => {
      let unexcused = 0;
      let excused = 0;
      let late = 0;
      let total = 0;

      let row = `${idx + 1},${st.code},"${st.name}"`;
      sessions.forEach((sess) => {
        const rec = sess.records.find((r) => r.studentId === st.id);
        if (rec) {
          total++;
          if (rec.status === 'unexcused') {
            unexcused++;
            row += ',KP';
          } else if (rec.status === 'excused') {
            excused++;
            row += ',P';
          } else if (rec.status === 'late') {
            late++;
            row += ',M';
          } else {
            row += ',✓';
          }
        } else {
          row += ',-';
        }
      });

      const rate = total > 0 ? Math.round(((total - unexcused - excused) / total) * 100) : 100;
      row += `,${unexcused},${excused},${late},${rate}%\r\n`;
      csvContent += row;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MaTranChuyenCan_${currentClass.name}_${matrixMonth}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Đã xuất ma trận chuyên cần tháng thành công!');
  };

  // Sessions of current class
  const classSessions = useMemo(() => {
    return attendanceSessions
      .filter((s) => s.classId === selectedClassId || s.className === currentClass?.name)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [attendanceSessions, selectedClassId, currentClass]);

  // Statistics across all sessions of this class
  const studentAbsenceStats = useMemo(() => {
    const stats: {
      [studentId: string]: {
        student: (typeof students)[0];
        unexcused: number;
        excused: number;
        late: number;
        totalSessions: number;
        reasons: string[];
        history: {
          date: string;
          status: AttendanceStatus;
          reason?: string;
          note?: string;
        }[];
      };
    } = {};

    classStudents.forEach((st) => {
      stats[st.id] = {
        student: st,
        unexcused: 0,
        excused: 0,
        late: 0,
        totalSessions: 0,
        reasons: [],
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
            if (rec.reasonPreset && !stats[rec.studentId].reasons.includes(rec.reasonPreset)) {
              stats[rec.studentId].reasons.push(rec.reasonPreset);
            }
            stats[rec.studentId].history.push({
              date: sess.date,
              status: rec.status,
              reason: rec.reasonPreset,
              note: rec.note,
            });
          }
        }
      });
    });

    return Object.values(stats);
  }, [classStudents, classSessions]);

  // At-risk students
  const atRiskStudents = useMemo(() => {
    return studentAbsenceStats
      .filter((s) => s.unexcused + s.excused >= 1 || s.late >= 2)
      .sort((a, b) => b.unexcused * 3 + b.excused - (a.unexcused * 3 + a.excused));
  }, [studentAbsenceStats]);

  // Handle Create Leave Request
  const handleSaveLeaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveFormStudentId) {
      alert('Vui lòng chọn học sinh xin nghỉ!');
      return;
    }

    const targetStudent = students.find((s) => s.id === leaveFormStudentId);
    if (!targetStudent) return;

    const targetClass = classes.find((c) => c.id === leaveFormClassId) || currentClass;

    addLeaveRequest({
      studentId: targetStudent.id,
      studentCode: targetStudent.code,
      studentName: targetStudent.name,
      classId: targetClass.id,
      className: targetClass.name,
      fromDate: leaveFormFromDate,
      toDate: leaveFormToDate,
      reasonCategory: leaveFormReasonCategory,
      detailedReason: leaveFormDetailedReason || leaveFormReasonCategory,
      requesterType: leaveFormRequesterType,
      parentPhone: leaveFormParentPhone || targetStudent.phone,
      status: 'approved',
      notes: leaveFormNotes,
    });

    showToast(`Đã thêm đơn xin phép nghỉ cho em ${targetStudent.name} (${targetClass.name})`);
    setIsLeaveModalOpen(false);

    // Reset form fields
    setLeaveFormDetailedReason('');
    setLeaveFormNotes('');
  };

  // Open create leave modal for current class
  const handleOpenLeaveModal = (presetStudentId?: string) => {
    setLeaveFormClassId(selectedClassId);
    if (presetStudentId) {
      setLeaveFormStudentId(presetStudentId);
      const st = students.find((s) => s.id === presetStudentId);
      if (st?.phone) setLeaveFormParentPhone(st.phone);
    } else if (classStudents.length > 0) {
      setLeaveFormStudentId(classStudents[0].id);
      if (classStudents[0].phone) setLeaveFormParentPhone(classStudents[0].phone);
    }
    setLeaveFormFromDate(selectedDate);
    setLeaveFormToDate(selectedDate);
    setIsLeaveModalOpen(true);
  };

  // Filtered leave requests in Leave Requests Tab
  const filteredLeaveRequests = useMemo(() => {
    return leaveRequests.filter((lr) => {
      const matchClass = leaveFilterClassId === 'all' || lr.classId === leaveFilterClassId;
      const matchStatus = leaveFilterStatus === 'all' || lr.status === leaveFilterStatus;
      const matchSearch =
        lr.studentName.toLowerCase().includes(leaveSearchTerm.toLowerCase()) ||
        lr.studentCode.toLowerCase().includes(leaveSearchTerm.toLowerCase()) ||
        lr.detailedReason.toLowerCase().includes(leaveSearchTerm.toLowerCase());
      return matchClass && matchStatus && matchSearch;
    });
  }, [leaveRequests, leaveFilterClassId, leaveFilterStatus, leaveSearchTerm]);

  // Comparison metrics for all classes
  const classComparisonData = useMemo(() => {
    return classes.map((cls) => {
      const clsStudents = students.filter(
        (s) => s.classId === cls.id || s.className === cls.name
      );
      const clsSessions = attendanceSessions.filter(
        (s) => s.classId === cls.id || s.className === cls.name
      );

      let totalPresent = 0;
      let totalLate = 0;
      let totalExcused = 0;
      let totalUnexcused = 0;
      let totalRecords = 0;

      clsSessions.forEach((sess) => {
        sess.records.forEach((rec) => {
          totalRecords++;
          if (rec.status === 'present') totalPresent++;
          if (rec.status === 'late') totalLate++;
          if (rec.status === 'excused') totalExcused++;
          if (rec.status === 'unexcused') totalUnexcused++;
        });
      });

      const rate =
        totalRecords > 0
          ? Math.round(((totalPresent + totalLate) / totalRecords) * 100)
          : 98;

      return {
        cls,
        studentCount: clsStudents.length,
        sessionCount: clsSessions.length,
        totalPresent,
        totalLate,
        totalExcused,
        totalUnexcused,
        rate,
      };
    });
  }, [classes, students, attendanceSessions]);

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
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="bg-white/20 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider text-blue-100 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
                Hệ thống chuyên cần chuẩn hoá THPT Đan Phượng
              </span>
              <span className="text-xs bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-medium">
                Năm học 2026 - 2027
              </span>
              {activeLeavesForSelectedDate.length > 0 && (
                <span className="text-xs bg-amber-400/30 text-amber-100 border border-amber-300/40 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <CalendarRange className="w-3 h-3 text-amber-200" />
                  {activeLeavesForSelectedDate.length} học sinh có đơn xin nghỉ trước hôm nay
                </span>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold font-serif tracking-tight">
              Phân hệ Điểm danh & Quản lý Chuyên cần theo lớp
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Quản lý sĩ số từng lớp riêng biệt, điểm danh phân loại khoa học (Có mặt / Nghỉ có phép / Nghỉ không phép / Đi muộn), ghi nhận lý do rõ ràng và tự động hóa sổ liên lạc với phụ huynh.
            </p>
          </div>

          {/* Sub-Tab Navigation Bar */}
          <div className="flex flex-wrap items-center bg-black/25 p-1 rounded-xl backdrop-blur-sm border border-white/10 shrink-0 gap-1">
            <button
              onClick={() => setActiveSubTab('daily')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
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
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeSubTab === 'matrix'
                  ? 'bg-white text-[#064A87] shadow-sm font-semibold'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Ma trận tháng</span>
            </button>

            <button
              onClick={() => setActiveSubTab('leave_requests')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all relative ${
                activeSubTab === 'leave_requests'
                  ? 'bg-white text-[#064A87] shadow-sm font-semibold'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileCheck className="w-4 h-4 text-emerald-300" />
              <span>Đơn xin phép & Đặt trước</span>
              {leaveRequests.filter((lr) => lr.status === 'approved').length > 0 && (
                <span className="text-[10px] bg-emerald-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                  {leaveRequests.filter((lr) => lr.status === 'approved').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('warnings')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all relative ${
                activeSubTab === 'warnings'
                  ? 'bg-white text-[#064A87] shadow-sm font-semibold'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <span>Cảnh báo & Sổ liên lạc</span>
              {atRiskStudents.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-400 absolute top-1.5 right-1.5 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('comparison')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeSubTab === 'comparison'
                  ? 'bg-white text-[#064A87] shadow-sm font-semibold'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Thi đua các lớp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Class Selection Pill Bar (Quick 1-Click Class Switching) */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0878D1]" />
            <span>Danh sách các lớp phụ trách ({classes.length} lớp THPT Đan Phượng)</span>
          </div>
          <button
            type="button"
            onClick={() => handleOpenLeaveModal()}
            className="flex items-center gap-1 text-xs font-semibold text-[#0878D1] hover:text-[#064A87] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo đơn xin nghỉ phép trước cho học sinh</span>
          </button>
        </div>

        {/* Classes Horizontal Carousel */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {classes.map((cls) => {
            const isSelected = cls.id === selectedClassId;
            const clsStudentsCount = students.filter(
              (s) => s.classId === cls.id || s.className === cls.name
            ).length;
            const clsAbsencesToday = attendanceSessions
              .filter(
                (s) =>
                  (s.classId === cls.id || s.className === cls.name) &&
                  s.date === selectedDate
              )
              .reduce((acc, curr) => acc + curr.excusedCount + curr.unexcusedCount, 0);

            return (
              <button
                key={cls.id}
                type="button"
                onClick={() => setSelectedClassId(cls.id)}
                className={`text-left p-3 rounded-xl border transition-all relative ${
                  isSelected
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50/50 border-[#0878D1] ring-2 ring-[#0878D1]/30 shadow-sm'
                    : 'bg-[#F8FAFC] border-slate-200 hover:bg-blue-50/40 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-base font-bold ${isSelected ? 'text-[#064A87]' : 'text-slate-800'}`}>
                    Lớp {cls.name}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {clsStudentsCount} HS
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 truncate">
                  {cls.room} • GV: {cls.teacher.split(' ').pop()}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-medium">TB: {cls.avgScore || '7.8'}</span>
                  {clsAbsencesToday > 0 ? (
                    <span className="text-amber-700 bg-amber-100 font-bold px-1.5 py-0.5 rounded text-[10px]">
                      Vắng {clsAbsencesToday}
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-medium">✓ Đầy đủ</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: DAILY ATTENDANCE (ĐIỂM DANH BUỔI HỌC) */}
      {/* ======================================================== */}
      {activeSubTab === 'daily' && (
        <div className="space-y-5">
          {/* Controls: Date, Period & Lesson Topic */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Class Select Dropdown (also synchronized with pill buttons) */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#0878D1]" />
                  Lớp đang điểm danh
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full bg-[#F4F8FC] border border-blue-200 rounded-lg px-3 py-2 text-sm font-bold text-[#064A87] focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
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
                  className="w-full bg-[#F4F8FC] border border-blue-200 rounded-lg px-3 py-2 text-sm font-semibold text-[#12345A] focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
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
                  Chuyên đề / Nội dung bài học
                </label>
                <input
                  type="text"
                  placeholder="VD: Nguyên hàm & Tích phân, Oxyz..."
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  className="w-full bg-[#F4F8FC] border border-blue-200 rounded-lg px-3 py-2 text-sm text-[#12345A] focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
                />
              </div>
            </div>

            {/* Advance Leave Notice Bar for this date if any */}
            {activeLeavesForSelectedDate.length > 0 && (
              <div className="mt-3.5 bg-blue-50/80 border border-blue-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-blue-900 font-medium">
                  <FileCheck className="w-4 h-4 text-[#0878D1] shrink-0" />
                  <span>
                    Hệ thống tự động nhận diện và điền trạng thái <strong>Nghỉ có phép</strong> cho{' '}
                    <strong>{activeLeavesForSelectedDate.length}</strong> học sinh lớp {currentClass?.name} có đơn xin nghỉ trước:
                  </span>
                  <span className="font-semibold text-[#064A87]">
                    {activeLeavesForSelectedDate.map((lr) => lr.studentName).join(', ')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('leave_requests')}
                  className="text-xs text-[#0878D1] font-semibold underline hover:text-[#064A87] shrink-0"
                >
                  Xem chi tiết đơn phép →
                </button>
              </div>
            )}
          </div>

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
                  className="bg-emerald-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${totalCount > 0 ? (presentCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Late */}
            <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-800 text-xs font-semibold">
                <span>Đi muộn (M)</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-amber-700">{lateCount}</span>
                <span className="text-xs text-amber-600">học sinh</span>
              </div>
              <div className="text-[11px] text-amber-700 mt-1">
                {lateCount > 0 ? 'Nhắc nhở tác phong' : 'Đúng giờ 100%'}
              </div>
            </div>

            {/* Excused Absences */}
            <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-blue-800 text-xs font-semibold">
                <span>Nghỉ có phép (P)</span>
                <FileText className="w-4 h-4 text-[#0878D1]" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#0878D1]">{excusedCount}</span>
                <span className="text-xs text-blue-600">học sinh</span>
              </div>
              <div className="text-[11px] text-blue-600 mt-1">
                {excusedCount > 0 ? 'Đã có lý do & người xin' : 'Không có'}
              </div>
            </div>

            {/* Unexcused Absences */}
            <div className="bg-rose-50/60 rounded-xl p-4 border border-rose-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-rose-800 text-xs font-semibold">
                <span>Nghỉ không phép (KP)</span>
                <XCircle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-rose-700">{unexcusedCount}</span>
                <span className="text-xs text-rose-600">học sinh</span>
              </div>
              <div className="text-[11px] text-rose-600 mt-1 font-semibold">
                {unexcusedCount > 0 ? '⚠️ Cần gọi phụ huynh' : 'Không có'}
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
                type="button"
                onClick={handleMarkAllPresent}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-sm"
              >
                <CheckCheck className="w-4 h-4" />
                <span>1-Chạm: Tất cả Có mặt</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenLeaveModal()}
                className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-[#064A87] border border-blue-200 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#0878D1]" />
                <span>Thêm đơn xin nghỉ</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const recordsMap: { [studentId: string]: StudentAttendanceEntry } = {};
                  classStudents.forEach((st) => {
                    const leave = studentActiveLeaveMap.get(st.id);
                    if (leave) {
                      recordsMap[st.id] = {
                        studentId: st.id,
                        studentCode: st.code,
                        studentName: st.name,
                        status: 'excused',
                        reasonPreset: leave.reasonCategory,
                        requesterType: leave.requesterType,
                        note: leave.detailedReason || 'Có đơn xin phép',
                      };
                    } else {
                      recordsMap[st.id] = {
                        studentId: st.id,
                        studentCode: st.code,
                        studentName: st.name,
                        status: 'present',
                      };
                    }
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
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#0878D1]" />
                <span>Xuất file Excel / CSV</span>
              </button>

              <button
                type="button"
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
                type="button"
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
                      ? 'bg-[#0878D1] text-white shadow-xs font-semibold'
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
                    <th className="py-3 px-3 w-10 text-center">STT</th>
                    <th className="py-3 px-3 w-24">Mã HS</th>
                    <th className="py-3 px-4 min-w-[180px]">Họ và Tên Học Sinh</th>
                    <th className="py-3 px-3 w-20 text-center">Giới tính</th>
                    <th className="py-3 px-3 min-w-[320px] text-center">Trạng thái điểm danh</th>
                    <th className="py-3 px-3 min-w-[200px]">Phân loại Lý do</th>
                    <th className="py-3 px-3 min-w-[160px]">Người / Kênh xin</th>
                    <th className="py-3 px-3 min-w-[180px]">Ghi chú chi tiết</th>
                    <th className="py-3 px-3 w-24 text-center">Báo PH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                  {displayedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-slate-400">
                        <UserX className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        Không tìm thấy học sinh nào thuộc lớp {currentClass?.name} phù hợp với bộ lọc hiện tại.
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
                      const activeLeave = studentActiveLeaveMap.get(st.id);

                      return (
                        <tr
                          key={st.id}
                          className={`hover:bg-blue-50/40 transition-colors ${
                            currentStatus === 'unexcused'
                              ? 'bg-rose-50/35'
                              : currentStatus === 'late'
                              ? 'bg-amber-50/25'
                              : currentStatus === 'excused'
                              ? 'bg-blue-50/25'
                              : ''
                          }`}
                        >
                          {/* STT */}
                          <td className="py-3 px-3 text-center text-xs font-semibold text-slate-500">
                            {idx + 1}
                          </td>

                          {/* Code */}
                          <td className="py-3 px-3 text-xs font-mono font-semibold text-slate-700">
                            {st.code}
                          </td>

                          {/* Student Name */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[#12345A] flex items-center gap-1.5 flex-wrap">
                              <span>{st.name}</span>
                              {activeLeave && (
                                <button
                                  type="button"
                                  onClick={() => setViewingLeaveRequest(activeLeave)}
                                  className="inline-flex items-center gap-0.5 text-[10px] bg-blue-100 text-[#0878D1] border border-blue-200 px-1.5 py-0.2 rounded font-medium hover:bg-blue-200"
                                  title="Xem đơn xin nghỉ phép trước"
                                >
                                  <FileCheck className="w-3 h-3 text-[#0878D1]" />
                                  <span>Đơn phép trước</span>
                                </button>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>Lớp: {st.className}</span>
                              {st.phone && <span>SĐT: {st.phone}</span>}
                            </div>
                          </td>

                          {/* Gender */}
                          <td className="py-3 px-3 text-center">
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
                          <td className="py-3 px-3">
                            <div className="flex items-center justify-center gap-1 bg-[#F4F8FC] p-1 rounded-xl border border-blue-100">
                              {/* Present Button */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(st.id, 'present')}
                                className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
                                className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  currentStatus === 'late'
                                    ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300'
                                    : 'text-slate-600 hover:bg-white hover:text-amber-700'
                                }`}
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>Muộn</span>
                                {currentStatus === 'late' && (
                                  <span className="text-[10px] bg-black/20 px-1 rounded">
                                    {rec.lateMinutes || 10}p
                                  </span>
                                )}
                              </button>

                              {/* Excused Button (P) */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(st.id, 'excused')}
                                className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  currentStatus === 'excused'
                                    ? 'bg-[#0878D1] text-white shadow-sm ring-2 ring-blue-300'
                                    : 'text-slate-600 hover:bg-white hover:text-[#0878D1]'
                                }`}
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Có phép</span>
                              </button>

                              {/* Unexcused Button (KP) */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(st.id, 'unexcused')}
                                className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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

                          {/* Reason Preset Dropdown */}
                          <td className="py-3 px-3">
                            {currentStatus === 'present' ? (
                              <span className="text-xs text-slate-400 italic">Đi học đúng giờ</span>
                            ) : (
                              <div className="space-y-1">
                                <select
                                  value={rec.reasonPreset || ''}
                                  onChange={(e) =>
                                    handleReasonPresetChange(
                                      st.id,
                                      e.target.value as AbsenceReasonCategory
                                    )
                                  }
                                  className={`w-full text-xs px-2 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#0878D1] font-medium ${
                                    currentStatus === 'unexcused'
                                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                                      : currentStatus === 'late'
                                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                                      : 'bg-blue-50 border-blue-200 text-blue-900'
                                  }`}
                                >
                                  <option value="">-- Chọn danh mục lý do --</option>
                                  {ABSENCE_REASON_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>

                                {currentStatus === 'late' && (
                                  <div className="flex items-center gap-1 text-[11px] text-amber-800">
                                    <span>Trễ:</span>
                                    <input
                                      type="number"
                                      min={1}
                                      max={60}
                                      value={rec.lateMinutes || 10}
                                      onChange={(e) =>
                                        handleLateMinutesChange(st.id, parseInt(e.target.value) || 10)
                                      }
                                      className="w-12 px-1 py-0.5 bg-white border border-amber-300 rounded text-center text-xs"
                                    />
                                    <span>phút</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Requester Type Dropdown */}
                          <td className="py-3 px-3">
                            {currentStatus === 'present' ? (
                              <span className="text-xs text-slate-300">-</span>
                            ) : (
                              <select
                                value={rec.requesterType || ''}
                                onChange={(e) =>
                                  handleRequesterTypeChange(
                                    st.id,
                                    e.target.value as LeaveRequesterType
                                  )
                                }
                                className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0878D1]"
                              >
                                <option value="">-- Kênh xác nhận --</option>
                                {LEAVE_REQUESTER_OPTIONS.map((req) => (
                                  <option key={req} value={req}>
                                    {req}
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>

                          {/* Specific Note Input */}
                          <td className="py-3 px-3">
                            <input
                              type="text"
                              placeholder={
                                currentStatus === 'late'
                                  ? 'VD: Hỏng xe, muộn 10p...'
                                  : currentStatus === 'excused'
                                  ? 'VD: Ốm sốt, khám tại Viện Mắt...'
                                  : currentStatus === 'unexcused'
                                  ? 'Lý do vắng (nếu có)...'
                                  : 'Ghi chú thêm...'
                              }
                              value={rec.note || ''}
                              onChange={(e) => handleNoteChange(st.id, e.target.value)}
                              className="w-full text-xs px-2.5 py-1.5 bg-[#F4F8FC] border border-blue-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0878D1]"
                            />
                          </td>

                          {/* SMS / Zalo Parent Action */}
                          <td className="py-3 px-3 text-center">
                            {currentStatus === 'unexcused' ||
                            currentStatus === 'late' ||
                            currentStatus === 'excused' ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setSmsModalStudent({
                                    name: st.name,
                                    code: st.code,
                                    phone: st.phone,
                                    status: currentStatus,
                                    reasonPreset: rec.reasonPreset,
                                    note: rec.note,
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
                Ghi chú chung cho buổi học (nề nếp, kỷ luật, bài tập về nhà môn Toán):
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
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#064A87]">
                  Bảng Ma trận Chuyên cần Lớp {currentClass?.name}
                </h2>
                <span className="bg-blue-100 text-[#0878D1] text-xs font-bold px-2 py-0.5 rounded">
                  Khối {currentClass?.grade}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tổng hợp tình trạng điểm danh của tất cả học sinh lớp {currentClass?.name} theo từng buổi học đã ghi nhận trong hệ thống.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Có mặt (✓)
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Muộn (M)
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
                  <FileText className="w-3.5 h-3.5 text-blue-500" /> Có phép (P)
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-rose-700">
                  <XCircle className="w-3.5 h-3.5 text-rose-500" /> Không phép (KP)
                </span>
              </div>

              <button
                type="button"
                onClick={handleExportMatrixCSV}
                className="flex items-center gap-1.5 bg-[#0878D1] text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm hover:bg-[#064A87]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất bảng tổng hợp Excel</span>
              </button>
            </div>
          </div>

          {classSessions.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CalendarDays className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600">Chưa có buổi điểm danh nào được lưu cho lớp {currentClass?.name}.</p>
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
                    <th className="py-2.5 px-3 text-center font-bold text-rose-700">Không phép (KP)</th>
                    <th className="py-2.5 px-3 text-center font-bold text-blue-700">Có phép (P)</th>
                    <th className="py-2.5 px-3 text-center font-bold text-amber-700">Muộn (M)</th>
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
                                <span
                                  className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]"
                                  title={`Đi muộn ${rec.lateMinutes || 10}p: ${rec.reasonPreset || ''}`}
                                >
                                  M
                                </span>
                              </td>
                            );
                          }
                          if (rec.status === 'excused') {
                            return (
                              <td key={sessionId} className="py-2.5 px-3 text-center">
                                <span
                                  className="inline-block px-1.5 py-0.5 rounded bg-blue-100 text-[#0878D1] font-bold text-[10px]"
                                  title={`Nghỉ có phép: ${rec.reasonPreset || ''} (${rec.note || ''})`}
                                >
                                  P
                                </span>
                              </td>
                            );
                          }
                          return (
                            <td key={sessionId} className="py-2.5 px-3 text-center">
                              <span
                                className="inline-block px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px]"
                                title={`Nghỉ không phép: ${rec.note || ''}`}
                              >
                                KP
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
      {/* SUB-TAB 3: ADVANCE LEAVE REQUESTS (ĐƠN XIN NGHỈ PHÉP TRƯỚC) */}
      {/* ======================================================== */}
      {activeSubTab === 'leave_requests' && (
        <div className="space-y-5">
          {/* Top Info Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <FileCheck className="w-6 h-6 text-[#0878D1] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-base text-[#064A87]">
                  Quản lý Đơn xin nghỉ phép & Đặt trước ngày nghỉ
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  Ghi nhận trước các đơn xin nghỉ của học sinh (ốm điều trị, khám bệnh, việc gia đình, cử đi thi HSG...). Khi đến ngày được phê duyệt, hệ thống sẽ <strong>tự động gán trạng thái Nghỉ có phép</strong> kèm lý do chuẩn xác trong bảng điểm danh hàng ngày.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenLeaveModal()}
              className="flex items-center justify-center gap-2 bg-[#0878D1] hover:bg-[#064A87] text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo đơn xin nghỉ mới</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Class */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium">Lớp:</span>
                <select
                  value={leaveFilterClassId}
                  onChange={(e) => setLeaveFilterClassId(e.target.value)}
                  className="bg-[#F4F8FC] border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs text-[#064A87] font-semibold focus:outline-none"
                >
                  <option value="all">Tất cả các lớp</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      Lớp {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Status */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium">Trạng thái:</span>
                <select
                  value={leaveFilterStatus}
                  onChange={(e) => setLeaveFilterStatus(e.target.value as any)}
                  className="bg-[#F4F8FC] border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs text-[#064A87] font-semibold focus:outline-none"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="approved">Đã duyệt (Có hiệu lực)</option>
                  <option value="pending">Đang chờ xem xét</option>
                  <option value="rejected">Từ chối</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tên HS, mã số, lý do..."
                value={leaveSearchTerm}
                onChange={(e) => setLeaveSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F4F8FC] border border-blue-200 rounded-lg text-[#12345A] focus:outline-none"
              />
            </div>
          </div>

          {/* Leave Requests Table */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#064A87]/5 text-[#064A87] font-semibold border-b border-blue-100 uppercase tracking-wider">
                    <th className="py-3 px-3 w-10 text-center">STT</th>
                    <th className="py-3 px-3">Học Sinh</th>
                    <th className="py-3 px-3">Lớp</th>
                    <th className="py-3 px-3">Thời Gian Nghỉ</th>
                    <th className="py-3 px-3">Danh Mục Lý Do</th>
                    <th className="py-3 px-3 min-w-[200px]">Chi Tiết Lý Do</th>
                    <th className="py-3 px-3">Người Xin Phép</th>
                    <th className="py-3 px-3">Trạng Thái</th>
                    <th className="py-3 px-3 text-center">Tác Vụ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                  {filteredLeaveRequests.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-slate-400">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        Chưa có đơn xin nghỉ phép nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredLeaveRequests.map((lr, idx) => {
                      const isMultiDay = lr.fromDate !== lr.toDate;

                      return (
                        <tr key={lr.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="py-3 px-3 text-center text-slate-500 font-semibold">{idx + 1}</td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-[#12345A]">{lr.studentName}</div>
                            <div className="text-[11px] font-mono text-slate-400">{lr.studentCode}</div>
                          </td>
                          <td className="py-3 px-3 font-semibold text-[#064A87]">{lr.className}</td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-800">
                              {isMultiDay ? `${lr.fromDate} → ${lr.toDate}` : lr.fromDate}
                            </div>
                            <div className="text-[10px] text-blue-600">
                              {isMultiDay ? 'Nghỉ nhiều ngày' : 'Nghỉ 1 ngày'}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-block bg-blue-100 text-[#0878D1] px-2 py-0.5 rounded font-semibold text-[11px]">
                              {lr.reasonCategory}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-700">
                            <div>{lr.detailedReason}</div>
                            {lr.notes && (
                              <div className="text-[10px] text-slate-400 mt-0.5 italic">
                                Ghi chú: {lr.notes}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-medium text-slate-800">{lr.requesterType}</div>
                            {lr.parentPhone && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                SĐT: {lr.parentPhone}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                lr.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : lr.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {lr.status === 'approved' ? (
                                <>
                                  <Check className="w-3 h-3" /> Đã duyệt
                                </>
                              ) : lr.status === 'pending' ? (
                                'Chờ duyệt'
                              ) : (
                                'Từ chối'
                              )}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {lr.status === 'pending' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateLeaveRequest(lr.id, { status: 'approved' });
                                    showToast(`Đã duyệt đơn xin phép của em ${lr.studentName}`);
                                  }}
                                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded font-semibold"
                                  title="Duyệt đơn"
                                >
                                  Duyệt
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setViewingLeaveRequest(lr)}
                                className="text-xs text-[#0878D1] hover:bg-blue-50 p-1 rounded"
                                title="Xem chi tiết đơn"
                              >
                                <Info className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Xác nhận xóa đơn xin nghỉ của em ${lr.studentName}?`)) {
                                    deleteLeaveRequest(lr.id);
                                    showToast('Đã xóa đơn xin nghỉ.');
                                  }
                                }}
                                className="text-xs text-rose-600 hover:bg-rose-50 p-1 rounded"
                                title="Xóa đơn"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 4: WARNINGS & STUDENT ATTENDANCE DOSSIER */}
      {/* ======================================================== */}
      {activeSubTab === 'warnings' && (
        <div className="space-y-6">
          {/* Warning Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">Quy chế chuyên cần THPT:</span> Học sinh nghỉ học quá 45 buổi trong một năm học (nghỉ có phép hoặc không phép) sẽ không được lên lớp. Học sinh vắng từ 3 buổi không phép trong tháng cần được giáo viên thông báo trực tiếp cho phụ huynh và Ban giám hiệu nhà trường.
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-[#064A87] flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-rose-600" />
                  Danh sách học sinh có nguy cơ chuyên cần (Lớp {currentClass?.name})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tự động lọc những học sinh đã vắng học (có phép / không phép) hoặc đi muộn nhiều lần trong các tiết học môn Toán.
                </p>
              </div>

              <span className="text-xs bg-rose-100 text-rose-800 font-semibold px-3 py-1 rounded-full">
                {atRiskStudents.length} học sinh cần theo dõi
              </span>
            </div>

            {atRiskStudents.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">Tuyệt vời! Không có học sinh nào bị cảnh báo chuyên cần.</p>
                <p className="text-xs text-slate-400 mt-1">Tất cả học sinh lớp {currentClass?.name} đều tham gia học tập đầy đủ và đúng giờ.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {atRiskStudents.map(({ student, unexcused, excused, late, reasons, history }) => {
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

                      {/* Reasons Summary */}
                      {reasons.length > 0 && (
                        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] text-slate-500">Lý do đã ghi:</span>
                          {reasons.map((r, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      )}

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
                                  {h.reason ? ` (${h.reason})` : h.note ? ` (${h.note})` : ''}
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
                                reasonPreset: reasons[0],
                                date: selectedDate,
                                className: student.className,
                              })
                            }
                            className="flex items-center gap-1 text-xs bg-[#0878D1] hover:bg-[#064A87] text-white px-3 py-1 rounded-md font-semibold transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            <span>Báo PH qua SMS/Zalo</span>
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
      {/* SUB-TAB 5: CLASS COMPARISON & EMULATION (THI ĐUA CHUYÊN CẦN CÁC LỚP) */}
      {/* ======================================================== */}
      {activeSubTab === 'comparison' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center justify-between border-b border-blue-100 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#064A87] flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Bảng Thống kê & Xếp hạng Chuyên cần các Lớp phụ trách
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Đánh giá so sánh tỷ lệ đi học đúng giờ, tỷ lệ nghỉ phép và nghỉ không phép giữa các lớp 12A3, 12A4, 12A12, 12A13, 12A14.
                </p>
              </div>

              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Lớp 12A4 (100% Đạt chuẩn)
              </span>
            </div>

            {/* Grid Cards for All Classes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classComparisonData.map(({ cls, studentCount, sessionCount, totalPresent, totalLate, totalExcused, totalUnexcused, rate }, rankIdx) => {
                return (
                  <div
                    key={cls.id}
                    className={`rounded-xl p-5 border transition-all ${
                      cls.name === '12A4'
                        ? 'bg-gradient-to-br from-emerald-50/50 to-teal-50/40 border-emerald-300 ring-1 ring-emerald-200'
                        : cls.id === selectedClassId
                        ? 'bg-blue-50/40 border-blue-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-[#064A87]">Lớp {cls.name}</span>
                          {cls.name === '12A4' && (
                            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Xuất sắc
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {cls.room} • GV: {cls.teacher}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-black text-[#0878D1]">{rate}%</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Chuyên cần</div>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
                      <div
                        className={`h-2 rounded-full ${
                          rate >= 95 ? 'bg-emerald-500' : rate >= 85 ? 'bg-[#0878D1]' : 'bg-amber-500'
                        }`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
                      <div className="bg-white/80 p-2 rounded-lg border border-slate-100">
                        <div className="text-slate-400 text-[10px]">Sĩ số</div>
                        <div className="font-bold text-[#12345A]">{studentCount} HS</div>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg border border-slate-100">
                        <div className="text-slate-400 text-[10px]">Có phép (P)</div>
                        <div className="font-bold text-blue-600">{totalExcused}</div>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg border border-slate-100">
                        <div className="text-slate-400 text-[10px]">Không phép</div>
                        <div className="font-bold text-rose-600">{totalUnexcused}</div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Điểm TB: <strong className="text-emerald-700">{cls.avgScore}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClassId(cls.id);
                          setActiveSubTab('daily');
                        }}
                        className="text-xs text-[#0878D1] hover:text-[#064A87] font-semibold underline"
                      >
                        Vào điểm danh lớp này →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* POPUP / MODAL: CREATE LEAVE REQUEST (ĐƠN XIN NGHỈ PHÉP) */}
      {/* ======================================================== */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-blue-200 animate-scale-up space-y-4">
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#0878D1]" />
                <h3 className="font-bold text-base text-[#064A87]">
                  Tạo Đơn xin nghỉ phép & Đặt trước ngày nghỉ
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLeaveRequest} className="space-y-3.5 text-xs">
              {/* Select Class */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chọn lớp học:</label>
                  <select
                    value={leaveFormClassId}
                    onChange={(e) => {
                      setLeaveFormClassId(e.target.value);
                      const clsSts = students.filter(
                        (s) => s.classId === e.target.value || s.className === e.target.value
                      );
                      if (clsSts.length > 0) {
                        setLeaveFormStudentId(clsSts[0].id);
                        if (clsSts[0].phone) setLeaveFormParentPhone(clsSts[0].phone);
                      }
                    }}
                    className="w-full p-2 bg-[#F4F8FC] border border-blue-200 rounded-lg text-xs font-semibold text-[#064A87] focus:outline-none"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        Lớp {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Student */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Học sinh xin nghỉ:</label>
                  <select
                    value={leaveFormStudentId}
                    onChange={(e) => {
                      setLeaveFormStudentId(e.target.value);
                      const st = students.find((s) => s.id === e.target.value);
                      if (st?.phone) setLeaveFormParentPhone(st.phone);
                    }}
                    className="w-full p-2 bg-[#F4F8FC] border border-blue-200 rounded-lg text-xs font-bold text-[#12345A] focus:outline-none"
                  >
                    {students
                      .filter(
                        (s) => s.classId === leaveFormClassId || s.className === leaveFormClassId
                      )
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Date Range: From Date -> To Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nghỉ từ ngày:</label>
                  <input
                    type="date"
                    required
                    value={leaveFormFromDate}
                    onChange={(e) => setLeaveFormFromDate(e.target.value)}
                    className="w-full p-2 bg-[#F4F8FC] border border-blue-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Đến hết ngày:</label>
                  <input
                    type="date"
                    required
                    value={leaveFormToDate}
                    onChange={(e) => setLeaveFormToDate(e.target.value)}
                    className="w-full p-2 bg-[#F4F8FC] border border-blue-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Reason Category & Requester */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Danh mục lý do:</label>
                  <select
                    value={leaveFormReasonCategory}
                    onChange={(e) => setLeaveFormReasonCategory(e.target.value as any)}
                    className="w-full p-2 bg-[#F4F8FC] border border-blue-200 rounded-lg text-xs font-medium text-[#12345A] focus:outline-none"
                  >
                    {ABSENCE_REASON_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Người / Kênh xin phép:</label>
                  <select
                    value={leaveFormRequesterType}
                    onChange={(e) => setLeaveFormRequesterType(e.target.value as any)}
                    className="w-full p-2 bg-[#F4F8FC] border border-blue-200 rounded-lg text-xs font-medium text-[#12345A] focus:outline-none"
                  >
                    {LEAVE_REQUESTER_OPTIONS.map((req) => (
                      <option key={req} value={req}>
                        {req}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Detailed Reason */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lý do chi tiết (sốt, mổ ruột thừa, việc gia đình hiếu hỉ, thi HSG...):
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ghi rõ lý do xin nghỉ của học sinh..."
                  value={leaveFormDetailedReason}
                  onChange={(e) => setLeaveFormDetailedReason(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F8FC] border border-blue-200 rounded-lg text-xs focus:outline-none"
                />
              </div>

              {/* Parent Phone & Teacher Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SĐT liên hệ phụ huynh:</label>
                  <input
                    type="text"
                    placeholder="0912 345 678"
                    value={leaveFormParentPhone}
                    onChange={(e) => setLeaveFormParentPhone(e.target.value)}
                    className="w-full p-2 bg-[#F4F8FC] border border-blue-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ghi chú thêm:</label>
                  <input
                    type="text"
                    placeholder="Đã báo GVCN, có giấy ra viện..."
                    value={leaveFormNotes}
                    onChange={(e) => setLeaveFormNotes(e.target.value)}
                    className="w-full p-2 bg-[#F4F8FC] border border-blue-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-[#0878D1] hover:bg-[#064A87] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Lưu & Phê duyệt đơn nghỉ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* POPUP / MODAL: VIEW LEAVE REQUEST DETAILS */}
      {/* ======================================================== */}
      {viewingLeaveRequest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-blue-200 animate-scale-up space-y-4">
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0878D1]" />
                <h3 className="font-bold text-base text-[#064A87]">
                  Chi tiết Đơn xin nghỉ phép
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingLeaveRequest(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-blue-50/70 p-3 rounded-xl space-y-1.5 border border-blue-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Học sinh:</span>
                  <span className="font-bold text-[#12345A]">{viewingLeaveRequest.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã số:</span>
                  <span className="font-mono font-semibold">{viewingLeaveRequest.studentCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lớp:</span>
                  <span className="font-bold text-[#064A87]">{viewingLeaveRequest.className}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Thời gian nghỉ:</span>
                  <span className="font-bold text-slate-800">
                    {viewingLeaveRequest.fromDate === viewingLeaveRequest.toDate
                      ? viewingLeaveRequest.fromDate
                      : `${viewingLeaveRequest.fromDate} đến ${viewingLeaveRequest.toDate}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Danh mục:</span>
                  <span className="font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    {viewingLeaveRequest.reasonCategory}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Người xin phép:</span>
                  <span className="font-medium text-slate-800">{viewingLeaveRequest.requesterType}</span>
                </div>

                {viewingLeaveRequest.parentPhone && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Số điện thoại phụ huynh:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {viewingLeaveRequest.parentPhone}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Nội dung chi tiết:</label>
                <div className="p-3 bg-[#F4F8FC] border border-blue-100 rounded-lg text-slate-800 leading-relaxed font-sans">
                  {viewingLeaveRequest.detailedReason}
                </div>
              </div>

              {viewingLeaveRequest.notes && (
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Ghi chú của giáo viên:</label>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 italic">
                    {viewingLeaveRequest.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {viewingLeaveRequest.parentPhone && (
                <a
                  href={`tel:${viewingLeaveRequest.parentPhone}`}
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg font-semibold"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Gọi PH</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => setViewingLeaveRequest(null)}
                className="ml-auto px-4 py-2 text-xs font-semibold bg-[#0878D1] text-white rounded-lg hover:bg-[#064A87]"
              >
                Đóng
              </button>
            </div>
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
                type="button"
                onClick={() => setSmsModalStudent(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-blue-50/60 p-3 rounded-xl border border-blue-100">
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
                {smsModalStudent.reasonPreset && (
                  <span className="text-slate-700 ml-1">({smsModalStudent.reasonPreset})</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nội dung tin nhắn mẫu (SMS / Zalo):
              </label>
              <textarea
                rows={4}
                defaultValue={`[THPT Đan Phượng] Kính gửi phụ huynh em ${smsModalStudent.name} (Lớp ${smsModalStudent.className}), hôm nay ngày ${smsModalStudent.date}, thầy Bùi Ngọc Thắng ghi nhận em ${smsModalStudent.status === 'unexcused' ? 'vắng mặt không phép' : smsModalStudent.status === 'late' ? 'đến lớp muộn' : 'nghỉ học có phép'} trong giờ học môn Toán${smsModalStudent.reasonPreset ? ` (Lý do: ${smsModalStudent.reasonPreset})` : ''}. Kính đề nghị phụ huynh kiểm tra và phối hợp theo dõi cùng nhà trường.`}
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
                      `[THPT Đan Phượng] Kính gửi phụ huynh em ${smsModalStudent.name} (Lớp ${smsModalStudent.className}), hôm nay ngày ${smsModalStudent.date}, thầy Bùi Ngọc Thắng ghi nhận em ${smsModalStudent.status === 'unexcused' ? 'vắng mặt không phép' : smsModalStudent.status === 'late' ? 'đến lớp muộn' : 'nghỉ học có phép'} trong giờ học môn Toán${smsModalStudent.reasonPreset ? ` (Lý do: ${smsModalStudent.reasonPreset})` : ''}. Kính đề nghị phụ huynh kiểm tra và trao đổi cùng thầy Thắng qua số 0988 123 456.`
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
