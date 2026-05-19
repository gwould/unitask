import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { STORAGE_KEYS } from '../constants';
import type { Notification } from '../types/automation';
import { simulateDelay } from '../utils/async';

/* ─── HELPERS ─────────────────────────────────────── */

function loadNotifications(recipientId: string): Notification[] {
  try {
    const all: Notification[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    return all
      .filter((n) => n.recipientId === recipientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

function saveNotifications(notifications: Notification[]) {
  try {
    const all: Notification[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    const ids = new Set(notifications.map((n) => n.id));
    const kept = all.filter((n) => !ids.has(n.id));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([...notifications, ...kept]));
  } catch {
    // Ignore storage errors in demo mode.
  }
}

/* ─── SUB COMPONENTS ──────────────────────────────── */

function NotificationItem({ notification, onMarkRead, onDelete }: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
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
            <a href={notification.actionUrl} className="notif-action-link">
              Xem chi tiết →
            </a>
          )}
        </div>
      </div>
      <div className="notif-actions">
        {!notification.isRead && (
          <button className="btn-icon" onClick={() => onMarkRead(notification.id)} title="Đã đọc">
            ✓
          </button>
        )}
        <button className="btn-icon" onClick={() => onDelete(notification.id)} title="Xóa">
          ✕
        </button>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ───────────────────────────────────── */

export default function NotificationHubPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    let cancelled = false;
    simulateDelay(300).then(() => {
      if (cancelled) return;
      setNotifications(loadNotifications(user.id));
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user, navigate]);

  const filtered = useMemo(() => {
    if (filterType === 'unread') {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, filterType]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const handleMarkRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const handleDelete = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    if (!window.confirm('Xoá tất cả thông báo?')) return;
    setNotifications([]);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, '[]');
  }, []);

  if (isLoading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page-notifications">
      <div className="page-header">
        <div>
          <h1>🔔 Trung tâm thông báo</h1>
          <p>Quản lý tất cả thông báo tự động từ hệ thống</p>
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
          {notifications.length > 0 && (
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
          {filtered.map((notification: Notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
