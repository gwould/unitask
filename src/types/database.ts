/**
 * UniTask Database Types
 * Complete TypeScript interfaces for all database entities
 */

// ==========================================
// ENUMS
// ==========================================

export enum UserType {
  STUDENT = 'student',
  BUSINESS = 'business',
  ADMIN = 'admin',
}

export enum JobStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ApplicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  ESCROW = 'escrow',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
}

export enum DurationType {
  MICRO = 'micro',
  SHORT_TERM = 'short-term',
  PROJECT = 'project',
}

export enum ExperienceLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum ProficiencyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum BlogStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum CompanySize {
  STARTUP = 'startup',
  SME = 'sme',
  LARGE = 'large',
}

export enum WithdrawalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

export enum NotificationType {
  JOB_APPLIED = 'job_applied',
  APPLICATION_ACCEPTED = 'application_accepted',
  APPLICATION_REJECTED = 'application_rejected',
  PAYMENT_RECEIVED = 'payment_received',
  JOB_COMPLETED = 'job_completed',
  NEW_MESSAGE = 'new_message',
  REVIEW_RECEIVED = 'review_received',
  NEW_JOB_MATCHED = 'new_job_matched',
}

export enum ReportStatus {
  PENDING = 'pending',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

// ==========================================
// MAIN ENTITIES
// ==========================================

/**
 * User Base Entity
 */
export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
  user_type: UserType;
  is_verified: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

/**
 * Student Profile
 */
export interface StudentProfile {
  id: string;
  user_id: string;
  student_email?: string;
  university?: string;
  major?: string;
  graduation_year?: number;
  cv_url?: string;
  grade_point?: number;
  is_verified: boolean;
  verified_at?: Date;
  bio?: string;
  skills: string[];
  portfolio_url?: string;
  completed_jobs: number;
  total_earnings: number;
  created_at: Date;
  updated_at: Date;
  // Relations (optional, for frontend)
  user?: User;
}

/**
 * Business Profile
 */
export interface BusinessProfile {
  id: string;
  user_id: string;
  company_name: string;
  company_email?: string;
  company_website?: string;
  company_size: CompanySize;
  industry?: string;
  description?: string;
  logo_url?: string;
  cover_image_url?: string;
  is_verified: boolean;
  verified_at?: Date;
  address?: string;
  phone?: string;
  completed_projects: number;
  total_spent: number;
  rating: number;
  created_at: Date;
  updated_at: Date;
  // Relations (optional, for frontend)
  user?: User;
}

/**
 * Job/Task
 */
export interface Job {
  id: string;
  business_id: string;
  title: string;
  description: string;
  category?: string;
  tags: string[];
  status: JobStatus;
  salary_min?: number;
  salary_max?: number;
  currency: string;
  duration_type: DurationType;
  duration_days?: number;
  required_skills: string[];
  experience_level: ExperienceLevel;
  spots_total: number;
  spots_filled: number;
  location?: string;
  is_remote: boolean;
  is_featured: boolean;
  deadline?: Date;
  created_at: Date;
  updated_at: Date;
  published_at?: Date;
  // Relations (optional, for frontend)
  business?: BusinessProfile;
  applications?: JobApplication[];
}

/**
 * Job Application
 */
export interface JobApplication {
  id: string;
  job_id: string;
  student_id: string;
  status: ApplicationStatus;
  applied_at: Date;
  cover_letter?: string;
  proposed_timeline?: string;
  accepted_at?: Date;
  rejected_at?: Date;
  rejection_reason?: string;
  completed_at?: Date;
  started_at?: Date;
  // Relations (optional, for frontend)
  job?: Job;
  student?: StudentProfile;
}

/**
 * Payment/Escrow
 */
export interface Payment {
  id: string;
  job_id?: string;
  job_application_id: string;
  business_id?: string;
  student_id?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method?: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
  released_at?: Date;
  // Relations (optional, for frontend)
  job?: Job;
  jobApplication?: JobApplication;
}

/**
 * Student Wallet
 */
export interface StudentWallet {
  id: string;
  student_id: string;
  balance: number;
  total_earned: number;
  total_withdrawn: number;
  updated_at: Date;
}

/**
 * Withdrawal Request
 */
export interface WithdrawalRequest {
  id: string;
  student_id: string;
  amount: number;
  status: WithdrawalStatus;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_name?: string;
  requested_at: Date;
  completed_at?: Date;
  reason?: string;
}

/**
 * Review/Rating
 */
export interface Review {
  id: string;
  job_id: string;
  job_application_id: string;
  from_user_id: string;
  to_user_id: string;
  rating: number; // 1-5
  comment?: string;
  skill_endorsements: string[];
  is_anonymous: boolean;
  created_at: Date;
  updated_at: Date;
  // Relations (optional, for frontend)
  from_user?: User;
  to_user?: User;
  job?: Job;
}

/**
 * Skill
 */
export interface Skill {
  id: string;
  name: string;
  category?: string;
  icon_url?: string;
  created_at: Date;
}

/**
 * Student Skill
 */
export interface StudentSkill {
  id: string;
  student_id: string;
  skill_id: string;
  proficiency: ProficiencyLevel;
  endorsement_count: number;
  added_at: Date;
  // Relations (optional, for frontend)
  skill?: Skill;
}

/**
 * Blog Post
 */
export interface BlogPost {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  category?: string;
  tags: string[];
  status: BlogStatus;
  view_count: number;
  like_count: number;
  created_at: Date;
  updated_at: Date;
  published_at?: Date;
  // Relations (optional, for frontend)
  author?: User;
}

/**
 * Notification
 */
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title?: string;
  message: string;
  related_job_id?: string;
  related_user_id?: string;
  is_read: boolean;
  created_at: Date;
  read_at?: Date;
}

/**
 * Conversation/Chat
 */
export interface Conversation {
  id: string;
  user_1_id: string;
  user_2_id: string;
  last_message_at?: Date;
  created_at: Date;
  updated_at: Date;
  // Relations (optional, for frontend)
  user_1?: User;
  user_2?: User;
  messages?: Message[];
}

/**
 * Message
 */
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachment_url?: string;
  is_read: boolean;
  created_at: Date;
  read_at?: Date;
  // Relations (optional, for frontend)
  sender?: User;
  conversation?: Conversation;
}

/**
 * Admin Report
 */
export interface AdminReport {
  id: string;
  reported_by_id: string;
  reported_user_id?: string;
  reported_job_id?: string;
  report_type?: string;
  reason: string;
  status: ReportStatus;
  action_taken?: string;
  created_at: Date;
  resolved_at?: Date;
  // Relations (optional, for frontend)
  reported_by?: User;
  reported_user?: User;
  reported_job?: Job;
}

/**
 * Activity Log
 */
export interface ActivityLog {
  id: string;
  user_id?: string;
  action_type: string;
  entity_type: string;
  entity_id?: string;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

/**
 * Job Category
 */
export interface JobCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_url?: string;
  job_count: number;
  created_at: Date;
}

/**
 * FAQ
 */
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  view_count: number;
  helpful_count: number;
  order_index?: number;
  created_at: Date;
  updated_at: Date;
}

// ==========================================
// COMPOSITE TYPES (for API responses)
// ==========================================

/**
 * Extended Job with related data
 */
export interface JobWithRelations extends Job {
  business: BusinessProfile;
  applications?: JobApplication[];
  application_count?: number;
  pending_applications?: number;
}

/**
 * Extended Student Profile with related data
 */
export interface StudentProfileWithRelations extends StudentProfile {
  user: User;
  skills_data?: StudentSkill[];
  wallet?: StudentWallet;
  applications?: JobApplication[];
  reviews_received?: Review[];
}

/**
 * Extended Business Profile with related data
 */
export interface BusinessProfileWithRelations extends BusinessProfile {
  user: User;
  jobs?: Job[];
  reviews_received?: Review[];
}

/**
 * Application with full details
 */
export interface ApplicationWithDetails extends JobApplication {
  job: Job;
  student: StudentProfile;
  payment?: Payment;
  reviews?: Review[];
}

// ==========================================
// PAGINATION & FILTERING TYPES
// ==========================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface JobFilterParams {
  category?: string;
  min_salary?: number;
  max_salary?: number;
  location?: string;
  is_remote?: boolean;
  experience_level?: ExperienceLevel;
  tags?: string[];
  sort_by?: 'latest' | 'salary_high' | 'salary_low' | 'featured';
  page?: number;
  limit?: number;
}

export interface ApplicationFilterParams {
  status?: ApplicationStatus;
  job_id?: string;
  student_id?: string;
  sort_by?: 'latest' | 'oldest';
  page?: number;
  limit?: number;
}

// ==========================================
// REQUEST/RESPONSE TYPES
// ==========================================

export interface CreateJobRequest {
  title: string;
  description: string;
  category?: string;
  tags?: string[];
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  duration_type: DurationType;
  duration_days?: number;
  required_skills?: string[];
  experience_level?: ExperienceLevel;
  spots_total?: number;
  location?: string;
  is_remote?: boolean;
  deadline?: Date;
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {
  status?: JobStatus;
}

export interface ApplyJobRequest {
  cover_letter?: string;
  proposed_timeline?: string;
}

export interface CreateReviewRequest {
  rating: number;
  comment?: string;
  skill_endorsements?: string[];
}

export interface CreateBlogPostRequest {
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  featured_image_url?: string;
  status?: BlogStatus;
}

// ==========================================
// AUTH TYPES
// ==========================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  user_type: UserType;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token?: string;
}

// ==========================================
// STATISTICS/ANALYTICS TYPES
// ==========================================

export interface StudentStats {
  completed_jobs: number;
  total_earnings: number;
  average_rating: number;
  pending_applications: number;
  active_jobs: number;
  profile_completion_percentage: number;
}

export interface BusinessStats {
  completed_projects: number;
  total_spent: number;
  average_rating: number;
  pending_applications: number;
  open_jobs: number;
}

export interface PlatformStats {
  total_users: number;
  total_students: number;
  total_businesses: number;
  total_jobs: number;
  completed_jobs: number;
  total_transactions: number;
  total_revenue: number;
}
