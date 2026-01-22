import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { createDelivery, CreateDeliveryItem } from '../services/managerService';
import { useCallback } from 'react';

export default function CreateDeliveryScreen() {
  const { token, user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [orderNumber, setOrderNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<{ id: number; username: string } | null>(null);
  const [items, setItems] = useState<CreateDeliveryItem[]>([]);

  useEffect(() => {
    if (user && user.role !== 'Manager' && user.role !== 'Admin') {
      router.replace('/');
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadFromStorage();
    }, [])
  );

  const loadFromStorage = async () => {
    try {
      const driverData = await AsyncStorage.getItem('tempSelectedDriver');
      if (driverData) {
        setSelectedDriver(JSON.parse(driverData));
      }

      const productsData = await AsyncStorage.getItem('tempDeliveryProducts');
      if (productsData) {
        setItems(JSON.parse(productsData));
      }

      const orderNumberData = await AsyncStorage.getItem('tempOrderNumber');
      if (orderNumberData) {
        setOrderNumber(orderNumberData);
      }

      const customerNameData = await AsyncStorage.getItem('tempCustomerName');
      if (customerNameData) {
        setCustomerName(customerNameData);
      }

      const deliveryAddressData = await AsyncStorage.getItem('tempDeliveryAddress');
      if (deliveryAddressData) {
        setDeliveryAddress(deliveryAddressData);
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  };

  const clearStorage = async () => {
    try {
      await AsyncStorage.removeItem('tempSelectedDriver');
      await AsyncStorage.removeItem('tempDeliveryProducts');
      await AsyncStorage.removeItem('tempOrderNumber');
      await AsyncStorage.removeItem('tempCustomerName');
      await AsyncStorage.removeItem('tempDeliveryAddress');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };

  const saveOrderNumber = async (value: string) => {
    setOrderNumber(value);
    try {
      await AsyncStorage.setItem('tempOrderNumber', value);
    } catch (error) {
      console.error('Error saving order number:', error);
    }
  };

  const saveCustomerName = async (value: string) => {
    setCustomerName(value);
    try {
      await AsyncStorage.setItem('tempCustomerName', value);
    } catch (error) {
      console.error('Error saving customer name:', error);
    }
  };

  const saveDeliveryAddress = async (value: string) => {
    setDeliveryAddress(value);
    try {
      await AsyncStorage.setItem('tempDeliveryAddress', value);
    } catch (error) {
      console.error('Error saving delivery address:', error);
    }
  };

  const handleAddProduct = () => {
    router.push('/add-product');
  };

  const handleSelectDriver = () => {
    router.push('/select-driver');
  };

  const handleSubmit = async () => {
    if (!orderNumber.trim() || !customerName.trim() || !deliveryAddress.trim()) {
      Alert.alert('Błąd', 'Wypełnij wszystkie dane zamówienia');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Błąd', 'Dodaj przynajmniej jeden produkt');
      return;
    }

    if (!token) return;

    try {
      await createDelivery({
        orderNumber: orderNumber.trim(),
        customerName: customerName.trim(),
        deliveryAddress: deliveryAddress.trim(),
        assignedDriverId: selectedDriver?.id,
        items,
      }, token);

      await clearStorage();

      Alert.alert('Sukces', 'Zamówienie zostało utworzone', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się utworzyć zamówienia');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Powrót</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nowe zamówienie</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Dane zamówienia</Text>
        
        <Text style={styles.label}>Numer zamówienia</Text>
        <TextInput
          style={styles.input}
          value={orderNumber}
          onChangeText={saveOrderNumber}
        />

        <Text style={styles.label}>Nazwa klienta</Text>
        <TextInput
          style={styles.input}
          value={customerName}
          onChangeText={saveCustomerName}
        />

        <Text style={styles.label}>Adres dostawy</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={deliveryAddress}
          onChangeText={saveDeliveryAddress}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Kierowca (opcjonalnie)</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={handleSelectDriver}
        >
          <Text style={styles.selectButtonText}>
            {selectedDriver ? selectedDriver.username : 'Wybierz kierowcę'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Produkty</Text>

        <TouchableOpacity
          style={styles.addProductButton}
          onPress={handleAddProduct}
        >
          <Text style={styles.addProductButtonText}>+ Dodaj produkty</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Utwórz zamówienie</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  form: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  selectButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  selectButtonText: {
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  addProductButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  addProductButtonText: {
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
