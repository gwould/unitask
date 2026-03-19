import type { Job } from './job';

export type AppStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export type SubmissionReviewStatus = 'submitted' | 'revision_requested' | 'approved';

export interface TaskSubmission {
  summary: string;
  deliverableUrl: string;
  note?: string;
  submittedAt: string;
  reviewStatus: SubmissionReviewStatus;
  reviewNote?: string;
  reviewedAt?: string;
}

export interface Application {
  id: string;
  jobId: number;
  userId: string;
  coverLetter: string;
  status: AppStatus;
  appliedAt: string;
  submission?: TaskSubmission;
}

export interface EnrichedApplication extends Application {
  job: Job | undefined;
}

export interface Applicant {
  id: string;
  appId?: string;
  jobId: number;
  userId: string;
  coverLetter: string;
  status: AppStatus;
  appliedAt: string;
  name: string;
  university?: string;
  skills?: string[];
  rating?: number;
  submission?: TaskSubmission;
}
