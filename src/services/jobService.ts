import type { Job } from '../types';
import { apiGet, apiPost } from './apiClient';

export const jobService = {
  /** Get all jobs (seeded + custom from localStorage) */
  async getAll(): Promise<Job[]> {
    return apiGet<Job[]>('/api/jobs');
  },

  /** Get a single job by id */
  async getById(id: number): Promise<Job | undefined> {
    return apiGet<Job>(`/api/jobs/${id}`);
  },

  /** Synchronous version for immediate access */
  getAllSync(): Job[] {
    return [];
  },

  /** Get jobs by company id */
  async getByCompany(companyId: string): Promise<Job[]> {
    return apiGet<Job[]>(`/api/jobs?companyId=${encodeURIComponent(companyId)}`);
  },

  /** Create a new job (saved to localStorage) */
  async create(job: Omit<Job, 'id'>): Promise<Job> {
    return apiPost<Job>('/api/jobs', job);
  },
};
