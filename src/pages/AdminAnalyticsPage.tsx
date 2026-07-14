import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { analyticsService, type AnalyticsOverview } from '../services/analyticsService';

const RANGE_OPTIONS = [
  { label: '7 ngày', value: 7 },
  { label: '28 ngày', value: 28 },
  { label: '90 ngày', value: 90 },
];

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}p ${s}s`;
}

export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [days, setDays] = useState(28);
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) navigate('/login');
    else if (user.role !== 'admin') navigate('/dashboard');
  }, [user, navigate]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    analyticsService.getOverview(days)
      .then((res) => { if (!cancelled) setData(res); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Không tải được dữ liệu GA4.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [days]);

  if (!user || user.role !== 'admin') return null;

  return (
    <section className="page-admin-finance">
      <div className="container">
        <div className="admin-finance-head fade-up visible">
          <div>
            <h1><i className="bx bxl-google" /> Analytics</h1>
            <p>Số liệu truy cập thật từ Google Analytics 4.</p>
          </div>
          <div className="admin-finance-actions">
            <div className="admin-range-switch">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`btn btn-sm ${days === opt.value ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setDays(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost btn-sm"
            >
              <i className="bx bx-link-external" /> Mở GA4
            </a>
          </div>
        </div>

        {loading && (
          <div className="admin-panel fade-up visible">
            <p className="admin-note">Đang tải số liệu GA4…</p>
          </div>
        )}

        {!loading && error && (
          <div className="admin-panel fade-up visible">
            <p className="admin-note">Lỗi: {error}</p>
          </div>
        )}

        {!loading && !error && data && !data.configured && (
          <div className="admin-panel fade-up visible">
            <h2>Chưa cấu hình Google Analytics Data API</h2>
            <p className="admin-note">
              Backend cần 2 biến môi trường: <strong>GoogleAnalytics__PropertyId</strong> (GA4 Property ID dạng số)
              và <strong>GoogleAnalytics__ServiceAccountJson</strong> (JSON của Service Account trên Google Cloud,
              đã được cấp quyền Viewer trên property đó). Xem chú thích trong <code>.env.example</code> ở backend
              để biết cách lấy 2 giá trị này. Sau khi thêm và khởi động lại backend, trang này sẽ tự hiển thị số liệu thật.
            </p>
          </div>
        )}

        {!loading && !error && data && data.configured && (
          <>
            <div className="admin-kpis fade-up visible">
              <div className="admin-kpi-card">
                <div className="admin-kpi-label">Đang hoạt động</div>
                <div className="admin-kpi-value">{data.activeUsersNow}</div>
                <div className="admin-kpi-sub">Người dùng trên site ngay lúc này</div>
              </div>
              <div className="admin-kpi-card">
                <div className="admin-kpi-label">Người dùng</div>
                <div className="admin-kpi-value">{data.totalUsers}</div>
                <div className="admin-kpi-sub">{data.newUsers} người dùng mới</div>
              </div>
              <div className="admin-kpi-card">
                <div className="admin-kpi-label">Phiên truy cập</div>
                <div className="admin-kpi-value">{data.sessions}</div>
                <div className="admin-kpi-sub">Tỷ lệ thoát {(data.bounceRate * 100).toFixed(1)}%</div>
              </div>
              <div className="admin-kpi-card">
                <div className="admin-kpi-label">Lượt xem trang</div>
                <div className="admin-kpi-value">{data.pageViews}</div>
                <div className="admin-kpi-sub">TB {formatDuration(data.avgSessionDurationSeconds)}/phiên</div>
              </div>
            </div>

            <div className="admin-finance-grid">
              <div className="admin-panel fade-up visible">
                <h2>Trang xem nhiều nhất</h2>
                {data.topPages.length === 0 ? (
                  <p className="admin-note">Chưa có dữ liệu.</p>
                ) : (
                  <div className="admin-revenue-list">
                    {data.topPages.map((p) => (
                      <div key={p.path} className="admin-revenue-row">
                        <div>
                          <div className="admin-revenue-name">{p.path}</div>
                        </div>
                        <div className="admin-revenue-value">{p.views}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="admin-panel fade-up visible">
                <h2>Nguồn truy cập</h2>
                {data.trafficSources.length === 0 ? (
                  <p className="admin-note">Chưa có dữ liệu.</p>
                ) : (
                  <div className="admin-revenue-list">
                    {data.trafficSources.map((s) => (
                      <div key={s.source} className="admin-revenue-row">
                        <div>
                          <div className="admin-revenue-name">{s.source}</div>
                        </div>
                        <div className="admin-revenue-value">{s.sessions}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
