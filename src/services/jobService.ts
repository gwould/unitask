import type { Job } from '../types';
import { jobsData } from '../data/siteData';
import { apiGet, apiPost } from './apiClient';
import { withFallback } from './withFallback';

type ApiJob = Job & {
  companyName?: string;
  companyUserId?: number;
  companyCode?: string;
};

function normalizeJob(raw: ApiJob): Job {
  return {
    ...raw,
    company: raw.company ?? raw.companyName ?? '',
    companyId: raw.companyId ?? raw.companyCode ?? raw.companyUserId ?? '',
    verified: raw.verified ?? false,
    tags: raw.tags ?? [],
    skills: raw.skills ?? [],
    requirements: raw.requirements ?? [],
    deliverables: raw.deliverables ?? [],
  };
}

export const jobService = {
  /** Get all jobs (seeded + custom from localStorage) */
  async getAll(): Promise<Job[]> {
    return withFallback(
      async () => {
        const jobs = await apiGet<ApiJob[]>('/api/jobs');
        return jobs.map(normalizeJob);
      },
      jobsData,
    );
  },

  /** Get a single job by id */
  async getById(id: number): Promise<Job | undefined> {
    try {
      const job = await apiGet<ApiJob>(`/api/jobs/${id}`);
      return normalizeJob(job);
    } catch {
      return jobsData.find((j) => j.id === id);
    }
  },

  /** Synchronous version for immediate access */
  getAllSync(): Job[] {
    return [];
  },

  /** Get jobs by company id (numeric or external code e.g. biz-1) */
  async getByCompany(companyId: string): Promise<Job[]> {
    return withFallback(
      async () => {
        const jobs = await apiGet<ApiJob[]>(
          `/api/jobs?companyId=${encodeURIComponent(companyId)}`,
        );
        return jobs.map(normalizeJob);
      },
      jobsData.filter((j) => String(j.companyId) === String(companyId)),
    );
  },

  /** Create a new job */
  async create(job: Omit<Job, 'id'>): Promise<Job> {
    const created = await apiPost<ApiJob>('/api/jobs', {
      title: job.title,
      description: job.description,
      companyName: job.company,
      companyCode: String(job.companyId),
      companyUserId: String(job.companyId),
      payMin: job.payMin,
      payMax: job.payMax,
      pay: job.pay,
      deadline: job.deadline,
      location: job.location,
      category: job.category,
      duration: job.duration,
      logoText: job.logoText,
      logoGradient: job.logoGradient,
      verified: job.verified,
      spotsLeft: job.spotsLeft,
      spotsTotal: job.spotsTotal,
      featured: job.featured ?? false,
      postedAt: job.postedAt,
      tags: job.tags,
      skills: job.skills,
      requirements: job.requirements,
      deliverables: job.deliverables,
    });
    return normalizeJob(created);
  },
};
