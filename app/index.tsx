import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
// #1 UI components used to render the index screen.
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
// #1 Shared navigation displayed at the bottom of the index screen.


export default function HomeScreen() {
  const { courses, isLoading, storageError, deleteCourse, refreshData } = useCourses();
  // #3 Search input and course-action feedback state.
  const [query, setQuery] = useState('');
  const [actionError, setActionError] = useState('');
  // #4 Additional advice feature state.
  const [thoughtsAndAdvices, setThoughtsAndAdvices] = useState('');
  const [thoughtsAndAdvicesLoading, setThoughtsAndAdvicesLoading] = useState(true);
  const [thoughtsAndAdvicesError, setThoughtsAndAdvicesError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  return (
    <View style={styles.screen}>
      {/* #1 Search field, heading, and feedback text. */}
      <View style={styles.searchArea}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#5B6B8C" />
          <TextInput style={styles.searchInput} placeholder="Search courses..." placeholderTextColor="#7A8AA8" value={query} onChangeText={setQuery} />
        </View>
      </View>
      <Text style={styles.heading}>My Courses</Text>
      {actionError !== '' && <Text style={styles.error}>{actionError}</Text>}

      {/* #1 Scrollable content area for advice and the course list. */}
      <ScrollView contentContainerStyle={styles.list}>
        {/* #4 Additional advice feature display, including loading and error states. */}
        
        {/* #1 Course cards display course details and link to the details screen. */}
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
              {/* #3 Trash button calls the course-delete function. */}
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

// #2 Design styles: layout, colors, spacing, and typography for the index screen.
const styles = StyleSheet.create({
  // #2 Overall screen and search-area design.
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
  // #2 Search box and search text design.
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
  // #2 Screen heading and scrollable list design.
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
  // #2 Course badge, course text, and action-button design.
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
  // #2 Empty-list and error-message text design.
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
