import type { AppStatus, TxType, TxStatus } from '../types';

export const APP_STATUS_MAP: Record<AppStatus, { label: string; cls: string; order: number }> = {
  pending:   { label: 'Đang chờ duyệt',  cls: 'st-pending',   order: 0 },
  accepted:  { label: 'Đã được nhận',     cls: 'st-accepted',  order: 1 },
  rejected:  { label: 'Không được chọn',  cls: 'st-rejected',  order: 2 },
  completed: { label: 'Hoàn thành',       cls: 'st-completed', order: 3 },
};

export const APPLICANT_STATUS_MAP: Record<AppStatus, { label: string; cls: string }> = {
  pending:   { label: 'Đang chờ',   cls: 'st-pending' },
  accepted:  { label: 'Đã nhận',    cls: 'st-accepted' },
  rejected:  { label: 'Đã từ chối', cls: 'st-rejected' },
  completed: { label: 'Hoàn thành', cls: 'st-completed' },
};

export const TX_TYPE_CONFIG: Record<TxType, { icon: string; color: string; label: string }> = {
  income:         { icon: '💰', color: 'var(--t)',  label: 'Thu nhập' },
  escrow_in:      { icon: '🔒', color: 'var(--pl)', label: 'Nạp Escrow' },
  withdraw:       { icon: '🏦', color: 'var(--a)',  label: 'Rút tiền' },
  escrow_release: { icon: '✅', color: 'var(--t)',  label: 'Giải phóng' },
};

export const TX_STATUS_LABEL: Record<TxStatus, { text: string; cls: string }> = {
  completed:  { text: 'Hoàn thành',  cls: 'st-completed' },
  pending:    { text: 'Đang xử lý',  cls: 'st-pending' },
  processing: { text: 'Đang chuyển', cls: 'st-accepted' },
};
