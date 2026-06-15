import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Contract } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { milestoneService } from '../services/milestoneService';
import { formatMoney } from '../utils/format';

// ============================================================
// MyContractsPage (/contracts) — danh sách hợp đồng của người dùng hiện tại.
// Dùng chung Business & Student; mỗi thẻ dẫn vào bảng Kanban /contracts/:id.
// ============================================================

const CONTRACT_STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Đang thực hiện',
  COMPLETED: 'Hoàn thành',
  CANCELED: 'Đã hủy',
};

export default function MyContractsPage() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    milestoneService
      .getMyContracts()
      .then((data) => alive && setContracts(data))
      .catch(() => alive && setContracts([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  return (
    <section className="container" style={{ padding: '100px 20px 60px', maxWidth: 880 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 6 }}>🤝 Hợp đồng & Milestone</h1>
      <p style={{ color: 'var(--text-2)', marginBottom: 24 }}>
        {user?.role === 'business'
          ? 'Quản lý tiến độ, ký quỹ và nghiệm thu các hợp đồng bạn đã giao.'
          : 'Theo dõi tiến độ và nộp sản phẩm cho các hợp đồng của bạn.'}
      </p>

      {loading ? (
        <div className="spinner" />
      ) : contracts.length === 0 ? (
        <div className="ms-panel" style={{ textAlign: 'center', color: 'var(--text-2)' }}>
          Chưa có hợp đồng nào.
          {user?.role === 'business' && (
            <> Vào <Link to="/manage-jobs" style={{ color: 'var(--pl)' }}>Quản lý job</Link> để tạo hợp đồng từ ứng viên đã nhận.</>
          )}
        </div>
      ) : (
        <div className="contract-list">
          {contracts.map((c) => {
            const total = c.milestones.length;
            const done = c.milestones.filter((m) => m.status === 'COMPLETED').length;
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <Link key={c.id} to={`/contracts/${c.id}`} className="contract-card">
                <div className="contract-card-top">
                  <strong>{c.jobTitle ?? 'Hợp đồng'}</strong>
                  <span className={`ms-badge ${c.status === 'COMPLETED' ? 'ms-completed' : c.status === 'CANCELED' ? 'ms-revision' : 'ms-escrowed'}`}>
                    {CONTRACT_STATUS_LABEL[c.status] ?? c.status}
                  </span>
                </div>
                {user?.role === 'business' && c.studentName && (
                  <div className="contract-card-sub">👨‍🎓 {c.studentName}</div>
                )}
                <div className="contract-card-meta">
                  <span>{formatMoney(c.finalPrice)}</span>
                  <span>{done}/{total} milestone xong</span>
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
