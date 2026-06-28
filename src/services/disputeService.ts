import type { Dispute } from '../types';
import { apiGet, apiPost } from './apiService';

// Quy trình tranh chấp B1–B4.

/** Tranh chấp kèm bối cảnh cho màn hình quản trị (admin). */
export interface AdminDispute extends Dispute {
  milestoneAmount: number;
  jobTitle?: string | null;
  studentName?: string | null;
  companyName?: string | null;
  /** "student" | "business" — bên đã mở tranh chấp. */
  raisedByRole?: 'student' | 'business' | string | null;
}

export const disputeService = {
  /** B1 — mở tranh chấp trên một milestone. */
  open(milestoneId: string, reason: string): Promise<Dispute> {
    return apiPost<Dispute>('/api/disputes', { milestoneId, reason });
  },

  /** B2 — yêu cầu hòa giải. */
  requestMediation(disputeId: string): Promise<Dispute> {
    return apiPost<Dispute>(`/api/disputes/${disputeId}/request-mediation`, {});
  },

  /** B3 — hòa giải viên (admin) ra quyết định. */
  resolve(disputeId: string, decision: 'RELEASE' | 'REFUND' | 'SPLIT', studentPercent?: number, note?: string): Promise<Dispute> {
    return apiPost<Dispute>(`/api/disputes/${disputeId}/resolve`, { decision, studentPercent, note });
  },

  /** B4 — kháng cáo trong 7 ngày. */
  appeal(disputeId: string, reason?: string): Promise<Dispute> {
    return apiPost<Dispute>(`/api/disputes/${disputeId}/appeal`, { reason });
  },

  /** Danh sách tranh chấp của một hợp đồng. */
  byContract(contractId: string): Promise<Dispute[]> {
    return apiGet<Dispute[]>(`/api/disputes/contract/${contractId}`);
  },

  /** Admin — danh sách tất cả tranh chấp (lọc theo status nếu có). */
  listAll(status?: string): Promise<AdminDispute[]> {
    const q = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    return apiGet<AdminDispute[]>(`/api/disputes${q}`);
  },
};
