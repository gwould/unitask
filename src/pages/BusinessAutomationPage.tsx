import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { applicationsData, jobsData } from '../data/mockData';
import { STORAGE_KEYS } from '../constants';
import type { Application, Transaction } from '../types';
import { formatMoney } from '../utils/format';

function loadCustomJobs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_JOBS) || '[]') as typeof jobsData;
  } catch {
    return [] as typeof jobsData;
  }
}

function loadApplications() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLICATIONS) || '[]') as Application[];
    return [...applicationsData, ...stored];
  } catch {
    return applicationsData as Application[];
  }
}

function loadUserTransactions(userId: string): Transaction[] {
  try {
    const perUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_TRANSACTIONS) || '{}') as Record<string, Transaction[]>;
    if (perUser[userId]?.length) return perUser[userId];
  } catch {
    // fallback below
  }
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]') as Transaction[];
    return all.filter((tx) => tx.userId === userId);
  } catch {
    return [];
  }
}

function pct(value: number, total: number) {
  if (!total) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

export default function BusinessAutomationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
    else if (user.role !== 'business') navigate('/dashboard');
  }, [navigate, user]);

  const model = useMemo(() => {
    if (!user || user.role !== 'business') {
      return {
        postedJobs: 0,
        applicants: 0,
        accepted: 0,
        submitted: 0,
        completed: 0,
        conversionApplyToAccept: '0%',
        conversionAcceptToComplete: '0%',
        revenueReleased: 0,
        monthlyTarget: 10,
        targetProgress: 0,
      };
    }

    const allJobs = [...jobsData, ...loadCustomJobs()].filter((j) => j.companyId === user.id);
    const jobIds = new Set(allJobs.map((j) => j.id));

    const apps = loadApplications().filter((a) => jobIds.has(a.jobId));
    const accepted = apps.filter((a) => a.status === 'accepted' || a.status === 'completed').length;
    const submitted = apps.filter((a) => a.submission && (a.submission.reviewStatus === 'submitted' || a.submission.reviewStatus === 'revision_requested' || a.submission.reviewStatus === 'approved')).length;
    const completed = apps.filter((a) => a.status === 'completed').length;

    const txs = loadUserTransactions(String(user.id));
    const release = Math.abs(
      txs
        .filter((tx) => tx.type === 'escrow_release' && tx.status === 'completed')
        .reduce((sum, tx) => sum + tx.amount, 0)
    );

    const monthlyTarget = 10;
    const targetProgress = Math.min(100, Math.round((completed / monthlyTarget) * 100));

    return {
      postedJobs: allJobs.length,
      applicants: apps.length,
      accepted,
      submitted,
      completed,
      conversionApplyToAccept: pct(accepted, apps.length),
      conversionAcceptToComplete: pct(completed, accepted),
      revenueReleased: release,
      monthlyTarget,
      targetProgress,
    };
  }, [user]);

  if (!user || user.role !== 'business') return null;

  const tasks = [
    {
      title: 'Giữ ít nhất 3 job đang mở',
      done: model.postedJobs >= 3,
      detail: `${model.postedJobs}/3 job đang hoạt động`,
      to: '/post-job',
      action: 'Đăng thêm job',
    },
    {
      title: 'Phản hồi ứng viên trong 24h',
      done: model.conversionApplyToAccept !== '0%',
      detail: `Tỉ lệ chấp nhận hiện tại: ${model.conversionApplyToAccept}`,
      to: '/manage-jobs',
      action: 'Xử lý ứng viên',
    },
    {
      title: 'Duyệt bài và giải ngân nhanh',
      done: model.conversionAcceptToComplete !== '0%',
      detail: `Tỉ lệ hoàn thành sau nhận: ${model.conversionAcceptToComplete}`,
      to: '/manage-jobs',
      action: 'Mở danh sách bài nộp',
    },
    {
      title: 'Theo dõi dòng tiền Escrow',
      done: model.revenueReleased > 0,
      detail: `Đã giải ngân: ${formatMoney(model.revenueReleased)}`,
      to: '/wallet',
      action: 'Xem giao dịch',
    },
  ];

  return (
    <section className="page-business-automation">
      <div className="container">
        <div className="biz-auto-head fade-up">
          <div>
            <div className="section-eyebrow">Business Operating System</div>
            <h1>Đích đến rõ ràng cho doanh nghiệp</h1>
            <p>
              North Star: <strong>tăng số job hoàn thành mỗi tháng</strong> với thời gian duyệt nhanh,
              dòng tiền minh bạch và quy trình tự động.
            </p>
          </div>
          <Link to="/manage-jobs" className="btn btn-primary">Đi tới trung tâm vận hành</Link>
        </div>

        <div className="biz-auto-grid fade-up">
          <div className="biz-auto-card">
            <div className="biz-auto-label">Mục tiêu 30 ngày</div>
            <div className="biz-auto-big">{model.completed}/{model.monthlyTarget} job hoàn thành</div>
            <div className="biz-auto-progress">
              <div className="biz-auto-progress-fill" style={{ width: `${model.targetProgress}%` }} />
            </div>
            <div className="biz-auto-sub">Tiến độ: {model.targetProgress}%</div>
          </div>

          <div className="biz-auto-card">
            <div className="biz-auto-label">Escrow đã giải ngân</div>
            <div className="biz-auto-big">{formatMoney(model.revenueReleased)}</div>
            <div className="biz-auto-sub">Tổng tiền đã thanh toán cho sinh viên</div>
          </div>
        </div>

        <div className="biz-funnel fade-up">
          <h2>Funnel tự động hóa</h2>
          <div className="biz-funnel-row">
            <div className="biz-funnel-item">
              <span>Job đăng</span>
              <strong>{model.postedJobs}</strong>
            </div>
            <div className="biz-funnel-arrow">→</div>
            <div className="biz-funnel-item">
              <span>Ứng viên</span>
              <strong>{model.applicants}</strong>
            </div>
            <div className="biz-funnel-arrow">→</div>
            <div className="biz-funnel-item">
              <span>Đã nhận</span>
              <strong>{model.accepted}</strong>
            </div>
            <div className="biz-funnel-arrow">→</div>
            <div className="biz-funnel-item">
              <span>Đã nộp bài</span>
              <strong>{model.submitted}</strong>
            </div>
            <div className="biz-funnel-arrow">→</div>
            <div className="biz-funnel-item">
              <span>Hoàn thành</span>
              <strong>{model.completed}</strong>
            </div>
          </div>
          <div className="biz-funnel-note">
            Tỉ lệ chấp nhận: <strong>{model.conversionApplyToAccept}</strong> · Tỉ lệ hoàn thành: <strong>{model.conversionAcceptToComplete}</strong>
          </div>
        </div>

        <div className="biz-checklist fade-up">
          <h2>Checklist hành động ưu tiên</h2>
          <div className="biz-checklist-list">
            {tasks.map((task) => (
              <div key={task.title} className="biz-task-row">
                <div className={`biz-task-status${task.done ? ' done' : ''}`}>{task.done ? '✓' : '•'}</div>
                <div className="biz-task-main">
                  <div className="biz-task-title">{task.title}</div>
                  <div className="biz-task-detail">{task.detail}</div>
                </div>
                <Link to={task.to} className="btn btn-ghost btn-sm">{task.action}</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
