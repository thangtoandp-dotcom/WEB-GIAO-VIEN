import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  AlertTriangle,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AnalyticsView: React.FC = () => {
  const { classes, students, gradeRecords, selectedSchoolYear, selectedSemester } = useApp();

  const [selectedAnalyticsGrade, setSelectedAnalyticsGrade] = useState<'all' | '10' | '11' | '12'>('all');

  // Topic mastery rates
  const mathTopicsAnalysis = [
    { topic: 'Hàm số và Đồ thị', avg: 7.8, goodRate: '78%', passRate: '94%', needFocus: false },
    { topic: 'Đạo hàm và Ứng dụng', avg: 7.4, goodRate: '72%', passRate: '91%', needFocus: false },
    { topic: 'Mũ và Logarit', avg: 7.2, goodRate: '68%', passRate: '89%', needFocus: false },
    { topic: 'Nguyên hàm và Tích phân', avg: 6.5, goodRate: '54%', passRate: '82%', needFocus: true },
    { topic: 'Hình học không gian Oxyz', avg: 6.2, goodRate: '49%', passRate: '78%', needFocus: true },
    { topic: 'Vectơ và Hệ tọa độ', avg: 7.0, goodRate: '64%', passRate: '88%', needFocus: false },
    { topic: 'Xác suất và Thống kê', avg: 6.8, goodRate: '60%', passRate: '85%', needFocus: false },
  ];

  // Top improving students
  const topImprovingStudents = [
    { name: 'Nguyễn Văn Nam', class: '10A1', initial: 4.0, latest: 5.5, improvement: '+1.5', status: 'Tiến bộ vượt bậc' },
    { name: 'Lê Minh Hoàng', class: '11A1', initial: 5.2, latest: 6.5, improvement: '+1.3', status: 'Tiến bộ rõ rệt' },
    { name: 'Đỗ Quang Huy', class: '12A1', initial: 5.4, latest: 6.4, improvement: '+1.0', status: 'Tiến bộ khá' },
    { name: 'Trần Thị Mai', class: '10A2', initial: 4.8, latest: 5.6, improvement: '+0.8', status: 'Đang duy trì đà tăng' },
    { name: 'Bùi Phương Thảo', class: '12A2', initial: 7.8, latest: 8.5, improvement: '+0.7', status: 'Vững vàng học lực giỏi' },
  ];

  // At risk students requiring intervention
  const urgentInterventionStudents = [
    { name: 'Nguyễn Văn Nam', class: '10A1', avg: 4.8, weakPoint: 'Vectơ, Bất phương trình', recommendation: 'Phụ đạo phương pháp tọa độ mặt phẳng thứ Năm hàng tuần.' },
    { name: 'Trần Thị Mai', class: '10A2', avg: 5.2, weakPoint: 'Hàm số bậc hai, Biến đổi dấu', recommendation: 'Rèn luyện thêm bài tập trắc nghiệm nhận diện đồ thị.' },
    { name: 'Lê Minh Hoàng', class: '11A1', avg: 5.6, weakPoint: 'Hình học không gian', recommendation: 'Sử dụng mô hình 3D trực quan khi giải góc & khoảng cách.' },
    { name: 'Phạm Thùy Linh', class: '11A2', avg: 5.9, weakPoint: 'Kỹ năng làm nhanh trắc nghiệm', recommendation: 'Hướng dẫn kỹ thuật bấm máy tính Casio FX-580VNX.' },
    { name: 'Đỗ Quang Huy', class: '12A1', avg: 5.7, weakPoint: 'Tích phân & Oxyz', recommendation: 'Luyện theo từng dạng đề thi tốt nghiệp THPT chuẩn hóa.' },
  ];

  // Score distribution brackets (Phổ điểm)
  const scoreBrackets = [
    { range: '0 - 2.9', count: 2, percent: '0.5%' },
    { range: '3.0 - 4.9', count: 18, percent: '4.2%' },
    { range: '5.0 - 6.4', count: 52, percent: '12.1%' },
    { range: '6.5 - 7.9', count: 198, percent: '46.3%' },
    { range: '8.0 - 8.9', count: 116, percent: '27.1%' },
    { range: '9.0 - 10', count: 42, percent: '9.8%' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#0878D1]" />
            <h2 className="text-lg font-bold text-[#064A87]">
              Báo cáo phân tích chuyên sâu & Thống kê giáo dục
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Dữ liệu phân tích thực tế học kỳ 2 (2025-2026) - Trường THPT Đan Phượng
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In báo cáo</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
          <p className="text-xs text-gray-500">Tỷ lệ đạt chuẩn (&ge; 5.0)</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">95.3%</p>
          <p className="text-[11px] text-gray-400 mt-0.5">408 / 428 học sinh</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
          <p className="text-xs text-gray-500">Tỷ lệ Giỏi (&ge; 8.0)</p>
          <p className="text-2xl font-bold text-[#0878D1] mt-1">36.9%</p>
          <p className="text-[11px] text-gray-400 mt-0.5">158 học sinh xuất sắc</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
          <p className="text-xs text-gray-500">Tỷ lệ nộp bài tập đúng hạn</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">92.4%</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Trong 5 tuần giảng dạy</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
          <p className="text-xs text-gray-500">Học sinh cần phụ đạo trọng điểm</p>
          <p className="text-2xl font-bold text-red-500 mt-1">36 em</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Có kế hoạch kèm cặp cụ thể</p>
        </div>
      </div>

      {/* Row 1: Phổ điểm & Topic Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Histogram / Phổ điểm (5 cols) */}
        <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
          <h3 className="font-bold text-[#12345A] text-sm mb-1">Phổ điểm phân bố (Toàn trường)</h3>
          <p className="text-xs text-gray-500 mb-3">Tần số học sinh theo từng khoảng điểm môn Toán</p>

          <div className="space-y-2 pt-2">
            {scoreBrackets.map((b) => (
              <div key={b.range} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-700">{b.range} điểm</span>
                  <span className="font-semibold text-gray-800">
                    {b.count} HS ({b.percent})
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      b.range.startsWith('8') || b.range.startsWith('9')
                        ? 'bg-[#10B981]'
                        : b.range.startsWith('6')
                        ? 'bg-[#0878D1]'
                        : b.range.startsWith('5')
                        ? 'bg-[#F59E0B]'
                        : 'bg-[#EF4444]'
                    }`}
                    style={{ width: `${(b.count / 200) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Math Topic Strengths & Weaknesses (7 cols) */}
        <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-[#12345A] text-sm">
              Đánh giá kết quả theo từng chuyên đề Toán THPT
            </h3>
            <span className="text-[11px] text-gray-500">Giúp thầy Thắng định hướng ôn tập</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#EAF5FF] text-[#064A87] font-bold">
                <tr>
                  <th className="py-2 px-2.5">Chuyên đề Toán</th>
                  <th className="py-2 px-2 text-center">Điểm TB</th>
                  <th className="py-2 px-2 text-center">Tỷ lệ Giỏi</th>
                  <th className="py-2 px-2 text-center">Tỷ lệ Đạt</th>
                  <th className="py-2 px-2 text-right">Khuyến nghị sư phạm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mathTopicsAnalysis.map((t) => (
                  <tr key={t.topic} className="hover:bg-blue-50/40">
                    <td className="py-2.5 px-2.5 font-bold text-gray-800">{t.topic}</td>
                    <td className="py-2.5 px-2 text-center font-bold text-[#0878D1]">{t.avg}</td>
                    <td className="py-2.5 px-2 text-center text-gray-700">{t.goodRate}</td>
                    <td className="py-2.5 px-2 text-center font-semibold text-emerald-600">{t.passRate}</td>
                    <td className="py-2.5 px-2 text-right">
                      {t.needFocus ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Cần tăng cường ôn tập
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                          Nắm vững
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 2: Top Improvers & Urgent Intervention Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Improvers */}
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-[#12345A] text-sm">
              Gương mặt học sinh tiến bộ vượt bậc (Khen thưởng)
            </h3>
          </div>

          <div className="divide-y divide-gray-100 text-xs">
            {topImprovingStudents.map((st, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">{st.name}</p>
                  <p className="text-gray-500 text-[11px]">
                    Lớp {st.class} • Từ {st.initial} lên {st.latest} điểm
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                    {st.improvement}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-0.5">{st.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgent Intervention */}
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-[#12345A] text-sm">
              Danh sách học sinh cần được hỗ trợ trọng điểm
            </h3>
          </div>

          <div className="divide-y divide-gray-100 text-xs">
            {urgentInterventionStudents.map((st, i) => (
              <div key={i} className="py-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">
                    {st.name} ({st.class})
                  </span>
                  <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 text-xs">
                    ĐTB: {st.avg}
                  </span>
                </div>
                <p className="text-gray-600 text-[11px]">
                  <span className="font-semibold text-gray-700">Chủ đề yếu:</span> {st.weakPoint}
                </p>
                <p className="text-[#0878D1] text-[11px] font-medium bg-blue-50/60 p-1.5 rounded">
                  👉 {st.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
