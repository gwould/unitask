import { apiPost } from './apiService';

// BC1 — gửi báo cáo vi phạm vào dbo.AdminReports (qua /api/reports).

export type ReportCategory = 'scam' | 'nda' | 'abuse' | 'bypass' | 'other';

export interface ReportInput {
  reportType: ReportCategory;
  reason: string;
  reportedUserId?: string;
  reportedJobId?: string;
}

export const reportService = {
  create(input: ReportInput): Promise<{ id: string; status: string }> {
    return apiPost<{ id: string; status: string }>('/api/reports', input);
  },
};
