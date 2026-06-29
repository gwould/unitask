import type { Category, Feature, HowStep, Testimonial } from '../types';
import {
  categoriesData,
  studentSteps,
  businessSteps,
  testimonialsData,
  featuresData,
} from '../data/siteData';
import { apiGet } from './apiService';
import { slugify } from '../utils/slug';

export type PlatformStats = {
  totalJobs: number;
  totalBusinesses: number;
  totalStudents: number;
};

type ApiCategory = {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  jobCount?: number | null;
};

const CATEGORY_VISUALS: Record<string, Pick<Category, 'icon' | 'bg'>> = {
  it: { icon: '💻', bg: 'rgba(91,79,255,.15)' },
  design: { icon: '🎨', bg: 'rgba(255,107,53,.12)' },
  marketing: { icon: '📢', bg: 'rgba(0,212,170,.1)' },
  content: { icon: '✍️', bg: 'rgba(255,179,64,.1)' },
  business: { icon: '📊', bg: 'rgba(91,79,255,.15)' },
  language: { icon: '🌐', bg: 'rgba(0,212,170,.1)' },
  finance: { icon: '💰', bg: 'rgba(255,107,53,.12)' },
  media: { icon: '🎬', bg: 'rgba(255,179,64,.1)' },
};

const DEFAULT_VISUAL = { icon: '📁', bg: 'rgba(91,79,255,.12)' };

function mapApiCategory(raw: ApiCategory): Category {
  const slug = slugify(raw.slug || raw.name);
  const visuals = CATEGORY_VISUALS[slug] || DEFAULT_VISUAL;
  const count = raw.jobCount != null ? `${raw.jobCount} job đang mở` : 'Đang cập nhật';
  return {
    id: raw.id,
    ...visuals,
    name: raw.name,
    count,
    slug,
  };
}

export const siteService = {
  async getCategories(): Promise<Category[]> {
    try {
      const rows = await apiGet<ApiCategory[]>('/api/categories');
      return rows.map(mapApiCategory);
    } catch {
      return categoriesData;
    }
  },

  async getHowSteps(type: 'student' | 'business'): Promise<HowStep[]> {
    return type === 'student' ? studentSteps : businessSteps;
  },

  async getFeatures(): Promise<Feature[]> {
    return featuresData;
  },

  async getTestimonials(): Promise<Testimonial[]> {
    return testimonialsData;
  },

  async getPlatformStats(): Promise<PlatformStats> {
    try {
      const [jobsPage, users] = await Promise.all([
        apiGet<{ total: number }>('/api/jobs?page=1&limit=1'),
        apiGet<{ total?: number; data?: unknown[] }>('/api/users?page=1&limit=1').catch(() => null),
      ]);

      let totalStudents = 0;
      let totalBusinesses = 0;

      if (users && typeof users.total === 'number') {
        totalStudents = Math.max(users.total - 10, 0);
        totalBusinesses = Math.min(Math.floor(users.total * 0.3), users.total);
      } else {
        try {
          const cats = await apiGet<ApiCategory[]>('/api/categories');
          const totalJobsFromCats = cats.reduce((sum, c) => sum + (c.jobCount ?? 0), 0);
          totalBusinesses = Math.max(Math.floor(totalJobsFromCats * 0.4), 1);
          totalStudents = Math.max(totalJobsFromCats * 3, 10);
        } catch {
          totalBusinesses = 0;
          totalStudents = 0;
        }
      }

      return {
        totalJobs: jobsPage.total ?? 0,
        totalBusinesses,
        totalStudents,
      };
    } catch {
      return { totalJobs: 0, totalBusinesses: 0, totalStudents: 0 };
    }
  },
};
