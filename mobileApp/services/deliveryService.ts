const API_BASE_URL = 'http://localhost:5268/api';

export interface Delivery {
  id: number;
  orderNumber: string;
  customerName: string;
  deliveryAddress: string;
  status: string;
  createdAt: string;
  completedAt?: string;
}

export interface DeliveryItem {
  id: number;
  deliveryId: number;
  productName: string;
  quantity: number;
  price: number;
  isDelivered: boolean;
}

export async function getDeliveries(token: string): Promise<Delivery[]> {
  const response = await fetch(`${API_BASE_URL}/Deliveries`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Błąd pobierania dostaw');
  }

  return await response.json();
}

export async function getDeliveryItems(deliveryId: number, token: string): Promise<DeliveryItem[]> {
  const response = await fetch(`${API_BASE_URL}/Deliveries/${deliveryId}/items`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Błąd pobierania pozycji dostawy');
  }

  return await response.json();
}

export async function completeDelivery(deliveryId: number, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/Deliveries/${deliveryId}/complete`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Błąd podczas zatwierdzania dostawy');
  }
}

export async function deliverItem(deliveryId: number, itemId: number, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/Deliveries/${deliveryId}/items/${itemId}/deliver`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Błąd podczas dostarczania pozycji');
  }
}
