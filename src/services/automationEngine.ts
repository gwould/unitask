/**
 * Automation Engine - Executes automation rules and creates notifications
 * This runs in the background to process applicants & execute actions
 */

import type { AutomationRule, AutomationLog, Notification } from '../types/automation';
import type { Applicant } from '../types/application';
import { STORAGE_KEYS } from '../constants';
import { apiPost } from './apiService';
import { hasAuthToken } from '../utils/auth';

/* ─── STORAGE HELPERS ─────────────────────────────── */

export function loadRules(companyId: string): AutomationRule[] {
  try {
    const all: AutomationRule[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTOMATION_RULES) || '[]');
    return all.filter(r => r.companyId === companyId && r.enabled);
  } catch {
    return [];
  }
}

export function updateRuleRunCount(ruleId: string, companyId: string) {
  try {
    const all: AutomationRule[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTOMATION_RULES) || '[]');
    const updated = all.map(r => {
      if (r.id === ruleId && r.companyId === companyId) {
        return {
          ...r,
          runCount: (r.runCount || 0) + 1,
          lastRun: new Date().toISOString().slice(0, 10),
        };
      }
      return r;
    });
    localStorage.setItem(STORAGE_KEYS.AUTOMATION_RULES, JSON.stringify(updated));
  } catch {
    // Ignore storage errors in demo mode.
  }
}

export function createNotification(data: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Notification {
  const notification: Notification = {
    ...data,
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    isRead: false,
  };

  if (hasAuthToken()) {
    apiPost('/api/notifications', {
      recipientId: data.recipientId,
      type: data.type ?? 'system',
      title: data.title,
      message: data.message,
      relatedJobId: data.relatedJobId ?? null,
    }).catch(() => {});
  }

  try {
    const all: Notification[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([notification, ...all]));
  } catch {
    // Ignore storage errors in demo mode.
  }

  return notification;
}

function logAutomation(log: AutomationLog) {
  try {
    const all: AutomationLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTOMATION_LOGS) || '[]');
    localStorage.setItem(STORAGE_KEYS.AUTOMATION_LOGS, JSON.stringify([log, ...all.slice(0, 99)]));
  } catch {
    // Ignore storage errors in demo mode.
  }
}

/* ─── CORE ENGINE ─────────────────────────────────── */

/**
 * Execute a single automation rule against an applicant
 */
export function executeRule(
  rule: AutomationRule,
  applicant: Applicant,
  companyId: string
): { executed: boolean; reason?: string } {
  try {
    // Check conditions
    if (
      rule.conditions.minRating !== undefined &&
      typeof applicant.rating === 'number' &&
      applicant.rating < rule.conditions.minRating
    ) {
      return { executed: false, reason: 'Rating below minimum' };
    }

    if (
      rule.conditions.maxRating !== undefined &&
      typeof applicant.rating === 'number' &&
      applicant.rating > rule.conditions.maxRating
    ) {
      return { executed: false, reason: 'Rating above maximum for rejection' };
    }

    // Execute action based on rule type
    switch (rule.ruleType) {
      case 'auto_accept': {
        if (applicant.status !== 'pending') {
          return { executed: false, reason: 'Applicant not pending' };
        }
        
        // Update applicant status
        const applicants: Applicant[] = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.MANAGE_APPLICANTS) || '[]'
        );
        const updated = applicants.map(a =>
          a.id === applicant.id ? { ...a, status: 'accepted' as const } : a
        );
        localStorage.setItem(STORAGE_KEYS.MANAGE_APPLICANTS, JSON.stringify(updated));

        // Create notification
        createNotification({
          recipientId: String(applicant.userId),
          recipientType: 'student',
          title: '✅ Bạn đã được chấp nhận',
          message: `Bạn được chấp nhận cho vị trí ${applicant.name}. Vui lòng nộp bài.`,
          type: 'application_status',
          actionUrl: '/my-applications',
        });

        logAutomation({
          id: `log-${Date.now()}`,
          ruleId: rule.id,
          companyId,
          applicantId: String(applicant.id),
          action: 'auto_accept',
          result: 'success',
          executedAt: new Date().toISOString(),
        });

        updateRuleRunCount(rule.id, companyId);
        return { executed: true };
      }

      case 'auto_reject': {
        if (applicant.status !== 'pending') {
          return { executed: false, reason: 'Applicant not pending' };
        }

        const applicants: Applicant[] = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.MANAGE_APPLICANTS) || '[]'
        );
        const updated = applicants.map(a =>
          a.id === applicant.id ? { ...a, status: 'rejected' as const } : a
        );
        localStorage.setItem(STORAGE_KEYS.MANAGE_APPLICANTS, JSON.stringify(updated));

        createNotification({
          recipientId: String(applicant.userId),
          recipientType: 'student',
          title: '❌ Không được chấp nhận',
          message: `Xin lỗi, bạn không được chấp nhận cho vị trí này. Chúc bạn thành công với các cơ hội khác!`,
          type: 'application_status',
          actionUrl: '/jobs',
        });

        logAutomation({
          id: `log-${Date.now()}`,
          ruleId: rule.id,
          companyId,
          applicantId: String(applicant.id),
          action: 'auto_reject',
          result: 'success',
          executedAt: new Date().toISOString(),
        });

        updateRuleRunCount(rule.id, companyId);
        return { executed: true };
      }

      case 'auto_notify': {
        if (!rule.action.message) {
          return { executed: false, reason: 'No message configured' };
        }

        createNotification({
          recipientId: String(applicant.userId),
          recipientType: 'student',
          title: '🔔 Thông báo từ công ty',
          message: rule.action.message,
          type: 'system',
          actionUrl: '/my-applications',
        });

        logAutomation({
          id: `log-${Date.now()}`,
          ruleId: rule.id,
          companyId,
          applicantId: String(applicant.id),
          action: 'auto_notify',
          result: 'success',
          executedAt: new Date().toISOString(),
        });

        updateRuleRunCount(rule.id, companyId);
        return { executed: true };
      }

      default:
        return { executed: false, reason: 'Rule type not supported in this context' };
    }
  } catch (error) {
    logAutomation({
      id: `log-${Date.now()}`,
      ruleId: rule.id,
      companyId,
      applicantId: String(applicant.id),
      action: rule.ruleType,
      result: 'failed',
      reason: error instanceof Error ? error.message : String(error),
      executedAt: new Date().toISOString(),
    });
    return { executed: false, reason: 'Execution failed' };
  }
}

/**
 * Execute all applicable rules for a company
 */
export function executeAllRules(
  applicants: Applicant[],
  companyId: string
): { executed: number; skipped: number } {
  const rules = loadRules(companyId);
  let executed = 0;
  let skipped = 0;

  for (const applicant of applicants) {
    for (const rule of rules) {
      const result = executeRule(rule, applicant, companyId);
      if (result.executed) {
        executed++;
      } else {
        skipped++;
      }
    }
  }

  return { executed, skipped };
}

/**
 * Get automation logs for a company
 */
export function getAutomationLogs(companyId: string): AutomationLog[] {
  try {
    const all: AutomationLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTOMATION_LOGS) || '[]');
    return all
      .filter(log => log.companyId === companyId)
      .slice(0, 50);
  } catch {
    return [];
  }
}
