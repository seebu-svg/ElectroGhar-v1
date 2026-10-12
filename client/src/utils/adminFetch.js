import { API_BASE } from './api';
let refreshing;
export async function adminFetch(url, options = {}) {
  const send = () => fetch(url, { ...options, headers: { ...options.headers, Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}` } });
  let response = await send();
  if (response.status === 401) {
    if (!refreshing) refreshing = (async () => {
      const refreshToken = localStorage.getItem('admin_refresh_token');
      if (!refreshToken) return false;
      const result = await fetch(`${API_BASE}/admin/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken }) });
      if (!result.ok) return false;
      const data = await result.json();
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_refresh_token', data.refreshToken);
      return true;
    })().finally(() => { refreshing = null; });
    if (await refreshing) response = await send();
    else {
      window.dispatchEvent(new Event('admin-session-expired'));
      throw new Error('Session expired. Please log in again. Your product draft has been preserved.');
    }
  }
  if (response.status === 401) {
    window.dispatchEvent(new Event('admin-session-expired'));
    throw new Error('Session invalid. Please log in again. Your product draft has been preserved.');
  }
  if (response.status === 403) throw new Error('Administrator permission required. This account cannot make changes.');
  return response;
}
export async function adminApi(path, method = 'GET', body) {
  const response = await adminFetch(`${API_BASE}/admin${path}`, { method, headers: { 'Content-Type': 'application/json' }, ...(body !== undefined && { body: JSON.stringify(body) }) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}
