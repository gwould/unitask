import type { User } from '../types';
import { apiRepository, type ApiUser } from './apiRepository';

export type { ApiUser };

export function normalizeUser(user: ApiUser): User {
  return {
    id: user.externalCode ?? String(user.id),
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

/** Map database user id → profile (for application joins). */
export function buildUsersByDbId(users: ApiUser[]): Map<number, User> {
  return new Map(users.map((u) => [u.id, normalizeUser(u)]));
}

export const userApiService = {
  async getAll(): Promise<User[]> {
    const users = await apiRepository.users.list();
    return users.map(normalizeUser);
  },

  async getAllRaw(): Promise<ApiUser[]> {
    return apiRepository.users.list();
  },
};
