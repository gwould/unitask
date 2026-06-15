import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Contract, Milestone, MilestoneStatus } from '../types';
import { MILESTONE_STATUS_MAP } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { milestoneService } from '../services/milestoneService';
import { formatMoney } from '../utils/format';
import { AddTaskModal, ConfirmModal, RequestChangesModal, SubmitTaskModal, Toast } from './ui';

// ============================================================
// MilestoneManager — Bảng KANBAN quản lý milestone, dùng chung cho cả
// Business và Student (tự nhận vai trò từ useAuth).
//
// CỘT (theo Milestone.status):
//   PENDING → ESCROWED → UNDER_REVIEW → REVISION → COMPLETED
//
// HÀNH ĐỘNG theo vai trò + trạng thái:
//   Business:  PENDING → Nạp ký quỹ | UNDER_REVIEW → Nghiệm thu / Yêu cầu sửa
//   Student:   ESCROWED|REVISION → Nộp bài
//
// LUỒNG DỮ LIỆU: load contract → group theo status thành các cột. Mỗi action gọi
// API trả về Milestone mới → patch tại chỗ (thẻ tự "nhảy cột") không reload.
// ============================================================

interface MilestoneManagerProps {
  contractId: string;
}

/** Thứ tự cột hiển thị trên bảng Kanban. */
const COLUMN_ORDER: MilestoneStatus[] = ['PENDING', 'ESCROWED', 'UNDER_REVIEW', 'REVISION', 'COMPLETED'];

type ActiveModal =
  | { type: 'approve'; milestone: Milestone }
  | { type: 'request-changes'; milestone: Milestone }
  | { type: 'submit'; milestone: Milestone }
  | { type: 'add-task' }
  | null;

/** Format deadline + cờ quá hạn (chỉ tính khi chưa hoàn thành). */
function formatDeadline(dueDate?: string | null, status?: MilestoneStatus) {
  if (!dueDate) return { text: 'Không có hạn', overdue: false };
  const d = new Date(dueDate);
  const text = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const overdue = status !== 'COMPLETED' && d.getTime() < Date.now();
  return { text, overdue };
}

export default function MilestoneManager({ contractId }: MilestoneManagerProps) {
  const { user } = useAuth();
  const isBusiness = user?.role === 'business';
  const isStudent = user?.role === 'student';

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [modal, setModal] = useState<ActiveModal>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    milestoneService
      .getContract(contractId)
      .then((data) => alive && setContract(data))
      .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : 'Không tải được hợp đồng.'))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [contractId]);

  const patchMilestone = useCallback((updated: Milestone) => {
    setContract((prev) =>
      prev ? { ...prev, milestones: prev.milestones.map((m) => (m.id === updated.id ? updated : m)) } : prev,
    );
  }, []);

  const runAction = useCallback(
    async (milestoneId: string, fn: () => Promise<Milestone>, successMsg: string) => {
      setBusyId(milestoneId);
      try {
        const updated = await fn();
        patchMilestone(updated);
        setToast(successMsg);
      } catch (e: unknown) {
        setToast(e instanceof Error ? e.message : 'Thao tác thất bại.');
      } finally {
        setBusyId(null);
        setModal(null);
      }
    },
    [patchMilestone],
  );

  const handleEscrow = (m: Milestone) =>
    runAction(m.id, () => milestoneService.escrow(m.id), `Đã ký quỹ "${m.title}".`);
  const handleApprove = (m: Milestone) =>
    runAction(m.id, () => milestoneService.approve(m.id), `Đã nghiệm thu & giải ngân "${m.title}".`);
  const handleRequestChanges = (m: Milestone, feedback: string) =>
    runAction(m.id, () => milestoneService.requestChanges(m.id, feedback), `Đã gửi yêu cầu sửa "${m.title}".`);
  const handleSubmit = (m: Milestone, data: { fileUrl: string; coverLetter: string }) =>
    runAction(m.id, () => milestoneService.submit(m.id, data), `Đã nộp bài "${m.title}".`);

  // Giao task = thêm milestone mới vào hợp đồng (chỉ Business).
  const [addBusy, setAddBusy] = useState(false);
  const handleAddTask = async (data: { title: string; amount: number; dueDate?: string }) => {
    setAddBusy(true);
    try {
      const created = await milestoneService.addMilestone(contractId, data);
      setContract((prev) =>
        prev
          ? {
              ...prev,
              // Thêm task -> hợp đồng mở lại ACTIVE (nếu trước đó đã hoàn thành).
              status: prev.status === 'COMPLETED' ? 'ACTIVE' : prev.status,
              milestones: [...prev.milestones, created],
              finalPrice: prev.finalPrice + created.amount,
            }
          : prev,
      );
      setToast(`Đã giao task "${created.title}".`);
      setModal(null);
    } catch (e: unknown) {
      setToast(e instanceof Error ? e.message : 'Không giao được task.');
    } finally {
      setAddBusy(false);
    }
  };

  // ----- Kéo-thả (drag & drop) -----
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<MilestoneStatus | null>(null);

  // Các cột hợp lệ mà 1 milestone được phép thả vào (theo vai trò + state machine).
  const validTargets = (m: Milestone): MilestoneStatus[] => {
    if (isBusiness && m.status === 'PENDING') return ['ESCROWED'];
    if (isBusiness && m.status === 'UNDER_REVIEW') return ['COMPLETED', 'REVISION'];
    if (isStudent && (m.status === 'ESCROWED' || m.status === 'REVISION')) return ['UNDER_REVIEW'];
    return [];
  };

  // Thả vào cột -> kích hoạt đúng hành động (mở modal nếu cần nhập liệu/xác nhận).
  const performDrop = (m: Milestone, target: MilestoneStatus) => {
    if (!validTargets(m).includes(target)) return;
    if (target === 'ESCROWED') handleEscrow(m);
    else if (target === 'COMPLETED') setModal({ type: 'approve', milestone: m });
    else if (target === 'REVISION') setModal({ type: 'request-changes', milestone: m });
    else if (target === 'UNDER_REVIEW') setModal({ type: 'submit', milestone: m });
  };

  // Gom milestone theo cột.
  const columns = useMemo(() => {
    const map: Record<MilestoneStatus, Milestone[]> = {
      PENDING: [], ESCROWED: [], UNDER_REVIEW: [], REVISION: [], COMPLETED: [],
    };
    contract?.milestones.forEach((m) => map[m.status]?.push(m));
    return map;
  }, [contract]);

  if (loading) return <div className="ms-panel"><div className="spinner" /></div>;
  if (error) return <div className="ms-panel ms-error">{error}</div>;
  if (!contract) return null;

  const renderCard = (m: Milestone) => {
    const badge = MILESTONE_STATUS_MAP[m.status];
    const isBusy = busyId === m.id;
    const deadline = formatDeadline(m.dueDate, m.status);
    const sub = m.latestSubmission;
    const canDrag = validTargets(m).length > 0 && !isBusy;

    return (
      <div
        key={m.id}
        className={`kb-card${isBusy ? ' kb-card-busy' : ''}${canDrag ? ' kb-draggable' : ''}${dragId === m.id ? ' kb-dragging' : ''}`}
        draggable={canDrag}
        onDragStart={() => setDragId(m.id)}
        onDragEnd={() => { setDragId(null); setDragOverCol(null); }}
      >
        <div className="kb-card-head">
          <strong className="kb-card-title">{m.title}</strong>
          <span className={`ms-badge ${badge.cls}`}>{badge.label}</span>
        </div>
        <div className="kb-card-meta">
          <span className="kb-amount">{formatMoney(m.amount)}</span>
          <span className={`kb-deadline${deadline.overdue ? ' kb-overdue' : ''}`}>
            📅 {deadline.text}{deadline.overdue ? ' (quá hạn)' : ''}
          </span>
        </div>

        {/* Bài nộp / feedback */}
        {sub?.fileUrl && (m.status === 'UNDER_REVIEW' || m.status === 'COMPLETED') && (
          <a className="kb-sub-link" href={sub.fileUrl} target="_blank" rel="noopener noreferrer">⬇️ File sản phẩm</a>
        )}
        {sub?.coverLetter && m.status === 'UNDER_REVIEW' && (
          <p className="kb-sub-note">{sub.coverLetter}</p>
        )}
        {m.status === 'REVISION' && sub?.clientFeedback && (
          <p className="ms-feedback" style={{ marginTop: 6 }}>Cần sửa: “{sub.clientFeedback}”</p>
        )}

        {/* Hành động theo vai trò */}
        <div className="kb-actions">
          {isBusiness && m.status === 'PENDING' && (
            <button className="btn btn-primary btn-sm" disabled={isBusy} onClick={() => handleEscrow(m)}>
              {isBusy ? '…' : '🔒 Nạp ký quỹ'}
            </button>
          )}
          {isBusiness && m.status === 'UNDER_REVIEW' && (
            <>
              <button className="btn btn-success btn-sm" disabled={isBusy} onClick={() => setModal({ type: 'approve', milestone: m })}>✅ Nghiệm thu</button>
              <button className="btn btn-danger btn-sm" disabled={isBusy} onClick={() => setModal({ type: 'request-changes', milestone: m })}>✏️ Yêu cầu sửa</button>
            </>
          )}
          {isStudent && (m.status === 'ESCROWED' || m.status === 'REVISION') && (
            <button className="btn btn-primary btn-sm" disabled={isBusy} onClick={() => setModal({ type: 'submit', milestone: m })}>
              📤 {m.status === 'REVISION' ? 'Nộp lại' : 'Nộp bài'}
            </button>
          )}
          {/* Gợi ý trạng thái cho phía còn lại */}
          {isStudent && m.status === 'PENDING' && <span className="kb-hint">⏳ Chờ doanh nghiệp ký quỹ</span>}
          {isStudent && m.status === 'UNDER_REVIEW' && <span className="kb-hint">👀 Chờ nghiệm thu</span>}
          {isBusiness && m.status === 'ESCROWED' && <span className="kb-hint">⏳ Chờ sinh viên nộp</span>}
          {isBusiness && m.status === 'REVISION' && <span className="kb-hint">🔁 Chờ nộp lại</span>}
        </div>
      </div>
    );
  };

  // Tiến trình milestone cho cả dự án
  const totalCount = contract.milestones.length;
  const doneCount = contract.milestones.filter((m) => m.status === 'COMPLETED').length;
  const paidAmount = contract.milestones.filter((m) => m.status === 'COMPLETED').reduce((s, m) => s + m.amount, 0);
  const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <section className="ms-panel">
      <header className="ms-panel-head">
        <div>
          <h3>Tiến độ dự án {contract.jobTitle ? `· ${contract.jobTitle}` : ''}</h3>
          {contract.studentName && <span className="kb-sub-name">👨‍🎓 {contract.studentName}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="ms-total">Giá trị HĐ: {formatMoney(contract.finalPrice)}</span>
          {isBusiness && contract.status !== 'CANCELED' && (
            <button className="btn btn-primary btn-sm" onClick={() => setModal({ type: 'add-task' })}>＋ Giao task</button>
          )}
        </div>
      </header>

      {/* Tiến trình milestone toàn dự án */}
      <div className="ms-progress">
        <div className="ms-progress-info">
          <span>{doneCount}/{totalCount} task hoàn thành · <span style={{ opacity: 0.7 }}>💡 kéo thẻ sang cột hợp lệ để chuyển nhanh</span></span>
          <span>Đã giải ngân: {formatMoney(paidAmount)}</span>
        </div>
        <div className="contract-progress"><div className="contract-progress-fill" style={{ width: `${pct}%` }} /></div>
      </div>

      {/* BẢNG KANBAN */}
      <div className="kanban">
        {COLUMN_ORDER.map((status) => {
          const col = columns[status];
          const meta = MILESTONE_STATUS_MAP[status];
          const draggedM = dragId ? contract.milestones.find((x) => x.id === dragId) ?? null : null;
          const isValidDrop = draggedM ? validTargets(draggedM).includes(status) : false;
          return (
            <div
              key={status}
              className={`kb-col${isValidDrop ? ' kb-col-droppable' : ''}${dragOverCol === status && isValidDrop ? ' kb-col-over' : ''}`}
              onDragOver={(e) => { if (isValidDrop) { e.preventDefault(); setDragOverCol(status); } }}
              onDragLeave={() => setDragOverCol((c) => (c === status ? null : c))}
              onDrop={(e) => {
                if (isValidDrop && draggedM) { e.preventDefault(); performDrop(draggedM, status); }
                setDragId(null);
                setDragOverCol(null);
              }}
            >
              <div className={`kb-col-head ${meta.cls}`}>
                <span>{meta.label}</span>
                <span className="kb-col-count">{col.length}</span>
              </div>
              <div className="kb-col-body">
                {col.length === 0 ? <div className="kb-empty">—</div> : col.map(renderCard)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {modal?.type === 'approve' && (
        <ConfirmModal
          title="Xác nhận nghiệm thu"
          message={`Giải ngân ${formatMoney(modal.milestone.amount)} cho sinh viên? Hành động này không thể hoàn tác.`}
          confirmLabel={busyId === modal.milestone.id ? 'Đang xử lý…' : 'Giải ngân'}
          onConfirm={() => handleApprove(modal.milestone)}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === 'request-changes' && (
        <RequestChangesModal
          milestoneTitle={modal.milestone.title}
          loading={busyId === modal.milestone.id}
          onSubmit={(feedback) => handleRequestChanges(modal.milestone, feedback)}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === 'submit' && (
        <SubmitTaskModal
          milestoneTitle={modal.milestone.title}
          previousFeedback={modal.milestone.latestSubmission?.clientFeedback}
          loading={busyId === modal.milestone.id}
          onSubmit={(data) => handleSubmit(modal.milestone, data)}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === 'add-task' && (
        <AddTaskModal
          loading={addBusy}
          onSubmit={handleAddTask}
          onCancel={() => setModal(null)}
        />
      )}

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </section>
  );
}
