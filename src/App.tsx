import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ClassStudentView } from './components/ClassStudentView';
import { AttendanceView } from './components/AttendanceView';
import { QuestionBankView } from './components/QuestionBankView';
import { OnlineExamView } from './components/OnlineExamView';
import { GradebookView } from './components/GradebookView';
import { AnalyticsView } from './components/AnalyticsView';
import { GameBankView } from './components/GameBankView';
import { AIAssistantView } from './components/AIAssistantView';
import { DocumentsView } from './components/DocumentsView';
import { SettingsView } from './components/SettingsView';
import { GraduationCap } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, currentRole } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F8FC] text-[#12345A] selection:bg-[#0878D1] selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Main Body */}
      <div className="flex-1 flex max-w-[1920px] w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'classes' && <ClassStudentView />}
          {activeTab === 'attendance' && <AttendanceView />}
          {activeTab === 'bank' && <QuestionBankView />}
          {activeTab === 'exams' && <OnlineExamView />}
          {activeTab === 'grades' && <GradebookView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'games' && <GameBankView />}
          {activeTab === 'ai' && <AIAssistantView />}
          {activeTab === 'docs' && <DocumentsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>


      {/* Official Footer matching specifications and screenshot */}
      <footer className="bg-white border-t border-blue-100 py-3.5 px-6 text-xs text-[#64748B] shadow-inner mt-auto">
        <div className="max-w-[1920px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            <span>© 2026 - Toán học cùng thầy Thắng | Trường THPT Đan Phượng | Email: thangtoandp@gmail.com</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#0878D1] font-semibold">
            <GraduationCap className="w-4 h-4" />
            <span>Cùng học - Cùng tiến bộ - Cùng chinh phục Toán học!</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
