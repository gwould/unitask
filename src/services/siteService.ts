import type { Category, Feature, HowStep, Testimonial } from '../types';
import {
  categoriesData,
  studentSteps,
  businessSteps,
  testimonialsData,
  featuresData,
} from '../data/siteData';
import { requestWithFallback } from './apiService';
import { apiRepository } from './apiRepository';

export const siteService = {
  async getCategories(): Promise<Category[]> {
    return requestWithFallback(() => apiRepository.site.categories(), categoriesData);
  },

  async getHowSteps(type: 'student' | 'business'): Promise<HowStep[]> {
    const fallback = type === 'student' ? studentSteps : businessSteps;
    return requestWithFallback(
      () => apiRepository.site.howSteps(type),
      fallback,
    );
  },

  async getFeatures(): Promise<Feature[]> {
    return requestWithFallback(() => apiRepository.site.features(), featuresData);
  },

  async getTestimonials(): Promise<Testimonial[]> {
    return requestWithFallback(
      () => apiRepository.site.testimonials(),
      testimonialsData,
    );
  },
};
