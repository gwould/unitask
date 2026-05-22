import type { Job } from '../types';
import { jobsData } from '../data/siteData';
import { apiGet, apiPost, requestWithFallback } from './apiService';

type ApiJobListItem = {
  id: string;
  title: string;
  description: string;
  categoryId?: string | null;
  categoryName?: string | null;
  businessId: string;
  companyName?: string | null;
  tags: string[];
  status: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  durationType?: string | null;
  durationDays?: number | null;
  requiredSkills: string[];
  experienceLevel?: string | null;
  spotsTotal?: number | null;
  spotsFilled?: number | null;
  location?: string | null;
  isRemote?: boolean | null;
  isFeatured?: boolean | null;
  deadline?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  publishedAt?: string | null;
};

type ApiJobDetailsResponse = {
  id: string;
  title: string;
  description: string;
  location?: string | null;
  category?: {
    id: string;
    name: string;
    slug?: string | null;
    description?: string | null;
    jobCount?: number | null;
  } | null;
  business?: {
    id: string;
    companyName: string;
    rating?: number | null;
  } | null;
  tags: string[];
  status: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  requiredSkills: string[];
  spotsTotal?: number | null;
  spotsFilled?: number | null;
  durationType?: string | null;
  durationDays?: number | null;
  deadline?: string | null;
  publishedAt?: string | null;
  applications: Array<{
    id: string;
    status: string;
    appliedAt?: string | null;
    student: {
      id: string;
      name: string;
      rating?: number | null;
    };
  }>;
  createdAt?: string | null;
};

type ApiJobListPage = {
  total: number;
  page: number;
  limit: number;
  data: ApiJobListItem[];
};

function normalizeJob(raw: ApiJobListItem): Job {
  const spotsTotal = raw.spotsTotal ?? 0;
  const spotsFilled = raw.spotsFilled ?? 0;
  const companyName = raw.companyName ?? '';
  const category = raw.categoryName?.toLowerCase() ?? 'all';
  return {
    ...raw,
    id: raw.id,
    logoText: companyName ? companyName.slice(0, 2).toUpperCase() : 'U',
    logoGradient: 'linear-gradient(135deg,#5B4FFF,#7C72FF)',
    company: raw.companyName ?? '',
    companyId: raw.businessId,
    location: raw.location ?? '',
    verified: raw.isFeatured ?? false,
    tags: (raw.tags || []).map((label) => ({
      label,
      variant: 'p' as const,
    })),
    spotsLeft: Math.max(0, spotsTotal - spotsFilled),
    spotsTotal,
    pay: raw.salaryMin != null && raw.salaryMax != null
      ? `${raw.salaryMin.toLocaleString('vi-VN')} – ${raw.salaryMax.toLocaleString('vi-VN')} ${raw.currency ?? '₫'}`
      : 'Thỏa thuận',
    payMin: raw.salaryMin ?? 0,
    payMax: raw.salaryMax ?? 0,
    deadline: raw.deadline ?? '',
    category,
    skills: raw.requiredSkills ?? [],
    requirements: raw.requiredSkills ?? [],
    deliverables: [],
    duration: raw.durationType && raw.durationDays
      ? `${raw.durationDays} ngày · ${raw.durationType}`
      : raw.durationType ?? '',
    featured: raw.isFeatured ?? false,
    postedAt: raw.createdAt ?? '',
  };
}

function normalizeJobDetails(raw: ApiJobDetailsResponse): Job {
  const spotsTotal = raw.spotsTotal ?? 0;
  const spotsFilled = raw.spotsFilled ?? 0;
  const companyName = raw.business?.companyName ?? '';
  return {
    id: raw.id,
    logoText: companyName ? companyName.slice(0, 2).toUpperCase() : 'U',
    logoGradient: 'linear-gradient(135deg,#5B4FFF,#7C72FF)',
    title: raw.title,
    company: companyName,
    companyId: raw.business?.id ?? '',
    verified: raw.business?.rating ? raw.business.rating >= 4.5 : false,
    location: raw.location ?? 'Remote',
    tags: (raw.tags || []).map((label) => ({ label, variant: 'p' as const })),
    spotsLeft: Math.max(0, spotsTotal - spotsFilled),
    spotsTotal,
    pay: raw.salaryMin != null && raw.salaryMax != null
      ? `${raw.salaryMin.toLocaleString('vi-VN')} – ${raw.salaryMax.toLocaleString('vi-VN')} ₫`
      : 'Thỏa thuận',
    payMin: raw.salaryMin ?? 0,
    payMax: raw.salaryMax ?? 0,
    deadline: raw.deadline ?? raw.createdAt ?? '',
    category: raw.category?.slug ?? raw.category?.name?.toLowerCase() ?? 'all',
    featured: false,
    description: raw.description,
    requirements: raw.requiredSkills ?? [],
    deliverables: [],
    duration: raw.durationType && raw.durationDays
      ? `${raw.durationDays} ngày · ${raw.durationType}`
      : raw.durationType ?? '',
    postedAt: raw.publishedAt ?? raw.createdAt ?? '',
    skills: raw.requiredSkills ?? [],
  };
}

export const jobService = {
  /** Get all jobs (seeded + custom from localStorage) */
  async getAll(): Promise<Job[]> {
    return requestWithFallback(
      async () => {
        const page = await apiGet<ApiJobListPage>('/api/jobs?page=1&limit=1000');
        return page.data.map(normalizeJob);
      },
      jobsData,
    );
  },

  /** Get a single job by id */
  async getById(id: string | number): Promise<Job | undefined> {
    try {
      const job = await apiGet<ApiJobDetailsResponse>(`/api/jobs/${id}`);
      return normalizeJobDetails(job);
    } catch {
      return jobsData.find((j) => String(j.id) === String(id));
    }
  },

  /** Synchronous version for immediate access */
  getAllSync(): Job[] {
    return [];
  },

  /** Get jobs by company id (numeric or external code e.g. biz-1) */
  async getByCompany(companyId: string): Promise<Job[]> {
    return requestWithFallback(
      async () => {
        const page = await apiGet<ApiJobListPage>('/api/jobs?page=1&limit=1000');
        return page.data.map(normalizeJob).filter((job) => String(job.companyId) === String(companyId));
      },
      jobsData.filter((j) => String(j.companyId) === String(companyId)),
    );
  },

  /** Create a new job */
  async create(job: Omit<Job, 'id'>): Promise<Job> {
    const created = await apiPost<ApiJobListItem>('/api/jobs', {
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
