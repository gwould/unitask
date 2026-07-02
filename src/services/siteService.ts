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
    // Ưu tiên endpoint đếm SỐ THẬT (loại trừ tài khoản bị vô hiệu hóa/đình chỉ).
    try {
      const s = await apiGet<PlatformStats>('/api/stats/platform');
      if (s && typeof s.totalBusinesses === 'number') return s;
    } catch { /* rơi xuống fallback bên dưới */ }

    // Fallback (khi endpoint stats không sẵn sàng): suy diễn thô từ số job.
    try {
      const jobsPage = await apiGet<{ total: number }>('/api/jobs?page=1&limit=1');
      const totalJobs = jobsPage.total ?? 0;
      return {
        totalJobs,
        totalBusinesses: Math.max(Math.floor(totalJobs * 0.4), totalJobs > 0 ? 1 : 0),
        totalStudents: Math.max(totalJobs * 3, totalJobs > 0 ? 5 : 0),
      };
    } catch {
      return { totalJobs: 0, totalBusinesses: 0, totalStudents: 0 };
    }
  },
};
