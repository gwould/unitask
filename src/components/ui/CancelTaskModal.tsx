import { useState } from 'react';
import { formatMoney } from '../../utils/format';

interface CancelTaskModalProps {
  milestoneTitle: string;
  amount: number;
  /** Task đã ký quỹ chưa? Nếu chưa thì không chia tiền. */
  escrowed: boolean;
  loading?: boolean;
  onSubmit: (progressPercent: number, reason: string) => void;
  onCancel: () => void;
}

/**
 * Modal hủy task (chính sách 1.3). Business chọn % tiến độ đã hoàn thành:
 * phần này trả cho người thực hiện, phần còn lại hoàn về ví doanh nghiệp.
 */
export default function CancelTaskModal({
  milestoneTitle,
  amount,
  escrowed,
  loading = false,
  onSubmit,
  onCancel,
}: CancelTaskModalProps) {
  const [percent, setPercent] = useState(0);
  const [reason, setReason] = useState('');

  const studentAmount = Math.round((amount * percent) / 100);
  const refund = amount - studentAmount;

  return (
    <div className="modal-overlay" onClick={loading ? undefined : onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>🚫 Hủy task</h3>
        <p className="modal-sub">{milestoneTitle}</p>

        {escrowed ? (
          <>
            <label style={{ fontSize: 13, color: 'var(--text-2)' }}>
              % tiến độ đã hoàn thành: <strong style={{ color: 'var(--text)' }}>{percent}%</strong>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
              disabled={loading}
              style={{ width: '100%', margin: '8px 0' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 10 }}>
              <span>Trả người làm: <strong style={{ color: 'var(--teal)' }}>{formatMoney(studentAmount)}</strong></span>
              <span>Hoàn về ví: <strong style={{ color: 'var(--pl)' }}>{formatMoney(refund)}</strong></span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-2)' }}>
              ⚖️ Chính sách 1.3: nếu task đã ký quỹ quá 48h, hệ thống đảm bảo tối thiểu 30% cho người thực hiện.
            </p>
          </>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
            Task chưa ký quỹ — hủy sẽ không phát sinh giao dịch.
          </p>
        )}

        <textarea
          className="rating-review"
          style={{ marginTop: 10 }}
          placeholder="Lý do hủy (không bắt buộc)…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          disabled={loading}
        />

        <div className="modal-actions">
          <button className="btn btn-ghost btn-sm" onClick={onCancel} disabled={loading}>Đóng</button>
          <button className="btn btn-danger btn-sm" disabled={loading} onClick={() => onSubmit(percent, reason.trim())}>
            {loading ? 'Đang hủy…' : 'Xác nhận hủy'}
          </button>
        </div>
      </div>
    </div>
  );
}
