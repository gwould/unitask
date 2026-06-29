/** Generic API response wrapper for simulated API calls */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface BackendAuthUser {
  id: string;
  email: string;
  fullName: string;
  userType: 'student' | 'business' | 'admin' | string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: BackendAuthUser;
  /** True nếu doanh nghiệp đã xác thực email nhưng vẫn chờ admin phê duyệt. */
  needsApproval?: boolean;
}

/** Flat shape returned by POST /api/auth/register */
export interface RegisterResponse {
  id: string;
  email: string;
  fullName: string;
  userType: string;
  token: string;
  refreshToken: string;
  needsApproval?: boolean;
  needsEmailVerification?: boolean;
  /** Mã OTP demo — chỉ có khi backend bật Sandbox:ExposeOtp (chưa cấu hình SMTP). */
  devOtp?: string | null;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

/** Paginated response */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}
