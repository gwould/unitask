import type { User, RegisterData } from '../types';
import { STORAGE_KEYS } from '../constants';

/* ─── SEED DATA ───────────────────────────────────── */

const DEMO_ACCOUNTS: (User & { password: string })[] = [
  {
    id: 'stu-1',
    email: 'student@demo.com',
    password: 'demo123',
    name: 'Nguyễn Minh Khoa',
    role: 'student',
    avatar: 'K',
    university: 'Đại học Bách Khoa TP.HCM',
    major: 'Công nghệ Thông tin',
    year: 4,
    skills: ['React', 'TypeScript', 'Figma', 'Node.js'],
    bio: 'Sinh viên năm 4 CNTT, đam mê Frontend Development.',
    phone: '0901234567',
    completedJobs: 8,
    rating: 4.9,
    balance: 5_200_000,
  },
  {
    id: 'biz-1',
    email: 'business@demo.com',
    password: 'demo123',
    name: 'Huỳnh Thanh Tùng',
    role: 'business',
    avatar: 'T',
    companyName: 'BrandSpace Startup',
    bio: 'Co-founder BrandSpace — chuyên về digital branding cho SME.',
    phone: '0987654321',
    completedJobs: 15,
    rating: 4.8,
    balance: 12_500_000,
  },
];

/* ─── SERVICE ─────────────────────────────────────── */

function getStoredAccounts(): (User & { password: string })[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return raw ? JSON.parse(raw) : [...DEMO_ACCOUNTS];
  } catch {
    return [...DEMO_ACCOUNTS];
  }
}

function saveAccounts(accounts: (User & { password: string })[]) {
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
}

export const userService = {
  /** Attempt login */
  async login(email: string, password: string): Promise<User | null> {
    const accounts = getStoredAccounts();
    const match = accounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password,
    );
    if (!match) return null;
    const { password: _, ...userData } = match;
    return userData;
  },

  /** Register a new user */
  async register(data: RegisterData): Promise<User | null> {
    const accounts = getStoredAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === data.email.toLowerCase())) {
      return null; // email exists
    }
    const newUser: User & { password: string } = {
      id: `${data.role}-${Date.now()}`,
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role,
      avatar: data.name.charAt(0).toUpperCase(),
      university: data.university,
      major: data.major,
      companyName: data.companyName,
      skills: [],
      bio: '',
      phone: '',
      completedJobs: 0,
      rating: 0,
      balance: 0,
    };
    accounts.push(newUser);
    saveAccounts(accounts);
    const { password: _, ...userData } = newUser;
    return userData;
  },

  /** Persist user session */
  persistUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  /** Restore user session */
  restoreUser(): User | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },
};
