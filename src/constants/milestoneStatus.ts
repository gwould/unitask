import type { MilestoneStatus } from '../types';

/**
 * Map trạng thái Milestone → nhãn tiếng Việt + class badge màu sắc.
 * `cls` dùng class CSS riêng (xem .ms-badge trong index.css) để mỗi trạng thái 1 màu.
 */
export const MILESTONE_STATUS_MAP: Record<
  MilestoneStatus,
  { label: string; cls: string }
> = {
  PENDING:      { label: 'Chờ ký quỹ',    cls: 'ms-pending' },
  ESCROWED:     { label: 'Đã ký quỹ',     cls: 'ms-escrowed' },
  UNDER_REVIEW: { label: 'Chờ nghiệm thu', cls: 'ms-review' },
  REVISION:     { label: 'Yêu cầu sửa',   cls: 'ms-revision' },
  COMPLETED:    { label: 'Hoàn thành',    cls: 'ms-completed' },
  CANCELED:     { label: 'Đã hủy',       cls: 'ms-canceled' },
};
