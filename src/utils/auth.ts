import { STORAGE_KEYS } from '../constants';

export function hasAuthToken(): boolean {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN));
  } catch {
    return false;
  }
}

/** Decode JWT payload without verifying signature (client-side expiry check only). */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** True nếu token hết hạn (hoặc không decode được). Buffer 30s để tránh edge-case. */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  return payload.exp * 1000 < Date.now() + 30_000;
}

/** Trạng thái phiên hiện tại dựa trên token trong localStorage. */
export function getSessionStatus(): 'valid' | 'expired' | 'none' {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return 'none';
    return isTokenExpired(token) ? 'expired' : 'valid';
  } catch {
    return 'none';
  }
}
