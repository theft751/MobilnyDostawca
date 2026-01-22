import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  productName: string;
  quantity: number;
  price: number;
}

export default function AddProduct() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (user && user.role !== 'Manager' && user.role !== 'Admin') {
      router.replace('/');
      return;
    }
    loadProducts();
  }, [user]);

  const loadProducts = async () => {
    try {
      const productsData = await AsyncStorage.getItem('tempDeliveryProducts');
      if (productsData) {
        setProducts(JSON.parse(productsData));
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const saveProducts = async (newProducts: Product[]) => {
    try {
      await AsyncStorage.setItem('tempDeliveryProducts', JSON.stringify(newProducts));
    } catch (error) {
      console.error('Error saving products:', error);
    }
  };

  const handleAddProduct = async () => {
    if (!productName.trim()) {
      Alert.alert('Błąd', 'Wprowadź nazwę produktu');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      Alert.alert('Błąd', 'Wprowadź poprawną ilość');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Błąd', 'Wprowadź poprawną cenę');
      return;
    }

    const newProducts = [...products, {
      productName: productName.trim(),
      quantity: quantityNum,
      price: priceNum,
    }];

    setProducts(newProducts);
    await saveProducts(newProducts);

    setProductName('');
    setQuantity('');
    setPrice('');
  };

  const handleEditProduct = (index: number) => {
    const product = products[index];
    setProductName(product.productName);
    setQuantity(product.quantity.toString());
    setPrice(product.price.toString());
    handleRemoveProduct(index);
  };

  const handleRemoveProduct = async (index: number) => {
    const newProducts = products.filter((_, i) => i !== index);
    setProducts(newProducts);
    await saveProducts(newProducts);
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backText}>← Powrót</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Dodaj produkty</Text>
      </View>

      <ScrollView style={styles.content}>
        {products.length > 0 && (
          <View style={styles.productsSection}>
            <Text style={styles.sectionTitle}>Dodane produkty ({products.length})</Text>
            {products.map((product, index) => (
              <View key={index} style={styles.productCard}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.productName}</Text>
                  <Text style={styles.productDetails}>
                    Ilość: {product.quantity} | Cena: {product.price.toFixed(2)} zł
                  </Text>
                </View>
                <View style={styles.productActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditProduct(index)}
                  >
                    <Text style={styles.editButtonText}>Edytuj</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemoveProduct(index)}
                  >
                    <Text style={styles.deleteButtonText}>Usuń</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.formTitle}>Nowy produkt</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nazwa produktu *</Text>
            <TextInput
              style={styles.input}
              value={productName}
              onChangeText={setProductName}
              placeholder="Wprowadź nazwę produktu"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ilość *</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Wprowadź ilość"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cena (PLN) *</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="Wprowadź cenę"
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
            <Text style={styles.addButtonText}>+ Dodaj produkt</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  productsSection: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productDetails: {
    fontSize: 14,
    color: '#666',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
