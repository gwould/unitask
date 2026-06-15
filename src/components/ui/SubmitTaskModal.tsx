import { useState } from 'react';

interface SubmitTaskModalProps {
  milestoneTitle: string;
  /** Feedback lần trước (nếu đang ở trạng thái REVISION) để sinh viên biết cần sửa gì. */
  previousFeedback?: string | null;
  loading?: boolean;
  onSubmit: (data: { fileUrl: string; coverLetter: string }) => void;
  onCancel: () => void;
}

/**
 * Modal sinh viên nộp sản phẩm cho 1 milestone.
 * Yêu cầu tối thiểu: link file sản phẩm (fileUrl). CoverLetter là ghi chú không bắt buộc.
 */
export default function SubmitTaskModal({
  milestoneTitle,
  previousFeedback,
  loading = false,
  onSubmit,
  onCancel,
}: SubmitTaskModalProps) {
  const [fileUrl, setFileUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const validUrl = fileUrl.trim().length > 0;

  return (
    <div className="modal-overlay" onClick={loading ? undefined : onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>📤 Nộp sản phẩm</h3>
        <p className="modal-sub">{milestoneTitle}</p>

        {previousFeedback && (
          <p className="ms-feedback" style={{ marginTop: 0 }}>
            Yêu cầu sửa từ doanh nghiệp: “{previousFeedback}”
          </p>
        )}

        <input
          className="ms-form-input"
          style={{ width: '100%', marginBottom: 10 }}
          placeholder="Link sản phẩm (Google Drive, GitHub, Figma…)"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          disabled={loading}
          autoFocus
        />
        <textarea
          className="rating-review"
          placeholder="Ghi chú cho doanh nghiệp (không bắt buộc)…"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          rows={3}
          disabled={loading}
        />

        <div className="modal-actions">
          <button className="btn btn-ghost btn-sm" onClick={onCancel} disabled={loading}>Hủy</button>
          <button
            className="btn btn-primary btn-sm"
            disabled={!validUrl || loading}
            onClick={() => onSubmit({ fileUrl: fileUrl.trim(), coverLetter: coverLetter.trim() })}
          >
            {loading ? 'Đang nộp…' : 'Nộp bài'}
          </button>
        </div>
      </div>
    </div>
  );
}
