import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Modal,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { getDeliveries, completeDelivery, Delivery } from '../services/deliveryService';

export default function DeliveriesScreen() {
  const { token, user, logout } = useAuth();
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | null>(null);

  const loadDeliveries = async () => {
    if (!token) return;

    try {
      const data = await getDeliveries(token);
      setDeliveries(data);
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się pobrać dostaw');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDeliveries();
  };

  const handleCompleteDelivery = async (deliveryId: number) => {
    setSelectedDeliveryId(deliveryId);
    setModalVisible(true);
  };

  const confirmCompleteDelivery = async () => {
    if (!token || !selectedDeliveryId) return;

    setModalVisible(false);

    try {
      await completeDelivery(selectedDeliveryId, token);
      Alert.alert('Sukces', 'Dostawa została zrealizowana');
      loadDeliveries();
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się zrealizować dostawy');
    } finally {
      setSelectedDeliveryId(null);
    }
  };

  const cancelCompleteDelivery = () => {
    setModalVisible(false);
    setSelectedDeliveryId(null);
  };

  const handleViewDetails = (deliveryId: number) => {
    router.push(`/delivery-details?id=${deliveryId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return '#FFA500';
      case 'InProgress': return '#007AFF';
      case 'Completed': return '#34C759';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Pending': return 'Oczekuje';
      case 'InProgress': return 'Częściowo zrealizowana';
      case 'Completed': return 'Zrealizowana';
      default: return status;
    }
  };

  const renderDeliveryItem = ({ item }: { item: Delivery }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.customerName}>{item.customerName}</Text>
        <Text style={styles.address}>{item.deliveryAddress}</Text>
        <Text style={styles.date}>
          Utworzono: {new Date(item.createdAt).toLocaleString('pl-PL')}
        </Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => handleViewDetails(item.id)}
        >
          <Text style={styles.detailsButtonText}>Szczegóły</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => handleCompleteDelivery(item.id)}
        >
          <Text style={styles.completeButtonText}>Zrealizuj</Text>
        </TouchableOpacity>
      </View>
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
        <View>
          <Text style={styles.title}>Moje dostawy</Text>
          <Text style={styles.subtitle}>{user?.username}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Wyloguj</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={deliveries}
        renderItem={renderDeliveryItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Brak dostaw do wyświetlenia</Text>
          </View>
        }
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={cancelCompleteDelivery}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Potwierdzenie</Text>
            <Text style={styles.modalMessage}>
              Wszystkie składowe zamówienia zostaną oznaczone jako dostarczone. Czy na pewno chcesz to zrobić?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={cancelCompleteDelivery}
              >
                <Text style={styles.modalButtonTextCancel}>Nie</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmCompleteDelivery}
              >
                <Text style={styles.modalButtonTextConfirm}>Tak</Text>
              </TouchableOpacity>
            </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    padding: 16,
  },
  filterButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
    maxHeight: 48,
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  card: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    marginBottom: 16,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
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
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#34C759',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f0f0f0',
  },
  modalButtonConfirm: {
    backgroundColor: '#34C759',
  },
  modalButtonTextCancel: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextConfirm: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
