import { useState } from 'react';

interface RequestChangesModalProps {
  milestoneTitle: string;
  /** Đang gửi API -> khóa nút để tránh double click. */
  loading?: boolean;
  onSubmit: (feedback: string, evidenceUrl: string) => void;
  onCancel: () => void;
}

/**
 * Modal yêu cầu sửa bài. Chính sách 1.4: BẮT BUỘC nhập lý do (feedback) VÀ
 * đính kèm bằng chứng (link). Nút bị disable nếu thiếu một trong hai.
 */
export default function RequestChangesModal({
  milestoneTitle,
  loading = false,
  onSubmit,
  onCancel,
}: RequestChangesModalProps) {
  const [feedback, setFeedback] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const fb = feedback.trim();
  const ev = evidenceUrl.trim();
  const valid = fb.length > 0 && ev.length > 0;

  return (
    <div className="modal-overlay" onClick={loading ? undefined : onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>✏️ Yêu cầu chỉnh sửa</h3>
        <p className="modal-sub">{milestoneTitle}</p>
        <textarea
          className="rating-review"
          placeholder="Lý do cụ thể cần chỉnh sửa... (bắt buộc)"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          autoFocus
          disabled={loading}
        />
        <input
          className="ms-form-input"
          style={{ width: '100%', marginTop: 10 }}
          placeholder="Link bằng chứng (ảnh chụp, tài liệu...), bắt buộc"
          value={evidenceUrl}
          onChange={(e) => setEvidenceUrl(e.target.value)}
          disabled={loading}
        />
        <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 8 }}>
          ⚖️ Chính sách 1.4: từ chối phải có lý do &amp; bằng chứng. Từ chối vô lý nhiều lần sẽ bị khóa đăng task.
        </p>
        <div className="modal-actions">
          <button className="btn btn-ghost btn-sm" onClick={onCancel} disabled={loading}>
            Hủy
          </button>
          <button
            className="btn btn-danger btn-sm"
            disabled={!valid || loading}
            onClick={() => onSubmit(fb, ev)}
          >
            {loading ? 'Đang gửi…' : 'Gửi yêu cầu sửa'}
          </button>
        </div>
      </div>
    </div>
  );
}
