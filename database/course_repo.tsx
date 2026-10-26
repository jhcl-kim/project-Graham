import * as SQLite from 'expo-sqlite';
import type { Course, CourseNote, TrashedNote } from '../context/course_context';

// Reuse the same async SQLite connection throughout the app session.
let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync('course-planner.db');
  }

  return databasePromise;
}

// Create tables, enable foreign keys, and migrate older databases if needed.
export async function initializeDatabase() {
  const database = await getDatabase();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY NOT NULL,
      code TEXT NOT NULL,
      title TEXT NOT NULL,
      units INTEGER NOT NULL,
      year TEXT NOT NULL,
      instructor TEXT NOT NULL,
      schedule TEXT NOT NULL,
      room TEXT NOT NULL,
      color TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY NOT NULL,
      course_id TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL,
      deleted_at TEXT,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );
  `);

  await addColumnIfMissing(database, 'courses');
  await addColumnIfMissing(database, 'notes');
}

// Add the soft-delete timestamp to installations created before Trash existed.
async function addColumnIfMissing(database: SQLite.SQLiteDatabase, tableName: 'courses' | 'notes') {
  const columns = await database.getAllAsync<{ name: string }>(`PRAGMA table_info(${tableName})`);
  if (!columns.some((column) => column.name === 'deleted_at')) {
    await database.execAsync(`ALTER TABLE ${tableName} ADD COLUMN deleted_at TEXT`);
  }
}

// Load active courses and attach each active note to its parent course.
export async function loadCourses(): Promise<Course[]> {
  const database = await getDatabase();
  const courses = await database.getAllAsync<Omit<Course, 'notes'>>(
    'SELECT id, code, title, units, year, instructor, schedule, room, color FROM courses WHERE deleted_at IS NULL ORDER BY rowid DESC'
  );
  const notes = await database.getAllAsync<{
    id: string;
    course_id: string;
    text: string;
    created_at: string;
  }>('SELECT id, course_id, text, created_at FROM notes WHERE deleted_at IS NULL ORDER BY rowid DESC');

  const notesByCourseId = new Map<string, CourseNote[]>();
  notes.forEach((note) => {
    const courseNotes = notesByCourseId.get(note.course_id) ?? [];
    courseNotes.push({ id: note.id, text: note.text, createdAt: note.created_at });
    notesByCourseId.set(note.course_id, courseNotes);
  });

  return courses.map((course) => ({
    ...course,
    notes: notesByCourseId.get(course.id) ?? [],
  }));
}

// Load archived courses separately so they do not appear in the active list.
export async function loadTrashedCourses(): Promise<Course[]> {
  const database = await getDatabase();
  const courses = await database.getAllAsync<Omit<Course, 'notes'>>(
    'SELECT id, code, title, units, year, instructor, schedule, room, color FROM courses WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC'
  );
  return courses.map((course) => ({ ...course, notes: [] }));
}

// Include parent-course labels so archived notes remain identifiable in Trash.
export async function loadTrashedNotes(): Promise<TrashedNote[]> {
  const database = await getDatabase();
  return database.getAllAsync<TrashedNote>(
    `SELECT notes.id, notes.course_id AS courseId, notes.text, notes.created_at AS createdAt,
            courses.code AS courseCode, courses.title AS courseTitle
     FROM notes INNER JOIN courses ON courses.id = notes.course_id
     WHERE notes.deleted_at IS NOT NULL ORDER BY notes.deleted_at DESC`
  );
}

// Insert new course and note records using parameterized SQL values.
export async function saveCourse(course: Course) {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO courses (id, code, title, units, year, instructor, schedule, room, color)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    course.id,
    course.code,
    course.title,
    course.units,
    course.year,
    course.instructor,
    course.schedule,
    course.room,
    course.color
  );
}

export async function saveNote(courseId: string, note: CourseNote) {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT INTO notes (id, course_id, text, created_at) VALUES (?, ?, ?, ?)',
    note.id,
    courseId,
    note.text,
    note.createdAt
  );
}

// Soft-delete records so they can be restored from the Trash screen.
export async function archiveCourse(courseId: string) {
  const database = await getDatabase();
  await database.runAsync('UPDATE courses SET deleted_at = ? WHERE id = ?', new Date().toISOString(), courseId);
}

// Clear the archive timestamp to restore a previously deleted record.
export async function restoreCourse(courseId: string) {
  const database = await getDatabase();
  await database.runAsync('UPDATE courses SET deleted_at = NULL WHERE id = ?', courseId);
}

// Permanently delete records; course notes cascade through the foreign key.
export async function permanentlyRemoveCourse(courseId: string) {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM courses WHERE id = ?', courseId);
}

export async function archiveNote(noteId: string) {
  const database = await getDatabase();
  await database.runAsync('UPDATE notes SET deleted_at = ? WHERE id = ?', new Date().toISOString(), noteId);
}

export async function restoreNote(noteId: string) {
  const database = await getDatabase();
  await database.runAsync('UPDATE notes SET deleted_at = NULL WHERE id = ?', noteId);
}

export async function permanentlyRemoveNote(noteId: string) {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM notes WHERE id = ?', noteId);
}
