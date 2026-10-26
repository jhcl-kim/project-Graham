import { Stack } from 'expo-router';
import { CourseProvider } from '../context/course_context';

export default function RootLayout() {
  return (
    <CourseProvider>
      <Stack screenOptions={{
        headerStyle: { backgroundColor: '#F6F9FF' },
        headerTintColor: '#0F2A5C',
        headerTitleStyle: { color: '#0F2A5C' },
      }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="add_course" options={{ title: 'Add Course' }} />
        <Stack.Screen name="trash" options={{ title: 'Trash' }} />
        <Stack.Screen name="details" options={{ title: 'Course Details' }} />
      </Stack>
    </CourseProvider>
  );
}
