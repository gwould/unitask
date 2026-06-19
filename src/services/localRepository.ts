import { STORAGE_KEYS } from '../constants';
import type { BankMethod, Transaction, User, RegisterData } from '../types';

export type StoredAccount = User & { password: string };

const DEMO_ACCOUNTS: StoredAccount[] = [
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

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const localRepository = {
  accounts: {
    getAll(): StoredAccount[] {
      return readJson(STORAGE_KEYS.ACCOUNTS, [...DEMO_ACCOUNTS]);
    },
    save(accounts: StoredAccount[]): void {
      writeJson(STORAGE_KEYS.ACCOUNTS, accounts);
    },
  },
  userSession: {
    get(): User | null {
      return readJson<User | null>(STORAGE_KEYS.USER, null);
    },
    set(user: User | null): void {
      if (user) {
        writeJson(STORAGE_KEYS.USER, user);
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    },
  },
  transactions: {
    get(_role: string): Transaction[] {
      return readJson<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    },
    save(transactions: Transaction[]): void {
      writeJson(STORAGE_KEYS.TRANSACTIONS, transactions);
    },
  },
  bankMethods: {
    getAll(): BankMethod[] {
      return readJson<BankMethod[]>(STORAGE_KEYS.BANK_METHODS, []);
    },
    save(methods: BankMethod[]): void {
      writeJson(STORAGE_KEYS.BANK_METHODS, methods);
    },
  },
  resetDemoAccounts(): void {
    writeJson(STORAGE_KEYS.ACCOUNTS, [...DEMO_ACCOUNTS]);
  },
  createAccount(data: RegisterData): StoredAccount {
    return {
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
  },
  getDemoAccounts(): StoredAccount[] {
    return [...DEMO_ACCOUNTS];
  },
};