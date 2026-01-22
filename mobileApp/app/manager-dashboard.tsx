import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { getCompletedCount, getInProgressCount, getPendingCount } from '../services/managerService';

export default function ManagerDashboard() {
  const router = useRouter();
  const { logout, user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
  });

  useEffect(() => {
    if (user && user.role !== 'Manager' && user.role !== 'Admin') {
      router.replace('/');
    }
  }, [user]);

  useEffect(() => {
    loadStats();
  }, [token]);

  const loadStats = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const [pending, inProgress, completed] = await Promise.all([
        getPendingCount(token),
        getInProgressCount(token),
        getCompletedCount(token),
      ]);
      
      setStats({ pending, inProgress, completed });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDelivery = () => {
    router.push('/create-delivery');
  };

  const handleViewDeliveries = () => {
    router.push('/manager-deliveries');
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Panel Managera</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Wyloguj</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Zarządzanie zamówieniami</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleCreateDelivery}>
            <Text style={styles.primaryButtonText}>Utwórz nowe zamówienie</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleViewDeliveries}>
            <Text style={styles.secondaryButtonText}>Zobacz wszystkie zamówienia</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Statystyki</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.pending}</Text>
                <Text style={styles.statLabel}>Oczekujące</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.inProgress}</Text>
                <Text style={styles.statLabel}>Częściowo zrealizowane</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.completed}</Text>
                <Text style={styles.statLabel}>Zrealizowane</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
