import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiGet } from '../services/apiService';
import { hasAuthToken } from '../utils/auth';

type AdminUser = { id: string; name: string; email: string; userType: string };
type Conversation = {
  id: string;
  user1: AdminUser;
  user2: AdminUser;
  lastMessage?: string;
  lastMessageAt?: string;
  totalMessages: number;
  flaggedCount: number;
};
type Message = {
  id: string;
  content: string;
  senderName: string;
  senderEmail: string;
  senderType: string;
  createdAt?: string;
  isFlagged?: boolean;
  flagReasons?: string;
};
type FlaggedMessage = Message & { conversationId: string; conversationWith?: string };
type Stats = { totalMessages: number; flaggedMessages: number; totalConversations: number; conversationsWithFlags: number; flagRate: number };

const FLAG_LABELS: Record<string, string> = {
  phone_number: 'So dien thoai',
  email_address: 'Email',
  social_media_link: 'MXH link',
  external_url: 'Link ngoai',
};

function formatFlag(reasons?: string) {
  if (!reasons) return '';
  return reasons.split(',').map((r) => {
    if (r.startsWith('keyword:')) return `"${r.replace('keyword:', '')}"`;
    return FLAG_LABELS[r] || r;
  }).join(', ');
}

function timeAgo(date?: string) {
  if (!date) return '';
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'vua xong';
  if (s < 3600) return `${Math.floor(s / 60)}p`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function AdminMessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'all' | 'flagged'>('flagged');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [flagged, setFlagged] = useState<FlaggedMessage[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    if (!hasAuthToken()) { navigate('/login'); return; }
    loadData();
  }, [user, navigate]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, f, c] = await Promise.all([
        apiGet<Stats>('/api/admin/moderation-stats'),
        apiGet<{ data: FlaggedMessage[] }>('/api/admin/flagged-messages?limit=50'),
        apiGet<{ data: Conversation[] }>('/api/admin/conversations?limit=50'),
      ]);
      setStats(s);
      setFlagged(f.data || []);
      setConversations(c.data || []);
    } catch {
      // admin API may fail if not admin
    } finally {
      setLoading(false);
    }
  }, []);

  const loadConversation = useCallback(async (convId: string) => {
    setSelectedConv(convId);
    try {
      const r = await apiGet<{ data: Message[] }>(`/api/admin/conversations/${convId}/messages?limit=200`);
      setMessages(r.data || []);
    } catch {
      setMessages([]);
    }
  }, []);

  const filteredConvs = search
    ? conversations.filter((c) =>
        c.user1.name.toLowerCase().includes(search.toLowerCase())
        || c.user2.name.toLowerCase().includes(search.toLowerCase())
        || c.user1.email.toLowerCase().includes(search.toLowerCase())
        || c.user2.email.toLowerCase().includes(search.toLowerCase())
      )
    : conversations;

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-2)' }}>Dang tai...</div>;

  return (
    <section className="page-admin-messages">
      <div className="container">
        <div className="wallet-header fade-up">
          <h1>Admin - Giam sat tin nhan</h1>
          <p>Theo doi hoi thoai va phat hien vi pham</p>
        </div>

        {stats && (
          <div className="wallet-cards fade-up" style={{ marginBottom: 24 }}>
            <div className="wc-card">
              <div className="wc-label">Tong tin nhan</div>
              <div className="wc-amount">{stats.totalMessages}</div>
            </div>
            <div className="wc-card" style={stats.flaggedMessages > 0 ? { border: '1px solid #ff4444' } : {}}>
              <div className="wc-label">Tin bi flag</div>
              <div className="wc-amount" style={{ color: stats.flaggedMessages > 0 ? '#ff4444' : undefined }}>{stats.flaggedMessages}</div>
              <div className="wc-sub">{stats.flagRate}% tong tin nhan</div>
            </div>
            <div className="wc-card">
              <div className="wc-label">Hoi thoai</div>
              <div className="wc-amount">{stats.totalConversations}</div>
            </div>
            <div className="wc-card">
              <div className="wc-label">Hoi thoai co flag</div>
              <div className="wc-amount" style={{ color: stats.conversationsWithFlags > 0 ? '#ff9900' : undefined }}>{stats.conversationsWithFlags}</div>
            </div>
          </div>
        )}

        <div className="notif-filters" style={{ marginBottom: 20 }}>
          <button className={`filter-btn${tab === 'flagged' ? ' active' : ''}`} onClick={() => { setTab('flagged'); setSelectedConv(null); }}>
            Tin nhan bi flag ({flagged.length})
          </button>
          <button className={`filter-btn${tab === 'all' ? ' active' : ''}`} onClick={() => { setTab('all'); setSelectedConv(null); }}>
            Tat ca hoi thoai ({conversations.length})
          </button>
        </div>

        {tab === 'flagged' && !selectedConv && (
          <div className="notif-list">
            {flagged.length === 0 ? (
              <div className="notif-empty-state">
                <div className="notif-empty-icon">OK</div>
                <h3>Khong co tin nhan vi pham</h3>
                <p>Tat ca tin nhan deu an toan.</p>
              </div>
            ) : (
              flagged.map((m) => (
                <div
                  key={m.id}
                  className="notif-item unread notif-warning"
                  style={{ cursor: 'pointer' }}
                  onClick={() => loadConversation(m.conversationId)}
                >
                  <div className="notif-icon">!</div>
                  <div className="notif-content">
                    <div className="notif-title">{m.senderName} ({m.senderType})</div>
                    <div className="notif-message" style={{ background: 'rgba(255,68,68,.08)', padding: '8px 12px', borderRadius: 8, marginTop: 4, border: '1px solid rgba(255,68,68,.15)' }}>
                      {m.content}
                    </div>
                    <div className="notif-meta" style={{ marginTop: 6 }}>
                      <span style={{ color: '#ff4444', fontWeight: 600, fontSize: 12 }}>
                        Flag: {formatFlag(m.flagReasons)}
                      </span>
                      <span className="notif-time"> {timeAgo(m.createdAt)}</span>
                      {m.conversationWith && <span style={{ fontSize: 12, color: 'var(--t3)' }}> Noi chuyen voi: {m.conversationWith}</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'all' && !selectedConv && (
          <>
            <input
              type="text"
              placeholder="Tim kiem theo ten hoac email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', marginBottom: 16, padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.04)', color: 'inherit', fontSize: 14 }}
            />
            <div className="notif-list">
              {filteredConvs.map((c) => (
                <div
                  key={c.id}
                  className={`notif-item${c.flaggedCount > 0 ? ' unread notif-warning' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => loadConversation(c.id)}
                >
                  <div className="notif-icon">{c.flaggedCount > 0 ? '!' : 'C'}</div>
                  <div className="notif-content">
                    <div className="notif-title">
                      <span style={{ color: c.user1.userType === 'student' ? 'var(--p)' : 'var(--t)' }}>{c.user1.name}</span>
                      {' '}&lt;-&gt;{' '}
                      <span style={{ color: c.user2.userType === 'student' ? 'var(--p)' : 'var(--t)' }}>{c.user2.name}</span>
                    </div>
                    <div className="notif-message">{c.lastMessage || 'Chua co tin nhan'}</div>
                    <div className="notif-meta">
                      <span className="notif-time">{timeAgo(c.lastMessageAt)}</span>
                      <span style={{ fontSize: 12, color: 'var(--t3)' }}>{c.totalMessages} tin nhan</span>
                      {c.flaggedCount > 0 && <span style={{ fontSize: 12, color: '#ff4444', fontWeight: 600 }}> {c.flaggedCount} flagged</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {selectedConv && (
          <div>
            <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedConv(null); setMessages([]); }} style={{ marginBottom: 16 }}>
              Quay lai
            </button>
            <div style={{ maxHeight: 600, overflowY: 'auto', borderRadius: 16, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', padding: 16 }}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: '12px 16px',
                    marginBottom: 8,
                    borderRadius: 12,
                    background: m.isFlagged ? 'rgba(255,68,68,.08)' : 'rgba(255,255,255,.03)',
                    border: m.isFlagged ? '1px solid rgba(255,68,68,.2)' : '1px solid rgba(255,255,255,.04)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <strong style={{ fontSize: 13, color: m.senderType === 'student' ? 'var(--p)' : 'var(--t)' }}>
                      {m.senderName}
                      <span style={{ fontWeight: 400, color: 'var(--t3)', marginLeft: 6, fontSize: 11 }}>{m.senderType}</span>
                    </strong>
                    <span style={{ fontSize: 11, color: 'var(--t3)' }}>{m.createdAt ? new Date(m.createdAt).toLocaleString('vi-VN') : ''}</span>
                  </div>
                  <div style={{ fontSize: 14 }}>{m.content}</div>
                  {m.isFlagged && (
                    <div style={{ marginTop: 6, fontSize: 11, color: '#ff4444', fontWeight: 600 }}>
                      FLAG: {formatFlag(m.flagReasons)}
                    </div>
                  )}
                </div>
              ))}
              {messages.length === 0 && <div style={{ textAlign: 'center', color: 'var(--t3)', padding: 24 }}>Khong co tin nhan</div>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
