import { supabase } from './supabase';
import {
  ClassRoom,
  Student,
  Question,
  Exam,
  GradeRecord,
  AttendanceSession,
  DocItem,
  GameItem,
  ClassActivity,
  TeacherProfile,
  ExamSubmission,
} from '../types';

// ==========================================
// Mappers: App Types <--> Supabase DB Tables
// ==========================================

export const mapClassToDB = (c: ClassRoom) => ({
  id: c.id,
  name: c.name,
  grade: c.grade,
  school_year: c.schoolYear,
  total_students: c.totalStudents || 0,
  room: c.room || '',
  teacher: c.teacher || '',
  avg_score: c.avgScore || 0,
  description: c.description || '',
  status: c.status || 'active',
});

export const mapClassFromDB = (row: any): ClassRoom => ({
  id: row.id,
  name: row.name,
  grade: row.grade,
  schoolYear: row.school_year || '2025-2026',
  totalStudents: row.total_students || 0,
  room: row.room || '',
  teacher: row.teacher || '',
  avgScore: Number(row.avg_score) || 0,
  description: row.description || '',
  status: row.status || 'active',
});

export const mapStudentToDB = (s: Student) => ({
  id: s.id,
  code: s.code,
  name: s.name,
  class_id: s.classId,
  class_name: s.className,
  gender: s.gender,
  birth_date: s.birthDate || null,
  email: s.email || null,
  phone: s.phone || null,
  status: s.status,
  status_reason: s.statusReason || null,
  avg_score: s.avgScore || 0,
  total_tests: s.totalTests || 0,
  notes: s.notes || null,
  recent_scores: s.recentScores || [],
  topic_strengths: s.topicStrengths || {},
});

export const mapStudentFromDB = (row: any): Student => ({
  id: row.id,
  code: row.code,
  name: row.name,
  classId: row.class_id,
  className: row.class_name,
  gender: row.gender,
  birthDate: row.birth_date,
  email: row.email,
  phone: row.phone,
  status: row.status || 'good',
  statusReason: row.status_reason,
  avgScore: Number(row.avg_score) || 0,
  totalTests: row.total_tests || 0,
  notes: row.notes,
  recentScores: Array.isArray(row.recent_scores) ? row.recent_scores : [],
  topicStrengths: row.topic_strengths || {},
});

export const mapQuestionToDB = (q: Question) => ({
  id: q.id,
  code: q.code,
  grade: q.grade,
  topic: q.topic,
  level: q.level,
  type: q.type,
  content: q.content,
  options: q.options || [],
  correct_answer: q.correctAnswer,
  solution: q.solution,
  points: q.points || 1,
  created_date: q.createdDate,
});

export const mapQuestionFromDB = (row: any): Question => ({
  id: row.id,
  code: row.code,
  grade: row.grade,
  topic: row.topic,
  level: row.level,
  type: row.type,
  content: row.content,
  options: Array.isArray(row.options) ? row.options : [],
  correctAnswer: row.correct_answer,
  solution: row.solution,
  points: Number(row.points) || 1,
  createdDate: row.created_date,
});

export const mapExamToDB = (e: Exam) => ({
  id: e.id,
  code: e.code,
  title: e.title,
  class_ids: e.classIds || [],
  class_names: e.classNames || [],
  grade: e.grade,
  duration_minutes: e.durationMinutes,
  total_questions: e.totalQuestions,
  created_date: e.createdDate,
  due_date: e.dueDate,
  status: e.status,
  question_ids: e.questionIds || [],
  avg_score: e.avgScore || 0,
  is_online: e.isOnline ?? true,
  shuffle_questions: e.shuffleQuestions ?? true,
});

export const mapExamFromDB = (row: any): Exam => ({
  id: row.id,
  code: row.code,
  title: row.title,
  classIds: Array.isArray(row.class_ids) ? row.class_ids : [],
  classNames: Array.isArray(row.class_names) ? row.class_names : [],
  grade: row.grade,
  durationMinutes: row.duration_minutes || 45,
  totalQuestions: row.total_questions || 0,
  createdDate: row.created_date,
  dueDate: row.due_date,
  status: row.status || 'active',
  questionIds: Array.isArray(row.question_ids) ? row.question_ids : [],
  avgScore: Number(row.avg_score) || 0,
  isOnline: row.is_online ?? true,
  shuffleQuestions: row.shuffle_questions ?? true,
});

export const mapGradeRecordToDB = (g: GradeRecord) => ({
  student_id: g.studentId,
  student_code: g.studentCode,
  student_name: g.studentName,
  class_name: g.className,
  tx1: g.tx1,
  tx2: g.tx2,
  tx3: g.tx3,
  gk: g.gk,
  ck: g.ck,
  avg_score: g.avgScore || 0,
  rank: g.rank,
  teacher_remarks: g.teacherRemarks,
  history: g.history || [],
});

export const mapGradeRecordFromDB = (row: any): GradeRecord => ({
  studentId: row.student_id,
  studentCode: row.student_code,
  studentName: row.student_name,
  className: row.class_name,
  tx1: row.tx1 !== null ? Number(row.tx1) : undefined,
  tx2: row.tx2 !== null ? Number(row.tx2) : undefined,
  tx3: row.tx3 !== null ? Number(row.tx3) : undefined,
  gk: row.gk !== null ? Number(row.gk) : undefined,
  ck: row.ck !== null ? Number(row.ck) : undefined,
  avgScore: Number(row.avg_score) || 0,
  rank: row.rank || 'Trung bình',
  teacherRemarks: row.teacher_remarks,
  history: Array.isArray(row.history) ? row.history : [],
});

export const mapAttendanceToDB = (a: AttendanceSession) => ({
  id: a.id,
  class_id: a.classId,
  class_name: a.className,
  date: a.date,
  period: a.period,
  topic: a.topic,
  teacher: a.teacher,
  total_students: a.totalStudents,
  present_count: a.presentCount,
  late_count: a.lateCount,
  excused_count: a.excusedCount,
  unexcused_count: a.unexcusedCount,
  records: a.records || [],
  note: a.note,
});

export const mapAttendanceFromDB = (row: any): AttendanceSession => ({
  id: row.id,
  classId: row.class_id,
  className: row.class_name,
  date: row.date,
  period: row.period,
  topic: row.topic,
  teacher: row.teacher,
  totalStudents: row.total_students || 0,
  presentCount: row.present_count || 0,
  lateCount: row.late_count || 0,
  excusedCount: row.excused_count || 0,
  unexcusedCount: row.unexcused_count || 0,
  records: Array.isArray(row.records) ? row.records : [],
  note: row.note,
  createdAt: row.created_at || new Date().toISOString(),
});

export const mapDocumentToDB = (d: DocItem) => ({
  id: d.id,
  title: d.title,
  category: d.category,
  category_name: d.categoryName,
  file_type: d.fileType,
  size: d.size,
  author: d.author,
  updated_date: d.updatedDate,
  download_url: d.downloadUrl,
  description: d.description,
  file_content: d.fileContent,
});

export const mapDocumentFromDB = (row: any): DocItem => ({
  id: row.id,
  title: row.title,
  category: row.category,
  categoryName: row.category_name,
  fileType: row.file_type,
  size: row.size,
  author: row.author,
  updatedDate: row.updated_date,
  downloadUrl: row.download_url,
  description: row.description,
  fileContent: row.file_content,
});

export const mapGameToDB = (g: GameItem) => ({
  id: g.id,
  title: g.title,
  subtitle: g.subtitle,
  description: g.description,
  category: g.category,
  category_name: g.categoryName,
  grade: g.grade !== undefined && g.grade !== null ? String(g.grade) : 'all',
  difficulty: g.difficulty,
  estimated_minutes: g.estimatedMinutes,
  plays_count: g.playsCount,
  rating: g.rating,
  thumbnail_color: g.thumbnailColor,
  tags: g.tags || [],
  badge: g.badge,
  game_source_type: g.gameSourceType,
  embed_url: g.embedUrl,
  html_content: g.htmlContent,
  quiz_questions: g.quizQuestions || [],
  is_custom_upload: g.isCustomUpload ?? false,
  author: g.author,
  created_date: g.createdDate,
});

export const mapGameFromDB = (row: any): GameItem => ({
  id: row.id,
  title: row.title,
  subtitle: row.subtitle,
  description: row.description,
  category: row.category,
  categoryName: row.category_name,
  grade: row.grade,
  difficulty: row.difficulty,
  estimatedMinutes: row.estimated_minutes,
  playsCount: row.plays_count,
  rating: Number(row.rating) || 5,
  thumbnailColor: row.thumbnail_color,
  tags: Array.isArray(row.tags) ? row.tags : [],
  badge: row.badge,
  gameSourceType: row.game_source_type,
  embedUrl: row.embed_url,
  htmlContent: row.html_content,
  quizQuestions: Array.isArray(row.quiz_questions) ? row.quiz_questions : [],
  isCustomUpload: row.is_custom_upload,
  author: row.author,
  createdDate: row.created_date,
});

export const mapActivityToDB = (a: ClassActivity) => ({
  id: a.id,
  title: a.title,
  class_id: a.classId,
  class_name: a.className,
  grade: a.grade,
  school_year: a.schoolYear,
  semester: a.semester,
  category: a.category,
  category_label: a.categoryLabel,
  date: a.date,
  description: a.description,
  teacher_remarks: a.teacherRemarks,
  images: a.images || [],
  video_url: a.videoUrl,
  video_title: a.videoTitle,
  featured_students: a.featuredStudents || [],
  likes_count: a.likesCount || 0,
  is_pinned: a.isPinned ?? false,
  author: a.author,
  created_date: a.createdDate,
});

export const mapActivityFromDB = (row: any): ClassActivity => ({
  id: row.id,
  title: row.title,
  classId: row.class_id,
  className: row.class_name,
  grade: row.grade,
  schoolYear: row.school_year,
  semester: row.semester,
  category: row.category,
  categoryLabel: row.category_label,
  date: row.date,
  description: row.description,
  teacherRemarks: row.teacher_remarks,
  images: Array.isArray(row.images) ? row.images : [],
  videoUrl: row.video_url,
  videoTitle: row.video_title,
  featuredStudents: Array.isArray(row.featured_students) ? row.featured_students : [],
  likesCount: row.likes_count || 0,
  isPinned: row.is_pinned ?? false,
  author: row.author,
  createdDate: row.created_date,
});

export const mapTeacherProfileToDB = (p: TeacherProfile) => ({
  id: 'main_profile',
  name: p.name,
  school: p.school,
  subject: p.subject,
  email: p.email,
  phone: p.phone,
  avatar_url: p.avatarUrl,
  bio: p.bio,
});

export const mapTeacherProfileFromDB = (row: any): TeacherProfile => ({
  name: row.name,
  school: row.school,
  subject: row.subject,
  email: row.email,
  phone: row.phone,
  avatarUrl: row.avatar_url,
  bio: row.bio,
});

export const mapSubmissionToDB = (s: ExamSubmission) => ({
  id: s.id,
  exam_id: s.examId,
  student_id: s.studentId,
  student_name: s.studentName,
  class_name: s.className,
  submitted_at: s.submittedAt,
  answers: s.answers || {},
  auto_score: s.autoScore || 0,
  essay_score: s.essayScore || 0,
  total_score: s.totalScore || 0,
  status: s.status || 'submitted',
  teacher_feedback: s.teacherFeedback || null,
});

export const mapSubmissionFromDB = (row: any): ExamSubmission => ({
  id: row.id,
  examId: row.exam_id,
  studentId: row.student_id,
  studentName: row.student_name,
  className: row.class_name,
  submittedAt: row.submitted_at,
  answers: row.answers || {},
  autoScore: Number(row.auto_score) || 0,
  essayScore: Number(row.essay_score) || 0,
  totalScore: Number(row.total_score) || 0,
  status: row.status || 'submitted',
  teacherFeedback: row.teacher_feedback,
});

// ==========================================
// Batch Push / Sync all data to Supabase
// ==========================================

export const pushAllDataToSupabase = async (state: {
  classes: ClassRoom[];
  students: Student[];
  questions: Question[];
  exams: Exam[];
  gradeRecords: GradeRecord[];
  attendanceSessions: AttendanceSession[];
  documents: DocItem[];
  games: GameItem[];
  activities: ClassActivity[];
  teacherProfile: TeacherProfile;
}): Promise<{ success: boolean; message: string; counts?: Record<string, number> }> => {
  try {
    const counts: Record<string, number> = {};

    // 1. Classes
    if (state.classes.length > 0) {
      const dbClasses = state.classes.map(mapClassToDB);
      const { error } = await supabase.from('classes').upsert(dbClasses, { onConflict: 'id' });
      if (error) throw new Error(`Lớp học: ${error.message}`);
      counts.classes = dbClasses.length;
    }

    // 2. Students (batching in chunks of 100 for safety)
    if (state.students.length > 0) {
      const dbStudents = state.students.map(mapStudentToDB);
      for (let i = 0; i < dbStudents.length; i += 100) {
        const chunk = dbStudents.slice(i, i + 100);
        const { error } = await supabase.from('students').upsert(chunk, { onConflict: 'id' });
        if (error) throw new Error(`Học sinh: ${error.message}`);
      }
      counts.students = dbStudents.length;
    }

    // 3. Questions
    if (state.questions.length > 0) {
      const dbQuestions = state.questions.map(mapQuestionToDB);
      for (let i = 0; i < dbQuestions.length; i += 50) {
        const chunk = dbQuestions.slice(i, i + 50);
        const { error } = await supabase.from('questions').upsert(chunk, { onConflict: 'id' });
        if (error) throw new Error(`Câu hỏi: ${error.message}`);
      }
      counts.questions = dbQuestions.length;
    }

    // 4. Exams
    if (state.exams.length > 0) {
      const dbExams = state.exams.map(mapExamToDB);
      const { error } = await supabase.from('exams').upsert(dbExams, { onConflict: 'id' });
      if (error) throw new Error(`Đề thi: ${error.message}`);
      counts.exams = dbExams.length;
    }

    // 5. Grade records
    if (state.gradeRecords.length > 0) {
      const dbGrades = state.gradeRecords.map(mapGradeRecordToDB);
      for (let i = 0; i < dbGrades.length; i += 100) {
        const chunk = dbGrades.slice(i, i + 100);
        const { error } = await supabase.from('grade_records').upsert(chunk, { onConflict: 'student_id' });
        if (error) throw new Error(`Sổ điểm: ${error.message}`);
      }
      counts.gradeRecords = dbGrades.length;
    }

    // 6. Attendance
    if (state.attendanceSessions.length > 0) {
      const dbAttendance = state.attendanceSessions.map(mapAttendanceToDB);
      const { error } = await supabase.from('attendance_sessions').upsert(dbAttendance, { onConflict: 'id' });
      if (error) throw new Error(`Điểm danh: ${error.message}`);
      counts.attendanceSessions = dbAttendance.length;
    }

    // 7. Documents
    if (state.documents.length > 0) {
      const dbDocs = state.documents.map(mapDocumentToDB);
      const { error } = await supabase.from('documents').upsert(dbDocs, { onConflict: 'id' });
      if (error) throw new Error(`Tài liệu: ${error.message}`);
      counts.documents = dbDocs.length;
    }

    // 8. Games
    if (state.games.length > 0) {
      const dbGames = state.games.map(mapGameToDB);
      const { error } = await supabase.from('games').upsert(dbGames, { onConflict: 'id' });
      if (error) throw new Error(`Trò chơi: ${error.message}`);
      counts.games = dbGames.length;
    }

    // 9. Activities
    if (state.activities.length > 0) {
      const dbActivities = state.activities.map(mapActivityToDB);
      const { error } = await supabase.from('class_activities').upsert(dbActivities, { onConflict: 'id' });
      if (error) throw new Error(`Hoạt động: ${error.message}`);
      counts.activities = dbActivities.length;
    }

    // 10. Teacher profile
    if (state.teacherProfile) {
      const dbProfile = mapTeacherProfileToDB(state.teacherProfile);
      const { error } = await supabase.from('teacher_profile').upsert([dbProfile], { onConflict: 'id' });
      if (error) throw new Error(`Hồ sơ giáo viên: ${error.message}`);
      counts.teacherProfile = 1;
    }

    return {
      success: true,
      message: 'Đã đồng bộ toàn bộ dữ liệu thành công lên Supabase!',
      counts,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Lỗi đồng bộ: ${err.message}`,
    };
  }
};

// ==========================================
// Pull all data from Supabase
// ==========================================

export const pullAllDataFromSupabase = async (): Promise<{
  success: boolean;
  message: string;
  data?: Partial<{
    classes: ClassRoom[];
    students: Student[];
    questions: Question[];
    exams: Exam[];
    gradeRecords: GradeRecord[];
    attendanceSessions: AttendanceSession[];
    documents: DocItem[];
    games: GameItem[];
    activities: ClassActivity[];
    teacherProfile: TeacherProfile;
    submissions: ExamSubmission[];
  }>;
}> => {
  try {
    const result: any = {};

    // 1. Classes
    const { data: dbClasses, error: errClasses } = await supabase.from('classes').select('*');
    if (!errClasses && dbClasses && dbClasses.length > 0) {
      result.classes = dbClasses.map(mapClassFromDB);
    }

    // 2. Students
    const { data: dbStudents, error: errStudents } = await supabase.from('students').select('*').limit(1000);
    if (!errStudents && dbStudents && dbStudents.length > 0) {
      result.students = dbStudents.map(mapStudentFromDB);
    }

    // 3. Questions
    const { data: dbQuestions, error: errQuestions } = await supabase.from('questions').select('*').limit(500);
    if (!errQuestions && dbQuestions && dbQuestions.length > 0) {
      result.questions = dbQuestions.map(mapQuestionFromDB);
    }

    // 4. Exams
    const { data: dbExams, error: errExams } = await supabase.from('exams').select('*');
    if (!errExams && dbExams && dbExams.length > 0) {
      result.exams = dbExams.map(mapExamFromDB);
    }

    // 5. Grade records
    const { data: dbGrades, error: errGrades } = await supabase.from('grade_records').select('*').limit(1000);
    if (!errGrades && dbGrades && dbGrades.length > 0) {
      result.gradeRecords = dbGrades.map(mapGradeRecordFromDB);
    }

    // 6. Attendance
    const { data: dbAttendance, error: errAttendance } = await supabase.from('attendance_sessions').select('*');
    if (!errAttendance && dbAttendance && dbAttendance.length > 0) {
      result.attendanceSessions = dbAttendance.map(mapAttendanceFromDB);
    }

    // 7. Documents
    const { data: dbDocs, error: errDocs } = await supabase.from('documents').select('*');
    if (!errDocs && dbDocs && dbDocs.length > 0) {
      result.documents = dbDocs.map(mapDocumentFromDB);
    }

    // 8. Games
    const { data: dbGames, error: errGames } = await supabase.from('games').select('*');
    if (!errGames && dbGames && dbGames.length > 0) {
      result.games = dbGames.map(mapGameFromDB);
    }

    // 9. Activities
    const { data: dbActivities, error: errActivities } = await supabase.from('class_activities').select('*');
    if (!errActivities && dbActivities && dbActivities.length > 0) {
      result.activities = dbActivities.map(mapActivityFromDB);
    }

    // 10. Teacher profile
    const { data: dbProfile, error: errProfile } = await supabase.from('teacher_profile').select('*').limit(1);
    if (!errProfile && dbProfile && dbProfile.length > 0) {
      result.teacherProfile = mapTeacherProfileFromDB(dbProfile[0]);
    }

    // 11. Submissions
    const { data: dbSubs, error: errSubs } = await supabase.from('exam_submissions').select('*');
    if (!errSubs && dbSubs && dbSubs.length > 0) {
      result.submissions = dbSubs.map(mapSubmissionFromDB);
    }

    const fetchedCount = Object.keys(result).length;
    if (fetchedCount === 0) {
      return {
        success: false,
        message: 'Chưa có dữ liệu nào trong các bảng Supabase. Bạn có thể nhấn nút "Đồng bộ dữ liệu mẫu lên Supabase" trước.',
      };
    }

    return {
      success: true,
      message: `Đã nạp thành công dữ liệu của ${fetchedCount} danh mục từ Supabase!`,
      data: result,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Lỗi khi tải dữ liệu từ Supabase: ${err.message}`,
    };
  }
};
