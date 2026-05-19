import type { Application } from '../types';
import { apiDelete, apiGet, apiPost, apiPut } from './apiClient';

type ApiApplication = Application & { studentUserId?: number };

function normalizeApplication(app: ApiApplication): Application {
  if (app.userId !== undefined) {
    return app;
  }
  return { ...app, userId: app.studentUserId ?? '' } as Application;
}

export const applicationService = {
  /** Load applications for a student */
  async getByUser(userId: number | string): Promise<Application[]> {
    const apps = await apiGet<ApiApplication[]>(`/api/applications?studentId=${userId}`);
    return apps.map(normalizeApplication);
  },

  /** Get simple applications for dashboard (seeded + stored) */
  async getForDashboard(userId: string): Promise<Application[]> {
    const apps = await apiGet<ApiApplication[]>(`/api/applications?studentId=${userId}`);
    return apps.map(normalizeApplication);
  },

  async getAll(): Promise<Application[]> {
    const apps = await apiGet<ApiApplication[]>('/api/applications');
    return apps.map(normalizeApplication);
  },

  async getByJob(jobId: number): Promise<Application[]> {
    const apps = await apiGet<ApiApplication[]>(`/api/applications?jobId=${jobId}`);
    return apps.map(normalizeApplication);
  },

  /** Apply to a job */
  async apply(data: { jobId: number; userId: number | string; coverLetter: string }): Promise<Application> {
    const app = await apiPost<ApiApplication>('/api/applications', {
      jobId: data.jobId,
      studentUserId: data.userId,
      coverLetter: data.coverLetter,
    });
    return normalizeApplication(app);
  },

  async updateStatus(appId: number | string, status: Application['status']): Promise<Application> {
    const app = await apiPut<ApiApplication>(`/api/applications/${appId}/status`, { status });
    return normalizeApplication(app);
  },

  /** Withdraw an application */
  async withdraw(appId: number | string): Promise<void> {
    await apiDelete(`/api/applications/${appId}`);
  },
};
