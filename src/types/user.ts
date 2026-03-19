export type UserRole = 'student' | 'business';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  university?: string;
  major?: string;
  year?: number;
  companyName?: string;
  skills?: string[];
  bio?: string;
  phone?: string;
  completedJobs?: number;
  rating?: number;
  balance?: number;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  university?: string;
  major?: string;
  companyName?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}
