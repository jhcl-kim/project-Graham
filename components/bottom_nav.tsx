import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, usePathname } from 'expo-router';

const items = [
  { href: '/', label: 'Home', icon: 'home-outline' },
  { href: '/add_course', label: 'Add Course', icon: 'add-circle-outline' },
  { href: '/trash', label: 'Trash', icon: 'trash-outline' },
] as const;

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <View style={styles.bar} accessibilityRole="tablist">
      {items.map((item) => {
        const active = pathname === item.href;
        const color = active ? '#1D4ED8' : '#6B7A99';

        return (
          <Link key={item.href} href={item.href} asChild>
            <Pressable style={styles.item} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={item.label}>
              <Ionicons name={item.icon} size={23} color={color} />
              <Text style={[styles.label, active && styles.activeLabel]}>{item.label}</Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderTopWidth: 1, 
    borderTopColor: '#DCE7F8', 
    paddingTop: 8, 
    paddingBottom: 12 
  },
  item: { 
    flex: 1, 
    alignItems: 'center', 
    gap: 3, 
    paddingVertical: 3 
  },
  label: { 
    color: '#6B7A99', 
    fontSize: 12, 
    fontWeight: '600' 
  },
  activeLabel: { 
    color: '#1D4ED8' 
  },
});
