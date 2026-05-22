import type { Application } from '../types';
import { applicationsData } from '../data/mockData';
import { requestWithFallback } from './apiService';
import { apiRepository } from './apiRepository';

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
    return requestWithFallback(
      async () => {
        const apps = await apiRepository.applications.listByStudent(userId);
        return apps.map(normalizeApplication);
      },
      applicationsData.filter((a) => String(a.userId) === String(userId)),
    );
  },

  /** Get simple applications for dashboard (seeded + stored) */
  async getForDashboard(userId: string): Promise<Application[]> {
    const apps = await apiRepository.applications.listByStudent(userId);
    return apps.map(normalizeApplication);
  },

  async getAll(): Promise<Application[]> {
    return requestWithFallback(
      async () => {
        const apps = await apiRepository.applications.listAll();
        return apps.map(normalizeApplication);
      },
      applicationsData,
    );
  },

  async getByJob(jobId: number | string): Promise<Application[]> {
    const apps = await apiRepository.applications.listByJob(jobId);
    return apps.map(normalizeApplication);
  },

  /** Apply to a job */
  async apply(data: { jobId: number | string; userId: number | string; coverLetter: string }): Promise<Application> {
    const app = await apiRepository.applications.create({
      jobId: data.jobId,
      studentUserId: data.userId,
      coverLetter: data.coverLetter,
    });
    return normalizeApplication(app);
  },

  async updateStatus(appId: number | string, status: Application['status']): Promise<Application> {
    const app = await apiRepository.applications.updateStatus(appId, { status });
    return normalizeApplication(app);
  },

  /** Withdraw an application */
  async withdraw(appId: number | string): Promise<void> {
    await apiRepository.applications.delete(appId);
  },
};
