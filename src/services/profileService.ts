import { apiGet, apiPut } from './apiService';
import type { User } from '../types';

type StudentProfileDto = {
  id: string;
  userId: string;
  university?: string | null;
  major?: string | null;
  graduationYear?: number | null;
  completedJobs?: number | null;
  totalEarnings?: number | null;
  bio?: string | null;
};

type BusinessProfileDto = {
  id: string;
  userId: string;
  companyName?: string | null;
  completedProjects?: number | null;
  rating?: number | null;
  description?: string | null;
};

type WalletDto = {
  balance?: number | null;
  totalEarned?: number | null;
  totalWithdrawn?: number | null;
};

export const profileService = {
  async enrichUser(base: User): Promise<User> {
    try {
      if (base.role === 'student') {
        const [profile, wallet] = await Promise.all([
          apiGet<StudentProfileDto>(`/api/students/${base.id}`).catch(() => null),
          apiGet<WalletDto>('/api/wallets/my-wallet').catch(() => null),
        ]);
        return {
          ...base,
          university: profile?.university ?? base.university,
          major: profile?.major ?? base.major,
          year: profile?.graduationYear ?? base.year,
          completedJobs: profile?.completedJobs ?? base.completedJobs,
          bio: profile?.bio ?? base.bio,
          balance: wallet?.balance != null ? Number(wallet.balance) : base.balance,
        };
      }

      if (base.role === 'business') {
        const profile = await apiGet<BusinessProfileDto>(`/api/businesses/${base.id}`).catch(() => null);
        return {
          ...base,
          companyName: profile?.companyName ?? base.companyName,
          completedJobs: profile?.completedProjects ?? base.completedJobs,
          rating: profile?.rating != null ? Number(profile.rating) : base.rating,
          bio: profile?.description ?? base.bio,
        };
      }
    } catch {
      // keep base user when API unavailable
    }
    return base;
  },

  async updateStudentProfile(userId: string, data: Partial<User>): Promise<void> {
    await apiPut(`/api/students/${userId}`, {
      university: data.university,
      major: data.major,
      graduationYear: data.year,
      bio: data.bio,
    });
  },

  async updateBusinessProfile(userId: string, data: Partial<User>): Promise<void> {
    await apiPut(`/api/businesses/${userId}`, {
      companyName: data.companyName,
      description: data.bio,
    });
  },
};
