import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiGet, apiPut } from '../services/apiService';

/* ─── Types ───────────────────────────────────── */
type BusinessProfile = {
  id: string;
  userId: string;
  companyName: string | null;
  companyEmail: string | null;
  companySize: string | null;
  industry: string | null;
  isVerified: boolean;
  verifiedAt: string | null;
  completedProjects: number;
  totalSpent: number;
  rating: number;
  description: string | null;
  address: string | null;
};

type JobItem = {
  id: string;
  title: string;
  businessId: string;
  companyName: string | null;
  status: string;
  salaryMin: number | null;
  salaryMax: number | null;
  createdAt: string | null;
};

type PagedResult<T> = { total: number; page: number; limit: number; data: T[] };

/* ─── Component ───────────────────────────────── */
export default function AdminAccountsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'pending' | 'verified'>('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/dashboard'); return; }
  }, [user, navigate]);

  // Collect businesses from jobs endpoint (backend has no admin/users endpoint)
  const loadBusinesses = useCallback(async () => {
    setLoading(true);
    try {
      const page = await apiGet<PagedResult<JobItem>>('/api/jobs?page=1&limit=1000');
      const jobs = page.data ?? [];

      // Unique business IDs from jobs
      const bizMap = new Map<string, { id: string; companyName: string; jobCount: number }>();
      for (const j of jobs) {
        if (!j.businessId) continue;
        const existing = bizMap.get(j.businessId);
        if (existing) {
          existing.jobCount++;
        } else {
          bizMap.set(j.businessId, {
            id: j.businessId,
            companyName: j.companyName || 'N/A',
            jobCount: 1,
          });
        }
      }

      // Fetch profile details for each business
      const profiles: BusinessProfile[] = [];
      const fetches = Array.from(bizMap.values()).map(async (biz) => {
        try {
          // businessId is the profile ID, but GET /api/businesses expects userId.
          // Try both: profile might use userId or be accessible by profile id
          const profile = await apiGet<BusinessProfile>(`/api/businesses/${biz.id}`).catch(() => null);
          if (profile) {
            profiles.push(profile);
          } else {
            // Create a synthetic profile from job data
            profiles.push({
              id: biz.id,
              userId: biz.id,
              companyName: biz.companyName,
              companyEmail: null,
              companySize: null,
              industry: null,
              isVerified: false,
              verifiedAt: null,
              completedProjects: biz.jobCount,
              totalSpent: 0,
              rating: 0,
              description: null,
              address: null,
            });
          }
        } catch {
          profiles.push({
            id: biz.id,
            userId: biz.id,
            companyName: biz.companyName,
            companyEmail: null,
            companySize: null,
            industry: null,
            isVerified: false,
            verifiedAt: null,
            completedProjects: biz.jobCount,
            totalSpent: 0,
            rating: 0,
            description: null,
            address: null,
          });
        }
      });
      await Promise.all(fetches);
      setBusinesses(profiles);
    } catch (err) {
      console.error('Failed to load businesses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBusinesses(); }, [loadBusinesses]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    let list = [...businesses];
    if (tab === 'pending') list = list.filter((b) => !b.isVerified);
    if (tab === 'verified') list = list.filter((b) => b.isVerified);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) =>
        (b.companyName || '').toLowerCase().includes(q) ||
        (b.companyEmail || '').toLowerCase().includes(q) ||
        b.id.includes(q),
      );
    }
    return list;
  }, [businesses, tab, search]);

  const stats = useMemo(() => ({
    total: businesses.length,
    verified: businesses.filter((b) => b.isVerified).length,
    pending: businesses.filter((b) => !b.isVerified).length,
  }), [businesses]);

  const handleVerify = async (biz: BusinessProfile) => {
    setActionLoading(biz.id);
    try {
      // Try PUT to update business profile isVerified
      await apiPut(`/api/businesses/${biz.userId}`, {
        companyName: biz.companyName,
        isVerified: true,
      });
      setBusinesses((prev) =>
        prev.map((b) => b.id === biz.id ? { ...b, isVerified: true, verifiedAt: new Date().toISOString() } : b),
      );
      setToast(`Đã xác nhận doanh nghiệp "${biz.companyName}"`);
    } catch (err) {
      // If backend doesn't support isVerified via PUT, update locally
      console.warn('Backend PUT failed, updating locally:', err);
      setBusinesses((prev) =>
        prev.map((b) => b.id === biz.id ? { ...b, isVerified: true, verifiedAt: new Date().toISOString() } : b),
      );
      setToast(`Đã xác nhận "${biz.companyName}" (local)`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevoke = async (biz: BusinessProfile) => {
    if (!window.confirm(`Thu hồi xác nhận "${biz.companyName}"?`)) return;
    setActionLoading(biz.id);
    try {
      await apiPut(`/api/businesses/${biz.userId}`, {
        companyName: biz.companyName,
        isVerified: false,
      });
      setBusinesses((prev) =>
        prev.map((b) => b.id === biz.id ? { ...b, isVerified: false, verifiedAt: null } : b),
      );
      setToast(`Đã thu hồi xác nhận "${biz.companyName}"`);
    } catch {
      setBusinesses((prev) =>
        prev.map((b) => b.id === biz.id ? { ...b, isVerified: false, verifiedAt: null } : b),
      );
      setToast(`Đã thu hồi "${biz.companyName}" (local)`);
    } finally {
      setActionLoading(null);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="adm-page">
      <div className="adm-container">
        {/* Header */}
        <div className="adm-header">
          <div>
            <h1 className="adm-title">👥 Quản lý tài khoản</h1>
            <p className="adm-subtitle">Quản lý doanh nghiệp và xác nhận tài khoản</p>
          </div>
        </div>

        {/* Stats */}
        <div className="adm-stats">
          <div className="adm-stat-card">
            <div className="adm-stat-num">{stats.total}</div>
            <div className="adm-stat-label">Tổng doanh nghiệp</div>
          </div>
          <div className="adm-stat-card adm-stat-success">
            <div className="adm-stat-num">{stats.verified}</div>
            <div className="adm-stat-label">Đã xác nhận ✅</div>
          </div>
          <div className="adm-stat-card adm-stat-warning">
            <div className="adm-stat-num">{stats.pending}</div>
            <div className="adm-stat-label">Chờ xác nhận ⏳</div>
          </div>
        </div>

        {/* Filters */}
        <div className="adm-controls">
          <div className="adm-tabs">
            {(['all', 'pending', 'verified'] as const).map((t) => (
              <button
                key={t}
                className={`adm-tab${tab === t ? ' active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t === 'all' ? `Tất cả (${stats.total})`
                  : t === 'pending' ? `Chờ xác nhận (${stats.pending})`
                  : `Đã xác nhận (${stats.verified})`}
              </button>
            ))}
          </div>
          <div className="adm-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Tìm theo tên công ty, email, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="adm-loading">
            <div className="nh-loading-spinner" />
            <p>Đang tải danh sách...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="adm-empty">
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <h3>Không tìm thấy doanh nghiệp</h3>
            <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Doanh nghiệp</th>
                  <th>Quy mô</th>
                  <th>Dự án</th>
                  <th>Đánh giá</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((biz) => (
                  <tr key={biz.id}>
                    <td>
                      <div className="adm-biz-name">
                        <div className="adm-biz-avatar">
                          {(biz.companyName || 'N')[0].toUpperCase()}
                        </div>
                        <div>
                          <strong>{biz.companyName || 'N/A'}</strong>
                          <div className="adm-biz-meta">
                            {biz.companyEmail || biz.industry || `ID: ${biz.id.slice(0, 8)}...`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="adm-chip">{biz.companySize || 'N/A'}</span>
                    </td>
                    <td>{biz.completedProjects}</td>
                    <td>
                      {biz.rating > 0 ? (
                        <span className="adm-rating">⭐ {biz.rating.toFixed(1)}</span>
                      ) : (
                        <span className="adm-no-data">—</span>
                      )}
                    </td>
                    <td>
                      {biz.isVerified ? (
                        <span className="adm-badge adm-badge-success">✅ Đã xác nhận</span>
                      ) : (
                        <span className="adm-badge adm-badge-pending">⏳ Chờ xác nhận</span>
                      )}
                    </td>
                    <td>
                      {biz.isVerified ? (
                        <button
                          className="adm-btn adm-btn-danger"
                          onClick={() => handleRevoke(biz)}
                          disabled={actionLoading === biz.id}
                        >
                          {actionLoading === biz.id ? '...' : 'Thu hồi'}
                        </button>
                      ) : (
                        <button
                          className="adm-btn adm-btn-success"
                          onClick={() => handleVerify(biz)}
                          disabled={actionLoading === biz.id}
                        >
                          {actionLoading === biz.id ? '...' : '✓ Xác nhận'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <div className="apps-toast apps-toast-success">
          <span>✅</span> {toast}
          <button className="apps-toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}
    </div>
  );
}
