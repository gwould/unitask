const DEFAULT_API_BASE = 'http://localhost:5244';

export const API_BASE = (import.meta as { env?: Record<string, string> }).env?.VITE_API_URL || DEFAULT_API_BASE;

type ApiBody = unknown;

export type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: ApiBody;
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

export async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: body === undefined
      ? headers
      : {
          'Content-Type': 'application/json',
          ...(headers || {}),
        },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  return parseResponse<T>(response);
}

export async function apiGet<T>(path: string): Promise<T> {
  return request<T>(path);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body });
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body });
}

export async function apiDelete(path: string): Promise<void> {
  await request<void>(path, { method: 'DELETE' });
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