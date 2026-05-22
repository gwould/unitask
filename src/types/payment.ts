export type PaymentStatus = 'pending' | 'released' | 'refunded' | string;

export interface Payment {
  id: string;
  jobApplicationId: string;
  amount: number;
  currency?: string | null;
  status: PaymentStatus;
  paymentMethod?: string | null;
  createdAt?: string | null;
  releasedAt?: string | null;
}
