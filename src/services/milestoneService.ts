import type { Contract, Milestone } from '../types';
import { apiGet, apiPost } from './apiService';

// ============================================================
// Service gọi API module Hợp đồng / Milestone.
// Backend trả về MilestoneResponse (camelCase) khớp trực tiếp với type Milestone,
// nên không cần normalize phức tạp như applicationService.
// Mỗi action POST trả về Milestone đã cập nhật -> dùng để update state tại chỗ.
// ============================================================

/** Body tạo hợp đồng từ một đơn ứng tuyển đã được duyệt. */
export interface CreateContractInput {
  jobApplicationId: string;
  finalPrice?: number;
  milestones: { title: string; amount: number; dueDate?: string }[];
}

export const milestoneService = {
  /** [Business] Tạo hợp đồng + milestone từ JobApplication đã 'accepted'. */
  createContract(input: CreateContractInput): Promise<Contract> {
    return apiPost<Contract>('/api/contracts', input);
  },

  /** Danh sách hợp đồng của người dùng hiện tại (Business hoặc Student). */
  getMyContracts(): Promise<Contract[]> {
    return apiGet<Contract[]>('/api/contracts/mine');
  },

  /** Lấy hợp đồng + danh sách milestone (kèm bản nộp mới nhất). */
  getContract(contractId: string): Promise<Contract> {
    return apiGet<Contract>(`/api/contracts/${contractId}`);
  },

  /** Tìm hợp đồng theo đơn ứng tuyển; trả về null nếu chưa có (404). */
  async getContractByApplication(jobApplicationId: string): Promise<Contract | null> {
    try {
      return await apiGet<Contract>(`/api/contracts/by-application/${jobApplicationId}`);
    } catch {
      return null;
    }
  },

  /** Chỉ lấy danh sách milestone của hợp đồng. */
  getMilestones(contractId: string): Promise<Milestone[]> {
    return apiGet<Milestone[]>(`/api/contracts/${contractId}/milestones`);
  },

  /** [Business] Giao task: thêm 1 milestone (PENDING) vào hợp đồng đang chạy. */
  addMilestone(contractId: string, data: { title: string; amount: number; dueDate?: string }): Promise<Milestone> {
    return apiPost<Milestone>(`/api/contracts/${contractId}/milestones`, data);
  },

  /** [Business] Nạp tiền ký quỹ: PENDING → ESCROWED. */
  escrow(milestoneId: string, paymentReference?: string): Promise<Milestone> {
    return apiPost<Milestone>(`/api/milestones/${milestoneId}/escrow`, { paymentReference });
  },

  /** [Student] Nộp bài: ESCROWED|REVISION → UNDER_REVIEW. */
  submit(milestoneId: string, data: { fileUrl?: string; coverLetter?: string }): Promise<Milestone> {
    return apiPost<Milestone>(`/api/milestones/${milestoneId}/submit`, data);
  },

  /** [Business] Nghiệm thu: UNDER_REVIEW → COMPLETED (giải ngân ví Student). */
  approve(milestoneId: string): Promise<Milestone> {
    return apiPost<Milestone>(`/api/milestones/${milestoneId}/approve`, {});
  },

  /** [Business] Yêu cầu sửa: UNDER_REVIEW → REVISION (bắt buộc lý do + bằng chứng — chính sách 1.4). */
  requestChanges(milestoneId: string, feedback: string, evidenceUrl: string): Promise<Milestone> {
    return apiPost<Milestone>(`/api/milestones/${milestoneId}/request-changes`, { feedback, evidenceUrl });
  },

  /** [Business] Hủy task: hoàn tiền theo % tiến độ (chính sách 1.3). */
  cancel(milestoneId: string, progressPercent: number, reason?: string): Promise<Milestone> {
    return apiPost<Milestone>(`/api/milestones/${milestoneId}/cancel`, { progressPercent, reason });
  },
};
