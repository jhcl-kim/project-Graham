import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { BottomNavigation } from '../components/bottom_nav';
import { useCourses } from '../context/course_context';

export default function DetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { courses, isLoading, addNote, deleteNote } = useCourses();
  const [draft, setDraft] = useState('');

  const course = courses.find((c) => c.id === id);

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <Text style={styles.meta}>Loading course...</Text>
      </View>
    );
  }

  if (!course) {
    return <Redirect href="/" />;
  }

  const handleAdd = async () => {
    if (draft.trim() === '') return;
    await addNote(course.id, draft.trim());
    setDraft('');
  };

  return (
    <View style={styles.screen}>
    <ScrollView style={styles.content} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <View style={styles.banner}>
        <View style={[styles.badge, { backgroundColor: course.color }]}>
          <Text style={styles.badgeText}>{course.code}</Text>
        </View>

        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.meta}>{course.units} Units  •  {course.year}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <InfoRow label="Instructor" value={course.instructor} />
        <InfoRow label="Schedule" value={course.schedule} />
        <InfoRow label="Room" value={course.room} />
      </View>

      <Text style={styles.sectionTitle}>My Notes</Text>
      <TextInput style={styles.noteInput} placeholder="Write a note..." placeholderTextColor="#7A8AA8" value={draft} onChangeText={setDraft} multiline/>
      <Pressable style={styles.addBtn} onPress={handleAdd}>
        <Text style={styles.addBtnText}>Add note</Text>
      </Pressable>

      {course.notes.length > 0 ? (
        course.notes.map((note) => (
          <View key={note.id} style={styles.note}>
            <Text style={styles.noteText}>{note.text}</Text>

            <View style={styles.noteFooter}>
              <Text style={styles.noteDate}>{note.createdAt}</Text>

              <Pressable onPress={() => void deleteNote(course.id, note.id)}>
                <Text style={styles.delete}>Move to trash</Text>
              </Pressable>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.empty}>No notes yet. Write your first one above.</Text>
      )}
    </ScrollView>

    <BottomNavigation />
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: '#F6F9FF' 
  },
  content: { 
    flex: 1 
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16 
  },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16 
  },
  title: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#0F2A5C' 
  },
  meta: { 
    fontSize: 15, 
    color: '#6B7A99',
    marginTop: 4 
  },
  infoCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DCE7F8',
    borderRadius: 10,
    padding: 12,
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 8 
  },
  rowLabel: { 
    color: '#6B7A99', 
    fontSize: 15 
  },
  rowValue: { 
    color: '#0F2A5C', 
    fontSize: 15, 
    fontWeight: '600', 
    flexShrink: 1, 
    textAlign: 'right', 
    marginLeft: 12 
  },
  sectionTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#0F2A5C', 
    marginTop: 24, 
    marginBottom: 10 
  },
  noteInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#BFD6F6',
    borderRadius: 10,
    padding: 12,
    minHeight: 90,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#0F2A5C',
  },
  addBtn: {
    backgroundColor: '#1D4ED8',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  addBtnText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 16 
  },
  note: {
    backgroundColor: '#FFFBE6',
    borderWidth: 1,
    borderColor: '#F3E7A6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  noteText: { 
    fontSize: 16, 
    color: '#3A3A2A'
  },
  noteFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 8 
  },
  noteDate: { 
    fontSize: 13, 
    color: '#8A8460'
  },
  delete: { 
    fontSize: 13, 
    color: '#C0392B' 
  },
  empty: { 
    color: '#6B7A99', 
    textAlign: 'center', 
    marginTop: 8 
  },
});
