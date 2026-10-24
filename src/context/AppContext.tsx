import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ClassRoom,
  Student,
  Question,
  Exam,
  GradeRecord,
  Assignment,
  DocItem,
  TeacherProfile,
  AppNotification,
  ExamSubmission,
  AttendanceSession,
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
  mapExamToDB,
  mapGradeRecordToDB,
  mapGradeRecordFromDB,
  mapAttendanceToDB,
  mapDocumentToDB,
  mapGameToDB,
  mapActivityToDB,
  mapTeacherProfileToDB,
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
    field: 'tx1' | 'tx2' | 'tx3' | 'gk' | 'ck',
    newVal: number,
    reason?: string
  ) => void;
  updateTeacherRemarks: (studentId: string, remarks: string) => void;

  updateTeacherProfile: (p: Partial<TeacherProfile>) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  saveAttendanceSession: (session: AttendanceSession) => void;
  deleteAttendanceSession: (sessionId: string) => void;

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
  } catch (e) {
    console.warn(`localStorage save failed for ${key}:`, e);
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
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('2025-2026');
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
    return true;
  };

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_classes`);
      if (saved !== null) return JSON.parse(saved);
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
          if (!errCls && dbClasses && dbClasses.length > 0) {
            const mappedCls = dbClasses.map(mapClassFromDB);
            setClasses(mappedCls);
            safeSetStorage(`${STORAGE_KEY}_classes`, mappedCls);
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

            // Also load corresponding grade records
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
        setSupabaseStatus('connected');
      }
      return { success: res.success, message: res.message };
    } finally {
      setIsSyncingWithSupabase(false);
    }
  };

  // Helper for background Supabase persistence without throwing
  const silentBgSync = (promise: PromiseLike<any>) => {
    promise.then(
      () => {},
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
      const matchingClass = classes.find((c) => c.name === st.className);
      const studentObj: Student = {
        id,
        code: st.code || `HS${Math.floor(1000 + Math.random() * 9000)}`,
        name: st.name,
        classId: matchingClass ? matchingClass.id : 'c10a1',
        className: st.className || '10A1',
        gender: (st.gender as 'Nam' | 'Nữ') || 'Nam',
        birthDate: st.birthDate || '2009-01-01',
        email: st.email || '',
        phone: st.phone || '',
        status: (st.status as any) || 'good',
        avgScore: st.avgScore || 0,
        totalTests: 0,
        notes: st.notes || 'Nhập từ tệp',
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

    setStudents((prev) => [...prev, ...newStList]);
    setGradeRecords((prev) => [...prev, ...newGradeList]);

    // Push imported students to Supabase
    if (newStList.length > 0) {
      silentBgSync(supabase.from('students').insert(newStList.map(mapStudentToDB)));
      silentBgSync(supabase.from('grade_records').insert(newGradeList.map(mapGradeRecordToDB)));
    }
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
    silentBgSync(supabase.from('exams').insert([mapExamToDB(newExam)]));
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
    silentBgSync(supabase.from('documents').insert([mapDocumentToDB(newDoc)]));
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
    silentBgSync(supabase.from('games').insert([mapGameToDB(newGame)]));
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
    silentBgSync(supabase.from('class_activities').insert([mapActivityToDB(newAct)]));
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
    field: 'tx1' | 'tx2' | 'tx3' | 'gk' | 'ck',
    newVal: number,
    reason?: string
  ) => {
    setGradeRecords((prev) =>
      prev.map((rec) => {
        if (rec.studentId !== studentId) return rec;

        const oldVal = rec[field] ?? 0;
        const updated = { ...rec, [field]: newVal };

        // Recalculate average: (tx1 + tx2 + tx3 + gk*2 + ck*3) / 8
        const tx1 = updated.tx1 ?? 0;
        const tx2 = updated.tx2 ?? 0;
        const tx3 = updated.tx3 ?? 0;
        const gk = updated.gk ?? 0;
        const ck = updated.ck ?? 0;

        const sum = tx1 + tx2 + tx3 + gk * 2 + ck * 3;
        const totalWeights = 1 + 1 + 1 + 2 + 3;
        const avg = Number((sum / totalWeights).toFixed(1));

        let rank: 'Giỏi' | 'Khá' | 'Trung bình' | 'Yếu' = 'Trung bình';
        if (avg >= 8.0) rank = 'Giỏi';
        else if (avg >= 6.5) rank = 'Khá';
        else if (avg >= 5.0) rank = 'Trung bình';
        else rank = 'Yếu';

        const history = updated.history || [];
        history.push({
          timestamp: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'),
          changedBy: 'Thầy Bùi Ngọc Thắng',
          field,
          oldVal,
          newVal,
          reason: reason || 'Cập nhật điểm trực tiếp trên bảng điểm',
        });

        // Update student state as well
        setStudents((sList) =>
          sList.map((st) => {
            if (st.id === studentId) {
              const status = avg < 5.0 ? 'danger' : avg < 6.5 ? 'warning' : 'good';
              return { ...st, avgScore: avg, status };
            }
            return st;
          })
        );

        const finalGradeRecord = {
          ...updated,
          avgScore: avg,
          rank,
          history,
        };

        // Sync to Supabase
        silentBgSync(supabase.from('grade_records').upsert([mapGradeRecordToDB(finalGradeRecord)]));

        return finalGradeRecord;
      })
    );
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
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = session;
        return next;
      }
      return [session, ...prev];
    });
    silentBgSync(supabase.from('attendance_sessions').upsert([mapAttendanceToDB(session)]));
  };

  const deleteAttendanceSession = (sessionId: string) => {
    setAttendanceSessions((prev) => prev.filter((s) => s.id !== sessionId));
    silentBgSync(supabase.from('attendance_sessions').delete().eq('id', sessionId));
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
      app: 'Toán học cùng thầy Thắng',
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
        updateTeacherRemarks,
        updateTeacherProfile,
        markNotificationAsRead,
        clearAllNotifications,
        saveAttendanceSession,
        deleteAttendanceSession,
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
