import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Notification } from '../types/automation';
import { STORAGE_KEYS } from '../constants';
import { notificationService } from '../services/notificationService';
import { useNotifications } from '../contexts/NotificationContext';
import { hasAuthToken } from '../utils/auth';

const TYPE_ICONS: Record<Notification['type'], string> = {
  job_match: 'bx-target-lock',
  application_status: 'bx-file',
  submission_request: 'bx-upload',
  approval: 'bx-check-circle',
  payment: 'bx-wallet',
  system: 'bx-bell',
  reminder: 'bx-time-five',
};

const TYPE_COLOR: Record<Notification['type'], string> = {
  job_match: 'info',
  application_status: 'warning',
  submission_request: 'info',
  approval: 'success',
  payment: 'success',
  system: 'default',
  reminder: 'warning',
};

const TYPE_LABELS: Record<Notification['type'], string> = {
  job_match: 'Gợi ý việc',
  application_status: 'Ứng tuyển',
  submission_request: 'Nộp bài',
  approval: 'Phê duyệt',
  payment: 'Thanh toán',
  system: 'Hệ thống',
  reminder: 'Nhắc nhở',
};

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'vừa xong';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  return `${Math.floor(seconds / 86400)} ngày trước`;
}

/**
 * Resolve the best link for a notification based on its type, actionUrl, and related data.
 */
function resolveNotificationLink(n: Notification, userRole?: string): { url: string; label: string } | null {
  // Route by notification type — type determines destination, not actionUrl
  switch (n.type) {
    case 'application_status':
      // Có ứng viên ứng tuyển → dẫn đến Quản lý Job
      if (userRole === 'business') {
        return { url: '/manage-jobs', label: 'Quản lý Job →' };
      }
      // Sinh viên nhận kết quả ứng tuyển → đơn ứng tuyển
      return { url: '/my-applications', label: 'Xem đơn ứng tuyển →' };

    case 'submission_request':
      // Nộp bài / nộp nhiệm vụ → dẫn đến trang Hợp đồng
      return { url: '/contracts', label: 'Xem hợp đồng →' };

    case 'approval':
      // Nghiệm thu / phê duyệt → dẫn đến trang Hợp đồng
      return { url: '/contracts', label: 'Xem hợp đồng →' };

    case 'job_match':
      return { url: '/jobs', label: 'Tìm việc →' };

    case 'payment':
      return { url: '/wallet', label: 'Xem ví →' };

    case 'reminder':
      return { url: '/contracts', label: 'Xem hợp đồng →' };

    default:
      // system or unknown — fallback to safe pages
      if (n.actionUrl && n.actionUrl.startsWith('/') && !n.actionUrl.startsWith('/jobs/')) {
        return { url: n.actionUrl, label: 'Xem chi tiết →' };
      }
      return { url: '/dashboard', label: 'Về Dashboard →' };
  }
}

function NotificationItem({ notification, onMarkRead, onDelete, apiMode, userRole }: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  apiMode: boolean;
  userRole?: string;
}) {
  const navigate = useNavigate();
  const link = resolveNotificationLink(notification, userRole);

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }
    if (link) {
      navigate(link.url);
    }
  };

  return (
    <div
      className={`nh-item${!notification.isRead ? ' nh-unread' : ''} nh-${TYPE_COLOR[notification.type]}`}
      onClick={handleClick}
      style={{ cursor: link ? 'pointer' : undefined }}
    >
      <div className="nh-item-icon"><i className={`bx ${TYPE_ICONS[notification.type]}`} /></div>
      <div className="nh-item-body">
        <div className="nh-item-top-row">
          <div className="nh-item-title">{notification.title}</div>
          <span className={`nh-type-badge nh-type-${TYPE_COLOR[notification.type]}`}>
            {TYPE_LABELS[notification.type]}
          </span>
        </div>
        <div className="nh-item-msg">{notification.message}</div>
        <div className="nh-item-meta">
          <span className="nh-item-time">{timeAgo(notification.createdAt)}</span>
          {link && (
            <button
              className="nh-item-link"
              onClick={(e) => { e.stopPropagation(); handleClick(); }}
            >
              {link.label} →
            </button>
          )}
        </div>
      </div>
      <div className="nh-item-actions" onClick={(e) => e.stopPropagation()}>
        {!notification.isRead && (
          <button
            className="nh-action-btn nh-action-read"
            onClick={() => onMarkRead(notification.id)}
            title="Đánh dấu đã đọc"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
        )}
        {!apiMode && (
          <button
            className="nh-action-btn nh-action-delete"
            onClick={() => onDelete(notification.id)}
            title="Xóa"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default function NotificationHubPage() {
  const { user } = useAuth();
  const { refresh: refreshBadge } = useNotifications();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all');
  const [categoryFilter, setCategoryFilter] = useState<Notification['type'] | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const apiMode = hasAuthToken();

  const load = useCallback(async () => {
    if (!user) return;
    const role = user.role === 'business' ? 'business' : 'student';
    const rows = await notificationService.list(String(user.id), role, {
      isRead: filterType === 'unread' ? false : undefined,
      page: 1,
    });
    setNotifications(rows);
  }, [user, filterType]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    let cancelled = false;
    load().catch(() => {}).finally(() => { if (!cancelled) setIsLoading(false); });
    const timer = setInterval(() => { load().catch(() => {}); }, 15000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [user, navigate, load]);

  const filtered = useMemo(() => {
    let list = filterType === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;
    if (categoryFilter !== 'all') {
      list = list.filter((n) => n.type === categoryFilter);
    }
    return list;
  }, [notifications, filterType, categoryFilter]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  // Count by type for category filter badges
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const base = filterType === 'unread' ? notifications.filter(n => !n.isRead) : notifications;
    for (const n of base) {
      counts[n.type] = (counts[n.type] || 0) + 1;
    }
    return counts;
  }, [notifications, filterType]);

  const handleMarkRead = useCallback(async (id: string) => {
    await notificationService.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    refreshBadge();
  }, [refreshBadge]);

  const handleDelete = useCallback((id: string) => {
    notificationService.deleteLocal(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    refreshBadge();
  }, [refreshBadge]);

  const handleMarkAllRead = useCallback(async () => {
    await notificationService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    refreshBadge();
  }, [refreshBadge]);

  const handleClearAll = useCallback(() => {
    if (apiMode) {
      window.alert('Thông báo trên server không hỗ trợ xóa hàng loạt.');
      return;
    }
    if (!window.confirm('Xoá tất cả thông báo?')) return;
    setNotifications([]);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, '[]');
  }, [apiMode]);

  if (isLoading) {
    return (
      <div className="nh-page">
        <div className="nh-container">
          <div className="nh-loading">
            <div className="nh-loading-spinner" />
            <p>Đang tải thông báo...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nh-page">
      <div className="nh-container">
        {/* Header */}
        <div className="nh-header">
          <div className="nh-header-left">
            <h1 className="nh-title">
              <span className="nh-title-icon"><i className="bx bx-bell" /></span>
              Trung tâm thông báo
            </h1>
            <p className="nh-subtitle">
              {apiMode ? 'Đồng bộ từ API backend' : 'Thông báo cục bộ (localStorage)'}
            </p>
          </div>
          <div className="nh-header-stats">
            <div className="nh-stat-chip">
              <span className="nh-stat-num">{notifications.length}</span>
              <span className="nh-stat-lbl">Tổng</span>
            </div>
            <div className="nh-stat-chip nh-stat-unread">
              <span className="nh-stat-num">{unreadCount}</span>
              <span className="nh-stat-lbl">Chưa đọc</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="nh-controls">
          <div className="nh-filters">
            <button
              className={`nh-filter-btn${filterType === 'all' ? ' active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              Tất cả <span className="nh-filter-count">{notifications.length}</span>
            </button>
            <button
              className={`nh-filter-btn${filterType === 'unread' ? ' active' : ''}`}
              onClick={() => setFilterType('unread')}
            >
              Chưa đọc <span className="nh-filter-count">{unreadCount}</span>
            </button>
          </div>
          <div className="nh-bulk-actions">
            {unreadCount > 0 && (
              <button className="nh-bulk-btn" onClick={handleMarkAllRead}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Đánh dấu tất cả đã đọc
              </button>
            )}
            {!apiMode && notifications.length > 0 && (
              <button className="nh-bulk-btn nh-bulk-danger" onClick={handleClearAll}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                </svg>
                Xóa tất cả
              </button>
            )}
          </div>
        </div>

        {/* Category filter chips */}
        {Object.keys(typeCounts).length > 1 && (
          <div className="nh-category-filters">
            <button
              className={`nh-cat-chip${categoryFilter === 'all' ? ' active' : ''}`}
              onClick={() => setCategoryFilter('all')}
            >
              Tất cả
            </button>
            {(Object.entries(typeCounts) as [Notification['type'], number][]).map(([type, count]) => (
              <button
                key={type}
                className={`nh-cat-chip${categoryFilter === type ? ' active' : ''}`}
                onClick={() => setCategoryFilter(type)}
              >
                <i className={`bx ${TYPE_ICONS[type]}`} /> {TYPE_LABELS[type]} <span className="nh-cat-count">{count}</span>
              </button>
            ))}
          </div>
        )}

        {/* List */}
        {filtered.length === 0 ? (
          <div className="nh-empty">
            <div className="nh-empty-icon"><i className={`bx ${filterType === 'unread' ? 'bx-inbox' : 'bx-bell'}`} /></div>
            <h3>{filterType === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo'}</h3>
            <p>{filterType === 'unread' ? 'Tất cả đã được đọc!' : 'Bạn sẽ nhận thông báo khi có điều gì mới.'}</p>
          </div>
        ) : (
          <div className="nh-list">
            {filtered.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
                apiMode={apiMode}
                userRole={user?.role}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
