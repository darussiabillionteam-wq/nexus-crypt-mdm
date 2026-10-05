// ============================================================
// API do Nexus Crypt MDM
// Centraliza todas as chamadas ao backend
// ============================================================

const API_URL = import.meta.env.VITE_API_URL || 'https://nexus-crypt-backend.onrender.com/api';

// ============================================================
// HELPERS DE TOKEN
// ============================================================

function getToken() {
  return localStorage.getItem('nexus_token') || sessionStorage.getItem('nexus_token');
}

function setToken(token) {
  if (localStorage.getItem('nexus_token') || !sessionStorage.getItem('nexus_token')) {
    localStorage.setItem('nexus_token', token);
  } else {
    sessionStorage.setItem('nexus_token', token);
  }
}

function clearToken() {
  localStorage.removeItem('nexus_token');
  localStorage.removeItem('nexus_user');
  localStorage.removeItem('nexus_saved_user');
  sessionStorage.removeItem('nexus_token');
  sessionStorage.removeItem('nexus_user');
  sessionStorage.removeItem('nexus_saved_user');
}

function getSavedCredentials() {
  const raw = localStorage.getItem('nexus_saved_user') || sessionStorage.getItem('nexus_saved_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ============================================================
// REQUEST COM AUTO-REFRESH DE TOKEN
// ============================================================

let isRefreshing = false;
let refreshPromise = null;

async function refreshToken() {
  const creds = getSavedCredentials();
  if (!creds || !creds.username || !creds.password) {
    throw new Error('Sem credenciais salvas pra renovar');
  }

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: creds.username, password: creds.password }),
  });

  if (!res.ok) {
    throw new Error('Falha ao renovar token');
  }

  const data = await res.json();
  setToken(data.token);
  if (data.user) {
    localStorage.setItem('nexus_user', JSON.stringify(data.user));
  }
  return data.token;
}

async function request(endpoint, options = {}, isRetry = false) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // ✅ Auto-refresh: se o token expirou, tenta renovar UMA vez
  if (response.status === 401 && !isRetry) {
    if (isRefreshing && refreshPromise) {
      // Espera o refresh que já tá em andamento
      try {
        await refreshPromise;
        return request(endpoint, options, true);
      } catch {
        clearToken();
        throw new Error('Sessão expirada. Faça login novamente.');
      }
    }

    isRefreshing = true;
    refreshPromise = refreshToken();

    try {
      await refreshPromise;
      isRefreshing = false;
      refreshPromise = null;
      return request(endpoint, options, true);
    } catch (err) {
      isRefreshing = false;
      refreshPromise = null;
      clearToken();
      throw new Error('Sessão expirada. Faça login novamente.');
    }
  }

  if (response.status === 401) {
    clearToken();
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Erro ${response.status}`);
  }

  return data;
}

// ============================================================
// AUTENTICAÇÃO
// ============================================================

export async function login(username, password, saveCredentials = true) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  setToken(data.token);
  localStorage.setItem('nexus_user', JSON.stringify(data.user));

  // ✅ Salva credenciais pra auto-refresh
  if (saveCredentials) {
    localStorage.setItem('nexus_saved_user', JSON.stringify({ username, password }));
  }

  return data.user;
}

export function logout() {
  clearToken();
}

export function getCurrentUser() {
  const user = localStorage.getItem('nexus_user') || sessionStorage.getItem('nexus_user');
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated() {
  return !!getToken();
}

// ============================================================
// DEVICES
// ============================================================

export async function listDevices() {
  return request('/devices');
}

export async function getDevice(id) {
  return request(`/devices/${id}`);
}

export async function createDevice(deviceData) {
  return request('/devices', {
    method: 'POST',
    body: JSON.stringify(deviceData),
  });
}

export async function updateDevice(id, data) {
  return request(`/devices/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteDevice(id) {
  return request(`/devices/${id}`, {
    method: 'DELETE',
  });
}

export async function syncSimpleMDM() {
  return request('/devices/sync-simplemdm', { method: 'POST' });
}

// ============================================================
// AÇÕES REMOTAS (MDM — via SimpleMDM)
// ============================================================

export async function lockDevice(id) {
  return request(`/devices/${id}/lock`, { method: 'POST' });
}

export async function wipeDevice(id) {
  return request(`/devices/${id}/wipe`, { method: 'POST' });
}

export async function locateDevice(id) {
  return request(`/devices/${id}/locate`, { method: 'POST' });
}

export async function restartDevice(id) {
  return request(`/devices/${id}/restart`, { method: 'POST' });
}

export async function sendMessage(id, message) {
  return request(`/devices/${id}/message`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

// ============================================================
// ENROLLMENT (SimpleMDM)
// ============================================================

export async function getDefaultEnrollment() {
  return request('/enrollment/default');
}

export async function listEnrollments() {
  return request('/enrollment/list');
}

export async function createEnrollment(name) {
  return request('/enrollment/create', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

// ============================================================
// LOGS
// ============================================================

export async function listLogs(limit = 100) {
  return request(`/logs?limit=${limit}`);
}

export function getLogsExportUrl() {
  const token = getToken();
  return `${API_URL}/logs/export?token=${token}`;
}

// ============================================================
// CONFIGURAÇÕES APPLE
// ============================================================

export async function getAppleConfig() {
  return request('/config');
}

export async function updateAppleConfig(config) {
  return request('/config', {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}

export async function testAPNS() {
  return request('/config/test-apns', {
    method: 'POST',
  });
}