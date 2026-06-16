import { apiGet } from './apiService';
import { hasAuthToken } from '../utils/auth';
import type { Notification } from '../types/automation';

export type DashboardNotification = {
  id: string;
  type?: string | null;
  title?: string | null;
  message: string;
  isRead?: boolean | null;
  createdAt?: string | null;
};

export type StudentDashboardData = {
  stats: {
    completedJobs: number;
    activeApplications: number;
    pendingApplications: number;
    totalEarnings: number;
    averageRating: number;
  };
  wallet: {
    balance: number;
    totalEarned: number;
    totalWithdrawn: number;
  };
  recentJobs: Array<{
    id: string;
    title: string;
    companyName?: string | null;
    status?: string | null;
    createdAt?: string | null;
  }>;
  notifications: DashboardNotification[];
};

export type BusinessDashboardData = {
  balance: number;
  stats: {
    openJobs: number;
    totalApplications: number;
    pendingApplications: number;
    totalSpent: number;
    completedProjects: number;
    averageRating: number;
  };
  openJobs: Array<{
    id: string;
    title: string;
    status: string;
    spotsFilled?: number | null;
    spotsTotal?: number | null;
  }>;
  recentApplications: Array<{
    id: string;
    status: string;
    jobId: string;
    jobTitle: string;
    studentName: string;
    appliedAt?: string | null;
  }>;
  notifications: DashboardNotification[];
};

type ApiStudentDashboard = {
  stats: StudentDashboardData['stats'];
  wallet: {
    balance?: number | null;
    totalEarned?: number | null;
    totalWithdrawn?: number | null;
  };
  recentJobs: StudentDashboardData['recentJobs'];
  notifications: DashboardNotification[];
};

type ApiBusinessDashboard = {
  business?: { balance?: number | null } | null;
  stats: BusinessDashboardData['stats'];
  openJobs: BusinessDashboardData['openJobs'];
  recentApplications: BusinessDashboardData['recentApplications'];
  notifications: DashboardNotification[];
};

export function mapDashboardNotification(
  n: DashboardNotification,
  recipientId: string,
  role: 'student' | 'business',
): Notification {
  return {
    id: n.id,
    recipientId,
    recipientType: role,
    title: n.title ?? 'Thông báo',
    message: n.message,
    type: 'system',
    isRead: n.isRead ?? false,
    createdAt: n.createdAt ?? new Date().toISOString(),
  };
}

export const dashboardService = {
  async getStudent(userId: string): Promise<StudentDashboardData | null> {
    if (!hasAuthToken()) return null;
    try {
      const data = await apiGet<ApiStudentDashboard>(`/api/students/${userId}/dashboard`);
      return {
        stats: data.stats,
        wallet: {
          balance: Number(data.wallet?.balance ?? 0),
          totalEarned: Number(data.wallet?.totalEarned ?? 0),
          totalWithdrawn: Number(data.wallet?.totalWithdrawn ?? 0),
        },
        recentJobs: data.recentJobs ?? [],
        notifications: data.notifications ?? [],
      };
    } catch {
      return null;
    }
  },

  async getBusiness(userId: string): Promise<BusinessDashboardData | null> {
    if (!hasAuthToken()) return null;
    try {
      const data = await apiGet<ApiBusinessDashboard>(`/api/businesses/${userId}/dashboard`);
      return {
        balance: Number(data.business?.balance ?? 0),
        stats: data.stats,
        openJobs: data.openJobs ?? [],
        recentApplications: data.recentApplications ?? [],
        notifications: data.notifications ?? [],
      };
    } catch {
      return null;
    }
  },
};
