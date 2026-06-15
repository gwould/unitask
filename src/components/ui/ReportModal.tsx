import { useState } from 'react';
import { reportService, type ReportCategory } from '../../services/reportService';

interface ReportModalProps {
  /** Mô tả ngắn đối tượng bị báo cáo (vd: tên người, tiêu đề task). */
  targetLabel: string;
  reportedUserId?: string;
  reportedJobId?: string;
  onClose: () => void;
  onDone?: (message: string) => void;
}

const CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: 'scam', label: 'Lừa đảo' },
  { value: 'nda', label: 'Vi phạm NDA' },
  { value: 'abuse', label: 'Ngôn ngữ xúc phạm' },
  { value: 'bypass', label: 'Giao dịch ngoài nền tảng (bypass)' },
  { value: 'other', label: 'Khác' },
];

/**
 * BC1 — Modal báo cáo vi phạm. Chọn danh mục + nhập lý do.
 * Gửi vào hệ thống kiểm duyệt (AdminReports).
 */
export default function ReportModal({ targetLabel, reportedUserId, reportedJobId, onClose, onDone }: ReportModalProps) {
  const [category, setCategory] = useState<ReportCategory>('scam');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const valid = reason.trim().length > 0;

  const submit = async () => {
    if (!valid || loading) return;
    setLoading(true);
    try {
      await reportService.create({ reportType: category, reason: reason.trim(), reportedUserId, reportedJobId });
      onDone?.('Đã gửi báo cáo. UniTask sẽ xem xét và phản hồi.');
      onClose();
    } catch {
      onDone?.('Không gửi được báo cáo. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={loading ? undefined : onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>🚩 Báo cáo vi phạm</h3>
        <p className="modal-sub">{targetLabel}</p>

        <label style={{ fontSize: 13, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Danh mục</label>
        <select
          className="apps-sort-select"
          style={{ width: '100%', marginBottom: 12 }}
          value={category}
          onChange={(e) => setCategory(e.target.value as ReportCategory)}
          disabled={loading}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <textarea
          className="rating-review"
          placeholder="Mô tả chi tiết vi phạm... (bắt buộc)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          disabled={loading}
        />

        <div className="modal-actions">
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={loading}>Hủy</button>
          <button className="btn btn-danger btn-sm" disabled={!valid || loading} onClick={submit}>
            {loading ? 'Đang gửi…' : 'Gửi báo cáo'}
          </button>
        </div>
      </div>
    </div>
  );
}
