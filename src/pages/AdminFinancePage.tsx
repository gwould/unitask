import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { applicationsData, jobsData } from '../data/mockData';
import { STORAGE_KEYS } from '../constants';
import { formatMoney } from '../utils/format';
import type { Transaction, User } from '../types';

interface AppRecord {
  id: string;
  jobId: number;
  userId: string;
  coverLetter: string;
  status: string;
  appliedAt: string;
}

interface RevenueLine {
  label: string;
  amount: number;
  share: number;
  note: string;
}

interface DailyRevenuePoint {
  date: string;
  total: number;
}

function toDateKey(date: string): string {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export default function AdminFinancePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
    else if (user.role !== 'admin') navigate('/dashboard');
  }, [user, navigate]);

  const accounts = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNTS) || '[]') as Array<User & { password?: string }>;
    } catch {
      return [];
    }
  }, []);

  const customJobs = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_JOBS) || '[]') as typeof jobsData;
    } catch {
      return [];
    }
  }, []);

  const apps = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLICATIONS) || '[]') as AppRecord[];
      return [...applicationsData, ...stored];
    } catch {
      return applicationsData;
    }
  }, []);

  const txs = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]') as Transaction[];
    } catch {
      return [];
    }
  }, []);

  const allJobs = useMemo(() => [...jobsData, ...customJobs], [customJobs]);

  const completedTxs = useMemo(
    () => txs.filter((t) => t.status === 'completed'),
    [txs]
  );

  const completedEscrows = useMemo(
    () => completedTxs.filter((t) => t.type === 'escrow_in').reduce((s, t) => s + Math.abs(t.amount), 0),
    [completedTxs]
  );

  const completedReleases = useMemo(
    () => completedTxs.filter((t) => t.type === 'escrow_release').reduce((s, t) => s + Math.abs(t.amount), 0),
    [completedTxs]
  );

  const grossPostedValue = useMemo(
    () => allJobs.reduce((sum, j) => sum + (Number(j.payMax) || Number(j.payMin) || 0), 0),
    [allJobs]
  );

  const paidApplications = useMemo(
    () => apps.filter((a) => a.status === 'accepted' || a.status === 'completed').length,
    [apps]
  );

  const totalStudents = useMemo(
    () => accounts.filter((a) => a.role === 'student').length,
    [accounts]
  );

  const totalBusinesses = useMemo(
    () => accounts.filter((a) => a.role === 'business').length,
    [accounts]
  );

  const avgJobValue = allJobs.length > 0 ? Math.round(grossPostedValue / allJobs.length) : 0;

  // Revenue model applied on completed transactions only.
  const PLATFORM_TAKE_RATE = 0.1;
  const PLATFORM_ESCROW_FEE = 0.02;

  const commissionRevenue = Math.round(completedReleases * PLATFORM_TAKE_RATE);
  const escrowFeeRevenue = Math.round(completedEscrows * PLATFORM_ESCROW_FEE);
  const totalRevenue = commissionRevenue + escrowFeeRevenue;

  const dailyRevenue = useMemo<DailyRevenuePoint[]>(() => {
    const map = new Map<string, number>();

    completedTxs.forEach((tx) => {
      const key = toDateKey(tx.date);
      if (!key) return;

      let amount = 0;
      if (tx.type === 'escrow_release') {
        amount = Math.round(Math.abs(tx.amount) * PLATFORM_TAKE_RATE);
      } else if (tx.type === 'escrow_in') {
        amount = Math.round(Math.abs(tx.amount) * PLATFORM_ESCROW_FEE);
      }

      map.set(key, (map.get(key) || 0) + amount);
    });

    const entries = Array.from(map.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return entries.slice(-7);
  }, [completedTxs]);

  const chartMax = useMemo(
    () => Math.max(...dailyRevenue.map((d) => d.total), 1),
    [dailyRevenue]
  );

  const linePoints = useMemo(() => {
    if (dailyRevenue.length === 0) return '';
    return dailyRevenue
      .map((point, i) => {
        const x = (i / Math.max(dailyRevenue.length - 1, 1)) * 100;
        const y = 100 - (point.total / chartMax) * 100;
        return `${x},${y}`;
      })
      .join(' ');
  }, [dailyRevenue, chartMax]);

  const revenueLines: RevenueLine[] = [
    {
      label: 'Phí hoa hồng giao dịch',
      amount: commissionRevenue,
      share: totalRevenue ? (commissionRevenue / totalRevenue) * 100 : 0,
      note: '10% trên escrow_release ở trạng thái completed',
    },
    {
      label: 'Phí dịch vụ Escrow',
      amount: escrowFeeRevenue,
      share: totalRevenue ? (escrowFeeRevenue / totalRevenue) * 100 : 0,
      note: '2% trên escrow_in ở trạng thái completed',
    },
  ];

  if (!user || user.role !== 'admin') return null;

  return (
    <section className="page-admin-finance">
      <div className="container">
        <div className="admin-finance-head fade-up visible">
          <div>
            <h1>📈 Admin Finance Dashboard</h1>
            <p>Thống kê tổng quan dòng tiền và các cách kiếm tiền của UniTask.</p>
          </div>
          <div className="admin-finance-actions">
            <Link to="/dashboard" className="btn btn-ghost btn-sm">Dashboard chung</Link>
            <Link to="/jobs" className="btn btn-primary btn-sm">Xem marketplace</Link>
          </div>
        </div>

        <div className="admin-kpis fade-up visible">
          <div className="admin-kpi-card">
            <div className="admin-kpi-label">Tổng doanh thu hệ thống</div>
            <div className="admin-kpi-value">{formatMoney(totalRevenue)}</div>
            <div className="admin-kpi-sub">Doanh thu thực ghi nhận từ giao dịch completed</div>
          </div>
          <div className="admin-kpi-card">
            <div className="admin-kpi-label">GMV job đã đăng</div>
            <div className="admin-kpi-value">{formatMoney(grossPostedValue)}</div>
            <div className="admin-kpi-sub">{allJobs.length} job, trung bình {formatMoney(avgJobValue)}/job</div>
          </div>
          <div className="admin-kpi-card">
            <div className="admin-kpi-label">Escrow nạp / giải phóng</div>
            <div className="admin-kpi-value">{formatMoney(completedEscrows)} / {formatMoney(completedReleases)}</div>
            <div className="admin-kpi-sub">Chỉ tính giao dịch completed</div>
          </div>
          <div className="admin-kpi-card">
            <div className="admin-kpi-label">Funnel thị trường</div>
            <div className="admin-kpi-value">{totalBusinesses} DN · {totalStudents} SV</div>
            <div className="admin-kpi-sub">{paidApplications} hồ sơ đã được nhận/hoàn thành</div>
          </div>
        </div>

        <div className="admin-finance-grid">
          <div className="admin-panel admin-chart-panel fade-up visible">
            <h2>Biểu đồ doanh thu theo ngày (7 ngày gần nhất)</h2>
            {dailyRevenue.length === 0 ? (
              <p className="admin-note">Chưa có giao dịch completed để vẽ biểu đồ doanh thu.</p>
            ) : (
              <>
                <div className="admin-bar-chart">
                  {dailyRevenue.map((point) => (
                    <div key={point.date} className="admin-bar-item" title={`${point.date}: ${formatMoney(point.total)}`}>
                      <div className="admin-bar-wrap">
                        <div className="admin-bar-fill" style={{ height: `${(point.total / chartMax) * 100}%` }} />
                      </div>
                      <div className="admin-bar-date">{point.date.slice(5)}</div>
                    </div>
                  ))}
                </div>
                <div className="admin-line-chart">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Doanh thu theo ngày">
                    <polyline points={linePoints} />
                  </svg>
                </div>
              </>
            )}
          </div>

          <div className="admin-panel fade-up visible">
            <h2>Cách hệ thống kiếm tiền</h2>
            <div className="admin-revenue-list">
              {revenueLines.map((line) => (
                <div key={line.label} className="admin-revenue-row">
                  <div>
                    <div className="admin-revenue-name">{line.label}</div>
                    <div className="admin-revenue-note">{line.note}</div>
                  </div>
                  <div className="admin-revenue-right">
                    <div className="admin-revenue-value">{formatMoney(line.amount)}</div>
                    <div className="admin-revenue-share">{line.share.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-panel fade-up visible">
            <h2>Tình hình vận hành</h2>
            <ul className="admin-metrics-list">
              <li>Tổng số job đang có: <strong>{allJobs.length}</strong></li>
              <li>Hồ sơ ứng tuyển đã ghi nhận: <strong>{apps.length}</strong></li>
              <li>Tỷ lệ chấp nhận: <strong>{apps.length ? ((paidApplications / apps.length) * 100).toFixed(1) : '0.0'}%</strong></li>
              <li>Giá trị job trung bình: <strong>{formatMoney(avgJobValue)}</strong></li>
              <li>Tổng người dùng hệ thống: <strong>{accounts.length}</strong></li>
              <li>Giao dịch completed: <strong>{completedTxs.length}</strong></li>
            </ul>
            <p className="admin-note">Lưu ý: Dashboard đang dùng dữ liệu localStorage của môi trường demo hiện tại.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
