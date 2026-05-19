import { useState, useCallback, useMemo } from 'react';
import type { Applicant } from '../types/application';

interface BulkActionsProps {
  selectedIds: Set<string>;
  applicants: Applicant[];
  onApplyAction: (action: 'accept' | 'reject' | 'notify', ids: string[], message?: string) => Promise<void>;
  isLoading: boolean;
}

export function BulkActions({ selectedIds, applicants, onApplyAction, isLoading }: BulkActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState('');
  const [showNotifyForm, setShowNotifyForm] = useState(false);

  const selectedCount = selectedIds.size;
  const selectedApplicants = useMemo(() => {
    return applicants.filter(a => selectedIds.has(a.id));
  }, [applicants, selectedIds]);

  const selectedStats = useMemo(() => {
    return {
      pending: selectedApplicants.filter(a => a.status === 'pending').length,
      accepted: selectedApplicants.filter(a => a.status === 'accepted').length,
      avgRating: selectedApplicants.length > 0
        ? (selectedApplicants.reduce((sum, a) => sum + (a.rating || 0), 0) / selectedApplicants.length).toFixed(1)
        : 0,
    };
  }, [selectedApplicants]);

  const handleBulkAccept = useCallback(async () => {
    if (window.confirm(`Chấp nhận ${selectedCount} ứng viên?`)) {
      await onApplyAction('accept', Array.from(selectedIds));
    }
  }, [selectedIds, selectedCount, onApplyAction]);

  const handleBulkReject = useCallback(async () => {
    if (window.confirm(`Từ chối ${selectedCount} ứng viên?`)) {
      await onApplyAction('reject', Array.from(selectedIds));
    }
  }, [selectedIds, selectedCount, onApplyAction]);

  const handleSendNotification = useCallback(async () => {
    if (!notifyMessage.trim()) {
      alert('Nhập nội dung thông báo');
      return;
    }
    await onApplyAction('notify', Array.from(selectedIds), notifyMessage);
    setNotifyMessage('');
    setShowNotifyForm(false);
  }, [selectedIds, notifyMessage, onApplyAction]);

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bulk-actions-container">
      <div className="bulk-header">
        <div className="bulk-info">
          <span className="bulk-count">{selectedCount}</span>
          <span className="bulk-label">ứng viên được chọn</span>
          <div className="bulk-stats">
            <span title="Pending">⏳ {selectedStats.pending}</span>
            <span title="Accepted">✅ {selectedStats.accepted}</span>
            <span title="Avg rating">⭐ {selectedStats.avgRating}</span>
          </div>
        </div>

        <button
          className="bulk-close"
          onClick={() => {
            setIsOpen(false);
            setShowNotifyForm(false);
          }}
          aria-label="Đóng"
        >
          ✕
        </button>
      </div>

      {!isOpen && (
        <div className="bulk-quick-actions">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setIsOpen(true)}
            disabled={isLoading}
          >
            📋 {selectedCount} thao tác
          </button>
        </div>
      )}

      {isOpen && (
        <div className="bulk-expanded-actions">
          <div className="bulk-action-group">
            <h4>Chấp nhận/Từ chối</h4>
            <div className="bulk-btn-row">
              <button
                className="btn btn-primary btn-sm"
                onClick={handleBulkAccept}
                disabled={isLoading}
              >
                ✅ Chấp nhận cả {selectedCount}
              </button>
              <button
                className="btn btn-danger-ghost btn-sm"
                onClick={handleBulkReject}
                disabled={isLoading}
              >
                ❌ Từ chối cả {selectedCount}
              </button>
            </div>
          </div>

          <div className="bulk-action-group">
            <h4>Thông báo</h4>
            {!showNotifyForm ? (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowNotifyForm(true)}
              >
                🔔 Gửi thông báo cho {selectedCount}
              </button>
            ) : (
              <div className="bulk-notify-form">
                <textarea
                  placeholder="Nhập nội dung thông báo..."
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                  rows={3}
                  style={{ width: '100%', marginBottom: 8 }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleSendNotification}
                    disabled={isLoading}
                  >
                    Gửi
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setShowNotifyForm(false);
                      setNotifyMessage('');
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
