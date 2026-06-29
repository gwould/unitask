export interface JobTag {
  label: string;
  variant: 'p' | 't' | 'a' | 'g';
}

export interface Job {
  id: number | string;
  logoText: string;
  logoGradient: string;
  title: string;
  company: string;
  companyId: number | string;
  companyUserId?: string;
  verified: boolean;
  location: string;
  tags: JobTag[];
  spotsLeft: number;
  spotsTotal: number;
  pay: string;
  payMin: number;
  payMax: number;
  deadline: string;
  /** Slug ngành nghề đã chuẩn hoá (dùng cho bộ lọc). */
  category: string;
  /** Id ngành nghề từ backend (Guid) — khoá join chính xác khi có. */
  categoryId?: string;
  featured?: boolean;
  description: string;
  requirements: string[];
  deliverables: string[];
  duration: string;
  postedAt: string;
  skills: string[];
}

/** Lightweight job type used for list/card displays (subset of Job) */
export type JobSummary = Pick<
  Job,
  | 'id' | 'logoText' | 'logoGradient' | 'title' | 'company'
  | 'verified' | 'location' | 'tags' | 'spotsLeft' | 'spotsTotal'
  | 'pay' | 'deadline' | 'category' | 'featured'
>;
