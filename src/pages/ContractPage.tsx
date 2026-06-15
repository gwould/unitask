import { Link, useParams } from 'react-router-dom';
import MilestoneManager from '../components/MilestoneManager';
import { useAuth } from '../contexts/AuthContext';

// ============================================================
// ContractPage — Trang quản lý tiến độ 1 hợp đồng (route /contracts/:id).
// Mỏng: chỉ lấy :id từ URL và giao toàn bộ phần hiển thị/hành động cho
// <MilestoneManager> (component tự fetch hợp đồng + render milestone).
// Điều hướng tới đây từ ManageJobsPage (nút "Hợp đồng & Milestone").
// ============================================================

export default function ContractPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const backTo = '/contracts';
  const backLabel = user?.role === 'business' ? '← Hợp đồng của tôi' : '← Hợp đồng của tôi';

  if (!id) {
    return (
      <section className="container" style={{ padding: '100px 20px 60px' }}>
        <p>Không tìm thấy mã hợp đồng.</p>
        <Link to={backTo} className="btn btn-ghost btn-sm">{backLabel}</Link>
      </section>
    );
  }

  return (
    <section className="container" style={{ padding: '100px 20px 60px', maxWidth: 1100 }}>
      <div style={{ marginBottom: 16 }}>
        <Link to={backTo} className="btn btn-ghost btn-sm">{backLabel}</Link>
      </div>
      <MilestoneManager contractId={id} />
    </section>
  );
}
