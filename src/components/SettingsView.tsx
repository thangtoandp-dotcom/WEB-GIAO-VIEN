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
  Cloud,
  CloudUpload,
  CloudDownload,
  RefreshCw,
  Code,
  Copy,
  ExternalLink,
  Check,
  X,
  Server,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPABASE_INIT_SQL } from '../lib/supabaseSchemaSql';
import { getSupabaseConfig, setCustomSupabaseConfig } from '../lib/supabase';

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
    supabaseStatus,
    supabaseMessage,
    isSyncingWithSupabase,
    checkSupabaseHealth,
    syncAllToSupabase,
    loadAllFromSupabase,
  } = useApp();

  const [name, setName] = useState(teacherProfile.name);
  const [school, setSchool] = useState(teacherProfile.school);
  const [email, setEmail] = useState(teacherProfile.email);
  const [phone, setPhone] = useState(teacherProfile.phone);
  const [bio, setBio] = useState(teacherProfile.bio || '');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [hasCopiedSql, setHasCopiedSql] = useState(false);

  const config = getSupabaseConfig();
  const [customUrl, setCustomUrl] = useState(config.url);
  const [customKey, setCustomKey] = useState(config.anonKey);
  const [showConfigInputs, setShowConfigInputs] = useState(false);

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

  const handleSyncToSupabase = async () => {
    setSyncFeedback('Đang đồng bộ tất cả lớp, học sinh, đề thi lên Supabase...');
    const res = await syncAllToSupabase();
    setSyncFeedback(res.message);
    setTimeout(() => setSyncFeedback(null), 5000);
  };

  const handleLoadFromSupabase = async () => {
    if (confirm('Tải dữ liệu từ Supabase sẽ cập nhật vào màn hình hiện tại. Bạn có muốn tiếp tục không?')) {
      setSyncFeedback('Đang tải dữ liệu từ Supabase về...');
      const res = await loadAllFromSupabase();
      setSyncFeedback(res.message);
      setTimeout(() => setSyncFeedback(null), 5000);
    }
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_INIT_SQL);
      setHasCopiedSql(true);
      setTimeout(() => setHasCopiedSql(false), 3000);
    } catch {
      alert('Không thể tự động sao chép. Bạn có thể bôi đen văn bản để copy.');
    }
  };

  const handleSaveCustomConfig = () => {
    setCustomSupabaseConfig(customUrl, customKey);
    alert('Đã lưu cấu hình kết nối Supabase mới! Hệ thống sẽ kiểm tra lại kết nối.');
    setShowConfigInputs(false);
    checkSupabaseHealth();
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#0878D1]" />
            <h2 className="text-lg font-bold text-[#064A87]">
              Cài đặt hệ thống & Cơ sở dữ liệu Supabase
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Cấu hình thông tin giáo viên, đồng bộ trực tiếp máy chủ Supabase Cloud và sao lưu dữ liệu
          </p>
        </div>

        {/* Status chip */}
        <div className="flex items-center gap-2">
          {supabaseStatus === 'connected' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Supabase Cloud: Đã kết nối</span>
            </span>
          )}
          {supabaseStatus === 'tables_missing' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Supabase: Cần chạy mã SQL</span>
            </span>
          )}
          {supabaseStatus === 'checking' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
              <span>Đang kiểm tra kết nối...</span>
            </span>
          )}
          {supabaseStatus === 'error' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span>Lỗi kết nối Supabase</span>
            </span>
          )}
        </div>
      </div>

      {/* Supabase Notification Banner */}
      {syncFeedback && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-medium text-[#064A87] flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
          <button onClick={() => setSyncFeedback(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Supabase Integration Card */}
      <div className="bg-gradient-to-br from-white via-blue-50/20 to-emerald-50/20 p-5 rounded-2xl border border-blue-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-blue-100 gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#064A87] to-[#0878D1] text-white flex items-center justify-center shadow-sm">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#064A87] text-sm sm:text-base">
                  Cơ sở dữ liệu đám mây Supabase (PostgreSQL)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3ECF8E]/20 text-[#1B8055] border border-[#3ECF8E]/40">
                  Supabase Realtime DB
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Dữ liệu được lưu trữ trực tuyến, đồng bộ tức thì trên mọi thiết bị máy tính và điện thoại
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => checkSupabaseHealth()}
              disabled={isSyncingWithSupabase}
              className="px-3 py-1.5 bg-white hover:bg-gray-50 text-[#064A87] border border-gray-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingWithSupabase ? 'animate-spin' : ''}`} />
              <span>Kiểm tra kết nối</span>
            </button>
            <button
              onClick={() => setIsSqlModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Xem mã SQL khởi tạo</span>
            </button>
          </div>
        </div>

        {/* Status message */}
        <div className="text-xs p-3 rounded-xl bg-white border border-blue-100 flex items-start gap-2.5">
          <Server className="w-4 h-4 text-[#0878D1] shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-800">Trạng thái máy chủ: {supabaseMessage}</p>
              <button
                onClick={() => setShowConfigInputs(!showConfigInputs)}
                className="text-[11px] text-[#0878D1] hover:underline cursor-pointer"
              >
                {showConfigInputs ? 'Ẩn thông tin cấu hình' : 'Xem / Đổi thông số URL & Key'}
              </button>
            </div>
            <div className="text-gray-500 text-[11px] break-all">
              <span className="font-semibold text-gray-700">Project URL: </span>
              <code className="text-[#064A87] bg-blue-50 px-1 py-0.5 rounded font-mono">{config.url}</code>
            </div>
          </div>
        </div>

        {/* Config Inputs if toggled */}
        {showConfigInputs && (
          <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-3 text-xs animate-fade-in">
            <h4 className="font-bold text-gray-800">Tùy chỉnh thông số kết nối Supabase</h4>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">VITE_SUPABASE_URL</label>
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">VITE_SUPABASE_ANON_KEY</label>
              <input
                type="text"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfigInputs(false)}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-xs"
              >
                Đóng
              </button>
              <button
                onClick={handleSaveCustomConfig}
                className="px-3 py-1.5 bg-[#0878D1] hover:bg-[#064A87] text-white font-semibold rounded-lg text-xs"
              >
                Lưu và kiểm tra lại
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-white rounded-xl border border-emerald-100 shadow-xs flex flex-col justify-between space-y-2">
            <div>
              <p className="font-bold text-[#064A87] flex items-center gap-1.5">
                <CloudUpload className="w-4 h-4 text-emerald-600" />
                <span>Đồng bộ dữ liệu mẫu lên Supabase</span>
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                Đẩy toàn bộ 12 lớp học, danh sách 428 học sinh chuẩn THPT Đan Phượng, đề thi, ngân hàng câu hỏi lên cơ sở dữ liệu Supabase.
              </p>
            </div>
            <button
              onClick={handleSyncToSupabase}
              disabled={isSyncingWithSupabase}
              className="mt-2 w-full px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <CloudUpload className="w-4 h-4" />
              <span>{isSyncingWithSupabase ? 'Đang đồng bộ...' : 'Đồng bộ toàn bộ lên Supabase'}</span>
            </button>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-blue-100 shadow-xs flex flex-col justify-between space-y-2">
            <div>
              <p className="font-bold text-[#064A87] flex items-center gap-1.5">
                <CloudDownload className="w-4 h-4 text-[#0878D1]" />
                <span>Tải dữ liệu từ Supabase về ứng dụng</span>
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                Lấy toàn bộ dữ liệu mới nhất được lưu trên Supabase Cloud để hiển thị trên hệ thống.
              </p>
            </div>
            <button
              onClick={handleLoadFromSupabase}
              disabled={isSyncingWithSupabase}
              className="mt-2 w-full px-3 py-2 bg-gradient-to-r from-[#0878D1] to-[#064A87] hover:from-[#064A87] hover:to-[#053d70] text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <CloudDownload className="w-4 h-4" />
              <span>{isSyncingWithSupabase ? 'Đang nạp...' : 'Tải dữ liệu từ Supabase về'}</span>
            </button>
          </div>
        </div>

        {/* Hint for first time running */}
        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Hướng dẫn khởi tạo lần đầu cho thầy Bùi Ngọc Thắng:</span>
          </p>
          <p className="text-[11px] leading-relaxed">
            1. Bấm nút <strong>"Xem mã SQL khởi tạo"</strong> ở trên và bấm <strong>"Sao chép toàn bộ mã SQL"</strong>.
          </p>
          <p className="text-[11px] leading-relaxed">
            2. Mở Supabase tại project <code>acdvkdsvpwdggkaukjmk</code> ➔ vào mục <strong>SQL Editor</strong> ➔ Tạo <strong>New Query</strong> ➔ Dán mã vào và bấm <strong>RUN</strong>.
          </p>
          <p className="text-[11px] leading-relaxed">
            3. Quay lại đây bấm <strong>"Đồng bộ toàn bộ lên Supabase"</strong> để hoàn tất nạp đầy đủ dữ liệu học sinh, điểm số và đề thi!
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
                  className="px-4 py-2 bg-[#0878D1] hover:bg-[#064A87] text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
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
                  <option value="2025-2026">Năm học 2025 - 2026</option>
                  <option value="2026-2027">Năm học 2026 - 2027 (Hiện tại)</option>
                  <option value="2027-2028">Năm học 2027 - 2028</option>
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

        {/* Right: Data Management & Local Backup (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm space-y-4">
            <h3 className="font-bold text-[#064A87] text-sm flex items-center gap-2 pb-3 border-b border-gray-100">
              <Database className="w-4 h-4 text-[#0878D1]" />
              <span>Sao lưu dự phòng tệp tin (Offline JSON)</span>
            </h3>

            <div className="space-y-3 text-xs">
              {/* Export JSON */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">Sao lưu dữ liệu ra file (JSON)</p>
                  <p className="text-[11px] text-gray-500">Tải về toàn bộ học sinh, đề thi và điểm số</p>
                </div>
                <button
                  onClick={exportDatabaseJSON}
                  className="px-3 py-1.5 bg-[#0878D1] hover:bg-[#064A87] text-white font-semibold rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
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
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
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
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa sạch</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SQL Script Viewer Modal */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-blue-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-[#064A87] to-[#0878D1] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Code className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="font-bold text-base">Mã SQL khởi tạo toàn bộ Database Supabase</h3>
                  <p className="text-xs text-blue-100">Bao gồm 11 bảng dữ liệu, cấu trúc JSONB và chính sách bảo mật RLS</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  {hasCopiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{hasCopiedSql ? 'Đã sao chép!' : 'Sao chép toàn bộ mã SQL'}</span>
                </button>

                <button
                  onClick={() => setIsSqlModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Step-by-step instruction bar */}
            <div className="bg-emerald-50 border-b border-emerald-200 p-3 text-xs text-emerald-900 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
                <span>Sao chép mã này</span>
                <span className="text-gray-300">➔</span>
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">2</span>
                <span>Mở Supabase SQL Editor ➔ New Query ➔ Dán vào ➔ Bấm RUN</span>
                <span className="text-gray-300">➔</span>
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">3</span>
                <span>Bấm "Đồng bộ lên Supabase"</span>
              </div>

              <a
                href="https://supabase.com/dashboard/project/acdvkdsvpwdggkaukjmk/sql/new"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
              >
                <span>Mở SQL Editor của Project</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Code Content */}
            <div className="p-4 overflow-y-auto flex-1 bg-gray-900 text-gray-100 font-mono text-xs leading-relaxed">
              <pre className="whitespace-pre-wrap select-all">{SUPABASE_INIT_SQL}</pre>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-gray-100 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                11 bảng: classes, students, questions, exams, grade_records, exam_submissions, attendance_sessions, documents, games, class_activities, teacher_profile
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySql}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {hasCopiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{hasCopiedSql ? 'Đã sao chép thành công!' : 'Sao chép toàn bộ mã SQL'}</span>
                </button>
                <button
                  onClick={() => setIsSqlModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-xs cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
