import { STORAGE_KEYS } from '../constants';

/** Empty = same-origin (Vite dev proxy). Set VITE_API_URL for direct API host. */
const DEFAULT_API_BASE = '';

export const API_BASE =
  (import.meta as { env?: Record<string, string> }).env?.VITE_API_URL ?? DEFAULT_API_BASE;

type ApiBody = unknown;

export type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: ApiBody;
  _isRetry?: boolean;
};

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const text = await res.text();
    if (!text) return `Lỗi server ${res.status}`;

    // Log raw response để debug
    console.error(`[API ${res.status}] ${res.url}\n`, text);

    const body = JSON.parse(text) as {
      message?: string;
      title?: string;
      detail?: string;
      errors?: Record<string, string[]>;
      traceId?: string;
    };

    // .NET validation errors (400)
    if (body.errors) {
      const msgs = Object.entries(body.errors)
        .flatMap(([field, errs]) => errs.map((e) => `${field}: ${e}`))
        .join('; ');
      return msgs || body.title || `Lỗi validation ${res.status}`;
    }

    // .NET problem details
    return body.detail || body.message || body.title || `Lỗi server ${res.status}`;
  } catch {
    return `Lỗi server ${res.status}`;
  }
}

function getToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch {
    return null;
  }
}

function clearAuthAndRedirect() {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  } catch { /* ignore */ }
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

let refreshPromise: Promise<boolean> | null = null;

export async function tryRefreshToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) return false;

      const res = await fetch(`${API_BASE}/api/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return false;

      const data = await res.json() as { token?: string; refreshToken?: string };
      if (!data.token) return false;

      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
      if (data.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      }
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, headers, _isRetry, ...rest } = options;
  const token = getToken();

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: body === undefined
      ? {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(headers || {}),
        }
      : {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(headers || {}),
        },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 401 && !_isRetry && token) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      return request<T>(path, { ...options, _isRetry: true });
    }
    clearAuthAndRedirect();
    throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
  }

  if (!response.ok) {
    const err = new Error(await parseErrorMessage(response)) as Error & { status?: number };
    err.status = response.status;
    throw err;
  }

  return parseResponse<T>(response);
}

const GET_CACHE_TTL_MS = 20_000;
const getCache = new Map<string, { data: unknown; expiresAt: number }>();
const inFlightGets = new Map<string, Promise<unknown>>();

/** Xóa cache GET đã lưu; gọi sau khi tạo/sửa/xóa dữ liệu để tránh trả về dữ liệu cũ. */
export function invalidateApiCache(pathPrefix?: string): void {
  if (!pathPrefix) {
    getCache.clear();
    return;
  }
  for (const key of getCache.keys()) {
    if (key.startsWith(pathPrefix)) {
      getCache.delete(key);
    }
  }
}

/**
 * GET có cache ngắn hạn (20s) + dedupe request trùng lặp đang bay.
 * Giảm tải backend khi nhiều component/nhiều người dùng cùng request 1 endpoint trong thời gian ngắn.
 */
export async function apiGet<T>(path: string): Promise<T> {
  const cached = getCache.get(path);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T;
  }

  const inFlight = inFlightGets.get(path);
  if (inFlight) {
    return inFlight as Promise<T>;
  }

  const promise = request<T>(path)
    .then((data) => {
      getCache.set(path, { data, expiresAt: Date.now() + GET_CACHE_TTL_MS });
      return data;
    })
    .finally(() => {
      inFlightGets.delete(path);
    });

  inFlightGets.set(path, promise);
  return promise;
}

/** vd: "/api/conversations/123/messages" -> "/api/conversations" */
function resourceRoot(path: string): string {
  return path.split('?')[0].split('/').slice(0, 3).join('/');
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const result = await request<T>(path, { method: 'POST', body });
  invalidateApiCache(resourceRoot(path));
  return result;
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const result = await request<T>(path, { method: 'PUT', body });
  invalidateApiCache(resourceRoot(path));
  return result;
}

export async function apiDelete(path: string): Promise<void> {
  await request<void>(path, { method: 'DELETE' });
  invalidateApiCache(resourceRoot(path));
}

export async function requestWithFallback<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  isEmpty: (value: T) => boolean = (value) => Array.isArray(value) && value.length === 0,
): Promise<T> {
  try {
    const data = await fetcher();
    return isEmpty(data) ? fallback : data;
  } catch {
    return fallback;
  }
}
