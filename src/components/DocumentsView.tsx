import React, { useState } from 'react';
import {
  BookMarked,
  Download,
  Search,
  FileText,
  Upload,
  Plus,
  Book,
  Table,
  HelpCircle,
  Eye,
  X,
  Trash2,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DocItem } from '../types';
import { UploadExamModal } from './UploadExamModal';
import { downloadFile } from '../lib/fileUtils';

export const DocumentsView: React.FC = () => {
  const { documents, deleteDocument } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewingDoc, setViewingDoc] = useState<DocItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const filteredDocs = documents.filter((d) => {
    const matchSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'all' || d.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const handleDownload = (doc: DocItem) => {
    const safeTitle = doc.title.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_');
    const ext = doc.fileType ? doc.fileType.toLowerCase() : 'pdf';

    // If real uploaded file data exists, download the genuine binary file!
    if (doc.fileContent && doc.fileContent.startsWith('data:')) {
      downloadFile(doc.fileContent, `${safeTitle}.${ext}`);
      return;
    }

    // Fallback: Generate structured study document representation
    const content = `TOÁN HỌC CÙNG THẦY THẮNG - TRƯỜNG THPT ĐAN PHƯỢNG\n\nTài liệu: ${doc.title}\nPhân loại: ${doc.categoryName}\nTác giả: ${doc.author}\nNgày cập nhật: ${doc.updatedDate}\n\nMô tả chi tiết:\n${doc.description}\n\n© 2026 - Thầy Bùi Ngọc Thắng (Trường THPT Đan Phượng)`;
    downloadFile(content, `${safeTitle}.txt`, 'text/plain');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-[#0878D1]" />
            <h2 className="text-lg font-bold text-[#064A87]">
              Thư viện tài liệu giảng dạy & Hướng dẫn sử dụng
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Sách giáo khoa điện tử, tài liệu chuyên đề bồi dưỡng, ma trận đề thi và cẩm nang sử dụng phần mềm
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0878D1] hover:bg-[#064A87] text-white shadow-sm transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Tải lên tài liệu mới</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu, sách giáo khoa, ma trận..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0878D1]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              selectedCategory === 'all'
                ? 'bg-[#0878D1] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setSelectedCategory('sgk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              selectedCategory === 'sgk'
                ? 'bg-[#0878D1] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            SGK Toán
          </button>
          <button
            onClick={() => setSelectedCategory('reference')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              selectedCategory === 'reference'
                ? 'bg-[#0878D1] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tài liệu tham khảo
          </button>
          <button
            onClick={() => setSelectedCategory('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              selectedCategory === 'matrix'
                ? 'bg-[#0878D1] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Ma trận đề
          </button>
          <button
            onClick={() => setSelectedCategory('guide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              selectedCategory === 'guide'
                ? 'bg-[#0878D1] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Hướng dẫn sử dụng
          </button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      doc.category === 'sgk'
                        ? 'bg-emerald-100 text-emerald-700'
                        : doc.category === 'reference'
                        ? 'bg-blue-100 text-[#0878D1]'
                        : doc.category === 'matrix'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {doc.category === 'sgk' ? (
                      <Book className="w-5 h-5" />
                    ) : doc.category === 'reference' ? (
                      <FileText className="w-5 h-5" />
                    ) : doc.category === 'matrix' ? (
                      <Table className="w-5 h-5" />
                    ) : (
                      <HelpCircle className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {doc.categoryName}
                    </span>
                    <h3 className="font-bold text-[#064A87] text-sm leading-snug mt-0.5">
                      {doc.title}
                    </h3>
                  </div>
                </div>

                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-100 text-gray-600 uppercase shrink-0">
                  {doc.fileType}
                </span>
              </div>

              <p className="text-xs text-gray-600 mt-3 line-clamp-2 leading-relaxed">
                {doc.description}
              </p>

              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <span>Tác giả: {doc.author}</span>
                <span>Dung lượng: {doc.size}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">Cập nhật: {doc.updatedDate}</span>

              <div className="flex items-center gap-2">
                {doc.fileContent && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <FileCheck className="w-3 h-3" />
                    <span>Tệp gốc</span>
                  </span>
                )}
                <button
                  onClick={() => setViewingDoc(doc)}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Chi tiết</span>
                </button>
                <button
                  onClick={() => handleDownload(doc)}
                  className="px-3 py-1.5 rounded-lg bg-[#0878D1] hover:bg-[#064A87] text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải về</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Thầy có muốn xóa tài liệu "${doc.title}" khỏi hệ thống và Supabase không?`)) {
                      deleteDocument(doc.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Xóa tài liệu này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DETAIL MODAL */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-blue-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#064A87]">{viewingDoc.title}</h3>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs leading-relaxed text-gray-700">
              <div>
                <span className="font-bold text-gray-800">Chuyên mục:</span> {viewingDoc.categoryName}
              </div>
              <div>
                <span className="font-bold text-gray-800">Tác giả biên soạn:</span> {viewingDoc.author}
              </div>
              <div>
                <span className="font-bold text-gray-800">Định dạng & Dung lượng:</span> {viewingDoc.fileType} • {viewingDoc.size}
              </div>
              {viewingDoc.fileContent && (
                <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg text-emerald-800 border border-emerald-200">
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tệp đính kèm gốc sẵn sàng tải về với nội dung đầy đủ.</span>
                </div>
              )}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-gray-800 font-serif">
                <p className="font-bold text-[#064A87] mb-1">Nội dung tóm tắt:</p>
                <p>{viewingDoc.description}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setViewingDoc(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  handleDownload(viewingDoc);
                  setViewingDoc(null);
                }}
                className="px-4 py-2 bg-[#0878D1] hover:bg-[#064A87] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải tệp ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Exam & Documents Modal */}
      <UploadExamModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};
