import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { getAllDeliveries, Delivery, getDrivers, Driver } from '../services/managerService';

export default function ManagerDeliveries() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDriverFilter, setShowDriverFilter] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'Manager' && user.role !== 'Admin') {
      router.replace('/');
      return;
    }
    loadData();
  }, [user]);

  useEffect(() => {
    filterDeliveries();
  }, [selectedDriverId, deliveries]);

  const loadData = async () => {
    if (!token) return;

    try {
      console.log('Loading deliveries and drivers...');
      const [deliveriesData, driversData] = await Promise.all([
        getAllDeliveries(token),
        getDrivers(token)
      ]);
      console.log('Deliveries loaded:', deliveriesData);
      console.log('Drivers loaded:', driversData);
      setDeliveries(deliveriesData);
      setDrivers(driversData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Błąd', 'Nie udało się pobrać danych');
    } finally {
      setLoading(false);
    }
  };

  const filterDeliveries = () => {
    console.log('Filtering with selectedDriverId:', selectedDriverId);
    console.log('Total deliveries:', deliveries.length);
    if (selectedDriverId === null) {
      setFilteredDeliveries(deliveries);
    } else {
      const filtered = deliveries.filter(d => {
        console.log(`Delivery ${d.orderNumber} assignedDriverId:`, d.assignedDriverId);
        return d.assignedDriverId === selectedDriverId;
      });
      console.log('Filtered deliveries:', filtered.length);
      setFilteredDeliveries(filtered);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return '#FF9500';
      case 'InProgress': return '#007AFF';
      case 'Completed': return '#34C759';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Pending': return 'Oczekujące';
      case 'InProgress': return 'W trakcie';
      case 'Completed': return 'Zrealizowane';
      default: return status;
    }
  };

  const renderDelivery = ({ item }: { item: Delivery }) => (
    <View style={styles.deliveryCard}>
      <View style={styles.deliveryHeader}>
        <Text style={styles.orderNumber}>{item.orderNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      <Text style={styles.customerName}>{item.customerName}</Text>
      <Text style={styles.address}>{item.deliveryAddress}</Text>
      <Text style={styles.date}>
        Utworzono: {new Date(item.createdAt).toLocaleDateString('pl-PL')}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
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
        <Text style={styles.title}>Wszystkie zamówienia</Text>
      </View>

      <View style={styles.filterSection}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowDriverFilter(true)}
        >
          <Text style={styles.filterButtonText}>
            {selectedDriverId === null ? 'Filtruj po kierowcy' : `Kierowca: ${drivers.find(d => d.id === selectedDriverId)?.username}`}
          </Text>
        </TouchableOpacity>
        {selectedDriverId !== null && (
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={() => setSelectedDriverId(null)}
          >
            <Text style={styles.clearFilterText}>Wyczyść</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredDeliveries}
        renderItem={renderDelivery}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Brak zamówień</Text>
        }
      />

      <Modal visible={showDriverFilter} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Wybierz kierowcę</Text>
            <FlatList
              data={drivers}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.driverOption}
                  onPress={() => {
                    setSelectedDriverId(item.id);
                    setShowDriverFilter(false);
                  }}
                >
                  <Text style={styles.driverOptionText}>{item.username}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDriverFilter(false)}
            >
              <Text style={styles.modalCloseText}>Anuluj</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  filterButtonText: {
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'center',
  },
  clearFilterButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  clearFilterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  deliveryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  customerName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  driverOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  driverOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalCloseButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
