import { useState } from 'react';

interface OpenDisputeModalProps {
  milestoneTitle: string;
  loading?: boolean;
  onSubmit: (reason: string) => void;
  onCancel: () => void;
}

/** B1 — mở tranh chấp: nhập lý do. */
export default function OpenDisputeModal({ milestoneTitle, loading = false, onSubmit, onCancel }: OpenDisputeModalProps) {
  const [reason, setReason] = useState('');
  const r = reason.trim();

  return (
    <div className="modal-overlay" onClick={loading ? undefined : onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>⚠️ Mở tranh chấp</h3>
        <p className="modal-sub">{milestoneTitle}</p>
        <textarea
          className="rating-review"
          placeholder="Mô tả vấn đề tranh chấp... (bắt buộc)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          autoFocus
          disabled={loading}
        />
        <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 8 }}>
          B1: hai bên thương lượng qua chat (tối đa 48h). Nếu không xong, hãy "Yêu cầu hòa giải".
        </p>
        <div className="modal-actions">
          <button className="btn btn-ghost btn-sm" onClick={onCancel} disabled={loading}>Hủy</button>
          <button className="btn btn-danger btn-sm" disabled={r.length === 0 || loading} onClick={() => onSubmit(r)}>
            {loading ? 'Đang mở…' : 'Mở tranh chấp'}
          </button>
        </div>
      </div>
    </div>
  );
}
