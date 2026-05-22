import type { Notification } from '../types/automation';
import { apiGet, apiPut } from './apiService';
import { unwrapPaged, type PagedResult } from '../utils/paged';
import { hasAuthToken } from '../utils/auth';
import { STORAGE_KEYS } from '../constants';

type ApiNotification = {
  id: string;
  type?: string | null;
  title?: string | null;
  message: string;
  relatedJobId?: string | null;
  isRead?: boolean | null;
  createdAt?: string | null;
};

const TYPE_MAP: Record<string, Notification['type']> = {
  job_match: 'job_match',
  application_status: 'application_status',
  submission_request: 'submission_request',
  approval: 'approval',
  payment: 'payment',
  system: 'system',
  reminder: 'reminder',
};

function mapType(raw?: string | null): Notification['type'] {
  if (!raw) return 'system';
  return TYPE_MAP[raw] ?? 'system';
}

function mapNotification(n: ApiNotification, recipientId: string, role: 'student' | 'business'): Notification {
  return {
    id: n.id,
    recipientId,
    recipientType: role,
    title: n.title ?? 'Thông báo',
    message: n.message,
    type: mapType(n.type),
    relatedJobId: n.relatedJobId ?? undefined,
    isRead: n.isRead ?? false,
    createdAt: n.createdAt ?? new Date().toISOString(),
    actionUrl: n.relatedJobId ? `/jobs/${n.relatedJobId}` : undefined,
  };
}

function loadLocalNotifications(recipientId: string): Notification[] {
  try {
    const all: Notification[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    return all
      .filter((n) => n.recipientId === recipientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export const notificationService = {
  async list(
    recipientId: string,
    role: 'student' | 'business',
    options?: { isRead?: boolean; page?: number },
  ): Promise<Notification[]> {
    if (hasAuthToken()) {
      try {
        const params = new URLSearchParams();
        params.set('page', String(options?.page ?? 1));
        if (options?.isRead != null) params.set('isRead', String(options.isRead));
        const page = await apiGet<PagedResult<ApiNotification>>(`/api/notifications?${params}`);
        return unwrapPaged(page).map((n) => mapNotification(n, recipientId, role));
      } catch {
        // fallback
      }
    }
    return loadLocalNotifications(recipientId);
  },

  async markRead(id: string): Promise<void> {
    if (hasAuthToken()) {
      try {
        await apiPut(`/api/notifications/${id}/read`, {});
        return;
      } catch {
        // fallback local
      }
    }
    const all: Notification[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    const updated = all.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  },

  async markAllRead(): Promise<void> {
    if (hasAuthToken()) {
      try {
        await apiPut('/api/notifications/read-all', {});
        return;
      } catch {
        // fallback
      }
    }
    const all: Notification[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    localStorage.setItem(
      STORAGE_KEYS.NOTIFICATIONS,
      JSON.stringify(all.map((n) => ({ ...n, isRead: true }))),
    );
  },

  deleteLocal(id: string): void {
    const all: Notification[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    localStorage.setItem(
      STORAGE_KEYS.NOTIFICATIONS,
      JSON.stringify(all.filter((n) => n.id !== id)),
    );
  },
};
