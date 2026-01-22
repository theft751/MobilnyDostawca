import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getDeliveryItems, deliverItem, DeliveryItem } from '../services/deliveryService';

export default function DeliveryDetailsScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [items, setItems] = useState<DeliveryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    if (!token || !id) return;

    try {
      const data = await getDeliveryItems(Number(id), token);
      setItems(data);
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się pobrać pozycji dostawy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [token, id]);

  const handleDeliverItem = async (itemId: number) => {
    if (!token || !id) return;

    try {
      await deliverItem(Number(id), itemId, token);
      Alert.alert('Sukces', 'Pozycja została dostarczona');
      loadItems();
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się dostarczyć pozycji');
    }
  };

  const renderItem = ({ item }: { item: DeliveryItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.productName}>{item.productName}</Text>
        {item.isDelivered && (
          <View style={styles.deliveredBadge}>
            <Text style={styles.deliveredText}>✓</Text>
          </View>
        )}
      </View>

      <View style={styles.itemDetails}>
        <Text style={styles.itemText}>Ilość: {item.quantity}</Text>
        <Text style={styles.itemText}>Cena: {item.price.toFixed(2)} zł</Text>
      </View>

      {!item.isDelivered && (
        <TouchableOpacity
          style={styles.deliverButton}
          onPress={() => handleDeliverItem(item.id)}
        >
          <Text style={styles.deliverButtonText}>Dostarcz</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveredCount = items.filter(item => item.isDelivered).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Powrót</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Szczegóły dostawy</Text>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          Pozycje: {deliveredCount}/{items.length} dostarczonych
        </Text>
        <Text style={styles.summaryText}>
          Wartość: {totalPrice.toFixed(2)} zł
        </Text>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Brak pozycji w dostawie</Text>
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
  summary: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  listContent: {
    padding: 16,
  },
  itemCard: {
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  deliveredBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveredText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDetails: {
    marginBottom: 12,
  },
  itemText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  deliverButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deliverButtonText: {
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
