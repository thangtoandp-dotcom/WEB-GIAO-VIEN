import React, { useState } from 'react';
import {
  Settings,
  User,
  Shield,
  Database,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Save,
  CheckCircle,
  AlertTriangle,
  School,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsView: React.FC = () => {
  const {
    teacherProfile,
    updateTeacherProfile,
    selectedSchoolYear,
    setSelectedSchoolYear,
    selectedSemester,
    setSelectedSemester,
    resetToDefaultData,
    clearAllData,
    exportDatabaseJSON,
    importDatabaseJSON,
  } = useApp();

  const [name, setName] = useState(teacherProfile.name);
  const [school, setSchool] = useState(teacherProfile.school);
  const [email, setEmail] = useState(teacherProfile.email);
  const [phone, setPhone] = useState(teacherProfile.phone);
  const [bio, setBio] = useState(teacherProfile.bio || '');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateTeacherProfile({
      name,
      school,
      email,
      phone,
      bio,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDatabaseJSON(content);
      if (success) {
        alert('Đã khôi phục dữ liệu thành công từ tệp sao lưu!');
      } else {
        alert('Tệp dữ liệu không hợp lệ hoặc bị lỗi cấu trúc JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#0878D1]" />
            <h2 className="text-lg font-bold text-[#064A87]">
              Cài đặt hệ thống & Quản lý dữ liệu
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Cấu hình thông tin giáo viên, quy tắc tính điểm, năm học và sao lưu phục hồi dữ liệu
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Teacher Profile & School Year (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Profile Card */}
          <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-[#064A87] text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-[#0878D1]" />
                <span>Thông tin giáo viên phụ trách</span>
              </h3>
              {savedSuccess && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-fade-in">
                  <CheckCircle className="w-4 h-4" />
                  <span>Đã lưu thành công!</span>
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Họ và tên giáo viên *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Đơn vị công tác chính thức *</label>
                  <input
                    type="text"
                    required
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email giáo viên</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Số điện thoại liên hệ</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Giới thiệu chuyên môn sư phạm</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-2.5 font-serif text-xs border border-gray-300 rounded-lg"
                />
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0878D1] hover:bg-[#064A87] text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Cập nhật thông tin</span>
                </button>
              </div>
            </form>
          </div>

          {/* Academic Year & Weights Configuration */}
          <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm space-y-4">
            <h3 className="font-bold text-[#064A87] text-sm flex items-center gap-2 pb-3 border-b border-gray-100">
              <School className="w-4 h-4 text-[#0878D1]" />
              <span>Năm học & Quy tắc tính điểm trung bình</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Năm học áp dụng</label>
                <select
                  value={selectedSchoolYear}
                  onChange={(e) => setSelectedSchoolYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="2024-2025">Năm học 2024 - 2025</option>
                  <option value="2025-2026">Năm học 2025 - 2026</option>
                  <option value="2026-2027">Năm học 2026 - 2027</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Học kỳ hiện tại</label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="Học kỳ 1">Học kỳ 1</option>
                  <option value="Học kỳ 2">Học kỳ 2</option>
                  <option value="Cả năm">Cả năm</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 text-xs text-gray-700 space-y-1">
              <p className="font-bold text-[#064A87]">Cấu hình hệ số đánh giá môn Toán THPT:</p>
              <p>• Kiểm tra thường xuyên (TX1, TX2, TX3): Hệ số 1</p>
              <p>• Kiểm tra giữa kỳ (GK): Hệ số 2</p>
              <p>• Kiểm tra cuối kỳ (CK): Hệ số 3</p>
            </div>
          </div>
        </div>

        {/* Right: Data Management & Backup (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm space-y-4">
            <h3 className="font-bold text-[#064A87] text-sm flex items-center gap-2 pb-3 border-b border-gray-100">
              <Database className="w-4 h-4 text-[#0878D1]" />
              <span>Sao lưu & Quản lý dữ liệu hệ thống</span>
            </h3>

            <div className="space-y-3 text-xs">
              {/* Export JSON */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">Sao lưu dữ liệu (JSON)</p>
                  <p className="text-[11px] text-gray-500">Tải về toàn bộ học sinh, đề thi và điểm số</p>
                </div>
                <button
                  onClick={exportDatabaseJSON}
                  className="px-3 py-1.5 bg-[#0878D1] hover:bg-[#064A87] text-white font-semibold rounded-lg flex items-center gap-1 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải về</span>
                </button>
              </div>

              {/* Import JSON */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">Khôi phục từ tệp sao lưu</p>
                  <p className="text-[11px] text-gray-500">Tải lên tệp JSON đã lưu trước đó</p>
                </div>
                <label className="px-3 py-1.5 bg-white text-[#0878D1] border border-blue-300 hover:bg-blue-50 font-semibold rounded-lg flex items-center gap-1 cursor-pointer shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Chọn tệp</span>
                  <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {/* Reset to Default Demo */}
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#064A87]">Khôi phục dữ liệu mẫu THPT Đan Phượng</p>
                  <p className="text-[11px] text-gray-500">Thiết lập lại 12 lớp, 428 học sinh chuẩn</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Thầy có chắc chắn muốn khôi phục dữ liệu mẫu chuẩn của Trường THPT Đan Phượng?')) {
                      resetToDefaultData();
                      alert('Đã khôi phục dữ liệu mẫu chuẩn thành công!');
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-1 shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Khôi phục</span>
                </button>
              </div>

              {/* Clear All Data */}
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-red-700">Xóa dữ liệu để nhập số liệu thực</p>
                  <p className="text-[11px] text-red-500">Làm trống hệ thống trước khi bắt đầu năm học mới</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('CẢNH BÁO: Thầy có chắc chắn muốn xóa toàn bộ dữ liệu minh họa để bắt đầu cơ sở dữ liệu trống không?')) {
                      clearAllData();
                      alert('Đã dọn dẹp hệ thống về trạng thái trống.');
                    }
                  }}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center gap-1 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa sạch</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
