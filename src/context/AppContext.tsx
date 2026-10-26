import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ClassRoom,
  Student,
  StudentStatus,
  Question,
  Exam,
  GradeRecord,
  Assignment,
  DocItem,
  TeacherProfile,
  AppNotification,
  ExamSubmission,
  AttendanceSession,
  LeaveRequest,
  GameItem,
  ClassActivity,
} from '../types';
import {
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_QUESTIONS,
  INITIAL_EXAMS,
  INITIAL_ASSIGNMENTS,
  INITIAL_DOCUMENTS,
  INITIAL_GRADE_RECORDS,
  INITIAL_TEACHER_PROFILE,
  INITIAL_NOTIFICATIONS,
  INITIAL_ATTENDANCE_SESSIONS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_GAMES,
  INITIAL_ACTIVITIES,
} from '../data/mockData';
import { supabase, checkSupabaseConnection } from '../lib/supabase';
import {
  pushAllDataToSupabase,
  pullAllDataFromSupabase,
  mapClassToDB,
  mapClassFromDB,
  mapStudentToDB,
  mapStudentFromDB,
  mapQuestionToDB,
  mapQuestionFromDB,
  mapExamToDB,
  mapExamFromDB,
  mapGradeRecordToDB,
  mapGradeRecordFromDB,
  mapAttendanceToDB,
  mapAttendanceFromDB,
  mapDocumentToDB,
  mapDocumentFromDB,
  mapGameToDB,
  mapGameFromDB,
  mapActivityToDB,
  mapActivityFromDB,
  mapTeacherProfileToDB,
  mapTeacherProfileFromDB,
  mapSubmissionToDB,
  mapSubmissionFromDB,
} from '../lib/supabaseService';


export type NavTab =
  | 'dashboard'
  | 'classes'
  | 'activities'
  | 'attendance'
  | 'bank'
  | 'exams'
  | 'grades'
  | 'analytics'
  | 'games'
  | 'ai'
  | 'docs'
  | 'settings';


interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  classes: ClassRoom[];
  students: Student[];
  questions: Question[];
  exams: Exam[];
  gradeRecords: GradeRecord[];
  assignments: Assignment[];
  attendanceSessions: AttendanceSession[];
  documents: DocItem[];
  teacherProfile: TeacherProfile;
  notifications: AppNotification[];
  currentRole: 'teacher' | 'student';
  setCurrentRole: (role: 'teacher' | 'student') => void;
  isAuthenticated: boolean;
  logout: () => void;
  login: (role?: 'teacher' | 'student', password?: string) => boolean;
  selectedSchoolYear: string;
  setSelectedSchoolYear: (year: string) => void;
  selectedSemester: string;
  setSelectedSemester: (sem: string) => void;
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;

  // Selected student for detail dossier
  selectedStudent: Student | null;
  setSelectedStudent: (s: Student | null) => void;

  // Modals
  isCreateClassOpen: boolean;
  setIsCreateClassOpen: (open: boolean) => void;
  isAddStudentOpen: boolean;
  setIsAddStudentOpen: (open: boolean) => void;
  isImportStudentsOpen: boolean;
  setIsImportStudentsOpen: (open: boolean) => void;
  isCreateExamOpen: boolean;
  setIsCreateExamOpen: (open: boolean) => void;
  isAssignHomeworkOpen: boolean;
  setIsAssignHomeworkOpen: (open: boolean) => void;
  isEnterGradeOpen: boolean;
  setIsEnterGradeOpen: (open: boolean) => void;

  // Active exam taking mode (Student exam room)
  activeExamTaking: Exam | null;
  setActiveExamTaking: (exam: Exam | null) => void;
  submissions: ExamSubmission[];
  submitExam: (submission: ExamSubmission) => void;

  // AI assistant prefill
  aiInitialPrompt: string;
  setAiInitialPrompt: (p: string) => void;

  // Actions
  addClass: (cls: Omit<ClassRoom, 'id' | 'avgScore' | 'totalStudents'>) => void;
  updateClass: (id: string, updates: Partial<ClassRoom>) => void;
  deleteClass: (id: string) => void;

  addStudent: (st: Omit<Student, 'id' | 'avgScore' | 'totalTests' | 'recentScores'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  deleteStudentsBatch: (ids: string[]) => void;
  clearClassStudents: (classId: string) => void;
  clearAllStudents: () => void;
  importStudentsList: (newStudents: Partial<Student>[]) => void;

  addQuestion: (q: Omit<Question, 'id' | 'createdDate'>) => void;
  addQuestionsBatch: (newQuestions: Omit<Question, 'id' | 'createdDate'>[]) => Question[];
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;

  addExam: (e: Omit<Exam, 'id' | 'createdDate' | 'status'>) => void;
  updateExam: (id: string, updates: Partial<Exam>) => void;

  addDocument: (doc: Omit<DocItem, 'id' | 'updatedDate'>) => void;
  deleteDocument: (id: string) => void;

  games: GameItem[];
  addGame: (game: Omit<GameItem, 'id' | 'playsCount' | 'rating'>) => void;
  deleteGame: (gameId: string) => void;
  updateGame: (gameId: string, updates: Partial<GameItem>) => void;

  activities: ClassActivity[];
  addActivity: (act: Omit<ClassActivity, 'id' | 'likesCount' | 'createdDate'>) => void;
  updateActivity: (id: string, updates: Partial<ClassActivity>) => void;
  deleteActivity: (id: string) => void;
  toggleLikeActivity: (id: string) => void;
  togglePinActivity: (id: string) => void;

  addAssignment: (a: Omit<Assignment, 'id' | 'assignedDate' | 'submittedCount'>) => void;


  updateGrade: (
    studentId: string,
    field: 'tx1' | 'tx2' | 'tx3' | 'tx4' | 'gk' | 'ck',
    newVal: number,
    reason?: string
  ) => void;
  updateGradesBatch: (
    updates: {
      studentId: string;
      field: 'tx1' | 'tx2' | 'tx3' | 'tx4' | 'gk' | 'ck';
      newVal: number;
    }[],
    reason?: string
  ) => void;
  updateTeacherRemarks: (studentId: string, remarks: string) => void;

  updateTeacherProfile: (p: Partial<TeacherProfile>) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  saveAttendanceSession: (session: AttendanceSession) => void;
  deleteAttendanceSession: (sessionId: string) => void;
  leaveRequests: LeaveRequest[];
  addLeaveRequest: (lr: Omit<LeaveRequest, 'id' | 'createdAt'>) => void;
  updateLeaveRequest: (id: string, updates: Partial<LeaveRequest>) => void;
  deleteLeaveRequest: (id: string) => void;

  resetToDefaultData: () => void;
  clearAllData: () => void;
  exportDatabaseJSON: () => void;
  importDatabaseJSON: (jsonStr: string) => boolean;

  // Supabase Cloud Data sync
  supabaseStatus: 'checking' | 'connected' | 'not_configured' | 'tables_missing' | 'error';
  supabaseMessage: string;
  isSyncingWithSupabase: boolean;
  checkSupabaseHealth: () => Promise<void>;
  syncAllToSupabase: () => Promise<{ success: boolean; message: string; counts?: Record<string, number> }>;
  loadAllFromSupabase: () => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'thang_math_edtech_state_v2';
const CUSTOMIZED_KEY = `${STORAGE_KEY}_is_customized`;

const safeSetStorage = (key: string, val: any) => {
  try {
    localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
  } catch (e: any) {
    console.warn(`localStorage save failed for ${key}:`, e);
    // If quota exceeded due to large base64 file payloads, strip large data URLs for local fallback
    if (e?.name === 'QuotaExceededError' || e?.code === 22) {
      try {
        if (Array.isArray(val)) {
          const slim = val.map((item: any) => {
            if (item && typeof item === 'object') {
              const copy = { ...item };
              if (copy.fileContent && copy.fileContent.length > 500) {
                copy.fileContent = '';
              }
              return copy;
            }
            return item;
          });
          localStorage.setItem(key, JSON.stringify(slim));
        }
      } catch {
        // Supabase has the true persistent data
      }
    }
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [currentRole, setCurrentRole] = useState<'teacher' | 'student'>('teacher');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_is_authenticated`);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('2026-2027');
  const [selectedSemester, setSelectedSemester] = useState('Học kỳ 2');
  const [selectedClassId, setSelectedClassId] = useState('all');

  const logout = () => {
    setIsAuthenticated(false);
    safeSetStorage(`${STORAGE_KEY}_is_authenticated`, 'false');
    setActiveExamTaking(null);
  };

  const login = (role: 'teacher' | 'student' = 'teacher', _password?: string) => {
    setIsAuthenticated(true);
    setCurrentRole(role);
    safeSetStorage(`${STORAGE_KEY}_is_authenticated`, 'true');
    // Ensure fresh pull from Supabase Cloud on login
    checkSupabaseHealth();
    return true;
  };

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_classes`);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.length === 5 &&
          parsed.some((c: any) => c.name === '12A12') &&
          parsed.find((c: any) => c.name === '12A3')?.totalStudents === 52
        ) {
          return parsed.map((c: any) => ({ ...c, schoolYear: '2026-2027' }));
        }
      }
      return INITIAL_CLASSES;
    } catch {
      return INITIAL_CLASSES;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
      if (saved !== null) {
        return JSON.parse(saved);
      }
      // Default to empty array [] so mock students NEVER flash or reappear unexpectedly
      return [];
    } catch {
      return [];
    }
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_questions`);
      return saved !== null ? JSON.parse(saved) : INITIAL_QUESTIONS;
    } catch {
      return INITIAL_QUESTIONS;
    }
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_exams`);
      return saved !== null ? JSON.parse(saved) : INITIAL_EXAMS;
    } catch {
      return INITIAL_EXAMS;
    }
  });

  const [gradeRecords, setGradeRecords] = useState<GradeRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_grades`);
      if (saved !== null) return JSON.parse(saved);
      return [];
    } catch {
      return [];
    }
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_assignments`);
      return saved !== null ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
    } catch {
      return INITIAL_ASSIGNMENTS;
    }
  });

  const [documents, setDocuments] = useState<DocItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_documents`);
      return saved !== null ? JSON.parse(saved) : INITIAL_DOCUMENTS;
    } catch {
      return INITIAL_DOCUMENTS;
    }
  });

  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_profile`);
      return saved !== null ? JSON.parse(saved) : INITIAL_TEACHER_PROFILE;
    } catch {
      return INITIAL_TEACHER_PROFILE;
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
      return saved !== null ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [submissions, setSubmissions] = useState<ExamSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_submissions`);
      return saved !== null ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_attendance`);
      return saved !== null ? JSON.parse(saved) : INITIAL_ATTENDANCE_SESSIONS;
    } catch {
      return INITIAL_ATTENDANCE_SESSIONS;
    }
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_leave_requests`);
      return saved !== null ? JSON.parse(saved) : INITIAL_LEAVE_REQUESTS;
    } catch {
      return INITIAL_LEAVE_REQUESTS;
    }
  });

  const [games, setGames] = useState<GameItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_games`);
      return saved !== null ? JSON.parse(saved) : INITIAL_GAMES;
    } catch {
      return INITIAL_GAMES;
    }
  });

  const [activities, setActivities] = useState<ClassActivity[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_activities`);
      return saved !== null ? JSON.parse(saved) : INITIAL_ACTIVITIES;
    } catch {
      return INITIAL_ACTIVITIES;
    }
  });

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Modals state
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isImportStudentsOpen, setIsImportStudentsOpen] = useState(false);
  const [isCreateExamOpen, setIsCreateExamOpen] = useState(false);
  const [isAssignHomeworkOpen, setIsAssignHomeworkOpen] = useState(false);
  const [isEnterGradeOpen, setIsEnterGradeOpen] = useState(false);

  // Exam room
  const [activeExamTaking, setActiveExamTaking] = useState<Exam | null>(null);

  // AI assistant prefill
  const [aiInitialPrompt, setAiInitialPrompt] = useState('');

  // Save to localStorage whenever state changes
  useEffect(() => {
    safeSetStorage(`${STORAGE_KEY}_classes`, classes);
  }, [classes]);

  useEffect(() => {
    safeSetStorage(`${STORAGE_KEY}_students`, students);
  }, [students]);

  useEffect(() => {
    safeSetStorage(`${STORAGE_KEY}_questions`, questions);
  }, [questions]);

  useEffect(() => {
    safeSetStorage(`${STORAGE_KEY}_exams`, exams);
  }, [exams]);

  useEffect(() => {
    safeSetStorage(`${STORAGE_KEY}_grades`, gradeRecords);
  }, [gradeRecords]);

  useEffect(() => {
    safeSetStorage(`${STORAGE_KEY}_assignments`, assignments);
  }, [assignments]);

  useEffect(() => {
    safeSetStorage(`${STORAGE_KEY}_games`, games);
  }, [games]);

  useEffect(() => {
    safeSetStorage(`${STORAGE_KEY}_activities`, activities);
  }, [activities]);

  useEffect(() => {
    safeSetStorage(`${STORAGE_KEY}_profile`, teacherProfile);
  }, [teacherProfile]);

  useEffect(() => {
    safeSetStorage(`${STORAGE_KEY}_notifications`, notifications);
  }, [notifications]);

  useEffect(() => {
    safeSetStorage(`${STORAGE_KEY}_submissions`, submissions);
  }, [submissions]);

  useEffect(() => {
    safeSetStorage(`${STORAGE_KEY}_attendance`, attendanceSessions);
  }, [attendanceSessions]);

  useEffect(() => {
    safeSetStorage(`${STORAGE_KEY}_documents`, documents);
  }, [documents]);

  // Supabase cloud synchronization state
  const [supabaseStatus, setSupabaseStatus] = useState<
    'checking' | 'connected' | 'not_configured' | 'tables_missing' | 'error'
  >('checking');
  const [supabaseMessage, setSupabaseMessage] = useState('Đang kết nối Supabase Cloud...');
  const [isSyncingWithSupabase, setIsSyncingWithSupabase] = useState(false);

  const checkSupabaseHealth = async () => {
    setSupabaseStatus('checking');
    setSupabaseMessage('Đang kiểm tra kết nối Supabase Cloud...');
    try {
      const res = await checkSupabaseConnection();
      if (!res.connected) {
        setSupabaseStatus('error');
        setSupabaseMessage(res.message);
      } else if (res.tablesFound && res.tablesFound.length > 0) {
        setSupabaseStatus('connected');
        setSupabaseMessage(res.message);

        // 1. Sync classes from Supabase Cloud
        try {
          const { data: dbClasses, error: errCls } = await supabase.from('classes').select('*');
          const hasNew5Classes =
            dbClasses &&
            dbClasses.length === 5 &&
            dbClasses.some((c: any) => c.name === '12A12') &&
            dbClasses.find((c: any) => c.name === '12A3')?.total_students === 52;
          if (!errCls && dbClasses && hasNew5Classes) {
            const mappedCls = dbClasses.map(mapClassFromDB);
            setClasses(mappedCls);
            safeSetStorage(`${STORAGE_KEY}_classes`, mappedCls);
          } else if (!errCls) {
            // Push exact 5 Grade 12 classes to Supabase
            await supabase.from('classes').upsert(INITIAL_CLASSES.map(mapClassToDB), { onConflict: 'id' });
            if (dbClasses && dbClasses.length > 5) {
              const extraIds = dbClasses.map((c: any) => c.id).filter((id: string) => !INITIAL_CLASSES.some(ic => ic.id === id));
              if (extraIds.length > 0) {
                await supabase.from('classes').delete().in('id', extraIds);
              }
            }
            setClasses(INITIAL_CLASSES);
            safeSetStorage(`${STORAGE_KEY}_classes`, INITIAL_CLASSES);
          }
        } catch (clsErr) {
          console.warn('Supabase classes load notice:', clsErr);
        }

        // 2. Load students & grade records from Supabase Cloud
        try {
          const { data: dbStudents, error: errSt } = await supabase.from('students').select('*').limit(1000);
          if (!errSt && dbStudents !== null) {
            const mapped = dbStudents.map(mapStudentFromDB);
            setStudents(mapped);
            safeSetStorage(`${STORAGE_KEY}_students`, mapped);
            safeSetStorage(CUSTOMIZED_KEY, 'true');

            // Grade records
            const { data: dbGrades, error: errGrades } = await supabase.from('grade_records').select('*').limit(1000);
            if (!errGrades && dbGrades !== null) {
              const mappedGrades = dbGrades.map(mapGradeRecordFromDB);
              setGradeRecords(mappedGrades);
              safeSetStorage(`${STORAGE_KEY}_grades`, mappedGrades);
            }
          }
        } catch (cloudErr) {
          console.warn('Supabase students load notice:', cloudErr);
        }

        // 3. Sync Documents from Supabase Cloud (uploaded files across all browsers)
        try {
          const { data: dbDocs, error: errDocs } = await supabase
            .from('documents')
            .select('*')
            .order('created_at', { ascending: false });
          if (!errDocs && dbDocs && dbDocs.length > 0) {
            const mappedDocs = dbDocs.map(mapDocumentFromDB);
            setDocuments(mappedDocs);
            safeSetStorage(`${STORAGE_KEY}_documents`, mappedDocs);
          } else if (!errDocs && (!dbDocs || dbDocs.length === 0)) {
            await supabase.from('documents').upsert(INITIAL_DOCUMENTS.map(mapDocumentToDB), { onConflict: 'id' });
          }
        } catch (docErr) {
          console.warn('Supabase documents load notice:', docErr);
        }

        // 4. Sync Exams from Supabase Cloud
        try {
          const { data: dbExams, error: errExams } = await supabase
            .from('exams')
            .select('*')
            .order('created_at', { ascending: false });
          if (!errExams && dbExams && dbExams.length > 0) {
            const mappedExams = dbExams.map(mapExamFromDB);
            setExams(mappedExams);
            safeSetStorage(`${STORAGE_KEY}_exams`, mappedExams);
          } else if (!errExams && (!dbExams || dbExams.length === 0)) {
            await supabase.from('exams').upsert(INITIAL_EXAMS.map(mapExamToDB), { onConflict: 'id' });
          }
        } catch (examErr) {
          console.warn('Supabase exams load notice:', examErr);
        }

        // 5. Sync Questions Bank from Supabase Cloud
        try {
          const { data: dbQuestions, error: errQuestions } = await supabase
            .from('questions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(500);
          if (!errQuestions && dbQuestions && dbQuestions.length > 0) {
            const mappedQs = dbQuestions.map(mapQuestionFromDB);
            setQuestions(mappedQs);
            safeSetStorage(`${STORAGE_KEY}_questions`, mappedQs);
          } else if (!errQuestions && (!dbQuestions || dbQuestions.length === 0)) {
            await supabase.from('questions').upsert(INITIAL_QUESTIONS.map(mapQuestionToDB), { onConflict: 'id' });
          }
        } catch (qErr) {
          console.warn('Supabase questions load notice:', qErr);
        }

        // 6. Sync Games from Supabase Cloud (custom uploads & built-in games)
        try {
          const { data: dbGames, error: errGames } = await supabase
            .from('games')
            .select('*')
            .order('created_at', { ascending: false });
          if (!errGames && dbGames && dbGames.length > 0) {
            const mappedGames = dbGames.map(mapGameFromDB);
            setGames(mappedGames);
            safeSetStorage(`${STORAGE_KEY}_games`, mappedGames);
          } else if (!errGames && (!dbGames || dbGames.length === 0)) {
            await supabase.from('games').upsert(INITIAL_GAMES.map(mapGameToDB), { onConflict: 'id' });
          }
        } catch (gameErr) {
          console.warn('Supabase games load notice:', gameErr);
        }

        // 7. Sync Class Activities & STEM Projects from Supabase Cloud
        try {
          const { data: dbActs, error: errActs } = await supabase
            .from('class_activities')
            .select('*')
            .order('created_at', { ascending: false });
          if (!errActs && dbActs && dbActs.length > 0) {
            const mappedActs = dbActs.map(mapActivityFromDB);
            setActivities(mappedActs);
            safeSetStorage(`${STORAGE_KEY}_activities`, mappedActs);
          } else if (!errActs && (!dbActs || dbActs.length === 0)) {
            await supabase.from('class_activities').upsert(INITIAL_ACTIVITIES.map(mapActivityToDB), { onConflict: 'id' });
          }
        } catch (actErr) {
          console.warn('Supabase activities load notice:', actErr);
        }

        // 8. Sync Attendance Sessions from Supabase Cloud
        try {
          const { data: dbAtt, error: errAtt } = await supabase
            .from('attendance_sessions')
            .select('*')
            .order('created_at', { ascending: false });
          if (!errAtt && dbAtt && dbAtt.length > 0) {
            const mappedAtt = dbAtt.map(mapAttendanceFromDB);
            setAttendanceSessions(mappedAtt);
            safeSetStorage(`${STORAGE_KEY}_attendance`, mappedAtt);
          }
        } catch (attErr) {
          console.warn('Supabase attendance load notice:', attErr);
        }

        // 9. Sync Teacher Profile from Supabase Cloud
        try {
          const { data: dbProf, error: errProf } = await supabase
            .from('teacher_profile')
            .select('*')
            .limit(1);
          if (!errProf && dbProf && dbProf.length > 0) {
            const mappedProf = mapTeacherProfileFromDB(dbProf[0]);
            setTeacherProfile(mappedProf);
            safeSetStorage(`${STORAGE_KEY}_profile`, mappedProf);
          }
        } catch (profErr) {
          console.warn('Supabase profile load notice:', profErr);
        }

        // 10. Sync Exam Submissions from Supabase Cloud
        try {
          const { data: dbSubs, error: errSubs } = await supabase
            .from('exam_submissions')
            .select('*')
            .order('created_at', { ascending: false });
          if (!errSubs && dbSubs && dbSubs.length > 0) {
            const mappedSubs = dbSubs.map(mapSubmissionFromDB);
            setSubmissions(mappedSubs);
            safeSetStorage(`${STORAGE_KEY}_submissions`, mappedSubs);
          }
        } catch (subErr) {
          console.warn('Supabase submissions load notice:', subErr);
        }
      } else {
        setSupabaseStatus('tables_missing');
        setSupabaseMessage(res.message);
      }
    } catch (e: any) {
      setSupabaseStatus('error');
      setSupabaseMessage(`Lỗi kiểm tra kết nối: ${e.message}`);
    }
  };

  useEffect(() => {
    checkSupabaseHealth();
  }, []);

  const syncAllToSupabase = async () => {
    setIsSyncingWithSupabase(true);
    try {
      const res = await pushAllDataToSupabase({
        classes,
        students,
        questions,
        exams,
        gradeRecords,
        attendanceSessions,
        documents,
        games,
        activities,
        teacherProfile,
      });
      if (res.success) {
        setSupabaseStatus('connected');
        setSupabaseMessage(res.message);
      }
      return res;
    } finally {
      setIsSyncingWithSupabase(false);
    }
  };

  const loadAllFromSupabase = async () => {
    setIsSyncingWithSupabase(true);
    try {
      const res = await pullAllDataFromSupabase();
      if (res.success && res.data) {
        if (res.data.classes) setClasses(res.data.classes);
        if (res.data.students) setStudents(res.data.students);
        if (res.data.questions) setQuestions(res.data.questions);
        if (res.data.exams) setExams(res.data.exams);
        if (res.data.gradeRecords) setGradeRecords(res.data.gradeRecords);
        if (res.data.attendanceSessions) setAttendanceSessions(res.data.attendanceSessions);
        if (res.data.documents) setDocuments(res.data.documents);
        if (res.data.games) setGames(res.data.games);
        if (res.data.activities) setActivities(res.data.activities);
        if (res.data.teacherProfile) setTeacherProfile(res.data.teacherProfile);
        if (res.data.submissions) setSubmissions(res.data.submissions);
        setSupabaseStatus('connected');
      }
      return { success: res.success, message: res.message };
    } finally {
      setIsSyncingWithSupabase(false);
    }
  };

  // Helper for background Supabase persistence with error logging
  const silentBgSync = (promise: PromiseLike<any>) => {
    promise.then(
      (res: any) => {
        if (res && res.error) {
          console.error('Supabase persistence error:', res.error);
        }
      },
      (err) => {
        console.warn('Supabase sync note:', err);
      }
    );
  };

  // Recalculate student counts and class stats
  const addClass = (cls: Omit<ClassRoom, 'id' | 'avgScore' | 'totalStudents'>) => {
    const newClass: ClassRoom = {
      ...cls,
      id: `c_${Date.now()}`,
      totalStudents: 0,
      avgScore: 0,
    };
    setClasses((prev) => [newClass, ...prev]);
    silentBgSync(supabase.from('classes').insert([mapClassToDB(newClass)]));
  };

  const updateClass = (id: string, updates: Partial<ClassRoom>) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...updates };
          silentBgSync(supabase.from('classes').update(mapClassToDB(updated)).eq('id', id));
          return updated;
        }
        return c;
      })
    );
  };

  const deleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    silentBgSync(supabase.from('classes').delete().eq('id', id));
  };

  const addStudent = (st: Omit<Student, 'id' | 'avgScore' | 'totalTests' | 'recentScores'>) => {
    const newStudent: Student = {
      ...st,
      id: `s_${Date.now()}`,
      avgScore: 0,
      totalTests: 0,
      recentScores: [],
    };
    setStudents((prev) => {
      const next = [newStudent, ...prev];
      safeSetStorage(`${STORAGE_KEY}_students`, next);
      safeSetStorage(CUSTOMIZED_KEY, 'true');
      return next;
    });

    // Also add empty grade record
    const newGrade: GradeRecord = {
      studentId: newStudent.id,
      studentCode: newStudent.code,
      studentName: newStudent.name,
      className: newStudent.className,
      avgScore: 0,
      rank: 'Trung bình',
    };
    setGradeRecords((prev) => {
      const next = [...prev, newGrade];
      safeSetStorage(`${STORAGE_KEY}_grades`, next);
      return next;
    });

    // Increment class student count
    setClasses((prev) => {
      const next = prev.map((c) =>
        c.id === st.classId ? { ...c, totalStudents: c.totalStudents + 1 } : c
      );
      safeSetStorage(`${STORAGE_KEY}_classes`, next);
      const targetCls = next.find((c) => c.id === st.classId);
      if (targetCls) {
        silentBgSync(supabase.from('classes').update({ total_students: targetCls.totalStudents }).eq('id', st.classId));
      }
      return next;
    });

    // Background sync to Supabase
    silentBgSync(supabase.from('students').insert([mapStudentToDB(newStudent)]));
    silentBgSync(supabase.from('grade_records').insert([mapGradeRecordToDB(newGrade)]));
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      safeSetStorage(`${STORAGE_KEY}_students`, next);
      safeSetStorage(CUSTOMIZED_KEY, 'true');
      return next;
    });
    // If student name changed, update grade records as well
    if (updates.name || updates.className || updates.code) {
      setGradeRecords((prev) => {
        const next = prev.map((g) =>
          g.studentId === id
            ? {
                ...g,
                studentName: updates.name || g.studentName,
                studentCode: updates.code || g.studentCode,
                className: updates.className || g.className,
              }
            : g
        );
        safeSetStorage(`${STORAGE_KEY}_grades`, next);
        return next;
      });
    }
    const current = students.find((s) => s.id === id);
    if (current) {
      silentBgSync(supabase.from('students').update(mapStudentToDB({ ...current, ...updates })).eq('id', id));
    }
    if (selectedStudent && selectedStudent.id === id) {
      setSelectedStudent((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteStudent = (id: string) => {
    const st = students.find((s) => s.id === id);
    setStudents((prev) => {
      const next = prev.filter((s) => s.id !== id);
      safeSetStorage(`${STORAGE_KEY}_students`, next);
      safeSetStorage(CUSTOMIZED_KEY, 'true');
      return next;
    });
    setGradeRecords((prev) => {
      const next = prev.filter((g) => g.studentId !== id);
      safeSetStorage(`${STORAGE_KEY}_grades`, next);
      return next;
    });
    silentBgSync(supabase.from('students').delete().eq('id', id));
    silentBgSync(supabase.from('grade_records').delete().eq('student_id', id));
    if (st) {
      setClasses((prev) => {
        const next = prev.map((c) =>
          c.id === st.classId ? { ...c, totalStudents: Math.max(0, c.totalStudents - 1) } : c
        );
        safeSetStorage(`${STORAGE_KEY}_classes`, next);
        const updatedCls = next.find((c) => c.id === st.classId);
        if (updatedCls) {
          silentBgSync(supabase.from('classes').update({ total_students: updatedCls.totalStudents }).eq('id', st.classId));
        }
        return next;
      });
    }
    if (selectedStudent && selectedStudent.id === id) {
      setSelectedStudent(null);
    }
  };

  const deleteStudentsBatch = (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    const idsSet = new Set(ids);
    setStudents((prev) => {
      const next = prev.filter((s) => !idsSet.has(s.id));
      safeSetStorage(`${STORAGE_KEY}_students`, next);
      safeSetStorage(CUSTOMIZED_KEY, 'true');
      return next;
    });
    setGradeRecords((prev) => {
      const next = prev.filter((g) => !idsSet.has(g.studentId));
      safeSetStorage(`${STORAGE_KEY}_grades`, next);
      return next;
    });
    silentBgSync(supabase.from('students').delete().in('id', ids));
    silentBgSync(supabase.from('grade_records').delete().in('student_id', ids));

    setClasses((prev) => {
      const next = prev.map((c) => {
        const remaining = students.filter((s) => s.classId === c.id && !idsSet.has(s.id)).length;
        silentBgSync(supabase.from('classes').update({ total_students: remaining }).eq('id', c.id));
        return { ...c, totalStudents: remaining };
      });
      safeSetStorage(`${STORAGE_KEY}_classes`, next);
      return next;
    });
    if (selectedStudent && idsSet.has(selectedStudent.id)) {
      setSelectedStudent(null);
    }
  };

  const clearClassStudents = (classId: string) => {
    const targetStudents = students.filter((s) => s.classId === classId);
    if (targetStudents.length === 0) return;
    deleteStudentsBatch(targetStudents.map((s) => s.id));
  };

  const clearAllStudents = () => {
    setStudents([]);
    setGradeRecords([]);
    safeSetStorage(`${STORAGE_KEY}_students`, []);
    safeSetStorage(`${STORAGE_KEY}_grades`, []);
    safeSetStorage(CUSTOMIZED_KEY, 'true');
    setClasses((prev) => {
      const next = prev.map((c) => ({ ...c, totalStudents: 0 }));
      safeSetStorage(`${STORAGE_KEY}_classes`, next);
      return next;
    });
    silentBgSync(supabase.from('classes').update({ total_students: 0 }).neq('id', ''));
    silentBgSync(supabase.from('students').delete().neq('id', ''));
    silentBgSync(supabase.from('grade_records').delete().neq('student_id', ''));
    setSelectedStudent(null);
  };

  const importStudentsList = (newStudentsData: Partial<Student>[]) => {
    const newStList: Student[] = [];
    const newGradeList: GradeRecord[] = [];

    newStudentsData.forEach((st, idx) => {
      if (!st.name) return;
      const id = `s_imp_${Date.now()}_${idx}`;
      const targetClassName = (st.className || '').trim();
      const matchingClass = classes.find(
        (c) => c.name.toLowerCase() === targetClassName.toLowerCase() || c.id === st.classId
      ) || classes[0];

      const studentObj: Student = {
        id,
        code: st.code?.trim() || `HS${Math.floor(1000 + Math.random() * 9000)}`,
        name: st.name.trim(),
        classId: matchingClass ? matchingClass.id : (st.classId || 'c10a1'),
        className: matchingClass ? matchingClass.name : (st.className || '10A1'),
        gender: ((st.gender as string) === 'Nữ' || (st.gender as string) === 'Female' ? 'Nữ' : 'Nam'),
        birthDate: st.birthDate || '2009-01-01',
        email: st.email || '',
        phone: st.phone || '',
        status: (st.status as any) || 'good',
        avgScore: typeof st.avgScore === 'number' ? st.avgScore : 0,
        totalTests: 0,
        notes: st.notes || 'Nhập từ file Excel',
        recentScores: [],
      };
      newStList.push(studentObj);

      newGradeList.push({
        studentId: id,
        studentCode: studentObj.code,
        studentName: studentObj.name,
        className: studentObj.className,
        avgScore: studentObj.avgScore,
        rank: studentObj.avgScore >= 8 ? 'Giỏi' : studentObj.avgScore >= 6.5 ? 'Khá' : 'Trung bình',
      });
    });

    if (newStList.length === 0) return;

    setStudents((prev) => {
      const next = [...prev, ...newStList];
      safeSetStorage(`${STORAGE_KEY}_students`, next);
      safeSetStorage(CUSTOMIZED_KEY, 'true');
      return next;
    });

    setGradeRecords((prev) => {
      const next = [...prev, ...newGradeList];
      safeSetStorage(`${STORAGE_KEY}_grades`, next);
      return next;
    });

    // Update classes student counts
    setClasses((prev) => {
      const allStudents = [...students, ...newStList];
      const next = prev.map((c) => {
        const count = allStudents.filter(
          (s) => s.classId === c.id || s.className.toLowerCase() === c.name.toLowerCase()
        ).length;
        return { ...c, totalStudents: count };
      });
      safeSetStorage(`${STORAGE_KEY}_classes`, next);
      next.forEach((cls) => {
        silentBgSync(supabase.from('classes').update({ total_students: cls.totalStudents }).eq('id', cls.id));
      });
      return next;
    });

    // Push imported students to Supabase
    silentBgSync(supabase.from('students').insert(newStList.map(mapStudentToDB)));
    silentBgSync(supabase.from('grade_records').insert(newGradeList.map(mapGradeRecordToDB)));
  };

  const addQuestion = (q: Omit<Question, 'id' | 'createdDate'>) => {
    const newQ: Question = {
      ...q,
      id: `q_${Date.now()}`,
      createdDate: new Date().toLocaleDateString('vi-VN'),
    };
    setQuestions((prev) => [newQ, ...prev]);
    silentBgSync(supabase.from('questions').insert([mapQuestionToDB(newQ)]));
  };

  const addQuestionsBatch = (newQs: Omit<Question, 'id' | 'createdDate'>[]) => {
    const timestamp = Date.now();
    const createdDate = new Date().toLocaleDateString('vi-VN');
    const createdList: Question[] = newQs.map((q, idx) => ({
      ...q,
      id: `q_${timestamp}_${idx}`,
      createdDate,
    }));
    setQuestions((prev) => [...createdList, ...prev]);
    silentBgSync(supabase.from('questions').insert(createdList.map(mapQuestionToDB)));
    return createdList;
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const updated = { ...q, ...updates };
          silentBgSync(supabase.from('questions').update(mapQuestionToDB(updated)).eq('id', id));
          return updated;
        }
        return q;
      })
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    silentBgSync(supabase.from('questions').delete().eq('id', id));
  };

  const addExam = (e: Omit<Exam, 'id' | 'createdDate' | 'status'>) => {
    const newExam: Exam = {
      ...e,
      id: `e_${Date.now()}`,
      createdDate: new Date().toLocaleDateString('vi-VN'),
      status: 'active',
      avgScore: 0,
    };
    setExams((prev) => [newExam, ...prev]);
    silentBgSync(supabase.from('exams').upsert([mapExamToDB(newExam)], { onConflict: 'id' }));
  };

  const updateExam = (id: string, updates: Partial<Exam>) => {
    setExams((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const updated = { ...e, ...updates };
          silentBgSync(supabase.from('exams').update(mapExamToDB(updated)).eq('id', id));
          return updated;
        }
        return e;
      })
    );
  };

  const addDocument = (doc: Omit<DocItem, 'id' | 'updatedDate'>) => {
    const newDoc: DocItem = {
      ...doc,
      id: `doc_${Date.now()}`,
      updatedDate: new Date().toLocaleDateString('vi-VN'),
    };
    setDocuments((prev) => [newDoc, ...prev]);
    silentBgSync(supabase.from('documents').upsert([mapDocumentToDB(newDoc)], { onConflict: 'id' }));
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    silentBgSync(supabase.from('documents').delete().eq('id', id));
  };

  const addGame = (game: Omit<GameItem, 'id' | 'playsCount' | 'rating'>) => {
    const newGame: GameItem = {
      ...game,
      id: `game_custom_${Date.now()}`,
      playsCount: 0,
      rating: 5.0,
      createdDate: new Date().toLocaleDateString('vi-VN'),
      isCustomUpload: true,
      author: game.author || 'Thầy Bùi Ngọc Thắng',
    };
    setGames((prev) => [newGame, ...prev]);
    silentBgSync(supabase.from('games').upsert([mapGameToDB(newGame)], { onConflict: 'id' }));
  };

  const deleteGame = (gameId: string) => {
    setGames((prev) => prev.filter((g) => g.id !== gameId));
    silentBgSync(supabase.from('games').delete().eq('id', gameId));
  };

  const updateGame = (gameId: string, updates: Partial<GameItem>) => {
    setGames((prev) =>
      prev.map((g) => {
        if (g.id === gameId) {
          const updated = { ...g, ...updates };
          silentBgSync(supabase.from('games').update(mapGameToDB(updated)).eq('id', gameId));
          return updated;
        }
        return g;
      })
    );
  };

  const addActivity = (act: Omit<ClassActivity, 'id' | 'likesCount' | 'createdDate'>) => {
    const newAct: ClassActivity = {
      ...act,
      id: `act_${Date.now()}`,
      likesCount: 0,
      createdDate: new Date().toLocaleDateString('vi-VN'),
    };
    setActivities((prev) => [newAct, ...prev]);
    silentBgSync(supabase.from('class_activities').upsert([mapActivityToDB(newAct)], { onConflict: 'id' }));
  };

  const updateActivity = (id: string, updates: Partial<ClassActivity>) => {
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updated = { ...a, ...updates };
          silentBgSync(supabase.from('class_activities').update(mapActivityToDB(updated)).eq('id', id));
          return updated;
        }
        return a;
      })
    );
  };

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    silentBgSync(supabase.from('class_activities').delete().eq('id', id));
  };

  const toggleLikeActivity = (id: string) => {
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updated = { ...a, likesCount: a.likesCount + 1 };
          silentBgSync(supabase.from('class_activities').update({ likes_count: updated.likesCount }).eq('id', id));
          return updated;
        }
        return a;
      })
    );
  };

  const togglePinActivity = (id: string) => {
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updated = { ...a, isPinned: !a.isPinned };
          silentBgSync(supabase.from('class_activities').update({ is_pinned: updated.isPinned }).eq('id', id));
          return updated;
        }
        return a;
      })
    );
  };

  const addAssignment = (a: Omit<Assignment, 'id' | 'assignedDate' | 'submittedCount'>) => {
    const newA: Assignment = {
      ...a,
      id: `a_${Date.now()}`,
      assignedDate: new Date().toLocaleDateString('vi-VN'),
      submittedCount: 0,
    };
    setAssignments((prev) => [newA, ...prev]);
  };

  const updateGrade = (
    studentId: string,
    field: 'tx1' | 'tx2' | 'tx3' | 'tx4' | 'gk' | 'ck',
    newVal: number,
    reason?: string
  ) => {
    setGradeRecords((prev) => {
      const next = prev.map((rec) => {
        if (rec.studentId !== studentId) return rec;

        const oldVal = rec[field] ?? 0;
        const updated = { ...rec, [field]: newVal };

        // 4 Thường xuyên (HS1), 1 Giữa kỳ (HS2), 1 Cuối kỳ (HS3)
        // Chuẩn Thông tư 22: (TX1 + TX2 + TX3 + TX4 + GK*2 + CK*3) / 9
        const scoresWithWeights: { score: number | undefined; weight: number }[] = [
          { score: updated.tx1, weight: 1 },
          { score: updated.tx2, weight: 1 },
          { score: updated.tx3, weight: 1 },
          { score: updated.tx4, weight: 1 },
          { score: updated.gk, weight: 2 },
          { score: updated.ck, weight: 3 },
        ];

        let sumWeighted = 0;
        let totalWeights = 0;

        scoresWithWeights.forEach(({ score, weight }) => {
          if (typeof score === 'number' && !isNaN(score) && score >= 0) {
            sumWeighted += score * weight;
            totalWeights += weight;
          }
        });

        // Điểm trung bình môn học kỳ
        const avg = totalWeights > 0 ? Number((sumWeighted / totalWeights).toFixed(1)) : 0;

        let rank: 'Giỏi' | 'Khá' | 'Trung bình' | 'Yếu' = 'Trung bình';
        if (avg >= 8.0) rank = 'Giỏi';
        else if (avg >= 6.5) rank = 'Khá';
        else if (avg >= 5.0) rank = 'Trung bình';
        else rank = 'Yếu';

        const history = [...(updated.history || [])];
        history.push({
          timestamp: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'),
          changedBy: 'Thầy Bùi Ngọc Thắng',
          field: field.toUpperCase(),
          oldVal,
          newVal,
          reason: reason || 'Cập nhật trực tiếp trên bảng điểm',
        });

        const finalGradeRecord: GradeRecord = {
          ...updated,
          avgScore: avg,
          rank,
          history,
        };

        // Sync to Supabase
        silentBgSync(supabase.from('grade_records').upsert([mapGradeRecordToDB(finalGradeRecord)], { onConflict: 'student_id' }));

        return finalGradeRecord;
      });

      safeSetStorage(`${STORAGE_KEY}_grades`, next);

      // Cập nhật điểm TB và trạng thái trong danh sách học sinh
      const targetRecord = next.find((g) => g.studentId === studentId);
      if (targetRecord) {
        setStudents((sList) => {
          const sNext = sList.map((st) => {
            if (st.id === studentId) {
              const status: StudentStatus = targetRecord.avgScore < 5.0 ? 'danger' : targetRecord.avgScore < 6.5 ? 'warning' : 'good';
              return { ...st, avgScore: targetRecord.avgScore, status };
            }
            return st;
          });
          safeSetStorage(`${STORAGE_KEY}_students`, sNext);
          return sNext;
        });
      }

      return next;
    });
  };

  const updateGradesBatch = (
    updates: {
      studentId: string;
      field: 'tx1' | 'tx2' | 'tx3' | 'tx4' | 'gk' | 'ck';
      newVal: number;
    }[],
    reason?: string
  ) => {
    if (!updates || updates.length === 0) return;
    const updateMap = new Map<string, { field: 'tx1' | 'tx2' | 'tx3' | 'tx4' | 'gk' | 'ck'; newVal: number }[]>();
    updates.forEach((u) => {
      const list = updateMap.get(u.studentId) || [];
      list.push({ field: u.field, newVal: u.newVal });
      updateMap.set(u.studentId, list);
    });

    setGradeRecords((prev) => {
      const next = prev.map((rec) => {
        const studentUpdates = updateMap.get(rec.studentId);
        if (!studentUpdates) return rec;

        let updated = { ...rec };
        const history = [...(updated.history || [])];

        studentUpdates.forEach(({ field, newVal }) => {
          const oldVal = updated[field] ?? 0;
          updated[field] = newVal;
          history.push({
            timestamp: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'),
            changedBy: 'Thầy Bùi Ngọc Thắng',
            field: field.toUpperCase(),
            oldVal,
            newVal,
            reason: reason || 'Nhập điểm hàng loạt theo đợt kiểm tra',
          });
        });

        const scoresWithWeights = [
          { score: updated.tx1, weight: 1 },
          { score: updated.tx2, weight: 1 },
          { score: updated.tx3, weight: 1 },
          { score: updated.tx4, weight: 1 },
          { score: updated.gk, weight: 2 },
          { score: updated.ck, weight: 3 },
        ];

        let sumWeighted = 0;
        let totalWeights = 0;
        scoresWithWeights.forEach(({ score, weight }) => {
          if (typeof score === 'number' && !isNaN(score) && score >= 0) {
            sumWeighted += score * weight;
            totalWeights += weight;
          }
        });

        const avg = totalWeights > 0 ? Number((sumWeighted / totalWeights).toFixed(1)) : 0;
        let rank: 'Giỏi' | 'Khá' | 'Trung bình' | 'Yếu' = 'Trung bình';
        if (avg >= 8.0) rank = 'Giỏi';
        else if (avg >= 6.5) rank = 'Khá';
        else if (avg >= 5.0) rank = 'Trung bình';
        else rank = 'Yếu';

        const finalRecord: GradeRecord = {
          ...updated,
          avgScore: avg,
          rank,
          history,
        };

        silentBgSync(supabase.from('grade_records').upsert([mapGradeRecordToDB(finalRecord)], { onConflict: 'student_id' }));
        return finalRecord;
      });

      safeSetStorage(`${STORAGE_KEY}_grades`, next);

      setStudents((sList) => {
        const sNext = sList.map((st) => {
          const g = next.find((rec) => rec.studentId === st.id);
          if (g) {
            const status: StudentStatus = g.avgScore < 5.0 ? 'danger' : g.avgScore < 6.5 ? 'warning' : 'good';
            return { ...st, avgScore: g.avgScore, status };
          }
          return st;
        });
        safeSetStorage(`${STORAGE_KEY}_students`, sNext);
        return sNext;
      });

      return next;
    });
  };

  const updateTeacherRemarks = (studentId: string, remarks: string) => {
    setGradeRecords((prev) =>
      prev.map((r) => {
        if (r.studentId === studentId) {
          const updated = { ...r, teacherRemarks: remarks };
          silentBgSync(supabase.from('grade_records').update({ teacher_remarks: remarks }).eq('student_id', studentId));
          return updated;
        }
        return r;
      })
    );
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const updated = { ...s, notes: remarks };
          silentBgSync(supabase.from('students').update({ notes: remarks }).eq('id', studentId));
          return updated;
        }
        return s;
      })
    );
  };

  const updateTeacherProfile = (p: Partial<TeacherProfile>) => {
    setTeacherProfile((prev) => {
      const updated = { ...prev, ...p };
      silentBgSync(supabase.from('teacher_profile').upsert([mapTeacherProfileToDB(updated)]));
      return updated;
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const saveAttendanceSession = (session: AttendanceSession) => {
    setAttendanceSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === session.id);
      let next: AttendanceSession[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = session;
      } else {
        next = [session, ...prev];
      }
      safeSetStorage(`${STORAGE_KEY}_attendance`, next);
      return next;
    });
    silentBgSync(supabase.from('attendance_sessions').upsert([mapAttendanceToDB(session)]));
  };

  const deleteAttendanceSession = (sessionId: string) => {
    setAttendanceSessions((prev) => {
      const next = prev.filter((s) => s.id !== sessionId);
      safeSetStorage(`${STORAGE_KEY}_attendance`, next);
      return next;
    });
    silentBgSync(supabase.from('attendance_sessions').delete().eq('id', sessionId));
  };

  const addLeaveRequest = (lr: Omit<LeaveRequest, 'id' | 'createdAt'>) => {
    const newLr: LeaveRequest = {
      ...lr,
      id: `lr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setLeaveRequests((prev) => {
      const next = [newLr, ...prev];
      safeSetStorage(`${STORAGE_KEY}_leave_requests`, next);
      return next;
    });
  };

  const updateLeaveRequest = (id: string, updates: Partial<LeaveRequest>) => {
    setLeaveRequests((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
      safeSetStorage(`${STORAGE_KEY}_leave_requests`, next);
      return next;
    });
  };

  const deleteLeaveRequest = (id: string) => {
    setLeaveRequests((prev) => {
      const next = prev.filter((item) => item.id !== id);
      safeSetStorage(`${STORAGE_KEY}_leave_requests`, next);
      return next;
    });
  };

  const submitExam = (submission: ExamSubmission) => {
    setSubmissions((prev) => [submission, ...prev]);
    silentBgSync(supabase.from('exam_submissions').insert([{
      id: submission.id,
      exam_id: submission.examId,
      student_id: submission.studentId,
      student_name: submission.studentName,
      class_name: submission.className,
      submitted_at: submission.submittedAt,
      answers: submission.answers,
      auto_score: submission.autoScore,
      essay_score: submission.essayScore,
      total_score: submission.totalScore,
      status: submission.status,
      teacher_feedback: submission.teacherFeedback,
    }]));
  };

  const resetToDefaultData = () => {
    setClasses(INITIAL_CLASSES);
    setStudents(INITIAL_STUDENTS);
    setQuestions(INITIAL_QUESTIONS);
    setExams(INITIAL_EXAMS);
    setGradeRecords(INITIAL_GRADE_RECORDS);
    setAssignments(INITIAL_ASSIGNMENTS);
    setAttendanceSessions(INITIAL_ATTENDANCE_SESSIONS);
    setGames(INITIAL_GAMES);
    setActivities(INITIAL_ACTIVITIES);
    setTeacherProfile(INITIAL_TEACHER_PROFILE);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSubmissions([]);
    
    // Save to storage
    safeSetStorage(`${STORAGE_KEY}_classes`, INITIAL_CLASSES);
    safeSetStorage(`${STORAGE_KEY}_students`, INITIAL_STUDENTS);
    safeSetStorage(`${STORAGE_KEY}_grades`, INITIAL_GRADE_RECORDS);
    try {
      localStorage.removeItem(CUSTOMIZED_KEY);
    } catch {}

    // Sync to Supabase
    silentBgSync(supabase.from('classes').upsert(INITIAL_CLASSES.map(mapClassToDB)));
    silentBgSync(supabase.from('students').upsert(INITIAL_STUDENTS.map(mapStudentToDB)));
    silentBgSync(supabase.from('grade_records').upsert(INITIAL_GRADE_RECORDS.map(mapGradeRecordToDB)));
  };

  const clearAllData = () => {
    setClasses([]);
    setStudents([]);
    setQuestions([]);
    setExams([]);
    setGradeRecords([]);
    setAssignments([]);
    setAttendanceSessions([]);
    setGames([]);
    setActivities([]);
    setSubmissions([]);
  };

  const exportDatabaseJSON = () => {
    const payload = {
      app: 'WEB QUẢN TRỊ LỚP HỌC',
      school: 'Trường THPT Đan Phượng',
      exportDate: new Date().toISOString(),
      classes,
      students,
      questions,
      exams,
      gradeRecords,
      assignments,
      attendanceSessions,
      games,
      activities,
      teacherProfile,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DuLieu_ToanHoc_ThayThang_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDatabaseJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.classes) setClasses(data.classes);
      if (data.students) setStudents(data.students);
      if (data.questions) setQuestions(data.questions);
      if (data.exams) setExams(data.exams);
      if (data.gradeRecords) setGradeRecords(data.gradeRecords);
      if (data.assignments) setAssignments(data.assignments);
      if (data.attendanceSessions) setAttendanceSessions(data.attendanceSessions);
      if (data.games) setGames(data.games);
      if (data.activities) setActivities(data.activities);
      if (data.teacherProfile) setTeacherProfile(data.teacherProfile);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        classes,
        students,
        questions,
        exams,
        games,
        addGame,
        deleteGame,
        updateGame,
        activities,
        addActivity,
        updateActivity,
        deleteActivity,
        toggleLikeActivity,
        togglePinActivity,
        gradeRecords,
        assignments,
        attendanceSessions,
        documents,
        teacherProfile,
        notifications,
        currentRole,
        setCurrentRole,
        isAuthenticated,
        logout,
        login,
        selectedSchoolYear,
        setSelectedSchoolYear,
        selectedSemester,
        setSelectedSemester,
        selectedClassId,
        setSelectedClassId,
        selectedStudent,
        setSelectedStudent,
        isCreateClassOpen,
        setIsCreateClassOpen,
        isAddStudentOpen,
        setIsAddStudentOpen,
        isImportStudentsOpen,
        setIsImportStudentsOpen,
        isCreateExamOpen,
        setIsCreateExamOpen,
        isAssignHomeworkOpen,
        setIsAssignHomeworkOpen,
        isEnterGradeOpen,
        setIsEnterGradeOpen,
        activeExamTaking,
        setActiveExamTaking,
        submissions,
        submitExam,
        aiInitialPrompt,
        setAiInitialPrompt,
        addClass,
        updateClass,
        deleteClass,
        addStudent,
        updateStudent,
        deleteStudent,
        deleteStudentsBatch,
        clearClassStudents,
        clearAllStudents,
        importStudentsList,
        addQuestion,
        addQuestionsBatch,
        updateQuestion,
        deleteQuestion,
        addExam,
        updateExam,
        addDocument,
        deleteDocument,
        addAssignment,
        updateGrade,
        updateGradesBatch,
        updateTeacherRemarks,
        updateTeacherProfile,
        markNotificationAsRead,
        clearAllNotifications,
        saveAttendanceSession,
        deleteAttendanceSession,
        leaveRequests,
        addLeaveRequest,
        updateLeaveRequest,
        deleteLeaveRequest,
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
      }}
    >

      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
