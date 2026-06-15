import type { Dispute } from '../types';
import { apiGet, apiPost } from './apiService';

// Quy trình tranh chấp B1–B4.

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
};
