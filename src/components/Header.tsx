import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  School,
  User,
  Bell,
  LogOut,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  Info,
  Shield,
  GraduationCap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    teacherProfile,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    currentRole,
    setCurrentRole,
    setActiveTab,
    logout,
  } = useApp();

  const [isSchoolMenuOpen, setIsSchoolMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const schoolRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (schoolRef.current && !schoolRef.current.contains(e.target as Node)) {
        setIsSchoolMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#064A87] via-[#075FAD] to-[#0878D1] text-white shadow-md border-b border-[#053d70]">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-6 py-2.5 flex items-center justify-between">
          {/* Logo & Title */}
          <div
            className="flex items-center gap-3.5 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-11 h-11 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-inner group-hover:bg-white/20 transition-all duration-200">
              <BookOpen className="w-7 h-7 text-white drop-shadow-sm" strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-xl lg:text-2xl font-bold tracking-wide text-white drop-shadow-sm flex items-center gap-2">
                <span>Toán học cùng thầy Thắng</span>
              </div>
              <p className="text-xs text-blue-100 italic tracking-wider opacity-90">
                Kiến thức hôm nay – Tương lai ngày mai
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 text-sm">
            {/* School Selector */}
            <div className="relative" ref={schoolRef}>
              <button
                onClick={() => setIsSchoolMenuOpen(!isSchoolMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white border border-white/15"
                title="Đơn vị công tác"
              >
                <School className="w-4 h-4 text-blue-200" />
                <span className="hidden md:inline font-medium">Trường THPT Đan Phượng</span>
                <ChevronDown className="w-3.5 h-3.5 text-blue-200" />
              </button>

              {isSchoolMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-[#12345A] rounded-xl shadow-xl border border-blue-100 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Đơn vị công tác chính thức</p>
                    <p className="font-bold text-base text-[#064A87]">Trường THPT Đan Phượng</p>
                    <p className="text-xs text-gray-500">Huyện Đan Phượng, TP. Hà Nội</p>
                  </div>
                  <div className="px-4 py-2 text-xs text-gray-600 bg-blue-50/50">
                    Tổ chuyên môn: <span className="font-semibold text-[#0878D1]">Toán - Tin</span>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white border border-white/15"
              >
                <div className="w-6 h-6 rounded-full bg-blue-200 text-[#064A87] flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <span className="hidden lg:inline font-medium">
                  {currentRole === 'teacher' ? 'Giáo viên: ' : 'Học sinh kiểm thử: '}
                  {teacherProfile.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-blue-200" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-[#12345A] rounded-xl shadow-xl border border-blue-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0878D1] text-white flex items-center justify-center font-bold text-base">
                        BT
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#064A87]">{teacherProfile.name}</p>
                        <p className="text-xs text-gray-500">{teacherProfile.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[11px] font-semibold rounded bg-blue-100 text-[#0878D1]">
                          {currentRole === 'teacher' ? 'Giáo viên Toán THPT' : 'Chế độ Học sinh'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 border-b border-gray-100">
                    <p className="px-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Chuyển đổi vai trò kiểm thử
                    </p>
                    <button
                      onClick={() => {
                        setCurrentRole(currentRole === 'teacher' ? 'student' : 'teacher');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg hover:bg-blue-50 text-left transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        {currentRole === 'teacher' ? (
                          <GraduationCap className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Shield className="w-4 h-4 text-[#0878D1]" />
                        )}
                        <span>
                          {currentRole === 'teacher'
                            ? 'Chuyển sang Giao diện Học sinh'
                            : 'Trở lại Giao diện Giáo viên'}
                        </span>
                      </span>
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                        Thử nghiệm
                      </span>
                    </button>
                  </div>

                  <div className="p-1">
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 rounded-lg flex items-center gap-2"
                    >
                      <span>Hồ sơ & Cài đặt hệ thống</span>
                    </button>
                  </div>

                  <div className="p-1 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đăng xuất phiên làm việc</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
                className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white border border-white/15"
                title="Thông báo hệ thống"
              >
                <Bell className="w-4 h-4 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-[#12345A] rounded-xl shadow-xl border border-blue-100 py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#064A87]">Thông báo lớp học</h4>
                      <p className="text-[11px] text-gray-500">Cập nhật kiểm tra và bài tập</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[11px] text-[#0878D1] hover:underline"
                      >
                        Đánh dấu đã đọc hết
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-gray-400">
                        Không có thông báo mới nào
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationAsRead(n.id)}
                          className={`px-4 py-3 hover:bg-blue-50/50 cursor-pointer flex gap-3 items-start transition-colors ${
                            !n.read ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          <div className="mt-0.5">
                            {n.type === 'success' && (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            )}
                            {n.type === 'warning' && (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            )}
                            {n.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                          </div>
                          <div className="flex-1 text-xs">
                            <p className={`text-gray-800 ${!n.read ? 'font-semibold' : ''}`}>
                              {n.title}
                            </p>
                            <span className="text-[10px] text-gray-400 mt-1 inline-block">
                              {n.time}
                            </span>
                          </div>
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-[#0878D1] mt-1.5 shrink-0" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 transition-all text-white border border-red-500/30 font-medium text-xs sm:text-sm"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-blue-100">
            <h3 className="text-lg font-bold text-[#064A87] mb-2">Xác nhận đăng xuất</h3>
            <p className="text-sm text-gray-600 mb-6">
              Thầy Bùi Ngọc Thắng có chắc chắn muốn kết thúc phiên làm việc hiện tại không?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="px-4 py-2 text-sm font-semibold bg-[#064A87] hover:bg-[#0878D1] text-white rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Đăng xuất an toàn
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
