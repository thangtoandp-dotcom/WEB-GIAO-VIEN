import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  GraduationCap,
  School,
  User,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthLoginView: React.FC = () => {
  const { login, teacherProfile, classes } = useApp();

  const [roleTab, setRoleTab] = useState<'teacher' | 'student'>('teacher');
  const [password, setPassword] = useState('thangtoandp');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [selectedStudentClass, setSelectedStudentClass] = useState(classes[0]?.name || '10A1');
  const [studentName, setStudentName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      login('teacher', password);
      setIsLoading(false);
    }, 400);
  };

  const handleQuickTeacherUnlock = () => {
    setIsLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      login('teacher');
      setIsLoading(false);
    }, 300);
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      login('student');
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06325C] via-[#064A87] to-[#0878D1] flex flex-col justify-between text-white p-4 sm:p-6 selection:bg-[#0878D1] selection:text-white">
      {/* Top Brand Header */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between pt-2 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md">
            <School className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg tracking-wide uppercase">
              Trường THPT Đan Phượng
            </h1>
            <p className="text-xs text-blue-200">
              Cổng Giáo Dục & Khảo Thí Toán Học Trực Tuyến
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-xs text-blue-100">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Hệ thống bảo mật SSL 256-bit</span>
        </div>
      </div>

      {/* Main Authentication Container */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        {/* Safe Logout Notice Banner */}
        <div className="mb-4 bg-emerald-500/15 border border-emerald-400/30 backdrop-blur-md rounded-2xl p-3.5 flex items-center gap-3 text-emerald-100 shadow-lg">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-400/40">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="text-xs">
            <p className="font-semibold text-emerald-200">Đã đăng xuất an toàn!</p>
            <p className="text-[11px] text-emerald-100/80">
              Phiên làm việc trước đó đã được kết thúc và dữ liệu được bảo vệ an toàn.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-blue-100 text-[#12345A]">
          {/* Tab Selection */}
          <div className="grid grid-cols-2 p-1.5 bg-blue-50/70 border-b border-blue-100 text-xs font-semibold">
            <button
              onClick={() => {
                setRoleTab('teacher');
                setErrorMsg('');
              }}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                roleTab === 'teacher'
                  ? 'bg-white text-[#064A87] shadow-sm font-bold'
                  : 'text-gray-600 hover:text-[#064A87]'
              }`}
            >
              <User className="w-4 h-4 text-[#0878D1]" />
              <span>Thầy Bùi Ngọc Thắng</span>
            </button>
            <button
              onClick={() => {
                setRoleTab('student');
                setErrorMsg('');
              }}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                roleTab === 'student'
                  ? 'bg-white text-[#064A87] shadow-sm font-bold'
                  : 'text-gray-600 hover:text-[#064A87]'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-[#0878D1]" />
              <span>Học sinh THPT ĐP</span>
            </button>
          </div>

          <div className="p-6 sm:p-7">
            {roleTab === 'teacher' ? (
              /* Teacher Login Form */
              <div className="space-y-5">
                {/* Teacher Profile Snapshot */}
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#064A87] to-[#0878D1] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {teacherProfile.name
                      .split(' ')
                      .slice(-2)
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-[#064A87] text-sm truncate">
                        {teacherProfile.name}
                      </h3>
                      <span className="text-[10px] bg-blue-100 text-[#064A87] px-1.5 py-0.5 rounded font-semibold shrink-0">
                        Giáo viên Toán
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{teacherProfile.email}</p>
                    <p className="text-[11px] text-gray-400 truncate">{teacherProfile.school}</p>
                  </div>
                </div>

                <form onSubmit={handleTeacherLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Mật khẩu xác thực giáo viên
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu..."
                        className="w-full pl-9 pr-10 py-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0878D1] focus:border-transparent transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#0878D1]" />
                      <span>Gợi ý mật khẩu mặc định: thangtoandp</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                      <input
                        type="checkbox"
                        checked={rememberDevice}
                        onChange={(e) => setRememberDevice(e.target.checked)}
                        className="rounded text-[#0878D1] focus:ring-[#0878D1] w-3.5 h-3.5"
                      />
                      <span>Ghi nhớ phiên trên thiết bị này</span>
                    </label>
                  </div>

                  {errorMsg && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs">
                      {errorMsg}
                    </div>
                  )}

                  <div className="space-y-2 pt-1">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 bg-gradient-to-r from-[#064A87] to-[#0878D1] hover:from-[#053c6d] hover:to-[#0768b5] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                    >
                      {isLoading ? (
                        <span>Đang xác thực...</span>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4" />
                          <span>Đăng nhập hệ thống quản lý</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleQuickTeacherUnlock}
                      className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-[#064A87] text-xs font-semibold rounded-xl border border-blue-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#0878D1]" />
                      <span>Mở khóa nhanh 1 chạm cho Thầy Thắng</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Student Login Form */
              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs text-[#064A87]">
                  <p className="font-bold flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#0878D1]" />
                    <span>Cổng học sinh làm bài thi & luyện tập toán</span>
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Học sinh chọn đúng lớp để xem đề thi trực tuyến và chơi Game học tập toán học do Thầy Thắng giao.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Chọn lớp học *
                  </label>
                  <select
                    value={selectedStudentClass}
                    onChange={(e) => setSelectedStudentClass(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} — Khối {c.grade} ({c.schoolYear})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Họ và tên học sinh (tùy chọn hoặc mã số)
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="VD: Nguyễn Văn An..."
                    className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-[#064A87] to-[#0878D1] hover:from-[#053c6d] hover:to-[#0768b5] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Vào phòng thi & Trải nghiệm Game học tập</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center text-[11px] text-gray-500">
            Cần hỗ trợ đăng nhập? Liên hệ Thầy Thắng: <span className="font-semibold text-[#0878D1]">thangtoandp@gmail.com</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-5xl w-full mx-auto text-center text-xs text-blue-200/80 pt-4 pb-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 Trường THPT Đan Phượng - TP. Hà Nội | Bản quyền phần mềm giáo dục Thầy Bùi Ngọc Thắng</p>
        <p className="flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-blue-200" />
          <span>Vững bước tương lai cùng Toán học THPT Đan Phượng</span>
        </p>
      </div>
    </div>
  );
};
