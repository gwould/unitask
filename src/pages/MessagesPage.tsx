import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { conversationService } from '../services/conversationService';
import { hasAuthToken } from '../utils/auth';
import type { Conversation, ChatMessage } from '../types/messaging';
import { ReportModal, Toast } from '../components/ui';

export default function MessagesPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  // Tìm kiếm & lọc hội thoại
  const [convSearch, setConvSearch] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string } | null>(null);
  const [reportToast, setReportToast] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const activeId = conversationId ?? conversations[0]?.id;
  const activeConversation = conversations.find((c) => c.id === activeId);

  // Hội thoại sau khi áp dụng tìm kiếm (tên/nội dung gần nhất) + lọc chưa đọc
  const filteredConversations = conversations.filter((c) => {
    const q = convSearch.trim().toLowerCase();
    const matchSearch =
      q === '' ||
      (c.otherUser.name ?? '').toLowerCase().includes(q) ||
      (c.lastMessage ?? '').toLowerCase().includes(q);
    const matchUnread = !unreadOnly || c.unreadCount > 0;
    return matchSearch && matchUnread;
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!hasAuthToken()) {
      setError('Đăng nhập qua API để sử dụng tin nhắn.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    conversationService.list()
      .then((rows) => {
        if (!cancelled) {
          setConversations(rows);
          if (!conversationId && rows[0]) {
            navigate(`/messages/${rows[0].id}`, { replace: true });
          }
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Không tải được hội thoại');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [user, navigate, conversationId]);

  useEffect(() => {
    if (!user || !activeId || !hasAuthToken()) return;
    let cancelled = false;

    const fetchMessages = () => {
      conversationService.getMessages(activeId, String(user.id))
        .then((rows) => {
          if (!cancelled) setMessages(rows);
        })
        .catch(() => {
          if (!cancelled) setMessages([]);
        });
    };

    fetchMessages();
    const timer = setInterval(fetchMessages, 5000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [user, activeId]);

  useEffect(() => {
    if (!user || !hasAuthToken()) return;
    const timer = setInterval(() => {
      conversationService.list()
        .then((rows) => setConversations(rows))
        .catch(() => {});
    }, 15000);
    return () => clearInterval(timer);
  }, [user]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const text = draft.trim();
    if (!text || !activeId || !user) return;

    setSending(true);
    setDraft('');
    try {
      await conversationService.sendMessage(activeId, text);
      const optimistic: ChatMessage = {
        id: `local-${Date.now()}`,
        conversationId: activeId,
        senderId: String(user.id),
        senderName: user.name,
        content: text,
        createdAt: new Date().toISOString(),
        isMine: true,
        isRead: false,
      };
      setMessages((prev) => [...prev, optimistic]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? { ...c, lastMessage: text, lastMessageAt: new Date().toISOString() }
            : c,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gửi tin nhắn thất bại');
      setDraft(text);
    } finally {
      setSending(false);
    }
  }, [activeId, draft, user]);

  if (!user) return null;

  return (
    <section className="page-messages">
      <div className="container">
        <div className="msg-header fade-up">
          <h1>💬 Tin nhắn</h1>
          <p>Trao đổi trực tiếp với sinh viên hoặc doanh nghiệp</p>
        </div>

        {error && !loading && (
          <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-2)' }}>Đang tải...</div>
        ) : (
          <div className="msg-layout fade-up">
            <aside className="msg-sidebar">
              <div className="msg-sidebar-title">Cuộc trò chuyện</div>

              {/* Tìm kiếm & lọc hội thoại */}
              {conversations.length > 0 && (
                <div className="msg-search">
                  <div className="apps-search">
                    <input
                      type="text"
                      placeholder="Tìm theo tên / nội dung..."
                      value={convSearch}
                      onChange={(e) => setConvSearch(e.target.value)}
                      className="apps-search-input"
                    />
                    {convSearch && (
                      <button className="apps-search-clear" onClick={() => setConvSearch('')} type="button">✕</button>
                    )}
                  </div>
                  <button
                    type="button"
                    className={`msg-filter-chip${unreadOnly ? ' active' : ''}`}
                    onClick={() => setUnreadOnly((v) => !v)}
                  >
                    Chưa đọc
                  </button>
                </div>
              )}

              {conversations.length === 0 ? (
                <p className="msg-empty">Chưa có hội thoại. Hệ thống sẽ tạo khi có tương tác job.</p>
              ) : filteredConversations.length === 0 ? (
                <p className="msg-empty">Không có hội thoại khớp bộ lọc.</p>
              ) : (
                filteredConversations.map((c) => (
                  <Link
                    key={c.id}
                    to={`/messages/${c.id}`}
                    className={`msg-thread${c.id === activeId ? ' active' : ''}`}
                  >
                    <div className="msg-thread-avatar">
                      {(c.otherUser.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="msg-thread-body">
                      <div className="msg-thread-name">
                        {c.otherUser.name || 'Người dùng'}
                        {c.unreadCount > 0 && (
                          <span className="msg-badge">{c.unreadCount}</span>
                        )}
                      </div>
                      <div className="msg-thread-preview">{c.lastMessage || 'Chưa có tin nhắn'}</div>
                    </div>
                  </Link>
                ))
              )}
            </aside>

            <div className="msg-panel">
              {activeConversation ? (
                <>
                  <div className="msg-panel-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong>{activeConversation.otherUser.name}</strong>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--red)' }}
                      onClick={() => setReportTarget({ id: activeConversation.otherUser.id, name: activeConversation.otherUser.name })}
                    >
                      🚩 Báo cáo
                    </button>
                  </div>
                  <div className="msg-messages" ref={listRef}>
                    {messages.length === 0 ? (
                      <p className="msg-empty">Bắt đầu cuộc trò chuyện...</p>
                    ) : (
                      messages.map((m) => (
                        <div
                          key={m.id}
                          className={`msg-bubble${m.isMine ? ' mine' : ''}`}
                        >
                          {!m.isMine && <div className="msg-sender">{m.senderName}</div>}
                          <div>{m.content}</div>
                          <div className="msg-time">
                            {new Date(m.createdAt).toLocaleString('vi-VN')}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="msg-compose">
                    <input
                      type="text"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder="Nhập tin nhắn..."
                      disabled={sending}
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleSend}
                      disabled={sending || !draft.trim()}
                    >
                      Gửi
                    </button>
                  </div>
                </>
              ) : (
                <div className="msg-empty" style={{ padding: 48 }}>
                  Chọn một cuộc trò chuyện để bắt đầu
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {reportTarget && (
        <ReportModal
          targetLabel={`Người dùng: ${reportTarget.name}`}
          reportedUserId={reportTarget.id}
          onClose={() => setReportTarget(null)}
          onDone={(msg) => setReportToast(msg)}
        />
      )}
      <Toast message={reportToast} onDismiss={() => setReportToast(null)} />
    </section>
  );
}
