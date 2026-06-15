import { useState } from 'react';

interface AddTaskModalProps {
  loading?: boolean;
  onSubmit: (data: { title: string; amount: number; dueDate?: string }) => void;
  onCancel: () => void;
}

/**
 * Modal "Giao task" — Business thêm 1 milestone (task) vào hợp đồng đang chạy.
 * Một task = một milestone (tiêu đề + số tiền + hạn chót).
 */
export default function AddTaskModal({ loading = false, onSubmit, onCancel }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  const amt = Number(amount);
  const valid = title.trim().length > 0 && amt > 0;

  return (
    <div className="modal-overlay" onClick={loading ? undefined : onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>📋 Giao task mới</h3>
        <p className="modal-sub">Mỗi task là một milestone thanh toán riêng</p>

        <input
          className="ms-form-input"
          style={{ width: '100%', marginBottom: 10 }}
          placeholder="Tên task (vd: Thiết kế trang chủ)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          autoFocus
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="ms-form-input"
            style={{ flex: 1 }}
            type="number"
            min={0}
            placeholder="Số tiền (₫)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
          />
          <input
            className="ms-form-input"
            style={{ flex: 1 }}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost btn-sm" onClick={onCancel} disabled={loading}>Hủy</button>
          <button
            className="btn btn-primary btn-sm"
            disabled={!valid || loading}
            onClick={() => onSubmit({ title: title.trim(), amount: amt, dueDate: dueDate || undefined })}
          >
            {loading ? 'Đang tạo…' : 'Giao task'}
          </button>
        </div>
      </div>
    </div>
  );
}
