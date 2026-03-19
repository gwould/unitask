import type { Job } from '../types';
import { STORAGE_KEYS } from '../constants';
import { getFromStorage } from '../utils/storage';
import { simulateDelay } from '../utils/async';
import { jobsData } from '../data/mockData';

export const jobService = {
  /** Get all jobs (seeded + custom from localStorage) */
  async getAll(): Promise<Job[]> {
    await simulateDelay(300);
    const custom = getFromStorage<Partial<Job>[]>(STORAGE_KEYS.CUSTOM_JOBS, []);
    return [...jobsData, ...custom.map(mapCustomJob)];
  },

  /** Get a single job by id */
  async getById(id: number): Promise<Job | undefined> {
    await simulateDelay(200);
    const all = this.getAllSync();
    return all.find((j) => j.id === id);
  },

  /** Synchronous version for immediate access */
  getAllSync(): Job[] {
    const custom = getFromStorage<Partial<Job>[]>(STORAGE_KEYS.CUSTOM_JOBS, []);
    return [...jobsData, ...custom.map(mapCustomJob)];
  },

  /** Get jobs by company id */
  async getByCompany(companyId: string): Promise<Job[]> {
    await simulateDelay(300);
    return this.getAllSync().filter((j) => j.companyId === companyId);
  },

  /** Create a new job (saved to localStorage) */
  async create(job: Omit<Job, 'id'>): Promise<Job> {
    await simulateDelay(500);
    const newJob: Job = { ...job, id: Date.now() } as Job;
    const custom = getFromStorage<Job[]>(STORAGE_KEYS.CUSTOM_JOBS, []);
    custom.push(newJob);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_JOBS, JSON.stringify(custom));
    return newJob;
  },
};

function mapCustomJob(c: Partial<Job>): Job {
  return {
    id: c.id || Date.now(),
    title: c.title || '',
    company: c.company || '',
    companyId: c.companyId || '',
    logoText: c.logoText || (c.company || '').slice(0, 2).toUpperCase(),
    logoGradient: c.logoGradient || 'linear-gradient(135deg,#5B4FFF,#7C72FF)',
    verified: c.verified ?? false,
    location: c.location || 'Remote',
    tags: c.tags || [],
    spotsLeft: c.spotsLeft ?? 3,
    spotsTotal: c.spotsTotal ?? 5,
    pay: c.pay || '',
    payMin: c.payMin || 0,
    payMax: c.payMax || 0,
    deadline: c.deadline || '',
    category: c.category || '',
    featured: c.featured ?? false,
    description: c.description || '',
    requirements: c.requirements || [],
    deliverables: c.deliverables || [],
    duration: c.duration || '',
    postedAt: c.postedAt || new Date().toISOString().slice(0, 10),
    skills: c.skills || [],
  };
}
