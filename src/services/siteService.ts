import type { Category, Feature, HowStep, Testimonial } from '../types';
import {
  categoriesData,
  studentSteps,
  businessSteps,
  testimonialsData,
  featuresData,
} from '../data/siteData';
import { apiGet } from './apiClient';
import { withFallback } from './withFallback';

export const siteService = {
  async getCategories(): Promise<Category[]> {
    return withFallback(() => apiGet<Category[]>('/api/categories'), categoriesData);
  },

  async getHowSteps(type: 'student' | 'business'): Promise<HowStep[]> {
    const fallback = type === 'student' ? studentSteps : businessSteps;
    return withFallback(
      () => apiGet<HowStep[]>(`/api/howsteps?type=${type}`),
      fallback,
    );
  },

  async getFeatures(): Promise<Feature[]> {
    return withFallback(() => apiGet<Feature[]>('/api/features'), featuresData);
  },

  async getTestimonials(): Promise<Testimonial[]> {
    return withFallback(
      () => apiGet<Testimonial[]>('/api/testimonials'),
      testimonialsData,
    );
  },
};
