import { apiGet, apiPost, apiPut } from './apiService';
import type { Application } from '../types';
import type { CareerChatResponse } from '../types/careerAssistant';
import { unwrapPaged, type PagedResult } from '../utils/paged';

export type ApiUser = {
  id: number;
  externalCode?: string | null;
  fullName: string;
  email: string;
  role: string;
  companyName?: string | null;
  university?: string | null;
  phone?: string | null;
  major?: string | null;
};

export type ApiJobListPage = {
  total: number;
  page: number;
  limit: number;
  data: unknown[];
};

export const apiRepository = {
  jobs: {
    list: () => apiGet<ApiJobListPage>('/api/jobs?page=1&limit=1000'),
    details: (id: string | number) => apiGet<unknown>(`/api/jobs/${id}`),
    create: (payload: unknown) => apiPost<unknown>('/api/jobs', payload),
  },
  applications: {
    listByStudent: (_studentId: string | number) => apiGet<Application[]>('/api/my-applications'),
    listAll: () => Promise.resolve([] as Application[]),
    listByJob: async (jobId: string | number) =>
      unwrapPaged(await apiGet<PagedResult<Application>>(`/api/jobs/${jobId}/applications?page=1&limit=100`)),
    create: (jobId: string | number, payload: unknown) => apiPost<Application>(`/api/jobs/${jobId}/apply`, payload),
    accept: (appId: string | number, payload: unknown) => apiPut<Application>(`/api/applications/${appId}/accept`, payload),
    reject: (appId: string | number, payload: unknown) => apiPut<Application>(`/api/applications/${appId}/reject`, payload),
    complete: (appId: string | number, payload: unknown) => apiPut<Application>(`/api/applications/${appId}/complete`, payload),
  },
  users: {
    list: () => apiGet<ApiUser[]>('/api/users?page=1&limit=1000').then(
      (res: unknown) => {
        const r = res as { data?: ApiUser[] };
        return r.data ?? (Array.isArray(res) ? res as ApiUser[] : []);
      },
    ).catch(() => [] as ApiUser[]),
  },
  site: {
    categories: () => apiGet<unknown[]>('/api/categories'),
  },
  insights: {
    recommendations: (payload: unknown) => apiPost<unknown>('/api/matching/recommendations', payload),
    careerChat: (payload: unknown) => apiPost<CareerChatResponse>('/api/career-assistant/chat', payload),
    automationSuggestions: (userId?: string | number, businessId?: string | number) => {
      const params = new URLSearchParams();
      if (businessId !== undefined && businessId !== null && businessId !== '') {
        params.set('businessId', String(businessId));
      }
      if (userId !== undefined && userId !== null && userId !== '') {
        params.set('userId', String(userId));
      }
      const query = params.toString();
      return apiGet<unknown>(`/api/automation/suggestions${query ? `?${query}` : ''}`);
    },
  },
};