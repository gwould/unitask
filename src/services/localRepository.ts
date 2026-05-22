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
    get(role: string): Transaction[] {
      return readJson<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []).length > 0
        ? readJson<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, [])
        : role === 'student'
          ? [
              { id: 'tx-1', type: 'income', label: 'Thanh toán job: Frontend Developer', amount: 3_200_000, date: '2026-03-01', status: 'completed', jobTitle: 'Frontend Developer (React + Tailwind)' },
              { id: 'tx-2', type: 'income', label: 'Thanh toán job: Viết 10 bài SEO Blog', amount: 1_600_000, date: '2026-02-22', status: 'completed', jobTitle: 'Viết 10 bài SEO Blog (chuẩn EEAT)' },
              { id: 'tx-3', type: 'withdraw', label: 'Rút tiền về Vietcombank ****1234', amount: -2_000_000, date: '2026-02-15', status: 'completed' },
              { id: 'tx-4', type: 'income', label: 'Thanh toán job: Dịch thuật tài liệu', amount: 1_200_000, date: '2026-02-10', status: 'completed' },
              { id: 'tx-5', type: 'withdraw', label: 'Rút tiền về MoMo', amount: -1_500_000, date: '2026-01-28', status: 'completed' },
            ]
          : [
              { id: 'tx-1', type: 'escrow_in', label: 'Nạp Escrow: Frontend Developer', amount: -4_000_000, date: '2026-02-25', status: 'completed' },
              { id: 'tx-2', type: 'escrow_release', label: 'Giải phóng Escrow: Viết bài SEO', amount: -1_800_000, date: '2026-02-20', status: 'completed' },
              { id: 'tx-3', type: 'escrow_in', label: 'Nạp Escrow: Thiết kế UI/UX', amount: -3_000_000, date: '2026-02-18', status: 'pending' },
              { id: 'tx-4', type: 'escrow_in', label: 'Nạp Escrow: Video TikTok', amount: -5_000_000, date: '2026-02-10', status: 'completed' },
              { id: 'tx-5', type: 'escrow_release', label: 'Giải phóng Escrow: Dịch thuật', amount: -1_500_000, date: '2026-01-30', status: 'completed' },
            ];
    },
    save(transactions: Transaction[]): void {
      writeJson(STORAGE_KEYS.TRANSACTIONS, transactions);
    },
  },
  bankMethods: {
    getAll(): BankMethod[] {
      return readJson<BankMethod[]>(STORAGE_KEYS.BANK_METHODS, [
        { id: 'bm-1', icon: '🏦', name: 'Vietcombank', detail: '****1234 · Nguyễn Minh Anh', isDefault: true },
        { id: 'bm-2', icon: '📱', name: 'Ví MoMo', detail: '0912***678', isDefault: false },
      ]);
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