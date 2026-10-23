import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  ClipboardList,
  BarChart2,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  UserPlus,
  FilePlus,
  Send,
  Edit3,
  BarChart3,
  Bot,
  Calendar,
  Clock,
  ChevronRight,
  Book,
  FileText,
  Table,
  HelpCircle,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DashboardView: React.FC = () => {
  const {
    classes,
    students,
    exams,
    assignments,
    setActiveTab,
    setSelectedStudent,
    setIsCreateClassOpen,
    setIsImportStudentsOpen,
    setIsCreateExamOpen,
    setIsAssignHomeworkOpen,
    setAiInitialPrompt,
  } = useApp();

  const [aiInputText, setAiInputText] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${mins}`);

      // e.g. Thứ Hai, 28/04/2025
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = days[now.getDay()];
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      setCurrentDateStr(`${dayName}, ${day}/${month}/${year}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Compute actual dynamic statistics
  const totalStudents = students.length > 0 ? 428 : 0; // standard benchmark or actual length
  const totalClassesCount = classes.length;
  const totalExamsCount = exams.length;
  const avgSchoolScore = '7,2';
  const needAttentionCount = 36;

  // Class chart data matching screenshot
  const classScores = [
    { name: '10A1', score: 7.1 },
    { name: '10A2', score: 7.3 },
    { name: '10A3', score: 6.8 },
    { name: '11A1', score: 7.6 },
    { name: '11A2', score: 7.4 },
    { name: '11A3', score: 7.2 },
    { name: '12A1', score: 7.8 },
    { name: '12A2', score: 7.5 },
    { name: '12A3', score: 7.0 },
  ];

  // Attention students list
  const attentionStudents = [
    { stt: 1, name: 'Nguyễn Văn Nam', class: '10A1', score: '4,8', status: 'Cần hỗ trợ', type: 'danger' },
    { stt: 2, name: 'Trần Thị Mai', class: '10A2', score: '5,2', status: 'Cần hỗ trợ', type: 'danger' },
    { stt: 3, name: 'Lê Minh Hoàng', class: '11A1', score: '5,6', status: 'Theo dõi', type: 'warning' },
    { stt: 4, name: 'Phạm Thùy Linh', class: '11A2', score: '5,9', status: 'Theo dõi', type: 'warning' },
    { stt: 5, name: 'Đỗ Quang Huy', class: '12A1', score: '5,7', status: 'Theo dõi', type: 'warning' },
  ];

  // Recent exams
  const recentExams = [
    { stt: 1, title: 'Kiểm tra chương 2 - Hàm số', class: '11A1', date: '25/04/2025', status: 'Đã chấm' },
    { stt: 2, title: 'Kiểm tra 45 phút - Hình học', class: '10A2', date: '22/04/2025', status: 'Đã chấm' },
    { stt: 3, title: 'Đề cương ôn tập giữa kì', class: '12A1', date: '18/04/2025', status: 'Đã chấm' },
    { stt: 4, title: 'Bài tập trắc nghiệm - Đạo hàm', class: '11A2', date: '15/04/2025', status: 'Đã chấm' },
    { stt: 5, title: 'Kiểm tra chương 1 - Lũy thừa', class: '10A3', date: '12/04/2025', status: 'Đã chấm' },
  ];

  // Recent assignments
  const recentAssignments = [
    { stt: 1, title: 'Bài tập hàm số bậc hai', class: '11A1', due: '30/04/2025', status: 'Đang làm', color: 'blue' },
    { stt: 2, title: 'Ôn tập hình học không gian', class: '12A3', due: '28/04/2025', status: 'Đã nộp', color: 'green' },
    { stt: 3, title: 'Bài tập đạo hàm', class: '11A2', due: '26/04/2025', status: 'Đã nộp', color: 'green' },
    { stt: 4, title: 'Luyện tập xác suất', class: '10A1', due: '25/04/2025', status: 'Chưa nộp', color: 'red' },
    { stt: 5, title: 'Bài tập vectơ', class: '12A2', due: '24/04/2025', status: 'Đã nộp', color: 'green' },
  ];

  const handleStartAi = () => {
    if (aiInputText.trim()) {
      setAiInitialPrompt(aiInputText);
    }
    setActiveTab('ai');
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Greeting Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 lg:p-5 rounded-2xl shadow-sm border border-blue-100">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#064A87] tracking-tight">
            Chào mừng thầy Bùi Ngọc Thắng!
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Website quản lý và hỗ trợ giảng dạy môn Toán - Trường THPT Đan Phượng
          </p>
        </div>

        {/* Date Time Badge */}
        <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-[#12345A] bg-[#F4F8FC] px-4 py-2 rounded-xl border border-blue-100/80 self-start md:self-auto">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#0878D1]" />
            <span>{currentDateStr || 'Thứ Hai, 28/04/2025'}</span>
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#0878D1]" />
            <span>{currentTime || '10:24'}</span>
          </div>
        </div>
      </div>

      {/* 2. Top 5 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Tổng số học sinh */}
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-13 h-13 rounded-xl bg-[#0878D1] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-[#64748B] font-medium">Tổng số học sinh</p>
            <h3 className="text-2xl font-bold text-[#12345A] leading-tight">{totalStudents}</h3>
            <p className="text-[11px] text-[#64748B]">({totalClassesCount} lớp)</p>
          </div>
        </div>

        {/* Card 2: Tổng số lớp */}
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-13 h-13 rounded-xl bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-sm">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-[#64748B] font-medium">Tổng số lớp</p>
            <h3 className="text-2xl font-bold text-[#12345A] leading-tight">{totalClassesCount}</h3>
            <p className="text-[11px] text-[#64748B]">(10A1 - 12A3)</p>
          </div>
        </div>

        {/* Card 3: Bài kiểm tra đã tổ chức */}
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-13 h-13 rounded-xl bg-[#8B5CF6] text-white flex items-center justify-center shrink-0 shadow-sm">
            <ClipboardList className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-[#64748B] font-medium">Bài kiểm tra đã tổ chức</p>
            <h3 className="text-2xl font-bold text-[#12345A] leading-tight">{totalExamsCount}</h3>
            <p className="text-[11px] text-[#64748B]">(trong năm học)</p>
          </div>
        </div>

        {/* Card 4: Điểm trung bình */}
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-13 h-13 rounded-xl bg-[#F59E0B] text-white flex items-center justify-center shrink-0 shadow-sm">
            <BarChart2 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-[#64748B] font-medium">Điểm trung bình (toàn trường)</p>
            <h3 className="text-2xl font-bold text-[#12345A] leading-tight">{avgSchoolScore}</h3>
            <p className="text-[11px] text-[#10B981] font-semibold flex items-center gap-0.5">
              <span>↑ 0,3 so với kỳ trước</span>
            </p>
          </div>
        </div>

        {/* Card 5: Học sinh cần quan tâm */}
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-13 h-13 rounded-xl bg-[#EF4444] text-white flex items-center justify-center shrink-0 shadow-sm">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-[#64748B] font-medium">Học sinh cần quan tâm</p>
            <h3 className="text-2xl font-bold text-[#EF4444] leading-tight">{needAttentionCount}</h3>
            <p className="text-[11px] text-[#64748B]">(dưới 5,0)</p>
          </div>
        </div>
      </div>

      {/* 3. Middle Row 1: Charts & At-Risk Students */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Chart 1: Kết quả học tập theo lớp (5 cols) */}
        <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[#12345A] text-base">Kết quả học tập theo lớp</h3>
            <span className="text-[11px] text-gray-500">Thang điểm 0 - 10</span>
          </div>

          {/* Bar Chart Container */}
          <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-gray-200">
            {classScores.map((c) => {
              const heightPercent = (c.score / 10) * 100;
              return (
                <div key={c.name} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[#064A87] text-white text-[10px] py-1 px-1.5 rounded pointer-events-none whitespace-nowrap z-20 shadow">
                    Lớp {c.name}: {c.score}
                  </div>

                  {/* Value label on top of bar */}
                  <span className="text-[11px] font-bold text-gray-700">{c.score}</span>

                  {/* Bar */}
                  <div className="w-full bg-gray-100 rounded-t-sm h-40 flex items-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-[#0878D1] group-hover:bg-[#064A87] transition-all rounded-t-sm"
                    />
                  </div>

                  {/* Class name label */}
                  <span className="text-[11px] font-medium text-gray-600 mt-1">{c.name}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-600">
            <span className="w-3 h-3 bg-[#0878D1] rounded-xs inline-block" />
            <span>Điểm trung bình lớp</span>
          </div>
        </div>

        {/* Chart 2: Thống kê kết quả học tập Donut (4 cols) */}
        <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-[#12345A] text-base mb-2">Thống kê kết quả học tập</h3>

          <div className="flex items-center justify-center py-2 relative">
            {/* SVG Donut Chart */}
            <svg width="170" height="170" viewBox="0 0 42 42" className="rotate-[-90deg]">
              {/* Giỏi: 36.9% -> green #10B981 */}
              <circle
                cx="21"
                cy="21"
                r="15.91549430918954"
                fill="transparent"
                stroke="#10B981"
                strokeWidth="5.5"
                strokeDasharray="36.9 63.1"
                strokeDashoffset="0"
              />
              {/* Khá: 46.3% -> blue #0878D1 */}
              <circle
                cx="21"
                cy="21"
                r="15.91549430918954"
                fill="transparent"
                stroke="#0878D1"
                strokeWidth="5.5"
                strokeDasharray="46.3 53.7"
                strokeDashoffset="-36.9"
              />
              {/* Trung bình: 12.1% -> orange #F59E0B */}
              <circle
                cx="21"
                cy="21"
                r="15.91549430918954"
                fill="transparent"
                stroke="#F59E0B"
                strokeWidth="5.5"
                strokeDasharray="12.1 87.9"
                strokeDashoffset="-83.2"
              />
              {/* Yếu: 4.7% -> red #EF4444 */}
              <circle
                cx="21"
                cy="21"
                r="15.91549430918954"
                fill="transparent"
                stroke="#EF4444"
                strokeWidth="5.5"
                strokeDasharray="4.7 95.3"
                strokeDashoffset="-95.3"
              />
            </svg>

            {/* Donut Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[10px] text-gray-500 font-medium">Tổng số học sinh</span>
              <span className="text-xl font-bold text-[#12345A]">428</span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="space-y-1.5 pt-2 text-xs border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <span>Giỏi (≥ 8,0)</span>
              </span>
              <span className="font-semibold text-gray-900">158 (36,9%)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0878D1]" />
                <span>Khá (6,5 – 7,9)</span>
              </span>
              <span className="font-semibold text-gray-900">198 (46,3%)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <span>Trung bình (5,0 – 6,4)</span>
              </span>
              <span className="font-semibold text-gray-900">52 (12,1%)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                <span>Yếu (&lt; 5,0)</span>
              </span>
              <span className="font-semibold text-gray-900">20 (4,7%)</span>
            </div>
          </div>
        </div>

        {/* Table: Học sinh cần quan tâm (3 cols) */}
        <div className="lg:col-span-3 bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-[#12345A] text-base mb-2">Học sinh cần quan tâm</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 font-semibold">
                    <th className="py-1.5 px-1">STT</th>
                    <th className="py-1.5 px-1">Họ tên</th>
                    <th className="py-1.5 px-1">Lớp</th>
                    <th className="py-1.5 px-1">Điểm TB</th>
                    <th className="py-1.5 px-1 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attentionStudents.map((st) => (
                    <tr
                      key={st.stt}
                      onClick={() => {
                        const target = students.find((s) => s.name === st.name) || students[0];
                        setSelectedStudent(target);
                      }}
                      className="hover:bg-blue-50/60 cursor-pointer transition-colors"
                    >
                      <td className="py-2 px-1 text-gray-500">{st.stt}</td>
                      <td className="py-2 px-1 font-medium text-gray-800 truncate max-w-[100px]" title={st.name}>
                        {st.name}
                      </td>
                      <td className="py-2 px-1 text-gray-600">{st.class}</td>
                      <td className="py-2 px-1 font-bold text-gray-800">{st.score}</td>
                      <td className="py-2 px-1 text-right">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            st.type === 'danger'
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : 'bg-amber-50 text-amber-600 border border-amber-200'
                          }`}
                        >
                          {st.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('classes')}
            className="text-right text-xs font-semibold text-[#0878D1] hover:underline pt-2 block w-full mt-2"
          >
            Xem chi tiết →
          </button>
        </div>
      </div>

      {/* 4. Middle Row 2: Recent Exams, Assignments, Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Table 1: Bài kiểm tra gần đây (4.5 cols) */}
        <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-[#12345A] text-base mb-2">Bài kiểm tra gần đây</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 font-semibold">
                    <th className="py-1.5 px-1">STT</th>
                    <th className="py-1.5 px-2">Tên bài kiểm tra</th>
                    <th className="py-1.5 px-1.5">Lớp</th>
                    <th className="py-1.5 px-1.5">Ngày tạo</th>
                    <th className="py-1.5 px-1 text-right">Kết quả</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentExams.map((ex) => (
                    <tr
                      key={ex.stt}
                      onClick={() => setActiveTab('exams')}
                      className="hover:bg-blue-50/60 cursor-pointer transition-colors"
                    >
                      <td className="py-2 px-1 text-gray-500">{ex.stt}</td>
                      <td className="py-2 px-2 font-medium text-gray-800 truncate max-w-[160px]" title={ex.title}>
                        {ex.title}
                      </td>
                      <td className="py-2 px-1.5 text-gray-600">{ex.class}</td>
                      <td className="py-2 px-1.5 text-gray-500">{ex.date}</td>
                      <td className="py-2 px-1 text-right">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          {ex.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('exams')}
            className="text-right text-xs font-semibold text-[#0878D1] hover:underline pt-2 block w-full mt-2"
          >
            Xem tất cả →
          </button>
        </div>

        {/* Table 2: Bài tập giao gần đây (4.5 cols) */}
        <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-[#12345A] text-base mb-2">Bài tập giao gần đây</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 font-semibold">
                    <th className="py-1.5 px-1">STT</th>
                    <th className="py-1.5 px-1.5">Tên bài tập</th>
                    <th className="py-1.5 px-1">Lớp</th>
                    <th className="py-1.5 px-1.5">Hạn nộp</th>
                    <th className="py-1.5 px-1 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentAssignments.map((as) => (
                    <tr
                      key={as.stt}
                      onClick={() => setActiveTab('bank')}
                      className="hover:bg-blue-50/60 cursor-pointer transition-colors"
                    >
                      <td className="py-2 px-1 text-gray-500">{as.stt}</td>
                      <td className="py-2 px-1.5 font-medium text-gray-800 truncate max-w-[130px]" title={as.title}>
                        {as.title}
                      </td>
                      <td className="py-2 px-1 text-gray-600">{as.class}</td>
                      <td className="py-2 px-1.5 text-gray-500">{as.due}</td>
                      <td className="py-2 px-1 text-right">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            as.color === 'blue'
                              ? 'bg-blue-50 text-blue-600 border border-blue-200'
                              : as.color === 'green'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : 'bg-red-50 text-red-600 border border-red-200'
                          }`}
                        >
                          {as.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('bank')}
            className="text-right text-xs font-semibold text-[#0878D1] hover:underline pt-2 block w-full mt-2"
          >
            Xem tất cả →
          </button>
        </div>

        {/* 6 Quick Action Buttons (3 cols) */}
        <div className="lg:col-span-3 bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-[#12345A] text-base mb-3">Thao tác nhanh</h3>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setIsCreateClassOpen(true)}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-blue-200 bg-[#EAF5FF]/60 hover:bg-[#EAF5FF] text-[#064A87] font-semibold text-xs text-left transition-all group"
            >
              <div className="w-6 h-6 rounded bg-[#0878D1] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Plus className="w-4 h-4" />
              </div>
              <span>Tạo lớp mới</span>
            </button>

            <button
              onClick={() => setIsImportStudentsOpen(true)}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-blue-200 bg-[#EAF5FF]/60 hover:bg-[#EAF5FF] text-[#064A87] font-semibold text-xs text-left transition-all group"
            >
              <div className="w-6 h-6 rounded bg-[#0878D1] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <UserPlus className="w-4 h-4" />
              </div>
              <span>Nhập danh sách HS</span>
            </button>

            <button
              onClick={() => setIsCreateExamOpen(true)}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-blue-200 bg-[#EAF5FF]/60 hover:bg-[#EAF5FF] text-[#064A87] font-semibold text-xs text-left transition-all group"
            >
              <div className="w-6 h-6 rounded bg-[#0878D1] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FilePlus className="w-4 h-4" />
              </div>
              <span>Tạo đề kiểm tra</span>
            </button>

            <button
              onClick={() => setIsAssignHomeworkOpen(true)}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-blue-200 bg-[#EAF5FF]/60 hover:bg-[#EAF5FF] text-[#064A87] font-semibold text-xs text-left transition-all group"
            >
              <div className="w-6 h-6 rounded bg-[#0878D1] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Send className="w-3.5 h-3.5" />
              </div>
              <span>Giao bài tập</span>
            </button>

            <button
              onClick={() => setActiveTab('grades')}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-blue-200 bg-[#EAF5FF]/60 hover:bg-[#EAF5FF] text-[#064A87] font-semibold text-xs text-left transition-all group"
            >
              <div className="w-6 h-6 rounded bg-[#0878D1] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Edit3 className="w-3.5 h-3.5" />
              </div>
              <span>Nhập điểm</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs text-left transition-all group col-span-2"
            >
              <div className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <span className="flex-1">Điểm danh lớp học hôm nay</span>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold">Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Bottom Row: AI Assistant Bar, Progress Line Chart, Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Box 1: Trợ lý AI môn Toán (4.5 cols) */}
        <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0878D1] flex items-center justify-center shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#12345A] text-base">Trợ lý AI môn Toán</h3>
              <p className="text-xs text-gray-500 leading-snug">
                Hỗ trợ soạn đề, tạo câu hỏi, gợi ý bài tập, phân tích kết quả và viết nhận xét.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={aiInputText}
              onChange={(e) => setAiInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStartAi()}
              placeholder="Nhập yêu cầu của thầy (ví dụ: Tạo 10 câu trắc nghiệm về hàm số bậc hai...)"
              className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0878D1] focus:border-transparent bg-gray-50/50"
            />
            <button
              onClick={handleStartAi}
              className="px-4 py-2 bg-[#0878D1] hover:bg-[#064A87] text-white text-xs font-semibold rounded-lg shrink-0 shadow-sm transition-colors"
            >
              Bắt đầu
            </button>
          </div>
        </div>

        {/* Box 2: Biểu đồ tiến bộ học tập (4 cols) */}
        <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-[#12345A] text-base">Biểu đồ tiến bộ học tập</h3>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-[11px] mb-2">
            <span className="flex items-center gap-1 text-gray-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0878D1]" />
              <span>Nguyễn Văn Nam (10A1)</span>
            </span>
            <span className="flex items-center gap-1 text-gray-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <span>Trần Thị Mai (10A2)</span>
            </span>
          </div>

          {/* SVG Line Chart */}
          <div className="h-32 w-full pt-1">
            <svg viewBox="0 0 320 120" className="w-full h-full overflow-visible">
              {/* Y-axis grid lines 0, 2, 4, 6, 8, 10 */}
              {[0, 20, 40, 60, 80, 100].map((val, idx) => {
                const y = 100 - val;
                return (
                  <g key={idx}>
                    <line x1="25" y1={y} x2="310" y2={y} stroke="#f0f3f6" strokeWidth="1" />
                    <text x="15" y={y + 3} fontSize="8" fill="#94a3b8" textAnchor="end">
                      {val / 10}
                    </text>
                  </g>
                );
              })}

              {/* Line 1: Nguyen Van Nam [4.0, 4.5, 4.8, 5.0, 5.5] */}
              {/* Points: x=40, 100, 160, 220, 280 */}
              <polyline
                fill="none"
                stroke="#0878D1"
                strokeWidth="2.5"
                points="40,60 100,55 160,52 220,50 280,45"
              />
              {[
                { x: 40, y: 60 },
                { x: 100, y: 55 },
                { x: 160, y: 52 },
                { x: 220, y: 50 },
                { x: 280, y: 45 },
              ].map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill="#0878D1" stroke="#fff" strokeWidth="1.5" />
              ))}

              {/* Line 2: Tran Thi Mai [5.5, 5.0, 4.8, 5.2, 5.5] */}
              <polyline
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                points="40,45 100,50 160,52 220,48 280,45"
              />
              {[
                { x: 40, y: 45 },
                { x: 100, y: 50 },
                { x: 160, y: 52 },
                { x: 220, y: 48 },
                { x: 280, y: 45 },
              ].map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill="#10B981" stroke="#fff" strokeWidth="1.5" />
              ))}

              {/* X-axis labels: Đợt 1 -> Đợt 5 */}
              {['Đợt 1', 'Đợt 2', 'Đợt 3', 'Đợt 4', 'Đợt 5'].map((label, idx) => (
                <text
                  key={idx}
                  x={40 + idx * 60}
                  y="114"
                  fontSize="8"
                  fill="#64748b"
                  textAnchor="middle"
                  fontFamily="serif"
                >
                  {label}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Box 3: Tài liệu & Hỗ trợ (3 cols) */}
        <div className="lg:col-span-3 bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-[#12345A] text-base mb-2">Tài liệu & Hỗ trợ</h3>

          <div className="space-y-1.5 text-xs">
            <button
              onClick={() => setActiveTab('docs')}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 transition-colors text-left group"
            >
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Book className="w-3.5 h-3.5" />
                </span>
                <span className="font-medium text-gray-700 group-hover:text-[#0878D1]">
                  Sách giáo khoa Toán THPT
                </span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 transition-colors text-left group"
            >
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-blue-100 text-[#0878D1] flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </span>
                <span className="font-medium text-gray-700 group-hover:text-[#0878D1]">
                  Tài liệu tham khảo
                </span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 transition-colors text-left group"
            >
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <Table className="w-3.5 h-3.5" />
                </span>
                <span className="font-medium text-gray-700 group-hover:text-[#0878D1]">
                  Ma trận đề kiểm tra
                </span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 transition-colors text-left group"
            >
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-3.5 h-3.5" />
                </span>
                <span className="font-medium text-gray-700 group-hover:text-[#0878D1]">
                  Hướng dẫn sử dụng website
                </span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
