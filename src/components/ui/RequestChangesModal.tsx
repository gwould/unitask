import { useState } from 'react';

interface RequestChangesModalProps {
  milestoneTitle: string;
  /** Đang gửi API -> khóa nút để tránh double click. */
  loading?: boolean;
  onSubmit: (feedback: string) => void;
  onCancel: () => void;
}

/**
 * Modal yêu cầu sửa bài: bắt buộc nhập lý do (feedback) trước khi gửi.
 * Nút "Gửi yêu cầu" bị disable khi textarea rỗng hoặc đang loading.
 */
export default function RequestChangesModal({
  milestoneTitle,
  loading = false,
  onSubmit,
  onCancel,
}: RequestChangesModalProps) {
  const [feedback, setFeedback] = useState('');
  const trimmed = feedback.trim();

  return (
    <div className="modal-overlay" onClick={loading ? undefined : onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>✏️ Yêu cầu chỉnh sửa</h3>
        <p className="modal-sub">{milestoneTitle}</p>
        <textarea
          className="rating-review"
          placeholder="Nhập lý do cần chỉnh sửa để sinh viên biết phải sửa gì... (bắt buộc)"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          autoFocus
          disabled={loading}
        />
        <div className="modal-actions">
          <button className="btn btn-ghost btn-sm" onClick={onCancel} disabled={loading}>
            Hủy
          </button>
          <button
            className="btn btn-danger btn-sm"
            disabled={trimmed.length === 0 || loading}
            onClick={() => onSubmit(trimmed)}
          >
            {loading ? 'Đang gửi…' : 'Gửi yêu cầu sửa'}
          </button>
        </div>
      </div>
    </div>
  );
}
