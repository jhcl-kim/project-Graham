import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { BottomNavigation } from '../components/bottom_nav';
import { useCourses } from '../context/course_context';

type Category = 'courses' | 'notes';

export default function TrashScreen() {
  const { trashedCourses, trashedNotes, restoreCourse, permanentlyDeleteCourse, restoreNote, permanentlyDeleteNote, refreshData } = useCourses();
  const [category, setCategory] = useState<Category>('courses');
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const runAction = async (action: () => Promise<void>) => {
    try {
      await action();
      setError('');
    } catch {
      setError('That item could not be updated. Please try again.');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      setError('');
    } catch {
      setError('Trash could not be reloaded. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.switcher}>
        <Pressable style={[styles.categoryButton, category === 'courses' && styles.categoryButtonActive]} onPress={() => setCategory('courses')}>
          <Text style={[styles.categoryText, category === 'courses' && styles.categoryTextActive]}>Courses</Text>
        </Pressable>
        <Pressable style={[styles.categoryButton, category === 'notes' && styles.categoryButtonActive]} onPress={() => setCategory('notes')}>
          <Text style={[styles.categoryText, category === 'notes' && styles.categoryTextActive]}>Notes</Text>
        </Pressable>
      </View>
      {error !== '' && <Text style={styles.error}>{error}</Text>}

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void handleRefresh()} tintColor="#1D4ED8" />}
      >
        {category === 'courses' ? (
          trashedCourses.length === 0 ? <Empty message="No deleted courses" /> : trashedCourses.map((course) => (
            <View key={course.id} style={styles.card}>
              <View style={[styles.badge, { backgroundColor: course.color }]}><Text style={styles.badgeText}>{course.code}</Text></View>
              <View style={styles.cardBody}><Text style={styles.title}>{course.title}</Text><Text style={styles.meta}>{course.units} Units • {course.year}</Text></View>
              <Actions onRestore={() => void runAction(() => restoreCourse(course.id))} onDelete={() => void runAction(() => permanentlyDeleteCourse(course.id))} />
            </View>
          ))
        ) : (
          trashedNotes.length === 0 ? <Empty message="No deleted notes" /> : trashedNotes.map((note) => (
            <View key={note.id} style={styles.noteCard}>
              <View style={styles.noteBody}><Text style={styles.noteText}>{note.text}</Text><Text style={styles.meta}>{note.courseCode} • {note.courseTitle}</Text></View>
              <Actions onRestore={() => void runAction(() => restoreNote(note.id))} onDelete={() => void runAction(() => permanentlyDeleteNote(note.id))} />
            </View>
          ))
        )}
      </ScrollView>
      <BottomNavigation />
    </View>
  );
}

// Compact action buttons shared by archived course and note cards.
function Actions({ onRestore, onDelete }: { onRestore: () => void; onDelete: () => void }) {
  return <View style={styles.actions}><Pressable style={styles.iconButton} onPress={onRestore} accessibilityLabel="Restore"><Ionicons name="arrow-undo-outline" size={21} color="#1D4ED8" /></Pressable><Pressable style={styles.iconButton} onPress={onDelete} accessibilityLabel="Delete permanently"><Ionicons name="trash-outline" size={21} color="#C0392B" /></Pressable></View>;
}

// Shared empty-state message for either trash category.
function Empty({ message }: { message: string }) { return <Text style={styles.empty}>{message}</Text>; }

// Card and switcher styles keep archived items readable on narrow screens.
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6F9FF' },
  switcher: { flexDirection: 'row', margin: 16, padding: 4, borderRadius: 10, backgroundColor: '#EAF2FF' },
  categoryButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  categoryButtonActive: { backgroundColor: '#1D4ED8' },
  categoryText: { color: '#5B6B8C', fontWeight: '600' },
  categoryTextActive: { color: '#fff' },
  list: { paddingHorizontal: 16, gap: 12, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#DCE7F8', borderRadius: 10, padding: 12 },
  noteCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBE6', borderWidth: 1, borderColor: '#F3E7A6', borderRadius: 10, padding: 12 },
  badge: { width: 58, height: 58, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  cardBody: { flex: 1, marginLeft: 12 }, noteBody: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: '#0F2A5C' }, noteText: { fontSize: 16, color: '#3A3A2A' },
  meta: { marginTop: 4, fontSize: 13, color: '#6B7A99' },
  actions: { flexDirection: 'row', marginLeft: 8 }, iconButton: { width: 36, height: 40, alignItems: 'center', justifyContent: 'center' },
  empty: { textAlign: 'center', color: '#6B7A99', marginTop: 24 }, error: { color: '#C0392B', textAlign: 'center', marginBottom: 8 },
});
