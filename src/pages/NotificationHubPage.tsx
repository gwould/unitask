import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Notification } from '../types/automation';
import { STORAGE_KEYS } from '../constants';
import { notificationService } from '../services/notificationService';
import { useNotifications } from '../contexts/NotificationContext';
import { hasAuthToken } from '../utils/auth';

function NotificationItem({ notification, onMarkRead, onDelete, apiMode }: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  apiMode: boolean;
}) {
  const icons: Record<Notification['type'], string> = {
    job_match: '🎯',
    application_status: '📋',
    submission_request: '📤',
    approval: '✅',
    payment: '💰',
    system: '🔔',
    reminder: '⏰',
  };

  const getColor = (type: Notification['type']) => {
    const colors: Record<Notification['type'], string> = {
      job_match: 'info',
      application_status: 'warning',
      submission_request: 'info',
      approval: 'success',
      payment: 'success',
      system: 'default',
      reminder: 'warning',
    };
    return colors[type];
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    if (seconds < 60) return 'vừa xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    return `${Math.floor(seconds / 86400)} ngày trước`;
  };

  return (
    <div className={`notif-item${!notification.isRead ? ' unread' : ''} notif-${getColor(notification.type)}`}>
      <div className="notif-icon">{icons[notification.type]}</div>
      <div className="notif-content">
        <div className="notif-title">{notification.title}</div>
        <div className="notif-message">{notification.message}</div>
        <div className="notif-meta">
          <span className="notif-time">{timeAgo(notification.createdAt)}</span>
          {notification.actionUrl && (
            <Link to={notification.actionUrl} className="notif-action-link">
              Xem chi tiết →
            </Link>
          )}
        </div>
      </div>
      <div className="notif-actions">
        {!notification.isRead && (
          <button className="btn-icon" onClick={() => onMarkRead(notification.id)} title="Đã đọc">
            ✓
          </button>
        )}
        {!apiMode && (
          <button className="btn-icon" onClick={() => onDelete(notification.id)} title="Xóa">
            ✕
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
    if (!user) {
      navigate('/login');
      return;
    }

    let cancelled = false;
    load()
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    const timer = setInterval(() => { load().catch(() => {}); }, 15000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [user, navigate, load]);

  const filtered = useMemo(() => {
    if (filterType === 'unread') {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, filterType]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

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
  }, []);

  const handleClearAll = useCallback(() => {
    if (apiMode) {
      window.alert('Thông báo trên server không hỗ trợ xóa hàng loạt. Dùng "Đánh dấu đã đọc".');
      return;
    }
    if (!window.confirm('Xoá tất cả thông báo?')) return;
    setNotifications([]);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, '[]');
  }, [apiMode]);

  if (isLoading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page-notifications">
      <div className="page-header">
        <div>
          <h1>🔔 Trung tâm thông báo</h1>
          <p>{apiMode ? 'Đồng bộ từ API backend' : 'Thông báo demo (localStorage)'}</p>
        </div>
      </div>

      <div className="notif-stats">
        <div className="notif-stat">
          <span className="notif-number">{notifications.length}</span>
          <span className="notif-label">Tổng thông báo</span>
        </div>
        <div className="notif-stat">
          <span className="notif-number" style={{ color: '#ff4444' }}>{unreadCount}</span>
          <span className="notif-label">Chưa đọc</span>
        </div>
      </div>

      <div className="notif-controls">
        <div className="notif-filters">
          <button className={`filter-btn${filterType === 'all' ? ' active' : ''}`} onClick={() => setFilterType('all')}>
            Tất cả ({notifications.length})
          </button>
          <button className={`filter-btn${filterType === 'unread' ? ' active' : ''}`} onClick={() => setFilterType('unread')}>
            Chưa đọc ({unreadCount})
          </button>
        </div>
        <div className="notif-quick-actions">
          {unreadCount > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={handleMarkAllRead}>
              ✓ Đánh dấu tất cả là đã đọc
            </button>
          )}
          {!apiMode && notifications.length > 0 && (
            <button className="btn btn-danger-ghost btn-sm" onClick={handleClearAll}>
              🗑️ Xóa tất cả
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="notif-empty-state">
          <div className="notif-empty-icon">{filterType === 'unread' ? '📭' : '🔔'}</div>
          <h3>{filterType === 'unread' ? 'Không có thông báo chưa đọc' : 'Không có thông báo'}</h3>
          <p>
            {filterType === 'unread'
              ? 'Tất cả thông báo đã được đọc!'
              : 'Bạn sẽ nhận được thông báo khi có điều gì mới'}
          </p>
        </div>
      ) : (
        <div className="notif-list">
          {filtered.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
              apiMode={apiMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
