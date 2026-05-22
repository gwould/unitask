import type { Payment } from '../types/payment';
import type { Transaction } from '../types';
import { apiGet, apiPost } from './apiService';
import { unwrapPaged, type PagedResult } from '../utils/paged';
import { hasAuthToken } from '../utils/auth';

type ApiPayment = {
  id: string;
  jobApplicationId: string;
  amount: number;
  currency?: string | null;
  status: string;
  paymentMethod?: string | null;
  createdAt?: string | null;
  releasedAt?: string | null;
};

function mapPayment(p: ApiPayment): Payment {
  return {
    id: p.id,
    jobApplicationId: p.jobApplicationId,
    amount: Number(p.amount),
    currency: p.currency,
    status: p.status,
    paymentMethod: p.paymentMethod,
    createdAt: p.createdAt,
    releasedAt: p.releasedAt,
  };
}

export function paymentToTransactions(payments: Payment[], role: 'student' | 'business'): Transaction[] {
  return payments.map((p) => {
    const date = (p.releasedAt || p.createdAt || new Date().toISOString()).slice(0, 10);
    if (role === 'student') {
      if (p.status === 'released') {
        return {
          id: p.id,
          type: 'income' as const,
          label: `Thanh toán job (đã giải phóng)`,
          amount: p.amount,
          date,
          status: 'completed' as const,
        };
      }
      return {
        id: p.id,
        type: 'income' as const,
        label: `Thanh toán đang chờ (${p.status})`,
        amount: p.amount,
        date,
        status: p.status === 'pending' ? 'pending' as const : 'completed' as const,
      };
    }

    if (p.status === 'released') {
      return {
        id: p.id,
        type: 'escrow_release' as const,
        label: `Giải phóng Escrow`,
        amount: -p.amount,
        date,
        status: 'completed' as const,
      };
    }
    return {
      id: p.id,
      type: 'escrow_in' as const,
      label: `Nạp Escrow (${p.paymentMethod ?? 'escrow'})`,
      amount: -p.amount,
      date,
      status: p.status === 'pending' ? 'pending' as const : 'completed' as const,
    };
  });
}

export const paymentService = {
  async list(options?: {
    userId?: string;
    status?: string;
    page?: number;
  }): Promise<Payment[]> {
    const params = new URLSearchParams();
    params.set('page', String(options?.page ?? 1));
    if (options?.status) params.set('status', options.status);
    if (options?.userId) params.set('userId', options.userId);

    const page = await apiGet<PagedResult<ApiPayment>>(`/api/payments?${params}`);
    return unwrapPaged(page).map(mapPayment);
  },

  async create(payload: {
    jobApplicationId: string;
    amount: number;
    paymentMethod?: string;
  }): Promise<Payment> {
    const created = await apiPost<ApiPayment>('/api/payments', {
      jobApplicationId: payload.jobApplicationId,
      amount: payload.amount,
      paymentMethod: payload.paymentMethod ?? 'escrow',
    });
    return mapPayment(created);
  },

  async release(paymentId: string): Promise<void> {
    await apiPost<unknown>(`/api/payments/${paymentId}/release`, {});
  },

  async refund(paymentId: string): Promise<void> {
    await apiPost<unknown>(`/api/payments/${paymentId}/refund`, {});
  },

  async listAsTransactions(userId: string, role: 'student' | 'business'): Promise<Transaction[]> {
    if (!hasAuthToken()) return [];
    try {
      const payments = await this.list({ userId, page: 1 });
      return paymentToTransactions(payments, role);
    } catch {
      return [];
    }
  },
};
