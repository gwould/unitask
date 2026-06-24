import { apiGet, apiPost, apiPut, apiDelete } from './apiService';
import type {
  PortfolioPublic,
  PortfolioProject,
  Education,
  Certification,
} from '../types/portfolio';

export const portfolioService = {
  // Public view
  getPublicPortfolio(userId: string) {
    return apiGet<PortfolioPublic>(`/api/portfolio/${userId}`);
  },

  // Projects
  getProjects(userId: string) {
    return apiGet<PortfolioProject[]>(`/api/portfolio/${userId}/projects`);
  },
  createProject(userId: string, data: Omit<PortfolioProject, 'id'>) {
    return apiPost<PortfolioProject>(`/api/portfolio/${userId}/projects`, data);
  },
  updateProject(userId: string, id: string, data: Omit<PortfolioProject, 'id'>) {
    return apiPut<void>(`/api/portfolio/${userId}/projects/${id}`, data);
  },
  deleteProject(userId: string, id: string) {
    return apiDelete(`/api/portfolio/${userId}/projects/${id}`);
  },

  // Education
  getEducations(userId: string) {
    return apiGet<Education[]>(`/api/portfolio/${userId}/educations`);
  },
  createEducation(userId: string, data: Omit<Education, 'id'>) {
    return apiPost<Education>(`/api/portfolio/${userId}/educations`, data);
  },
  updateEducation(userId: string, id: string, data: Omit<Education, 'id'>) {
    return apiPut<void>(`/api/portfolio/${userId}/educations/${id}`, data);
  },
  deleteEducation(userId: string, id: string) {
    return apiDelete(`/api/portfolio/${userId}/educations/${id}`);
  },

  // Certifications
  getCertifications(userId: string) {
    return apiGet<Certification[]>(`/api/portfolio/${userId}/certifications`);
  },
  createCertification(userId: string, data: Omit<Certification, 'id'>) {
    return apiPost<Certification>(`/api/portfolio/${userId}/certifications`, data);
  },
  updateCertification(userId: string, id: string, data: Omit<Certification, 'id'>) {
    return apiPut<void>(`/api/portfolio/${userId}/certifications/${id}`, data);
  },
  deleteCertification(userId: string, id: string) {
    return apiDelete(`/api/portfolio/${userId}/certifications/${id}`);
  },
};
