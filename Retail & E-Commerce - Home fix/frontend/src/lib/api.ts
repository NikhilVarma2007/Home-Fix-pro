import type { AppState, Booking, ChatMessage } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');
const AUTH_TOKEN_STORAGE_KEY = 'retail-ecommerce-api-token';

type BootstrapPayload = Pick<AppState, 'user' | 'categories' | 'professionals' | 'bookings' | 'chatThreads'>;
type LoginPayload = {
  role: 'customer' | 'service' | 'admin';
  name: string;
  phone: string;
  businessName?: string;
  profession?: string;
  language?: 'en' | 'hi' | 'te';
  experience?: string;
  serviceArea?: string;
};

type LoginResponse = {
  token: string;
  tokenType: 'Bearer';
  expiresInSeconds: number;
  user: {
    name: string;
    phone: string;
    role: 'customer' | 'service' | 'admin';
  };
};

function readAuthToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearBackendAuthToken() {
  try {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return;
  }
}

function storeAuthToken(token: string) {
  try {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } catch {
    return;
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = readAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function authenticateBackendSession(payload: LoginPayload): Promise<LoginResponse> {
  const result = await requestJson<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  storeAuthToken(result.token);
  return result;
}

export async function fetchBootstrapData(): Promise<BootstrapPayload> {
  return requestJson<BootstrapPayload>('/api/bootstrap');
}

export async function fetchAppStats(): Promise<{
  source: string;
  totalBookings: number;
  activeBookings: number;
  totalProfessionals: number;
  totalCategories: number;
  lastUpdated: string;
}> {
  return requestJson('/api/stats');
}

export async function fetchHealth(): Promise<{ ok: boolean; source: string }> {
  return requestJson('/health');
}

export async function saveBooking(booking: Booking): Promise<void> {
  await requestJson('/api/bookings', {
    method: 'POST',
    body: JSON.stringify({ booking }),
  });
}

export async function updateBooking(booking: Booking): Promise<void> {
  await requestJson(`/api/bookings/${booking.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ booking }),
  });
}

export async function sendChatMessage(threadId: string, message: ChatMessage): Promise<void> {
  await requestJson(`/api/chat-threads/${threadId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}
