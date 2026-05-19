import type { User } from '../types';
import { apiGet } from './apiClient';

type ApiUser = {
  id: number;
  fullName: string;
  email: string;
  role: string;
  companyName?: string | null;
  university?: string | null;
  phone?: string | null;
};

function normalizeUser(user: ApiUser): User {
  return {
    id: user.id,
    email: user.email,
    name: user.fullName,
    role: user.role === 'business' ? 'business' : user.role === 'admin' ? 'admin' : 'student',
    avatar: user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U',
    university: user.university || undefined,
    companyName: user.companyName || undefined,
    phone: user.phone || undefined,
    skills: [],
    bio: '',
    completedJobs: 0,
    rating: 0,
    balance: 0,
  };
}

export const userApiService = {
  async getAll(): Promise<User[]> {
    const users = await apiGet<ApiUser[]>('/api/users');
    return users.map(normalizeUser);
  },
};
