import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { getDrivers, Driver } from '../services/managerService';

export default function SelectDriverScreen() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user && user.role !== 'Manager' && user.role !== 'Admin') {
      router.replace('/');
      return;
    }
    loadDrivers();
  }, [user]);

  useEffect(() => {
    filterDrivers();
  }, [searchQuery, drivers]);

  const loadDrivers = async () => {
    if (!token) return;

    try {
      console.log('Fetching drivers with token:', token?.substring(0, 20) + '...');
      const data = await getDrivers(token);
      console.log('Drivers received:', data);
      setDrivers(data);
      setFilteredDrivers(data);
    } catch (error) {
      console.error('Error loading drivers:', error);
      Alert.alert('Błąd', 'Nie udało się pobrać listy kierowców');
    } finally {
      setLoading(false);
    }
  };

  const filterDrivers = () => {
    if (!searchQuery.trim()) {
      setFilteredDrivers(drivers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = drivers.filter(driver =>
      driver.username.toLowerCase().includes(query) ||
      driver.email.toLowerCase().includes(query)
    );
    setFilteredDrivers(filtered);
  };

  const handleSelectDriver = async (driver: Driver) => {
    try {
      await AsyncStorage.setItem('tempSelectedDriver', JSON.stringify({
        id: driver.id,
        username: driver.username,
      }));
      router.back();
    } catch (error) {
      console.error('Error saving driver:', error);
      Alert.alert('Błąd', 'Nie udało się zapisać kierowcy');
    }
  };

  const renderDriverItem = ({ item }: { item: Driver }) => (
    <View style={styles.driverCard}>
      <View style={styles.driverInfo}>
        <Text style={styles.driverName}>{item.username}</Text>
        <Text style={styles.driverEmail}>{item.email}</Text>
      </View>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => handleSelectDriver(item)}
      >
        <Text style={styles.selectButtonText}>Wybierz</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Powrót</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Wybierz kierowcę</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Szukaj po nazwie użytkownika lub emailu"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={filteredDrivers}
        renderItem={renderDriverItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nie znaleziono kierowców</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  driverCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  driverEmail: {
    fontSize: 14,
    color: '#666',
  },
  selectButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
