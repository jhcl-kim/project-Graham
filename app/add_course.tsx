import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { BottomNavigation } from '../components/bottom_nav';
import { useCourses } from '../context/course_context';

export default function AddCourseScreen() {
  const { addCourse } = useCourses();
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [units, setUnits] = useState('3');
  const [year, setYear] = useState('1st Year');
  const [instructor, setInstructor] = useState('');
  const [schedule, setSchedule] = useState('');
  const [room, setRoom] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (code.trim() === '' || title.trim() === '') { setError('Course code and title are required.'); return; }
    const unitsNumber = Number(units);
    if (Number.isNaN(unitsNumber) || unitsNumber <= 0) { setError('Units must be a number greater than 0.'); return; }

    await addCourse({ 
      code: code.trim().toUpperCase(), 
      title: title.trim(), 
      units: unitsNumber, 
      year: year.trim() || '1st Year', 
      instructor: instructor.trim() || 'TBA', 
      schedule: schedule.trim() || 'TBA',
      room: room.trim() || 'TBA' 
    });
    router.replace('/');
  };

  return (
    <View style={styles.screen}>
    <ScrollView style={styles.formScroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Field label="Course code *" value={code} onChangeText={setCode} placeholder="IT104" autoCapitalize="characters" />
      <Field label="Course title *" value={title} onChangeText={setTitle} placeholder="Data Structures" />

      <View style={styles.twoCols}>
        <View style={styles.column}>
          <Field label="Units" value={units} onChangeText={setUnits} placeholder="3" keyboardType="numeric" />
        </View>
        <View style={styles.column}>
          <Field label="Year" value={year} onChangeText={setYear} placeholder="1st Year" />
        </View>
      </View>

      <Field label="Instructor" value={instructor} onChangeText={setInstructor} placeholder="Prof. Garcia" />
      <Field label="Schedule" value={schedule} onChangeText={setSchedule} placeholder="Mon / Wed, 9:00-10:30 AM" />
      <Field label="Room" value={room} onChangeText={setRoom} placeholder="Room 305" />
      {error !== '' && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.saveBtn} onPress={() => void handleSave()}>
        <Text style={styles.saveText}>Save course</Text>
      </Pressable>
    </ScrollView>
    
    <BottomNavigation />
    </View>
  );
}

type FieldProps = { label: string; value: string; onChangeText: (text: string) => void; placeholder?: string; keyboardType?: 'default' | 'numeric'; autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters' };

function Field({ label, value, onChangeText, placeholder, keyboardType, autoCapitalize }: FieldProps) {
  return <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#7A8AA8" keyboardType={keyboardType} autoCapitalize={autoCapitalize} />
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6F9FF' }, 
  formScroll: { flex: 1 }, 
  content: { padding: 16, paddingBottom: 40 }, 
  field: { marginBottom: 14 }, 
  twoCols: { flexDirection: 'row', gap: 12 }, 
  column: { flex: 1 }, 
  label: { fontSize: 14, color: '#6B7A99', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#BFD6F6', borderRadius: 10, paddingHorizontal: 12, height: 46, fontSize: 16, color: '#0F2A5C' }, 
  error: { color: '#C0392B', fontSize: 14, marginBottom: 12 }, 
  saveBtn: { backgroundColor: '#1D4ED8', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 4 }, 
  saveText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
