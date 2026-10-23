import React from 'react';
import {
  Home,
  Users,
  UserCheck,
  FileQuestion,
  ClipboardCheck,
  TrendingUp,
  BarChart3,
  Gamepad2,
  Bot,
  BookMarked,
  Settings,
} from 'lucide-react';
import { useApp, NavTab } from '../context/AppContext';

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Trang chủ', icon: Home },
  { id: 'classes', label: 'Quản lý lớp học & học sinh', icon: Users },
  { id: 'attendance', label: 'Điểm danh & Chuyên cần', icon: UserCheck },
  { id: 'bank', label: 'Ngân hàng đề & Bài tập', icon: FileQuestion },
  { id: 'exams', label: 'Kiểm tra trực tuyến', icon: ClipboardCheck },
  { id: 'grades', label: 'Kết quả học tập', icon: TrendingUp },
  { id: 'analytics', label: 'Phân tích & Thống kê', icon: BarChart3 },
  { id: 'games', label: 'Ngân hàng Game', icon: Gamepad2 },
  { id: 'ai', label: 'Trợ lý AI môn Toán', icon: Bot },
  { id: 'docs', label: 'Tài liệu & Hỗ trợ', icon: BookMarked },
  { id: 'settings', label: 'Cài đặt', icon: Settings },
];


export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  return (
    <aside className="w-64 lg:w-72 bg-[#064A87] text-white flex flex-col justify-between shrink-0 shadow-xl border-r border-[#053d70] min-h-[calc(100vh-65px)]">
      {/* Navigation List */}
      <div className="py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
                isActive
                  ? 'bg-[#0878D1] text-white shadow-md font-semibold translate-x-1'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-white' : 'text-blue-200'
                }`}
              />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Quote card at bottom */}
      <div className="p-4 m-3 rounded-xl bg-gradient-to-br from-[#075398] to-[#053c70] border border-blue-400/20 relative overflow-hidden shadow-inner">
        {/* Subtle geometric wireframe background overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 80% 20%, white 1px, transparent 1px),
                              linear-gradient(45deg, transparent 48%, white 49%, white 51%, transparent 52%)`,
            backgroundSize: '24px 24px, 48px 48px',
          }}
        />

        <p className="text-xs text-blue-100 italic leading-relaxed relative z-10 text-center font-serif">
          “Dạy học không phải là truyền thụ kiến thức, mà là khơi dậy tiềm năng của mỗi học sinh.”
        </p>
        <p className="text-[11px] text-blue-300 text-right mt-2 font-semibold relative z-10 font-serif">
          - Bùi Ngọc Thắng -
        </p>
      </div>
    </aside>
  );
};
