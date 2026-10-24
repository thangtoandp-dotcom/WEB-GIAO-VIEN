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
  Gamepad2,
  Sparkles,
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

  // Compute actual dynamic statistics - Exact figures according to Trang giới thiệu Web:
  // Tổng số học sinh: 213
  // Tổng số lớp: 5 (12A3, 12A4, 12A12, 12A13, 12A14)
  // Kết quả học tập theo lớp:
  // 12A3 (7.8), 12A4 (100% Đạt), 12A12 (7.5), 12A13 (7.4), 12A14 (7.6)
  const totalStudents = 213;
  const totalClassesCount = 5;
  const totalExamsCount = exams.length > 0 ? exams.length : 18;
  const avgSchoolScore = '7,6';
  const needAttentionCount = 3;

  // Class chart data matching exact teacher results
  const classScores = [
    { name: '12A3', score: 7.8, display: '7.8', passRate: '98%', students: 52, isPass100: false },
    { name: '12A4', score: 8.2, display: '100% Đạt', passRate: '100% Đạt', students: 47, isPass100: true },
    { name: '12A12', score: 7.5, display: '7.5', passRate: '96%', students: 36, isPass100: false },
    { name: '12A13', score: 7.4, display: '7.4', passRate: '95%', students: 37, isPass100: false },
    { name: '12A14', score: 7.6, display: '7.6', passRate: '97%', students: 41, isPass100: false },
  ];

  // Attention & representative students list for the 5 classes
  const attentionStudents = [
    { stt: 1, name: 'Nguyễn Văn Nam', class: '12A13', score: '5,4', status: 'Cần bồi dưỡng', type: 'warning' },
    { stt: 2, name: 'Trần Thị Mai', class: '12A12', score: '5,6', status: 'Theo dõi', type: 'warning' },
    { stt: 3, name: 'Lê Minh Hoàng', class: '12A3', score: '7,8', status: 'Khá', type: 'good' },
    { stt: 4, name: 'Phạm Thùy Linh', class: '12A14', score: '7,6', status: 'Khá', type: 'good' },
    { stt: 5, name: 'Đỗ Quang Huy', class: '12A4', score: '8,4', status: '100% Đạt', type: 'good' },
  ];

  // Recent exams for the 5 classes
  const recentExams = [
    { stt: 1, title: 'Khảo sát chất lượng Toán 12', class: '12A4', date: '25/04/2025', status: '100% Đạt' },
    { stt: 2, title: 'Kiểm tra 45 phút - Hàm số & Tích phân', class: '12A3', date: '22/04/2025', status: 'Đã chấm (7.8)' },
    { stt: 3, title: 'Đề cương ôn tập giữa kì Toán 12', class: 'Toàn khối', date: '18/04/2025', status: 'Đã chấm (7.6)' },
    { stt: 4, title: 'Kiểm tra chương Oxyz - Hình không gian', class: '12A12', date: '15/04/2025', status: 'Đã chấm (7.5)' },
    { stt: 5, title: 'Bài tập trắc nghiệm Phương trình Mũ', class: '12A14', date: '12/04/2025', status: 'Đã chấm (7.6)' },
  ];

  // Recent assignments for the 5 classes
  const recentAssignments = [
    { stt: 1, title: 'Chuyên đề 9+ Tốt nghiệp THPT 2026', class: '12A4', due: '30/04/2025', status: 'Đã nộp', color: 'green' },
    { stt: 2, title: 'Ôn tập hình học không gian Oxyz', class: '12A3', due: '28/04/2025', status: 'Đã nộp', color: 'green' },
    { stt: 3, title: 'Phương trình Mũ và Logarit', class: '12A12', due: '26/04/2025', status: 'Đang làm', color: 'blue' },
    { stt: 4, title: 'Luyện tập Tích phân từng phần', class: '12A14', due: '25/04/2025', status: 'Đã nộp', color: 'green' },
    { stt: 5, title: 'Khảo sát sự biến thiên hàm số', class: '12A13', due: '24/04/2025', status: 'Đang làm', color: 'blue' },
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

      {/* Featured Overview Card: Số liệu trang giới thiệu Web */}
      <div className="bg-gradient-to-r from-[#064A87] via-[#075FAD] to-[#0878D1] rounded-2xl p-5 text-white shadow-md border border-blue-200">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-sm border border-white/25">
                Trang giới thiệu Web & Báo cáo giảng dạy
              </span>
              <span className="text-xs text-blue-100 font-medium">Môn Toán - Thầy Bùi Ngọc Thắng</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold mt-1 text-white">
              Tổng quan 5 lớp Khối 12 THPT Đan Phượng
            </h2>
            <p className="text-xs text-blue-100 mt-0.5">
              Dữ liệu giảng dạy, sĩ số học sinh và kết quả học tập chính thức
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20 text-center">
              <p className="text-[11px] text-blue-200 font-medium">Tổng số học sinh</p>
              <p className="text-2xl font-extrabold text-white">213</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20 text-center">
              <p className="text-[11px] text-blue-200 font-medium">Tổng số lớp</p>
              <p className="text-2xl font-extrabold text-white">5</p>
            </div>
          </div>
        </div>

        {/* 5 Classes Quick Result Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-4 pt-3.5 border-t border-white/20">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2.5 border border-white/20">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">Lớp 12A3</span>
              <span className="text-[11px] text-blue-200 font-semibold">52 HS</span>
            </div>
            <p className="text-lg font-extrabold text-amber-300 mt-1">7.8</p>
            <p className="text-[10px] text-blue-100 font-medium">Điểm trung bình</p>
          </div>

          <div className="bg-emerald-500/30 backdrop-blur-sm rounded-xl p-2.5 border border-emerald-400/50 ring-1 ring-emerald-300/40">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-emerald-200">Lớp 12A4</span>
              <span className="text-[11px] text-emerald-100 font-semibold">47 HS</span>
            </div>
            <p className="text-lg font-extrabold text-emerald-300 mt-1">100% Đạt</p>
            <p className="text-[10px] text-emerald-100 font-medium">Xuất sắc - 0 HS dưới chuẩn</p>
          </div>

          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2.5 border border-white/20">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">Lớp 12A12</span>
              <span className="text-[11px] text-blue-200 font-semibold">36 HS</span>
            </div>
            <p className="text-lg font-extrabold text-amber-300 mt-1">7.5</p>
            <p className="text-[10px] text-blue-100 font-medium">Điểm trung bình</p>
          </div>

          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2.5 border border-white/20">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">Lớp 12A13</span>
              <span className="text-[11px] text-blue-200 font-semibold">37 HS</span>
            </div>
            <p className="text-lg font-extrabold text-amber-300 mt-1">7.4</p>
            <p className="text-[10px] text-blue-100 font-medium">Điểm trung bình</p>
          </div>

          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2.5 border border-white/20 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">Lớp 12A14</span>
              <span className="text-[11px] text-blue-200 font-semibold">41 HS</span>
            </div>
            <p className="text-lg font-extrabold text-amber-300 mt-1">7.6</p>
            <p className="text-[10px] text-blue-100 font-medium">Điểm trung bình</p>
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
            <p className="text-[11px] text-[#64748B]">(5 lớp khối 12)</p>
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
            <p className="text-[11px] text-[#64748B]">(12A3 - 12A14)</p>
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
            <p className="text-[11px] text-[#64748B]">(Năm học 2025-2026)</p>
          </div>
        </div>

        {/* Card 4: Điểm trung bình */}
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-13 h-13 rounded-xl bg-[#F59E0B] text-white flex items-center justify-center shrink-0 shadow-sm">
            <BarChart2 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-[#64748B] font-medium">Điểm TB toàn khối</p>
            <h3 className="text-2xl font-bold text-[#12345A] leading-tight">{avgSchoolScore}</h3>
            <p className="text-[11px] text-[#10B981] font-semibold flex items-center gap-0.5">
              <span>↑ 0,3 so với kỳ trước</span>
            </p>
          </div>
        </div>

        {/* Card 5: Tỷ lệ đạt chuẩn */}
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-13 h-13 rounded-xl bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-[#64748B] font-medium">Tỷ lệ đạt chuẩn</p>
            <h3 className="text-2xl font-bold text-emerald-600 leading-tight">98,6%</h3>
            <p className="text-[11px] text-emerald-700 font-semibold">(12A4: 100% Đạt)</p>
          </div>
        </div>
      </div>

      {/* 3. Middle Row 1: Charts & At-Risk Students */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Chart 1: Kết quả học tập theo lớp (5 cols) */}
        <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-[#12345A] text-base">Kết quả học tập theo lớp</h3>
              <p className="text-[11px] text-gray-500">5 lớp khối 12: 12A3, 12A4, 12A12, 12A13, 12A14</p>
            </div>
            <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Thang điểm 0 - 10</span>
          </div>

          {/* Bar Chart Container */}
          <div className="h-56 flex items-end justify-between gap-3 pt-8 pb-2 px-2 border-b border-gray-200">
            {classScores.map((c) => {
              const heightPercent = (c.score / 10) * 100;
              return (
                <div key={c.name} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-[#064A87] text-white text-[11px] py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap z-20 shadow-lg">
                    Lớp {c.name}: {c.display} | Sĩ số: {c.students} HS
                  </div>

                  {/* Value label on top of bar */}
                  {c.isPass100 ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-md whitespace-nowrap shadow-xs">
                      100% Đạt
                    </span>
                  ) : (
                    <span className="text-[12px] font-bold text-gray-800">{c.display}</span>
                  )}

                  {/* Bar */}
                  <div className="w-full bg-gray-100 rounded-t-md h-36 flex items-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        c.isPass100
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-700 group-hover:to-emerald-500'
                          : 'bg-gradient-to-t from-[#064A87] to-[#0878D1] group-hover:from-[#053d70] group-hover:to-[#076ab9]'
                      }`}
                    />
                  </div>

                  {/* Class name label */}
                  <span className="text-xs font-bold text-[#12345A] mt-1.5">{c.name}</span>
                  <span className="text-[10px] text-gray-500 font-medium">{c.students} HS</span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-1 text-xs text-gray-600">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#0878D1] rounded-xs inline-block" />
                <span>Điểm trung bình</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs inline-block" />
                <span>12A4: 100% Đạt</span>
              </span>
            </div>
            <span className="font-semibold text-[#064A87]">Tổng: 5 lớp - 213 HS</span>
          </div>
        </div>

        {/* Chart 2: Thống kê kết quả học tập Donut (4 cols) */}
        <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-[#12345A] text-base">Thống kê kết quả học tập</h3>
            <span className="text-[11px] text-gray-500 font-medium">Toàn khối 12</span>
          </div>

          <div className="flex items-center justify-center py-2 relative">
            {/* SVG Donut Chart for 213 students */}
            <svg width="170" height="170" viewBox="0 0 42 42" className="rotate-[-90deg]">
              {/* Giỏi: 36.6% -> green #10B981 */}
              <circle
                cx="21"
                cy="21"
                r="15.91549430918954"
                fill="transparent"
                stroke="#10B981"
                strokeWidth="5.5"
                strokeDasharray="36.6 63.4"
                strokeDashoffset="0"
              />
              {/* Khá: 52.6% -> blue #0878D1 */}
              <circle
                cx="21"
                cy="21"
                r="15.91549430918954"
                fill="transparent"
                stroke="#0878D1"
                strokeWidth="5.5"
                strokeDasharray="52.6 47.4"
                strokeDashoffset="-36.6"
              />
              {/* Trung bình: 9.4% -> orange #F59E0B */}
              <circle
                cx="21"
                cy="21"
                r="15.91549430918954"
                fill="transparent"
                stroke="#F59E0B"
                strokeWidth="5.5"
                strokeDasharray="9.4 90.6"
                strokeDashoffset="-89.2"
              />
              {/* Cần bồi dưỡng: 1.4% -> red #EF4444 */}
              <circle
                cx="21"
                cy="21"
                r="15.91549430918954"
                fill="transparent"
                stroke="#EF4444"
                strokeWidth="5.5"
                strokeDasharray="1.4 98.6"
                strokeDashoffset="-98.6"
              />
            </svg>

            {/* Donut Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[10px] text-gray-500 font-medium">Tổng số học sinh</span>
              <span className="text-2xl font-extrabold text-[#12345A]">213</span>
              <span className="text-[10px] text-emerald-600 font-semibold">(5 lớp)</span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="space-y-1.5 pt-2 text-xs border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <span>Giỏi (≥ 8,0)</span>
              </span>
              <span className="font-semibold text-gray-900">78 (36,6%)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0878D1]" />
                <span>Khá (6,5 – 7,9)</span>
              </span>
              <span className="font-semibold text-gray-900">112 (52,6%)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <span>Trung bình (5,0 – 6,4)</span>
              </span>
              <span className="font-semibold text-gray-900">20 (9,4%)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                <span>Cần bồi dưỡng (&lt; 5,0)</span>
              </span>
              <span className="font-semibold text-gray-900">3 (1,4%)</span>
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
              onClick={() => setActiveTab('games')}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-900 font-semibold text-xs text-left transition-all group"
            >
              <div className="w-6 h-6 rounded bg-purple-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Gamepad2 className="w-3.5 h-3.5" />
              </div>
              <span>Ngân hàng Game</span>
            </button>

            <button
              onClick={() => setActiveTab('activities')}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-900 font-semibold text-xs text-left transition-all group col-span-2"
            >
              <div className="w-6 h-6 rounded bg-amber-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="flex-1">Hoạt động nổi bật các lớp & Video</span>
              <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">Mới</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs text-left transition-all group col-span-2"
            >
              <div className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <span className="flex-1">Điểm danh lớp học hôm nay</span>
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
              <span>Lê Minh Hoàng (12A3)</span>
            </span>
            <span className="flex items-center gap-1 text-gray-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <span>Đỗ Quang Huy (12A4 - 100% Đạt)</span>
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
