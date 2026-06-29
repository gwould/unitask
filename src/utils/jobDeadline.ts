/**
 * jobDeadline.ts — Single source of truth cho logic hạn nộp của Job.
 *
 * `deadline` của Job có thể là:
 *  - Chuỗi ISO date (từ API hoặc mock data mới) → tính trạng thái động theo giờ hệ thống.
 *  - Chuỗi hiển thị cũ ("Còn 5 ngày") → fallback hiển thị nguyên văn, coi như còn hạn.
 *  - Rỗng → không có hạn.
 */

export type DeadlineStatus = 'none' | 'active' | 'expiring' | 'expired';

export interface DeadlineInfo {
  status: DeadlineStatus;
  /** Nhãn hiển thị tiếng Việt, vd: "Còn 5 ngày", "Đã hết hạn". */
  label: string;
  /** Số ngày còn lại (âm nếu đã quá hạn); null nếu không xác định được. */
  daysLeft: number | null;
  /** Thời điểm hết hạn (ms) nếu parse được, dùng để sort. null nếu không có. */
  timestamp: number | null;
}

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
/** Trong vòng 3 ngày coi là "sắp hết hạn". */
const EXPIRING_THRESHOLD_DAYS = 3;

export function getDeadlineInfo(deadline?: string | null, now: number = Date.now()): DeadlineInfo {
  if (!deadline) {
    return { status: 'none', label: '', daysLeft: null, timestamp: null };
  }

  const ts = new Date(deadline).getTime();

  // Không parse được ngày (chuỗi hiển thị cũ) → hiển thị nguyên văn, coi như còn hạn.
  if (Number.isNaN(ts)) {
    return { status: 'active', label: deadline, daysLeft: null, timestamp: null };
  }

  const diff = ts - now;

  if (diff <= 0) {
    return { status: 'expired', label: 'Đã hết hạn', daysLeft: Math.ceil(diff / DAY_MS), timestamp: ts };
  }

  const days = Math.floor(diff / DAY_MS);
  const status: DeadlineStatus = days <= EXPIRING_THRESHOLD_DAYS ? 'expiring' : 'active';

  let label: string;
  if (days > 30) label = `Còn ${Math.floor(days / 30)} tháng`;
  else if (days > 0) label = `Còn ${days} ngày`;
  else label = `Còn ${Math.max(1, Math.floor(diff / HOUR_MS))} giờ`;

  return { status, label, daysLeft: days, timestamp: ts };
}

/** True nếu job đã hết hạn (current date > expiration date). */
export function isJobExpired(deadline?: string | null, now: number = Date.now()): boolean {
  return getDeadlineInfo(deadline, now).status === 'expired';
}
