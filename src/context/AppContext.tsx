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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'thang_math_edtech_state_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [currentRole, setCurrentRole] = useState<'teacher' | 'student'>('teacher');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_is_authenticated`);
    return saved !== null ? saved === 'true' : true;
  });
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('2025-2026');
  const [selectedSemester, setSelectedSemester] = useState('Học kỳ 2');
  const [selectedClassId, setSelectedClassId] = useState('all');

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem(`${STORAGE_KEY}_is_authenticated`, 'false');
    setActiveExamTaking(null);
  };

  const login = (role: 'teacher' | 'student' = 'teacher', _password?: string) => {
    setIsAuthenticated(true);
    setCurrentRole(role);
    localStorage.setItem(`${STORAGE_KEY}_is_authenticated`, 'true');
    return true;
  };

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_classes`);
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_questions`);
    return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_exams`);
    return saved ? JSON.parse(saved) : INITIAL_EXAMS;
  });

  const [gradeRecords, setGradeRecords] = useState<GradeRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_grades`);
    return saved ? JSON.parse(saved) : INITIAL_GRADE_RECORDS;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_assignments`);
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [documents, setDocuments] = useState<DocItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_documents`);
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_profile`);
    return saved ? JSON.parse(saved) : INITIAL_TEACHER_PROFILE;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [submissions, setSubmissions] = useState<ExamSubmission[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_submissions`);
    return saved ? JSON.parse(saved) : [];
  });

  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_attendance`);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE_SESSIONS;
  });

  const [games, setGames] = useState<GameItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_games`);
    return saved ? JSON.parse(saved) : INITIAL_GAMES;
  });

  const [activities, setActivities] = useState<ClassActivity[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_activities`);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
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

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_classes`, JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_questions`, JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_exams`, JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_grades`, JSON.stringify(gradeRecords));
  }, [gradeRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_assignments`, JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_games`, JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_activities`, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(teacherProfile));
  }, [teacherProfile]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_submissions`, JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_attendance`, JSON.stringify(attendanceSessions));
  }, [attendanceSessions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_documents`, JSON.stringify(documents));
  }, [documents]);


  // Recalculate student counts and class stats
  const addClass = (cls: Omit<ClassRoom, 'id' | 'avgScore' | 'totalStudents'>) => {
    const newClass: ClassRoom = {
      ...cls,
      id: `c_${Date.now()}`,
      totalStudents: 0,
      avgScore: 0,
    };
    setClasses((prev) => [newClass, ...prev]);
  };

  const updateClass = (id: string, updates: Partial<ClassRoom>) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  };

  const addStudent = (st: Omit<Student, 'id' | 'avgScore' | 'totalTests' | 'recentScores'>) => {
    const newStudent: Student = {
      ...st,
      id: `s_${Date.now()}`,
      avgScore: 0,
      totalTests: 0,
      recentScores: [],
    };
    setStudents((prev) => [newStudent, ...prev]);

    // Also add empty grade record
    const newGrade: GradeRecord = {
      studentId: newStudent.id,
      studentCode: newStudent.code,
      studentName: newStudent.name,
      className: newStudent.className,
      avgScore: 0,
      rank: 'Trung bình',
    };
    setGradeRecords((prev) => [...prev, newGrade]);

    // Increment class student count
    setClasses((prev) =>
      prev.map((c) =>
        c.id === st.classId ? { ...c, totalStudents: c.totalStudents + 1 } : c
      )
    );
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    if (selectedStudent && selectedStudent.id === id) {
      setSelectedStudent((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteStudent = (id: string) => {
    const st = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setGradeRecords((prev) => prev.filter((g) => g.studentId !== id));
    if (st) {
      setClasses((prev) =>
        prev.map((c) =>
          c.id === st.classId ? { ...c, totalStudents: Math.max(0, c.totalStudents - 1) } : c
        )
      );
    }
    if (selectedStudent && selectedStudent.id === id) {
      setSelectedStudent(null);
    }
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
  };

  const addQuestion = (q: Omit<Question, 'id' | 'createdDate'>) => {
    const newQ: Question = {
      ...q,
      id: `q_${Date.now()}`,
      createdDate: new Date().toLocaleDateString('vi-VN'),
    };
    setQuestions((prev) => [newQ, ...prev]);
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
    return createdList;
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
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
  };

  const updateExam = (id: string, updates: Partial<Exam>) => {
    setExams((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const addDocument = (doc: Omit<DocItem, 'id' | 'updatedDate'>) => {
    const newDoc: DocItem = {
      ...doc,
      id: `doc_${Date.now()}`,
      updatedDate: new Date().toLocaleDateString('vi-VN'),
    };
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
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
  };

  const deleteGame = (gameId: string) => {
    setGames((prev) => prev.filter((g) => g.id !== gameId));
  };

  const updateGame = (gameId: string, updates: Partial<GameItem>) => {
    setGames((prev) => prev.map((g) => (g.id === gameId ? { ...g, ...updates } : g)));
  };

  const addActivity = (act: Omit<ClassActivity, 'id' | 'likesCount' | 'createdDate'>) => {
    const newAct: ClassActivity = {
      ...act,
      id: `act_${Date.now()}`,
      likesCount: 0,
      createdDate: new Date().toLocaleDateString('vi-VN'),
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  const updateActivity = (id: string, updates: Partial<ClassActivity>) => {
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleLikeActivity = (id: string) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, likesCount: a.likesCount + 1 } : a))
    );
  };

  const togglePinActivity = (id: string) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isPinned: !a.isPinned } : a))
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

        return {
          ...updated,
          avgScore: avg,
          rank,
          history,
        };
      })
    );
  };

  const updateTeacherRemarks = (studentId: string, remarks: string) => {
    setGradeRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, teacherRemarks: remarks } : r))
    );
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, notes: remarks } : s))
    );
  };

  const updateTeacherProfile = (p: Partial<TeacherProfile>) => {
    setTeacherProfile((prev) => ({ ...prev, ...p }));
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
  };

  const deleteAttendanceSession = (sessionId: string) => {
    setAttendanceSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const submitExam = (submission: ExamSubmission) => {
    setSubmissions((prev) => [submission, ...prev]);
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
    localStorage.clear();
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
