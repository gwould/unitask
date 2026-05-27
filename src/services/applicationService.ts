import type { Applicant, Application } from '../types';
import { applicationsData } from '../data/mockData';
import { apiGet, apiPost, apiPut } from './apiService';
import { jobService } from './jobService';
import { unwrapPaged, type PagedResult } from '../utils/paged';

type BackendMyApplication = {
  id: string;
  job: {
    id: string;
    title: string;
    company?: string | null;
    salary?: string | null;
  };
  status: Application['status'];
  appliedAt?: string | null;
  acceptedAt?: string | null;
};

type BackendApplicationDetail = {
  id: string;
  jobId: string;
  studentId: string;
  status: Application['status'];
  coverLetter?: string | null;
  proposedTimeline?: string | null;
  appliedAt?: string | null;
  student?: {
    id: string;
    name: string;
    university?: string | null;
    rating?: number | null;
    completedJobs?: number | null;
  } | null;
};

type BackendJobApplication = {
  id: string;
  jobId: string;
  studentId: string;
  status: Application['status'];
  coverLetter?: string | null;
  proposedTimeline?: string | null;
  appliedAt?: string | null;
  student: {
    id: string;
    name: string;
    university?: string | null;
    rating?: number | null;
    completedJobs?: number | null;
  };
};

function normalizeApplication(
  app: BackendApplicationDetail | BackendJobApplication | BackendMyApplication,
): Application {
  const jobId = 'jobId' in app ? app.jobId : app.job.id;
  const userId = 'studentId' in app ? app.studentId : '';
  return {
    id: app.id,
    jobId,
    userId,
    coverLetter: 'coverLetter' in app && app.coverLetter ? app.coverLetter : '',
    status: app.status,
    appliedAt: 'appliedAt' in app && app.appliedAt ? app.appliedAt : new Date().toISOString(),
  };
}

function normalizeApplicant(app: BackendJobApplication): Applicant {
  return {
    id: app.id,
    appId: app.id,
    jobId: app.jobId,
    userId: app.studentId,
    coverLetter: app.coverLetter ?? '',
    status: app.status,
    appliedAt: app.appliedAt ?? new Date().toISOString(),
    name: app.student.name,
    university: app.student.university ?? undefined,
    skills: [],
    rating: app.student.rating ?? undefined,
  };
}

async function fetchJobApplications(jobId: string | number): Promise<BackendJobApplication[]> {
  const page = await apiGet<PagedResult<BackendJobApplication>>(`/api/jobs/${jobId}/applications?page=1&limit=100`);
  return unwrapPaged(page);
}

export const applicationService = {
  async getByUser(_userId: number | string): Promise<Application[]> {
    try {
      const apps = await apiGet<BackendMyApplication[]>('/api/my-applications');
      return apps.map((app) => normalizeApplication(app));
    } catch {
      return applicationsData.filter((a) => String(a.userId) === String(_userId));
    }
  },

  async getForDashboard(userId: string): Promise<Application[]> {
    return this.getByUser(userId);
  },

  async getAll(): Promise<Application[]> {
    try {
      const jobs = await jobService.getAll();
      const nested = await Promise.all(
        jobs.map(async (job) => {
          const apps = await fetchJobApplications(job.id);
          return apps.map(normalizeApplication);
        }),
      );
      return nested.flat();
    } catch {
      return applicationsData;
    }
  },

  async getApplicantsForManager(_businessUserId?: string): Promise<Applicant[]> {
    try {
      const apps = await apiGet<BackendJobApplication[]>('/api/my-business-applicants');
      return apps.map(normalizeApplicant);
    } catch {
      return [];
    }
  },

  async getByJob(jobId: number | string): Promise<Application[]> {
    try {
      const apps = await fetchJobApplications(jobId);
      return apps.map(normalizeApplication);
    } catch {
      return applicationsData.filter((a) => String(a.jobId) === String(jobId));
    }
  },

  async getApplicantsByJob(jobId: number | string): Promise<Applicant[]> {
    try {
      const apps = await fetchJobApplications(jobId);
      return apps.map(normalizeApplicant);
    } catch {
      return [];
    }
  },

  async apply(data: { jobId: number | string; userId: number | string; coverLetter: string }): Promise<Application> {
    void data.userId;
    const app = await apiPost<{ id: string; jobId: string; studentId: string; status: Application['status']; appliedAt?: string | null }>(
      `/api/jobs/${data.jobId}/apply`,
      { coverLetter: data.coverLetter },
    );
    return {
      id: app.id,
      jobId: app.jobId,
      userId: app.studentId,
      coverLetter: data.coverLetter,
      status: app.status,
      appliedAt: app.appliedAt ?? new Date().toISOString(),
    };
  },

  async updateStatus(appId: number | string, status: Application['status']): Promise<Application> {
    if (status === 'accepted') {
      await apiPut(`/api/applications/${appId}/accept`, { startDate: new Date().toISOString() });
    } else if (status === 'rejected') {
      await apiPut(`/api/applications/${appId}/reject`, { rejectionReason: 'Không phù hợp' });
    } else if (status === 'completed') {
      await apiPut(`/api/applications/${appId}/complete`, {});
    }

    return {
      id: appId,
      jobId: '',
      userId: '',
      coverLetter: '',
      status,
      appliedAt: new Date().toISOString(),
    };
  },

  async withdraw(_appId: number | string): Promise<void> {
    return undefined;
  },
};
