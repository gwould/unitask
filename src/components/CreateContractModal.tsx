import { useState } from 'react';
import type { CreateContractInput } from '../services/milestoneService';

// ============================================================
// CreateContractModal — Business nhập các milestone để tạo hợp đồng
// từ một ứng viên đã được duyệt (status 'accepted').
// onSubmit trả về payload khớp CreateContractInput (đã có jobApplicationId).
// ============================================================

interface MilestoneRow {
  title: string;
  amount: string; // giữ string để nhập liệu, parse khi submit
  dueDate: string;
}

interface CreateContractModalProps {
  studentName: string;
  jobApplicationId: string;
  loading?: boolean;
  onSubmit: (input: CreateContractInput) => void;
  onCancel: () => void;
}

const emptyRow = (): MilestoneRow => ({ title: '', amount: '', dueDate: '' });

export default function CreateContractModal({
  studentName,
  jobApplicationId,
  loading = false,
  onSubmit,
  onCancel,
}: CreateContractModalProps) {
  const [rows, setRows] = useState<MilestoneRow[]>([emptyRow()]);

  const update = (i: number, patch: Partial<MilestoneRow>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  // Hợp lệ: mọi dòng phải có title + amount > 0.
  const parsed = rows
    .map((r) => ({ title: r.title.trim(), amount: Number(r.amount), dueDate: r.dueDate || undefined }))
    .filter((r) => r.title.length > 0 && r.amount > 0);
  const valid = parsed.length === rows.length && parsed.length > 0;
  const total = parsed.reduce((s, r) => s + r.amount, 0);

  const handleSubmit = () => {
    if (!valid || loading) return;
    onSubmit({ jobApplicationId, finalPrice: total, milestones: parsed });
  };

  return (
    <div className="modal-overlay" onClick={loading ? undefined : onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <h3>🤝 Tạo hợp đồng</h3>
        <p className="modal-sub">Chia milestone thanh toán cho {studentName}</p>

        <div className="ms-form-list">
          {rows.map((r, i) => (
            <div key={i} className="ms-form-row">
              <input
                className="ms-form-input"
                placeholder="Tên milestone (vd: Giai đoạn 1 - Thiết kế)"
                value={r.title}
                onChange={(e) => update(i, { title: e.target.value })}
                disabled={loading}
              />
              <input
                className="ms-form-input ms-form-amount"
                type="number"
                min={0}
                placeholder="Số tiền (₫)"
                value={r.amount}
                onChange={(e) => update(i, { amount: e.target.value })}
                disabled={loading}
              />
              <input
                className="ms-form-input ms-form-date"
                type="date"
                value={r.dueDate}
                onChange={(e) => update(i, { dueDate: e.target.value })}
                disabled={loading}
              />
              {rows.length > 1 && (
                <button
                  type="button"
                  className="btn btn-danger-ghost btn-sm"
                  onClick={() => removeRow(i)}
                  disabled={loading}
                  title="Xóa dòng"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button type="button" className="btn btn-ghost btn-sm" onClick={addRow} disabled={loading} style={{ marginTop: 10 }}>
          ＋ Thêm milestone
        </button>

        {total > 0 && (
          <p style={{ marginTop: 12, fontSize: 13, color: 'var(--teal)' }}>
            Tổng giá trị hợp đồng: {new Intl.NumberFormat('vi-VN').format(total)} ₫
          </p>
        )}

        <div className="modal-actions">
          <button className="btn btn-ghost btn-sm" onClick={onCancel} disabled={loading}>Hủy</button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={!valid || loading}>
            {loading ? 'Đang tạo…' : 'Tạo hợp đồng'}
          </button>
        </div>
      </div>
    </div>
  );
}
