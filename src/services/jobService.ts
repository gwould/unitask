import type { Job } from '../types';
import { STORAGE_KEYS } from '../constants';
import { jobsData } from '../data/siteData';
import { apiGet, apiPost, apiPut, requestWithFallback } from './apiService';
import { unwrapPaged, type PagedResult } from '../utils/paged';

function getCurrentUserId(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    const user = JSON.parse(raw) as { id?: string | number };
    return user.id != null ? String(user.id) : null;
  } catch {
    return null;
  }
}

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
    userId?: string;
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

type ApiJobListPage = PagedResult<ApiJobListItem>;

type BusinessProfileRef = { id: string; userId: string };

export type JobListFilters = {
  status?: string;
  categoryId?: string;
  search?: string;
  isRemote?: boolean;
  page?: number;
  limit?: number;
};

function buildJobsQuery(filters?: JobListFilters): string {
  const params = new URLSearchParams();
  params.set('page', String(filters?.page ?? 1));
  params.set('limit', String(filters?.limit ?? 1000));
  if (filters?.status) params.set('status', filters.status);
  if (filters?.categoryId) params.set('categoryId', filters.categoryId);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.isRemote != null) params.set('isRemote', String(filters.isRemote));
  return params.toString();
}

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
    companyUserId: raw.business?.userId,
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

async function fetchJobPage(filters?: JobListFilters): Promise<ApiJobListItem[]> {
  const page = await apiGet<ApiJobListPage>(`/api/jobs?${buildJobsQuery(filters)}`);
  return unwrapPaged(page);
}

export const jobService = {
  async getAll(filters?: JobListFilters): Promise<Job[]> {
    return requestWithFallback(
      async () => {
        const items = await fetchJobPage({ ...filters, status: filters?.status ?? 'open' });
        return items.map(normalizeJob);
      },
      jobsData,
    );
  },

  async getById(id: string | number): Promise<Job | undefined> {
    try {
      const job = await apiGet<ApiJobDetailsResponse>(`/api/jobs/${id}`);
      return normalizeJobDetails(job);
    } catch {
      return jobsData.find((j) => String(j.id) === String(id));
    }
  },

  getAllSync(): Job[] {
    return [];
  },

  /** Jobs owned by the logged-in business user (resolves profile id from user id). */
  async getByCompanyUser(userId?: string): Promise<Job[]> {
    const uid = userId ?? getCurrentUserId();
    if (!uid) return [];

    try {
      const profile = await apiGet<BusinessProfileRef>(`/api/businesses/${uid}`);
      const items = await fetchJobPage({ limit: 1000 });
      return items.map(normalizeJob).filter((job) => String(job.companyId) === String(profile.id));
    } catch {
      return jobsData.filter((j) => String(j.companyId) === String(uid));
    }
  },

  /** @deprecated Use getByCompanyUser — kept for callers passing business profile id */
  async getByCompany(companyId: string): Promise<Job[]> {
    return requestWithFallback(
      async () => {
        const items = await fetchJobPage({ limit: 1000 });
        return items.map(normalizeJob).filter((job) => String(job.companyId) === String(companyId));
      },
      jobsData.filter((j) => String(j.companyId) === String(companyId)),
    );
  },

  async create(job: Omit<Job, 'id'> & { categoryId?: string | null }): Promise<Job> {
    // Bước 0: resolve businessId từ userId (backend có thể cần cả hai)
    const userId = getCurrentUserId();
    let resolvedBusinessId: string | undefined;
    if (userId) {
      try {
        const profile = await apiGet<{ id: string; userId: string }>(`/api/businesses/${userId}`);
        resolvedBusinessId = profile?.id;
      } catch {
        // Profile chưa tồn tại — thử tạo mới rồi lấy lại
        try {
          const created = await apiPost<{ id: string }>('/api/businesses', {
            companyName: job.company || 'My Company',
            description: '',
          });
          resolvedBusinessId = created?.id;
        } catch {
          // Bỏ qua, để backend tự xử lý từ JWT
        }
      }
    }

    // Bước 1: build payload — chỉ gửi field có giá trị thật
    const payload: Record<string, unknown> = {
      title: job.title,
      description: job.description,
      tags: job.tags.map((tag) => tag.label),
      salaryMin: job.payMin,
      salaryMax: job.payMax || job.payMin,
      currency: 'VND',
      spotsTotal: job.spotsTotal ?? 1,
      location: job.location,
      requiredSkills: job.skills?.length ? job.skills : [],
    };

    if (resolvedBusinessId) {
      payload.businessId = resolvedBusinessId;
    }

    if (job.categoryId && job.categoryId.length > 10) {
      payload.categoryId = job.categoryId;
    }

    if (job.duration) {
      payload.durationType = job.duration;
    }

    if (job.location.toLowerCase().includes('remote')) {
      payload.isRemote = true;
    }

    if (job.deadline) {
      try {
        payload.deadline = new Date(job.deadline).toISOString();
      } catch {
        payload.deadline = job.deadline;
      }
    }

    console.log('[jobService.create] payload:', JSON.stringify(payload, null, 2));

    const created = await apiPost<ApiJobListItem>('/api/jobs', payload);
    return normalizeJob(created);
  },

  async publish(jobId: string | number): Promise<void> {
    await apiPut(`/api/jobs/${jobId}/publish`, {});
  },

  async update(jobId: string | number, payload: Partial<Job> & { categoryId?: string | null }): Promise<void> {
    await apiPut(`/api/jobs/${jobId}`, {
      title: payload.title,
      description: payload.description,
      categoryId: payload.categoryId,
      status: undefined,
      tags: payload.tags?.map((t) => t.label),
      salaryMin: payload.payMin,
      salaryMax: payload.payMax,
      requiredSkills: payload.skills,
      location: payload.location,
      spotsTotal: payload.spotsTotal,
    });
  },
};
