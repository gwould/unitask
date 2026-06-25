import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

// ============================================================
// adminUserService — CRUD quản lý người dùng (chỉ Admin).
// Khớp với UsersController: list / create / admin-update / status / delete.
// ============================================================

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  userType: 'student' | 'business' | 'admin' | string;
  isVerified: boolean | null;
  isActive: boolean | null;
  reputationScore: number | null;
  suspendedUntil: string | null;
  createdAt: string | null;
  lastLogin: string | null;
};

export type PagedResult<T> = { total: number; page: number; limit: number; data: T[] };

export type UserStatus = 'active' | 'disabled' | 'suspended';
export type UserSort = 'newest' | 'oldest' | 'name' | 'rep';

export type ListUsersParams = {
  q?: string;
  role?: string;
  status?: string;
  sort?: UserSort;
  page?: number;
  limit?: number;
};

export type CreateUserPayload = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  userType: string;
};

export type UpdateUserPayload = {
  fullName?: string;
  email?: string;
  phone?: string;
  userType?: string;
  isVerified?: boolean;
};

function buildQuery(params: ListUsersParams): string {
  const sp = new URLSearchParams();
  if (params.q?.trim()) sp.set('q', params.q.trim());
  if (params.role && params.role !== 'all') sp.set('role', params.role);
  if (params.status && params.status !== 'all') sp.set('status', params.status);
  if (params.sort) sp.set('sort', params.sort);
  sp.set('page', String(params.page ?? 1));
  sp.set('limit', String(params.limit ?? 12));
  return sp.toString();
}

export const adminUserService = {
  list(params: ListUsersParams = {}) {
    return apiGet<PagedResult<AdminUser>>(`/api/users?${buildQuery(params)}`);
  },
  create(payload: CreateUserPayload) {
    return apiPost<AdminUser>('/api/users', payload);
  },
  update(id: string, payload: UpdateUserPayload) {
    return apiPut<AdminUser>(`/api/users/${id}/admin`, payload);
  },
  setStatus(id: string, isActive: boolean) {
    return apiPut<{ id: string; isActive: boolean }>(`/api/users/${id}/status`, { isActive });
  },
  remove(id: string) {
    return apiDelete(`/api/users/${id}`);
  },
  // Khung vi phạm M1–M3 (đã có sẵn ở backend).
  sanction(id: string, level: 'M1' | 'M2' | 'M3', reason?: string, days?: number) {
    return apiPost(`/api/users/${id}/sanction`, { level, reason, days });
  },
  liftSanction(id: string) {
    return apiPost(`/api/users/${id}/lift-sanction`, {});
  },
};
