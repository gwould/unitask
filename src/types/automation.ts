/* ─── AUTOMATION RULES & NOTIFICATIONS ─────────────────────── */

/**
 * Represents an automation rule for auto-processing applicants
 */
export interface AutomationRule {
  id: string;
  companyId: string;
  name: string;
  enabled: boolean;
  ruleType: 'auto_accept' | 'auto_reject' | 'auto_approve' | 'auto_notify' | 'auto_assign' | 'auto_release';
  
  // Conditions
  conditions: {
    minRating?: number;       // Auto-accept if rating >= this
    maxRating?: number;       // Auto-reject if rating <= this
    requiredSkills?: string[];
    jobTitles?: string[];     // Apply to specific job titles
  };
  
  // Actions
  action: {
    type: 'auto_accept' | 'auto_reject' | 'auto_approve' | 'auto_notify' | 'auto_assign' | 'auto_release';
    message?: string;         // For auto_notify
    assignAmount?: number;    // For auto_assign
    releaseThreshold?: number; // % completion to auto-release escrow (0-100)
    priority?: 'high' | 'normal' | 'low';
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastRun?: string;
  runCount: number;
}

/**
 * Notification sent automatically or manually
 */
export interface Notification {
  id: string;
  recipientId: string;      // user.id or company.id
  recipientType: 'student' | 'business';
  title: string;
  message: string;
  type: 'job_match' | 'application_status' | 'submission_request' | 'approval' | 'payment' | 'system' | 'reminder';
  relatedJobId?: number | string;
  relatedApplicationId?: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;       // Link to take action (e.g., /manage-jobs, /my-applications)
}

/**
 * Automation execution log
 */
export interface AutomationLog {
  id: string;
  ruleId: string;
  companyId: string;
  applicantId: string;
  action: string;
  result: 'success' | 'failed' | 'skipped';
  reason?: string;
  executedAt: string;
}

/**
 * Bulk action request
 */
export interface BulkAction {
  id: string;
  companyId: string;
  applicantIds: string[];
  action: 'accept' | 'reject' | 'approve' | 'notify' | 'assign';
  metadata?: {
    message?: string;
    amount?: number;
  };
  executedAt: string;
  count: number;
}
