/** Generic API response wrapper for simulated API calls */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

/** Paginated response */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}
