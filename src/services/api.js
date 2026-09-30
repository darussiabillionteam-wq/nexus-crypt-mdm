// ============================================================
// API do Nexus Crypt MDM
// Centraliza todas as chamadas ao backend
// ============================================================

const API_URL = import.meta.env.VITE_API_URL || 'https://nexus-crypt-backend.onrender.com/api';

// ---------- Helpers ----------

function getToken() {
  return localStorage.getItem('nexus_token');
}

function setToken(token) {
  localStorage.setItem('nexus_token', token);
}

function clearToken() {
  localStorage.removeItem('nexus_token');
  localStorage.removeItem('nexus_user');
}

async function request(endpoint, options = {}) {
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

export async function login(username, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  setToken(data.token);
  localStorage.setItem('nexus_user', JSON.stringify(data.user));
  return data.user;
}

export function logout() {
  clearToken();
}

export function getCurrentUser() {
  const user = localStorage.getItem('nexus_user');
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

export async function deleteDevice(id) {
  return request(`/devices/${id}`, {
    method: 'DELETE',
  });
}

// ============================================================
// AÇÕES REMOTAS (MDM)
// ============================================================

export async function lockDevice(id) {
  return request(`/mdm/devices/${id}/lock`, { method: 'POST' });
}

export async function wipeDevice(id) {
  return request(`/mdm/devices/${id}/wipe`, { method: 'POST' });
}

export async function locateDevice(id) {
  return request(`/mdm/devices/${id}/locate`, { method: 'POST' });
}

export async function restartDevice(id) {
  return request(`/mdm/devices/${id}/restart`, { method: 'POST' });
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