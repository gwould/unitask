import type { AppStatus } from '../../types';
import { APP_STATUS_MAP } from '../../constants';

export default function StatusBadge({ status }: { status: AppStatus }) {
  const info = APP_STATUS_MAP[status] ?? APP_STATUS_MAP.pending;
  return <span className={`dash-status ${info.cls}`}>{info.label}</span>;
}
