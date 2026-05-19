import type { Category, Feature, HowStep, Testimonial } from '../types';
import { apiGet } from './apiClient';

export const siteService = {
  async getCategories(): Promise<Category[]> {
    return apiGet<Category[]>('/api/categories');
  },

  async getHowSteps(type: 'student' | 'business'): Promise<HowStep[]> {
    return apiGet<HowStep[]>(`/api/howsteps?type=${type}`);
  },

  async getFeatures(): Promise<Feature[]> {
    return apiGet<Feature[]>('/api/features');
  },

  async getTestimonials(): Promise<Testimonial[]> {
    return apiGet<Testimonial[]>('/api/testimonials');
  },
};
