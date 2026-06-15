// ============================================================
// Types cho module Hợp đồng / Milestone / Submission.
// Khớp đúng shape JSON do backend (.NET) trả về.
// ============================================================

/** Vòng đời trạng thái của một Milestone (đồng bộ với CHECK constraint ở DB). */
export type MilestoneStatus =
  | 'PENDING'
  | 'ESCROWED'
  | 'UNDER_REVIEW'
  | 'REVISION'
  | 'COMPLETED'
  | 'CANCELED';

export type ContractStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELED';

/** Một lần sinh viên nộp bài. */
export interface Submission {
  id: string;
  milestoneId: string;
  fileUrl?: string | null;
  coverLetter?: string | null;
  clientFeedback?: string | null;
  clientEvidenceUrl?: string | null;
  createdAt?: string | null;
}

/** Milestone kèm bản nộp mới nhất (để render Box "bài nộp mới"). */
export interface Milestone {
  id: string;
  contractId: string;
  title: string;
  amount: number;
  status: MilestoneStatus;
  dueDate?: string | null;
  createdAt?: string | null;
  latestSubmission?: Submission | null;
}

export type DisputeStatus = 'NEGOTIATION' | 'MEDIATION' | 'RESOLVED' | 'APPEAL' | 'CLOSED';

/** Tranh chấp trên một milestone (quy trình B1–B4). */
export interface Dispute {
  id: string;
  milestoneId: string;
  milestoneTitle?: string | null;
  contractId: string;
  raisedByUserId: string;
  reason: string;
  status: DisputeStatus;
  decision?: 'RELEASE' | 'REFUND' | 'SPLIT' | null;
  studentPercent?: number | null;
  decisionNote?: string | null;
  createdAt?: string | null;
  resolvedAt?: string | null;
  appealDeadline?: string | null;
}

/** Hợp đồng kèm danh sách milestone. */
export interface Contract {
  id: string;
  jobId: string;
  jobTitle?: string | null;
  studentId: string;
  studentName?: string | null;
  businessId: string;
  finalPrice: number;
  status: ContractStatus;
  createdAt?: string | null;
  milestones: Milestone[];
}
