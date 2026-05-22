/** localStorage key constants — single source of truth */
export const STORAGE_KEYS = {
  USER: 'unitask_user',
  AUTH_TOKEN: 'unitask_auth_token',
  REFRESH_TOKEN: 'unitask_refresh_token',
  ACCOUNTS: 'unitask_accounts',
  APPLICATIONS: 'unitask_applications',
  APPLICATION_SUBMISSIONS: 'unitask_application_submissions',
  CUSTOM_JOBS: 'unitask_custom_jobs',
  TRANSACTIONS: 'unitask_transactions',
  USER_TRANSACTIONS: 'unitask_user_transactions',
  BANK_METHODS: 'unitask_bank_methods',
  MANAGE_APPLICANTS: 'unitask_manage_applicants',
  AUTOMATION_RULES: 'unitask_automation_rules',
  NOTIFICATIONS: 'unitask_notifications',
  AUTOMATION_LOGS: 'unitask_automation_logs',
  BULK_ACTIONS: 'unitask_bulk_actions',
} as const;
