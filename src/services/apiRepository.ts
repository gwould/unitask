import { apiDelete, apiGet, apiPost, apiPut } from './apiService';
import type { Application } from '../types';
import type { Category, Feature, HowStep, Testimonial } from '../types';
import type { CareerChatResponse } from '../types/careerAssistant';

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
    listByStudent: (studentId: string | number) => apiGet<Application[]>(`/api/applications?studentId=${studentId}`),
    listAll: () => apiGet<Application[]>('/api/applications'),
    listByJob: (jobId: string | number) => apiGet<Application[]>(`/api/applications?jobId=${jobId}`),
    create: (payload: unknown) => apiPost<Application>('/api/applications', payload),
    updateStatus: (appId: string | number, payload: unknown) => apiPut<Application>(`/api/applications/${appId}/status`, payload),
    delete: (appId: string | number) => apiDelete(`/api/applications/${appId}`),
  },
  users: {
    list: () => apiGet<ApiUser[]>('/api/users'),
  },
  site: {
    categories: () => apiGet<Category[]>('/api/categories'),
    howSteps: (type: 'student' | 'business') => apiGet<HowStep[]>(`/api/howsteps?type=${type}`),
    features: () => apiGet<Feature[]>('/api/features'),
    testimonials: () => apiGet<Testimonial[]>('/api/testimonials'),
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