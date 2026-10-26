import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { useCourses } from '../context/course_context';
import { BottomNavigation } from '../components/bottom_nav';

async function getThoughtsAndAdvices(signal?: AbortSignal) {
  const response = await fetch(
    `https://api.adviceslip.com/advice?request=${Date.now()}`,
    { signal }
  );

  if (!response.ok) {
    throw new Error(`Advice request failed with status ${response.status}.`);
  }
  
  const data: { slip?: { advice?: unknown } } = await response.json();
  if (typeof data.slip?.advice !== 'string' || data.slip.advice.trim() === '') {
    throw new Error('The thoughts and advices response was invalid.');
  }
  return data.slip.advice;
}

export default function HomeScreen() {
  const { courses, isLoading, storageError, deleteCourse, refreshData } = useCourses();
  const [query, setQuery] = useState('');
  const [actionError, setActionError] = useState('');
  const [thoughtsAndAdvices, setThoughtsAndAdvices] = useState('');
  const [thoughtsAndAdvicesLoading, setThoughtsAndAdvicesLoading] = useState(true);
  const [thoughtsAndAdvicesError, setThoughtsAndAdvicesError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchThoughtsAndAdvices() {
      try {
        const advice = await getThoughtsAndAdvices(controller.signal);
        if (!controller.signal.aborted) {
          setThoughtsAndAdvices(advice);
        }
      } catch {
        if (!controller.signal.aborted) {
          setThoughtsAndAdvicesError('Could not load thoughts and advices. Check your connection and try again later.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setThoughtsAndAdvicesLoading(false);
        }
      }
    }
    void fetchThoughtsAndAdvices();
    return () => controller.abort();
  }, []);

  const filtered = courses.filter((course) =>
    course.title.toLowerCase().includes(query.toLowerCase()) || course.code.toLowerCase().includes(query.toLowerCase())
  );

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await deleteCourse(courseId);
      setActionError('');
    } catch {
      setActionError('Course could not be moved to Trash. Please try again.');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setThoughtsAndAdvicesLoading(true);
    setThoughtsAndAdvicesError('');

    const [dataResult, adviceResult] = await Promise.allSettled([
      refreshData(),
      getThoughtsAndAdvices(),
    ]);

    if (dataResult.status === 'fulfilled') {
      setActionError('');
    } else {
      setActionError('Courses could not be reloaded. Please try again.');
    }

    if (adviceResult.status === 'fulfilled') {
      setThoughtsAndAdvices(adviceResult.value);
    } else {
      setThoughtsAndAdvicesError('Could not load thoughts and advices. Check your connection and try again later.');
    }

    setThoughtsAndAdvicesLoading(false);
    setIsRefreshing(false);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.searchArea}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#5B6B8C" />
          <TextInput style={styles.searchInput} placeholder="Search courses..." placeholderTextColor="#7A8AA8" value={query} onChangeText={setQuery} />
        </View>
      </View>
      <Text style={styles.heading}>My Courses</Text>
      {actionError !== '' && <Text style={styles.error}>{actionError}</Text>}

      <ScrollView contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void handleRefresh()} tintColor="#1D4ED8" />}>

        <View style={styles.thoughtsAndAdvicesCard} accessibilityLabel="Thoughts and advices">
          <View style={styles.thoughtsAndAdvicesHeading}>
            <Ionicons name="bulb-outline" size={20} color="#1D4ED8" />
            <Text style={styles.thoughtsAndAdvicesTitle}>Thoughts and advices</Text>
          </View>
          {thoughtsAndAdvicesLoading ? (
            <Text style={styles.thoughtsAndAdvicesMessage}>Loading a thought...</Text>
          ) : thoughtsAndAdvicesError ? (
            <Text style={styles.error}>{thoughtsAndAdvicesError}</Text>
          ) : (
            <Text style={styles.thoughtsAndAdvicesMessage}>{thoughtsAndAdvices}</Text>
          )}
        </View>

        {isLoading ? <Text style={styles.empty}>Loading saved courses...</Text> : storageError ? <Text style={styles.error}>{storageError}</Text> : filtered.length > 0 ? (
          filtered.map((course) => (
            <View key={course.id} style={styles.card}>
              <Link href={{ pathname: '/details', params: { id: course.id } }} asChild>
                <Pressable style={styles.courseLink} accessibilityLabel={`Open ${course.title}`}>
                  <View style={[styles.badge, { backgroundColor: course.color }]}><Text style={styles.badgeText}>{course.code}</Text></View>
                  <View style={styles.cardBody}><Text style={styles.title}>{course.title}</Text><Text style={styles.meta}>{course.units} Units • {course.year}</Text></View>
                  <Ionicons name="chevron-forward" size={22} color="#5B6B8C" />
                </Pressable>
              </Link>

              <Pressable style={styles.deleteButton} onPress={() => void handleDeleteCourse(course.id)} accessibilityRole="button" accessibilityLabel={`Move ${course.title} to Trash`} hitSlop={8}>
                <Ionicons name="trash-outline" size={21} color="#C0392B" />
              </Pressable>
            </View>
          ))
        ) : <Text style={styles.empty}>No courses found</Text>}
      </ScrollView>
      
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: '#F6F9FF' 
  },
  searchArea: { 
    backgroundColor: '#EAF2FF', 
    paddingTop: 60, 
    paddingBottom: 16, 
    paddingHorizontal: 16 
  },
  searchBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#BFD6F6', 
    borderRadius: 10, 
    paddingHorizontal: 12, 
    height: 46 
  },
  searchInput: { 
    flex: 1, 
    marginLeft: 10, 
    fontSize: 16, 
    color: '#0F2A5C' 
  },
  heading: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: '#0F2A5C', 
    paddingHorizontal: 16, 
    paddingVertical: 20 
  },
  list: { 
    paddingHorizontal: 16, 
    gap: 12, 
    paddingBottom: 40 
  },
  thoughtsAndAdvicesCard: { 
    backgroundColor: '#EAF2FF', 
    borderWidth: 1, 
    borderColor: '#BFD6F6', 
    borderRadius: 12, 
    padding: 14 
  },
  thoughtsAndAdvicesHeading: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    marginBottom: 8 
  },
  thoughtsAndAdvicesTitle: { 
    color: '#0F2A5C', 
    fontSize: 16, 
    fontWeight: '700' 
  },
  thoughtsAndAdvicesMessage: { 
    color: '#344563', 
    fontSize: 14, 
    lineHeight: 20 
  },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#DCE7F8', 
    borderRadius: 10, 
    padding: 12 
  },
  courseLink: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  badge: { 
    width: 72, 
    height: 72, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  badgeText: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 15 
  },
  cardBody: { 
    flex: 1, 
    marginLeft: 16 
  },
  title: { 
    fontSize: 17, 
    fontWeight: '600', 
    color: '#0F2A5C' 
  },
  meta: { 
    marginTop: 4, 
    fontSize: 14, 
    color: '#6B7A99' 
  },
  deleteButton: { 
    width: 40, 
    height: 40, 
    marginLeft: 4, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  empty: { 
    textAlign: 'center', 
    color: '#6B7A99', 
    marginTop: 20 
  },
  error: { 
    textAlign: 'center', 
    color: '#C0392B', 
    marginHorizontal: 16, 
    marginBottom: 8 
  },
});
