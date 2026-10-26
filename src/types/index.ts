export type GradeLevel = 10 | 11 | 12;

export type CognitiveLevel = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';

export type QuestionType = 'single_choice' | 'true_false' | 'short_answer' | 'essay';

export type StudentStatus = 'good' | 'warning' | 'danger';

export interface ClassRoom {
  id: string;
  name: string; // e.g. 10A1, 10A2, 11A1, 12A1
  grade: GradeLevel;
  schoolYear: string;
  totalStudents: number;
  room: string;
  teacher: string;
  avgScore: number;
  description?: string;
  status: 'active' | 'archived';
}

export interface Student {
  id: string;
  code: string; // e.g. HS1001
  name: string;
  classId: string;
  className: string;
  gender: 'Nam' | 'Nữ';
  birthDate?: string;
  email?: string;
  phone?: string;
  status: StudentStatus;
  statusReason?: string;
  avgScore: number;
  totalTests: number;
  notes?: string;
  recentScores: number[];
  topicStrengths?: { [topic: string]: number }; // score 0-10
}

export interface QuestionOption {
  key: 'A' | 'B' | 'C' | 'D';
  content: string; // may contain LaTeX
}

export interface Question {
  id: string;
  code: string;
  grade: GradeLevel;
  topic: string;
  level: CognitiveLevel;
  type: QuestionType;
  content: string; // LaTeX formatted
  options?: QuestionOption[];
  correctAnswer: string; // 'A', 'B', 'C', 'D' or 'Đúng,Sai,Đúng,Đúng' or number/text
  solution: string; // detailed LaTeX steps
  points: number;
  createdDate: string;
}

export interface Exam {
  id: string;
  code: string;
  title: string;
  classIds: string[];
  classNames: string[];
  grade: GradeLevel;
  durationMinutes: number;
  totalQuestions: number;
  createdDate: string;
  dueDate: string;
  status: 'draft' | 'active' | 'completed' | 'graded';
  questionIds: string[];
  avgScore?: number;
  isOnline: boolean;
  shuffleQuestions?: boolean;
}

export interface ExamSubmission {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  className: string;
  submittedAt: string;
  answers: { [questionId: string]: string };
  autoScore: number;
  essayScore: number;
  totalScore: number;
  status: 'in_progress' | 'submitted' | 'graded';
  teacherFeedback?: string;
}

export interface GradeChangeLog {
  timestamp: string;
  changedBy: string;
  field: string;
  oldVal: number;
  newVal: number;
  reason?: string;
}

export interface GradeRecord {
  studentId: string;
  studentCode: string;
  studentName: string;
  className: string;
  tx1?: number; // Thường xuyên 1 (HS1)
  tx2?: number; // Thường xuyên 2 (HS1)
  tx3?: number; // Thường xuyên 3 (HS1)
  tx4?: number; // Thường xuyên 4 (HS1)
  gk?: number;  // Giữa kỳ (hệ số 2)
  ck?: number;  // Cuối kỳ (hệ số 3)
  avgScore: number;
  rank: 'Giỏi' | 'Khá' | 'Trung bình' | 'Yếu';
  teacherRemarks?: string;
  history?: GradeChangeLog[];
}

export interface Assignment {
  id: string;
  title: string;
  className: string;
  dueDate: string;
  status: 'Đang làm' | 'Đã nộp' | 'Chưa nộp';
  submittedCount: number;
  totalCount: number;
  assignedDate: string;
}

export interface DocItem {
  id: string;
  title: string;
  category: 'sgk' | 'reference' | 'matrix' | 'guide' | 'exam';
  categoryName: string;
  fileType: 'PDF' | 'DOCX' | 'XLSX';
  size: string;
  author: string;
  updatedDate: string;
  downloadUrl?: string;
  description: string;
  fileContent?: string;
}

export interface TeacherProfile {
  name: string;
  school: string;
  subject: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  bio?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

export type AttendanceStatus = 'present' | 'late' | 'excused' | 'unexcused';

export type AbsenceReasonCategory =
  | 'Ốm đau / Sức khỏe'
  | 'Khám bệnh / Nhập viện'
  | 'Việc gia đình hiếu hỉ'
  | 'Thi HSG / Hoạt động Đoàn'
  | 'Trùng lịch thi / Bồi dưỡng'
  | 'Thời tiết / Hỏng xe'
  | 'Vắng không phép'
  | 'Khác';

export type LeaveRequesterType =
  | 'Phụ huynh gọi điện'
  | 'Tin nhắn Zalo/SMS'
  | 'Đơn xin phép viết tay'
  | 'Học sinh trực tiếp'
  | 'Giáo viên xác nhận';

export interface StudentAttendanceEntry {
  studentId: string;
  studentCode: string;
  studentName: string;
  status: AttendanceStatus;
  note?: string;
  reasonPreset?: AbsenceReasonCategory | string;
  requesterType?: LeaveRequesterType;
  lateMinutes?: number;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  classId: string;
  className: string;
  fromDate: string; // YYYY-MM-DD
  toDate: string;   // YYYY-MM-DD
  reasonCategory: AbsenceReasonCategory;
  detailedReason: string;
  requesterType: LeaveRequesterType;
  parentPhone?: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
  notes?: string;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  className: string;
  date: string; // format YYYY-MM-DD
  period: string; // e.g. "Tiết 1 - 2", "Tiết 3", "Buổi chiều"
  topic?: string; // Tên bài học / chuyên đề
  teacher: string;
  totalStudents: number;
  presentCount: number;
  lateCount: number;
  excusedCount: number;
  unexcusedCount: number;
  records: StudentAttendanceEntry[];
  note?: string;
  createdAt: string;
}

export type GameCategory = 'learning' | 'entertainment';

export type GameSourceType = 'built_in' | 'embed_url' | 'html_content' | 'quiz_game';

export interface GameQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface GameItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: GameCategory;
  categoryName: string;
  grade: 'all' | GradeLevel;
  difficulty: 'Dễ' | 'Trung bình' | 'Thử thách';
  estimatedMinutes: number;
  playsCount: number;
  rating: number;
  thumbnailColor: string;
  tags: string[];
  badge?: string;
  gameSourceType?: GameSourceType;
  embedUrl?: string;
  htmlContent?: string;
  quizQuestions?: GameQuizQuestion[];
  isCustomUpload?: boolean;
  author?: string;
  createdDate?: string;
}


export interface GameLeaderboardEntry {
  id: string;
  studentName: string;
  className: string;
  gameId: string;
  gameTitle: string;
  score: number;
  unit: string;
  date: string;
  badge?: string;
}

export type ActivityAttachmentType = 'word' | 'excel' | 'html' | 'video' | 'pdf' | 'other';

export interface ActivityAttachment {
  id: string;
  name: string;
  fileType: ActivityAttachmentType;
  size: number; // bytes
  urlOrData: string; // Base64 data URL or external URL
  uploadedAt: string;
  previewContent?: string; // Text content for HTML preview
}

export type ActivityCategory =
  | 'stem'
  | 'academic'
  | 'presentation'
  | 'extracurricular'
  | 'competition';

export interface ClassActivity {
  id: string;
  title: string;
  classId: string;
  className: string;
  grade: GradeLevel;
  schoolYear: string;
  semester: string;
  category: ActivityCategory;
  categoryLabel: string;
  date: string;
  description: string;
  teacherRemarks?: string;
  images: string[];
  videoUrl?: string; // YouTube URL, MP4 link, or Drive preview
  videoTitle?: string;
  featuredStudents?: string[]; // Commended students
  likesCount: number;
  isPinned?: boolean;
  author: string;
  createdDate: string;
  attachments?: ActivityAttachment[];
}


