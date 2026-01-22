import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'Driver') {
        router.replace('/deliveries');
      } else if (user.role === 'Manager' || user.role === 'Admin') {
        router.replace('/manager-dashboard');
      }
    }
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#007AFF',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
