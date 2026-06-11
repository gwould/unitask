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
  id: number | string;
  jobId: number | string;
  userId: number | string;
  coverLetter: string;
  status: AppStatus;
  appliedAt: string;
  submission?: TaskSubmission;
}

export interface EnrichedApplication extends Application {
  job: Job | undefined;
}

export interface AssignedTask {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'done';
  assignedAt: string;
}

export interface Applicant {
  id: number | string;
  appId?: number | string;
  jobId: number | string;
  userId: number | string;
  coverLetter: string;
  status: AppStatus;
  appliedAt: string;
  name: string;
  university?: string;
  skills?: string[];
  rating?: number;
  submission?: TaskSubmission;
  /** Tasks giao cho sinh viên này */
  assignedTasks?: AssignedTask[];
}
