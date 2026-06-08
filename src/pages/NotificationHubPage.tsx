import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Notification } from '../types/automation';
import { STORAGE_KEYS } from '../constants';
import { notificationService } from '../services/notificationService';
import { useNotifications } from '../contexts/NotificationContext';
import { hasAuthToken } from '../utils/auth';

const TYPE_ICONS: Record<Notification['type'], string> = {
  job_match: '🎯',
  application_status: '📋',
  submission_request: '📤',
  approval: '✅',
  payment: '💰',
  system: '🔔',
  reminder: '⏰',
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

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'vừa xong';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  return `${Math.floor(seconds / 86400)} ngày trước`;
}

function NotificationItem({ notification, onMarkRead, onDelete, apiMode }: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  apiMode: boolean;
}) {
  return (
    <div className={`nh-item${!notification.isRead ? ' nh-unread' : ''} nh-${TYPE_COLOR[notification.type]}`}>
      <div className="nh-item-icon">{TYPE_ICONS[notification.type]}</div>
      <div className="nh-item-body">
        <div className="nh-item-title">{notification.title}</div>
        <div className="nh-item-msg">{notification.message}</div>
        <div className="nh-item-meta">
          <span className="nh-item-time">{timeAgo(notification.createdAt)}</span>
          {notification.actionUrl && (
            <Link to={notification.actionUrl} className="nh-item-link">
              Xem chi tiết →
            </Link>
          )}
        </div>
      </div>
      <div className="nh-item-actions">
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

  const filtered = useMemo(() =>
    filterType === 'unread' ? notifications.filter((n) => !n.isRead) : notifications,
    [notifications, filterType],
  );

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
              <span className="nh-title-icon">🔔</span>
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

        {/* List */}
        {filtered.length === 0 ? (
          <div className="nh-empty">
            <div className="nh-empty-icon">{filterType === 'unread' ? '📭' : '🔔'}</div>
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
