/**
 * Serwis autoryzacji - komunikacja z backend API
 * Używa fetch API do wykonywania requestów HTTP
 */

// URL backendu - dla emulatora Android użyj 10.0.2.2
// Dla web developmentu użyj localhost
const API_BASE_URL = 'http://localhost:5268/api';

export interface LoginResponse {
  token: string;
  username: string;
  email: string;
  role: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface ApiError {
  message: string;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Błąd logowania');
    }

    return data as LoginResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Wystąpił nieoczekiwany błąd');
  }
}

export async function register(registerData: RegisterRequest): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        role: registerData.role || 'Driver',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Błąd rejestracji');
    }

    return data as LoginResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Wystąpił nieoczekiwany błąd');
  }
}
