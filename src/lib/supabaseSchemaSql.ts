export const SUPABASE_INIT_SQL = `-- ============================================================
-- SCRIPT KHỞI TẠO CƠ SỞ DỮ LIỆU SUPABASE
-- Hệ thống: Toán học cùng thầy Bùi Ngọc Thắng (THPT Đan Phượng)
-- ============================================================

-- 1. BẢNG LỚP HỌC (classes)
CREATE TABLE IF NOT EXISTS public.classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  grade INTEGER NOT NULL,
  school_year TEXT NOT NULL,
  total_students INTEGER DEFAULT 0,
  room TEXT,
  teacher TEXT,
  avg_score NUMERIC DEFAULT 0,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG HỌC SINH (students)
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  class_id TEXT NOT NULL,
  class_name TEXT NOT NULL,
  gender TEXT DEFAULT 'Nam',
  birth_date TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'good',
  status_reason TEXT,
  avg_score NUMERIC DEFAULT 0,
  total_tests INTEGER DEFAULT 0,
  notes TEXT,
  recent_scores JSONB DEFAULT '[]'::jsonb,
  topic_strengths JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BẢNG NGÂN HÀNG CÂU HỎI (questions)
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
  points NUMERIC DEFAULT 1,
  created_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BẢNG ĐỀ THI & KIỂM TRA (exams)
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
  avg_score NUMERIC DEFAULT 0,
  is_online BOOLEAN DEFAULT true,
  shuffle_questions BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BẢNG SỔ ĐIỂM (grade_records)
CREATE TABLE IF NOT EXISTS public.grade_records (
  student_id TEXT PRIMARY KEY,
  student_code TEXT,
  student_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  tx1 NUMERIC,
  tx2 NUMERIC,
  tx3 NUMERIC,
  tx4 NUMERIC,
  gk NUMERIC,
  ck NUMERIC,
  avg_score NUMERIC DEFAULT 0,
  rank TEXT,
  teacher_remarks TEXT,
  history JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BẢNG BÀI NỘP THI TRỰC TUYẾN (exam_submissions)
CREATE TABLE IF NOT EXISTS public.exam_submissions (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  class_name TEXT,
  submitted_at TEXT NOT NULL,
  answers JSONB DEFAULT '{}'::jsonb,
  auto_score NUMERIC DEFAULT 0,
  essay_score NUMERIC DEFAULT 0,
  total_score NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'submitted',
  teacher_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BẢNG ĐIỂM DANH (attendance_sessions)
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL,
  class_name TEXT NOT NULL,
  date TEXT NOT NULL,
  period TEXT NOT NULL,
  topic TEXT,
  teacher TEXT,
  total_students INTEGER DEFAULT 0,
  present_count INTEGER DEFAULT 0,
  late_count INTEGER DEFAULT 0,
  excused_count INTEGER DEFAULT 0,
  unexcused_count INTEGER DEFAULT 0,
  records JSONB DEFAULT '[]'::jsonb,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. BẢNG TÀI LIỆU TOÁN HỌC (documents)
CREATE TABLE IF NOT EXISTS public.documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  category_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  size TEXT,
  author TEXT,
  updated_date TEXT,
  download_url TEXT,
  description TEXT,
  file_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. BẢNG TRÒ CHƠI TOÁN HỌC (games)
CREATE TABLE IF NOT EXISTS public.games (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  category TEXT NOT NULL,
  category_name TEXT,
  grade TEXT,
  difficulty TEXT,
  estimated_minutes INTEGER DEFAULT 10,
  plays_count INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 5,
  thumbnail_color TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  badge TEXT,
  game_source_type TEXT,
  embed_url TEXT,
  html_content TEXT,
  quiz_questions JSONB DEFAULT '[]'::jsonb,
  is_custom_upload BOOLEAN DEFAULT false,
  author TEXT,
  created_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. BẢNG HOẠT ĐỘNG LỚP HỌC (class_activities)
CREATE TABLE IF NOT EXISTS public.class_activities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  class_id TEXT NOT NULL,
  class_name TEXT NOT NULL,
  grade INTEGER NOT NULL,
  school_year TEXT,
  semester TEXT,
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
  author TEXT,
  created_date TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. BẢNG HỒ SƠ GIÁO VIÊN (teacher_profile)
CREATE TABLE IF NOT EXISTS public.teacher_profile (
  id TEXT PRIMARY KEY DEFAULT 'main_profile',
  name TEXT NOT NULL,
  school TEXT,
  subject TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CẤU HÌNH PHÂN QUYỀN VÀ ROW LEVEL SECURITY (RLS)
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'classes', 'students', 'questions', 'exams', 'grade_records',
    'exam_submissions', 'attendance_sessions', 'documents', 'games',
    'class_activities', 'teacher_profile'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Allow full access for anon" ON public.%I;', tbl);
    EXECUTE format('CREATE POLICY "Allow full access for anon" ON public.%I FOR ALL TO anon USING (true) WITH CHECK (true);', tbl);
  END LOOP;
END $$;
`;
