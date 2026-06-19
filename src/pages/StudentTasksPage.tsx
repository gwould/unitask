import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Contract, MilestoneStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { milestoneService } from '../services/milestoneService';
import { formatMoney } from '../utils/format';
import { MILESTONE_STATUS_MAP } from '../constants';

// ============================================================
// StudentTasksPage (/my-tasks) — "Công việc của tôi".
// Toàn bộ task của sinh viên = các MILESTONE trong những hợp đồng đã ký.
// Trang này tổng hợp tiến trình milestone; thao tác nộp bài thực hiện trong
// bảng Kanban tại /contracts/:id (bấm vào từng hợp đồng).
// ============================================================

const STAT_ORDER: MilestoneStatus[] = ['ESCROWED', 'REVISION', 'UNDER_REVIEW', 'COMPLETED', 'PENDING'];

export default function StudentTasksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    let alive = true;
    milestoneService
      .getMyContracts()
      .then((data) => alive && setContracts(data))
      .catch(() => alive && setContracts([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [user, navigate]);

  // Tổng hợp số lượng milestone theo trạng thái (trên tất cả hợp đồng).
  const stats = useMemo(() => {
    const acc: Record<MilestoneStatus, number> = {
      PENDING: 0, ESCROWED: 0, UNDER_REVIEW: 0, REVISION: 0, COMPLETED: 0, CANCELED: 0,
    };
    contracts.forEach((c) => c.milestones.forEach((m) => { acc[m.status] += 1; }));
    return acc;
  }, [contracts]);

  const totalEarned = useMemo(
    () => contracts.reduce(
      (s, c) => s + c.milestones.filter((m) => m.status === 'COMPLETED').reduce((a, m) => a + m.amount, 0),
      0,
    ),
    [contracts],
  );

  return (
    <section className="container page-section-main" style={{ maxWidth: 880 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 6 }}><i className="bx bx-task" /> Công việc của tôi</h1>
        <p style={{ color: 'var(--text-2)' }}>
          Theo dõi tiến trình milestone, nộp sản phẩm và nhận thanh toán khi doanh nghiệp nghiệm thu.
        </p>
      </div>

      {/* Thẻ thống kê theo trạng thái milestone */}
      <div className="manage-panel-stats" style={{ marginBottom: 20 }}>
        {STAT_ORDER.map((s) => (
          <span key={s} className={`ms-badge ${MILESTONE_STATUS_MAP[s].cls}`}>
            {MILESTONE_STATUS_MAP[s].label}: {stats[s]}
          </span>
        ))}
        <span className="ms-badge ms-completed"><i className="bx bx-wallet" /> Đã nhận: {formatMoney(totalEarned)}</span>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : contracts.length === 0 ? (
        <div className="ms-panel" style={{ textAlign: 'center', color: 'var(--text-2)' }}>
          Chưa có công việc nào. <Link to="/jobs" style={{ color: 'var(--pl)' }}>Tìm việc ngay →</Link>
          <div style={{ fontSize: 13, marginTop: 8 }}>
            Sau khi ứng tuyển được duyệt và doanh nghiệp tạo hợp đồng, task sẽ hiện ở đây.
          </div>
        </div>
      ) : (
        <div className="contract-list">
          {contracts.map((c) => {
            const total = c.milestones.length;
            const done = c.milestones.filter((m) => m.status === 'COMPLETED').length;
            const pct = total ? Math.round((done / total) * 100) : 0;
            // Số task đang cần sinh viên hành động (nộp / nộp lại).
            const actionable = c.milestones.filter((m) => m.status === 'ESCROWED' || m.status === 'REVISION').length;
            return (
              <Link key={c.id} to={`/contracts/${c.id}`} className="contract-card">
                <div className="contract-card-top">
                  <strong>{c.jobTitle ?? 'Hợp đồng'}</strong>
                  {actionable > 0 && <span className="ms-badge ms-escrowed"><i className="bx bx-bolt-circle" /> {actionable} task cần nộp</span>}
                </div>
                <div className="contract-card-meta">
                  <span>{formatMoney(c.finalPrice)}</span>
                  <span>{done}/{total} task xong</span>
                </div>
                <div className="contract-progress"><div className="contract-progress-fill" style={{ width: `${pct}%` }} /></div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
