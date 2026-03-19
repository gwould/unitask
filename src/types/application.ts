import type { Job } from './job';

export type AppStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface Application {
  id: string;
  jobId: number;
  userId: string;
  coverLetter: string;
  status: AppStatus;
  appliedAt: string;
}

export interface EnrichedApplication extends Application {
  job: Job | undefined;
}

export interface Applicant {
  id: string;
  jobId: number;
  userId: string;
  coverLetter: string;
  status: AppStatus;
  appliedAt: string;
  name: string;
  university?: string;
  skills?: string[];
  rating?: number;
}
