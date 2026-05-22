import type { Category, Feature, HowStep, Testimonial } from '../types';
import {
  categoriesData,
  studentSteps,
  businessSteps,
  testimonialsData,
  featuresData,
} from '../data/siteData';
import { apiGet } from './apiService';

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
  const slug = (raw.slug || raw.name).toLowerCase().replace(/\s+/g, '-');
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
};
