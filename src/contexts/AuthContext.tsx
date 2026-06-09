import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole, RegisterData } from '../types';
import type { BackendAuthUser, LoginResponse, RegisterResponse } from '../types/api';
import { STORAGE_KEYS } from '../constants';
import { apiPost, apiPut } from '../services';
import { profileService } from '../services/profileService';

// Re-export types for consumers that import from AuthContext
export type { User, UserRole };

interface AuthState {
  user: User | null;
  isLoading: boolean;
  /** true = đăng nhập thành công với backend thật (có JWT). false = chỉ demo local, không có token. */
  isApiAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthState | null>(null);

function hasRealToken(): boolean {
  try { return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN); } catch { return false; }
}

const STORAGE_KEY = STORAGE_KEYS.USER;

function mapBackendUser(user: BackendAuthUser): User {
  const role = user.userType === 'business' ? 'business' : user.userType === 'admin' ? 'admin' : 'student';
  return {
    id: user.id,
    email: user.email,
    name: user.fullName,
    role,
    avatar: user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U',
    skills: [],
    bio: '',
  };
}

function persistTokens(token: string | null, refreshToken: string | null) {
  try {
    if (token) localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    else localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    if (refreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    else localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch {
    // ignore storage errors
  }
}

// Demo accounts seeded into "database"
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
  {
    id: 'admin-1',
    email: 'admin@demo.com',
    password: 'demo123',
    name: 'Admin UniTask',
    role: 'admin',
    avatar: 'A',
    bio: 'Quản trị hệ thống UniTask',
    phone: '0900000000',
    completedJobs: 0,
    rating: 5,
    balance: 0,
  },
];

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApiAuthenticated, setIsApiAuthenticated] = useState(() => hasRealToken());

  // Restore session
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setUser(JSON.parse(saved));
    } catch { /* ignore */ }
    setIsLoading(false);
  }, []);

  const persist = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const accounts = getStoredAccounts();
    const localMatch = accounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password,
    );

    try {
      const auth = await apiPost<LoginResponse>('/api/auth/login', { email, password });
      const fromApi = mapBackendUser(auth.user);
      const merged: User = {
        ...fromApi,
        balance: localMatch?.balance ?? 0,
        skills: localMatch?.skills ?? [],
        bio: localMatch?.bio ?? '',
        major: localMatch?.major,
        year: localMatch?.year,
        completedJobs: localMatch?.completedJobs ?? 0,
        rating: localMatch?.rating ?? 0,
        phone: fromApi.phone ?? localMatch?.phone,
      };
      persistTokens(auth.token, auth.refreshToken);
      setIsApiAuthenticated(true);
      let finalUser = merged;
      try {
        finalUser = await profileService.enrichUser(merged);
      } catch {
        // enrichUser failed (DB issue) — keep the user data we have
      }
      persist(finalUser);
      return true;
    } catch {
      // API unavailable or invalid credentials — fall back to local demo accounts
    }

    if (!localMatch) return false;
    const { password: _, ...userData } = localMatch;
    persistTokens(null, null);
    setIsApiAuthenticated(false);
    persist(userData);
    return true;
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    const accounts = getStoredAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === data.email.toLowerCase())) {
      return false; // email already exists
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
    try {
      const auth = await apiPost<RegisterResponse>('/api/auth/register', {
        email: data.email,
        password: data.password,
        fullName: data.name,
        userType: data.role,
        phone: undefined,
        avatarUrl: undefined,
        bio: undefined,
      });
      persistTokens(auth.token, auth.refreshToken);
      const fromApi = mapBackendUser({
        id: auth.id,
        email: auth.email,
        fullName: auth.fullName,
        userType: auth.userType,
      });

      // Đảm bảo profile tồn tại trên backend ngay sau khi đăng ký
      if (data.role === 'business') {
        // Thử tạo business profile — bỏ qua lỗi nếu đã tồn tại
        await apiPost('/api/businesses', {
          companyName: data.companyName || data.name,
          description: '',
        }).catch(() =>
          // Nếu POST thất bại (profile đã tồn tại), thử PUT để update
          apiPut(`/api/businesses/${auth.id}`, {
            companyName: data.companyName || data.name,
            description: '',
          }).catch(() => null),
        );
      } else if (data.role === 'student') {
        await apiPost('/api/students', {
          university: data.university || '',
          major: data.major || '',
          bio: '',
        }).catch(() =>
          apiPut(`/api/students/${auth.id}`, {
            university: data.university || '',
            major: data.major || '',
          }).catch(() => null),
        );
      }

      const enriched = await profileService.enrichUser({ ...fromApi, ...userData });
      persist(enriched);
    } catch {
      persistTokens(null, null);
      persist(userData);
    }
    return true;
  };

  const logout = () => {
    persistTokens(null, null);
    persist(null);
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    persist(updated);

    void apiPut(`/api/users/${user.id}`, {
      fullName: data.name,
      phone: data.phone,
      bio: data.bio,
      avatarUrl: undefined,
    }).catch(() => {});

    if (user.role === 'student') {
      void profileService.updateStudentProfile(String(user.id), data).catch(() => {});
    } else if (user.role === 'business') {
      void profileService.updateBusinessProfile(String(user.id), data).catch(() => {});
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isApiAuthenticated, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
