const API_BASE_URL = 'http://localhost:5268/api';

export interface Driver {
  id: number;
  username: string;
  email: string;
  role: string;
}

export async function getDrivers(token: string): Promise<Driver[]> {
  const response = await fetch(`${API_BASE_URL}/Users/drivers`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Błąd pobierania kierowców');
  }

  return await response.json();
}

export interface CreateDeliveryItem {
  productName: string;
  quantity: number;
  price: number;
}

export interface CreateDeliveryRequest {
  orderNumber: string;
  customerName: string;
  deliveryAddress: string;
  assignedDriverId?: number;
  items: CreateDeliveryItem[];
}

export async function createDelivery(data: CreateDeliveryRequest, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/Deliveries`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Błąd podczas tworzenia dostawy');
  }
}

export interface Delivery {
  id: number;
  orderNumber: string;
  customerName: string;
  deliveryAddress: string;
  status: string;
  assignedDriverId?: number;
  createdAt: string;
  completedAt?: string;
}

export async function getAllDeliveries(token: string): Promise<Delivery[]> {
  const response = await fetch(`${API_BASE_URL}/Deliveries`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Błąd pobierania zamówień');
  }

  return await response.json();
}

export async function deleteDelivery(id: number, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/Deliveries/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Błąd usuwania zamówienia');
  }
}

export async function getCompletedCount(token: string): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/Deliveries/stats/completed`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Błąd pobierania statystyk');
  }

  return await response.json();
}

export async function getInProgressCount(token: string): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/Deliveries/stats/inprogress`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Błąd pobierania statystyk');
  }

  return await response.json();
}

export async function getPendingCount(token: string): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/Deliveries/stats/pending`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Błąd pobierania statystyk');
  }

  return await response.json();
}

