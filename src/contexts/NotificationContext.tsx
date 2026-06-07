import { createContext, useContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';
// import { hasAuthToken } from '../utils/auth';

interface NotificationState {
  unreadCount: number;
  refresh: () => void;
}

const NotificationContext = createContext<NotificationState>({ unreadCount: 0, refresh: () => {} });

const POLL_INTERVAL = 20_000;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const refresh = useCallback(async () => {
    if (!user) { setUnreadCount(0); return; }
    const role = user.role === 'business' ? 'business' : 'student';
    try {
      const list = await notificationService.list(String(user.id), role, { isRead: false, page: 1 });
      setUnreadCount(list.length);
    } catch {
      // silent
    }
  }, [user]);

  useEffect(() => {
    refresh();
    if (timerRef.current) clearInterval(timerRef.current);
    if (user) {
      timerRef.current = setInterval(refresh, POLL_INTERVAL);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [user, refresh]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refresh }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
