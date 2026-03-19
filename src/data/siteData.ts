/**
 * siteData.ts — Re-exports from the consolidated mockData module.
 * Homepage components can continue to import from here.
 */
export {
  jobsData,
  categoriesData,
  studentSteps,
  businessSteps,
  testimonialsData,
  featuresData,
} from './mockData';

export type {
  Job,
  Category,
  HowStep,
  Testimonial,
  Feature,
} from '../types';

