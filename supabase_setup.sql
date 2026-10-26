-- ==============================================================================
-- CƠ SỞ DỮ LIỆU SUPABASE (POSTGRESQL) - HỆ THỐNG TOÁN HỌC CÙNG THẦY BÙI NGỌC THẮNG
-- Đơn vị: Trường THPT Đan Phượng, TP. Hà Nội
-- Hướng dẫn: Dán toàn bộ mã này vào Supabase -> SQL Editor -> Bấm RUN
-- ==============================================================================

-- Bật tiện ích mở rộng nếu cần
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. BẢNG LỚP HỌC (classes)
-- Quản lý các lớp 10, 11, 12, phòng học, giáo viên, sĩ số, điểm trung bình
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  grade INTEGER NOT NULL,
  school_year TEXT NOT NULL DEFAULT '2025-2026',
  total_students INTEGER DEFAULT 0,
  room TEXT DEFAULT '',
  teacher TEXT DEFAULT 'Thầy Bùi Ngọc Thắng',
  avg_score NUMERIC(4,2) DEFAULT 0.00,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classes_grade ON public.classes (grade);
CREATE INDEX IF NOT EXISTS idx_classes_school_year ON public.classes (school_year);

-- ==============================================================================
-- 2. BẢNG HỌC SINH (students)
-- Quản lý hồ sơ học sinh, lớp, điểm rèn luyện, năng lực chuyên đề
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  gender TEXT DEFAULT 'Nam',
  birth_date TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'good',
  status_reason TEXT,
  avg_score NUMERIC(4,2) DEFAULT 0.00,
  total_tests INTEGER DEFAULT 0,
  notes TEXT,
  recent_scores JSONB DEFAULT '[]'::jsonb,
  topic_strengths JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students (class_id);
CREATE INDEX IF NOT EXISTS idx_students_code ON public.students (code);
CREATE INDEX IF NOT EXISTS idx_students_name ON public.students (name);

-- ==============================================================================
-- 3. BẢNG NGÂN HÀNG CÂU HỎI (questions)
-- Câu hỏi Toán có công thức LaTeX, phân loại mức độ nhận thức, đáp án, lời giải
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  code TEXT,
  grade INTEGER NOT NULL,
  topic TEXT NOT NULL,
  level TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  options JSONB DEFAULT '[]'::jsonb,
  correct_answer TEXT,
  solution TEXT,
  points NUMERIC(4,2) DEFAULT 1.00,
  created_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_grade ON public.questions (grade);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.questions (topic);
CREATE INDEX IF NOT EXISTS idx_questions_level ON public.questions (level);

-- ==============================================================================
-- 4. BẢNG ĐỀ THI & KIỂM TRA (exams)
-- Quản lý bài kiểm tra định kỳ, 15 phút, giữa kỳ, cuối kỳ, thi trực tuyến
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.exams (
  id TEXT PRIMARY KEY,
  code TEXT,
  title TEXT NOT NULL,
  class_ids JSONB DEFAULT '[]'::jsonb,
  class_names JSONB DEFAULT '[]'::jsonb,
  grade INTEGER NOT NULL,
  duration_minutes INTEGER DEFAULT 45,
  total_questions INTEGER DEFAULT 0,
  created_date TEXT,
  due_date TEXT,
  status TEXT DEFAULT 'active',
  question_ids JSONB DEFAULT '[]'::jsonb,
  avg_score NUMERIC(4,2) DEFAULT 0.00,
  is_online BOOLEAN DEFAULT true,
  shuffle_questions BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exams_grade ON public.exams (grade);
CREATE INDEX IF NOT EXISTS idx_exams_status ON public.exams (status);

-- ==============================================================================
-- 5. BẢNG SỔ ĐIỂM (grade_records)
-- Điểm thành phần TX1, TX2, TX3, Giữa kỳ, Cuối kỳ, Điểm TB, Xếp loại, Lịch sử sửa điểm
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.grade_records (
  student_id TEXT PRIMARY KEY REFERENCES public.students(id) ON DELETE CASCADE,
  student_code TEXT,
  student_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  tx1 NUMERIC(4,2),
  tx2 NUMERIC(4,2),
  tx3 NUMERIC(4,2),
  tx4 NUMERIC(4,2),
  gk NUMERIC(4,2),
  ck NUMERIC(4,2),
  avg_score NUMERIC(4,2) DEFAULT 0.00,
  rank TEXT DEFAULT 'Trung bình',
  teacher_remarks TEXT,
  history JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.grade_records ADD COLUMN IF NOT EXISTS tx4 NUMERIC(4,2);

CREATE INDEX IF NOT EXISTS idx_grade_records_class_name ON public.grade_records (class_name);
CREATE INDEX IF NOT EXISTS idx_grade_records_rank ON public.grade_records (rank);

-- ==============================================================================
-- 6. BẢNG BÀI NỘP THI TRỰC TUYẾN (exam_submissions)
-- Lưu bài làm, câu trả lời học sinh đã chọn, điểm tự động chấm, nhận xét của thầy
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.exam_submissions (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  class_name TEXT,
  submitted_at TEXT NOT NULL,
  answers JSONB DEFAULT '{}'::jsonb,
  auto_score NUMERIC(4,2) DEFAULT 0.00,
  essay_score NUMERIC(4,2) DEFAULT 0.00,
  total_score NUMERIC(4,2) DEFAULT 0.00,
  status TEXT DEFAULT 'submitted',
  teacher_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_exam_id ON public.exam_submissions (exam_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON public.exam_submissions (student_id);

-- ==============================================================================
-- 7. BẢNG ĐIỂM DANH CHUYÊN CẦN (attendance_sessions)
-- Điểm danh theo từng tiết/buổi, sĩ số có mặt, muộn, có phép, không phép
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  date TEXT NOT NULL,
  period TEXT NOT NULL,
  topic TEXT,
  teacher TEXT DEFAULT 'Thầy Bùi Ngọc Thắng',
  total_students INTEGER DEFAULT 0,
  present_count INTEGER DEFAULT 0,
  late_count INTEGER DEFAULT 0,
  excused_count INTEGER DEFAULT 0,
  unexcused_count INTEGER DEFAULT 0,
  records JSONB DEFAULT '[]'::jsonb,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attendance_class_id ON public.attendance_sessions (class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_sessions (date);

-- ==============================================================================
-- 8. BẢNG KHO TÀI LIỆU TOÁN HỌC (documents)
-- Sách giáo khoa, chuyên đề ôn thi, ma trận đặc tả đề, tài liệu PDF/Word
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  category_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  size TEXT,
  author TEXT DEFAULT 'Thầy Bùi Ngọc Thắng',
  updated_date TEXT,
  download_url TEXT,
  description TEXT,
  file_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents (category);

-- ==============================================================================
-- 9. BẢNG TRÒ CHƠI TOÁN HỌC (games)
-- Game Toán học, trắc nghiệm tính nhanh, thử thách giải đố tương tác
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.games (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  category TEXT NOT NULL,
  category_name TEXT,
  grade TEXT DEFAULT 'all',
  difficulty TEXT DEFAULT 'Trung bình',
  estimated_minutes INTEGER DEFAULT 10,
  plays_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 5.00,
  thumbnail_color TEXT DEFAULT '#0878D1',
  tags JSONB DEFAULT '[]'::jsonb,
  badge TEXT,
  game_source_type TEXT DEFAULT 'built_in',
  embed_url TEXT,
  html_content TEXT,
  quiz_questions JSONB DEFAULT '[]'::jsonb,
  is_custom_upload BOOLEAN DEFAULT false,
  author TEXT DEFAULT 'Thầy Bùi Ngọc Thắng',
  created_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. BẢNG HOẠT ĐỘNG LỚP HỌC & STEM (class_activities)
-- Nhật ký dự án STEM, thuyết trình toán học, kỷ yếu hình ảnh, video hoạt động
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.class_activities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  grade INTEGER NOT NULL,
  school_year TEXT DEFAULT '2025-2026',
  semester TEXT DEFAULT 'Học kỳ 2',
  category TEXT NOT NULL,
  category_label TEXT,
  date TEXT,
  description TEXT,
  teacher_remarks TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  video_title TEXT,
  featured_students JSONB DEFAULT '[]'::jsonb,
  likes_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  author TEXT DEFAULT 'Thầy Bùi Ngọc Thắng',
  created_date TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_class_id ON public.class_activities (class_id);
CREATE INDEX IF NOT EXISTS idx_activities_grade ON public.class_activities (grade);

-- ==============================================================================
-- 11. BẢNG HỒ SƠ GIÁO VIÊN (teacher_profile)
-- Thông tin cá nhân, trường THPT Đan Phượng, email, điện thoại, giới thiệu
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.teacher_profile (
  id TEXT PRIMARY KEY DEFAULT 'main_profile',
  name TEXT NOT NULL DEFAULT 'Thầy Bùi Ngọc Thắng',
  school TEXT DEFAULT 'Trường THPT Đan Phượng',
  subject TEXT DEFAULT 'Toán học THPT',
  email TEXT DEFAULT 'thangtoandp@gmail.com',
  phone TEXT DEFAULT '0988 888 888',
  avatar_url TEXT,
  bio TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- CẤU HÌNH BẢO MẬT ROW LEVEL SECURITY (RLS) VÀ PHÂN QUYỀN
-- Cho phép đọc/ghi qua Anon / Public API Key an toàn trong môi trường giáo dục
-- ==============================================================================
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'classes', 
    'students', 
    'questions', 
    'exams', 
    'grade_records',
    'exam_submissions', 
    'attendance_sessions', 
    'documents', 
    'games',
    'class_activities', 
    'teacher_profile'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    -- Bật tính năng Row Level Security
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    
    -- Xoá các chính sách cũ (nếu có)
    EXECUTE format('DROP POLICY IF EXISTS "Allow full access for anon" ON public.%I;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Allow public read write" ON public.%I;', tbl);
    
    -- Tạo chính sách cho phép truy vấn (SELECT, INSERT, UPDATE, DELETE) qua anon key
    EXECUTE format('CREATE POLICY "Allow public read write" ON public.%I FOR ALL TO anon USING (true) WITH CHECK (true);', tbl);
  END LOOP;
END $$;

-- Thông báo kết quả hoàn thành
SELECT 'CHÚC MỪNG: Khởi tạo toàn bộ 11 bảng cơ sở dữ liệu Supabase thành công!' AS ket_qua;
