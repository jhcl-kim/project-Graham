import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  archiveCourse,
  archiveNote,
  initializeDatabase,
  loadCourses,
  loadTrashedCourses,
  loadTrashedNotes,
  permanentlyRemoveCourse,
  permanentlyRemoveNote,
  restoreCourse as restoreStoredCourse,
  restoreNote as restoreStoredNote,
  saveCourse,
  saveNote,
} from '../database/course_repo';

export type CourseNote = { id: string; text: string; createdAt: string };

export type Course = {
  id: string;
  code: string;
  title: string;
  units: number;
  year: string;
  instructor: string;
  schedule: string;
  room: string;
  color: string;
  notes: CourseNote[];
};

export type TrashedNote = CourseNote & {
  courseId: string;
  courseCode: string;
  courseTitle: string;
};

type NewCourse = Omit<Course, 'id' | 'color' | 'notes'>;

type CourseContextValue = {
  courses: Course[];
  trashedCourses: Course[];
  trashedNotes: TrashedNote[];
  isLoading: boolean;
  storageError: string | null;
  refreshData: () => Promise<void>;
  addCourse: (course: NewCourse) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  restoreCourse: (courseId: string) => Promise<void>;
  permanentlyDeleteCourse: (courseId: string) => Promise<void>;
  addNote: (courseId: string, text: string) => Promise<void>;
  deleteNote: (courseId: string, noteId: string) => Promise<void>;
  restoreNote: (noteId: string) => Promise<void>;
  permanentlyDeleteNote: (noteId: string) => Promise<void>;
};

// Keep generated course badges varied without storing a separate palette table.
const CourseContext = createContext<CourseContextValue | undefined>(undefined);
const courseColors = ['#2563EB', '#7C3AED', '#0891B2', '#059669', '#D97706'];
let nextCourseId = 0;
let nextNoteId = 0;

async function getStoredData() {
  return Promise.all([loadCourses(), loadTrashedCourses(), loadTrashedNotes()]);
}

// Own in-memory course state and expose persistence actions to every route.
export function CourseProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [trashedCourses, setTrashedCourses] = useState<Course[]>([]);
  const [trashedNotes, setTrashedNotes] = useState<TrashedNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Reload active and archived records together after any database mutation.
  const refreshStoredData = async () => {
    const [savedCourses, deletedCourses, deletedNotes] = await getStoredData();
    setCourses(savedCourses);
    setTrashedCourses(deletedCourses);
    setTrashedNotes(deletedNotes);
  };

  useEffect(() => {
    async function loadSavedCourses() {
      try {
        await initializeDatabase();
        const [savedCourses, deletedCourses, deletedNotes] = await getStoredData();
        setCourses(savedCourses);
        setTrashedCourses(deletedCourses);
        setTrashedNotes(deletedNotes);
      } catch {
        setStorageError('Your saved courses could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadSavedCourses();
  }, []);

  const value: CourseContextValue = {
    courses,
    trashedCourses,
    trashedNotes,
    isLoading,
    storageError,
    refreshData: refreshStoredData,
    addCourse: async (course) => {
      await saveCourse({
        ...course,
        id: `${Date.now()}-${nextCourseId++}`,
        color: courseColors[courses.length % courseColors.length],
        notes: [],
      });
      await refreshStoredData();
    },
    deleteCourse: async (courseId) => {
      await archiveCourse(courseId);
      await refreshStoredData();
    },
    restoreCourse: async (courseId) => {
      await restoreStoredCourse(courseId);
      await refreshStoredData();
    },
    permanentlyDeleteCourse: async (courseId) => {
      await permanentlyRemoveCourse(courseId);
      await refreshStoredData();
    },
    addNote: async (courseId, text) => {
      await saveNote(courseId, {
        id: `${Date.now()}-${nextNoteId++}`,
        text,
        createdAt: new Date().toLocaleString(),
      });
      await refreshStoredData();
    },
    deleteNote: async (_courseId, noteId) => {
      await archiveNote(noteId);
      await refreshStoredData();
    },
    restoreNote: async (noteId) => {
      await restoreStoredNote(noteId);
      await refreshStoredData();
    },
    permanentlyDeleteNote: async (noteId) => {
      await permanentlyRemoveNote(noteId);
      await refreshStoredData();
    },
  };

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}

// Require callers to render inside CourseProvider instead of hiding setup errors.
export function useCourses() {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider.');
  }
  return context;
}
