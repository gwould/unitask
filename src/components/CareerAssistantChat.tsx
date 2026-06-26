import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { serviceRegistry } from '../services';
import type { CareerChatMessage, CareerJobCard } from '../types/careerAssistant';

const { careerAssistant: careerAssistantService } = serviceRegistry;

const WELCOME: CareerChatMessage = {
  role: 'assistant',
  content:
    'Xin chào! Mình là trợ lý nghề nghiệp UniTask. Bạn có thể nhắn ngắn như «react remote», «viết content 5 triệu», mình sẽ gợi ý job phù hợp.',
  followUpQuestions: ['Job IT part-time', 'Thiết kế UI/UX', 'Content marketing remote'],
};

function JobCards({ jobs }: { jobs: CareerJobCard[] }) {
  if (jobs.length === 0) return null;
  return (
    <div className="ca-job-grid">
      {jobs.map((job) => (
        <Link key={job.id} to={`/jobs/${job.id}`} className="ca-job-card">
          <div className="ca-job-top">
            <div className="ca-job-logo" style={{ background: job.logoGradient }}>{job.logoText}</div>
            <span className="ca-match">{Math.round(job.matchScore)}%</span>
          </div>
          <div className="ca-job-title">{job.title}</div>
          <div className="ca-job-meta">{job.company} · {job.location}</div>
          <div className="ca-job-pay">💰 {job.pay}</div>
          {job.matchReasons.length > 0 && (
            <div className="ca-job-reasons">
              {job.matchReasons.slice(0, 2).map((r) => (
                <span key={r}>{r}</span>
              ))}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}

export default function CareerAssistantChat() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<CareerChatMessage[]>([WELCOME]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const userScrolledUp = useRef(false);

  useEffect(() => {
    if (open && listRef.current && !userScrolledUp.current) {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, open, loading]);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    userScrolledUp.current = !atBottom;
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: CareerChatMessage = { role: 'user', content: trimmed };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setLoading(true);

      const history = [...messages, userMsg]
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const res = await careerAssistantService.chat(trimmed, user, history, 5);
        const noResults = !res.jobs || res.jobs.length === 0;
        const reply = noResults && !res.refused && !res.reply.includes('không tìm thấy')
          ? (res.reply || 'Không tìm thấy kết quả phù hợp với yêu cầu của bạn. Hãy thử mô tả kỹ năng hoặc lĩnh vực bạn quan tâm cụ thể hơn.')
          : res.reply;
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: reply,
            jobs: res.jobs,
            followUpQuestions: res.followUpQuestions?.length ? res.followUpQuestions : (noResults ? ['Xem tất cả job', 'Job IT part-time', 'Thiết kế UI/UX'] : res.followUpQuestions),
            careerPaths: res.careerPaths,
            refused: res.refused,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'Mình chưa kết nối được máy chủ. Hãy chắc backend đang chạy, sau đó thử lại. Bạn vẫn có thể xem job tại trang Tìm việc.',
            followUpQuestions: ['Xem danh sách job'],
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, user],
  );

  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  const quickReplies = lastAssistant?.followUpQuestions?.length
    ? lastAssistant.followUpQuestions
    : WELCOME.followUpQuestions || [];

  return (
    <>
      <button
        type="button"
        className="ca-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label="Mở trợ lý nghề nghiệp"
      >
        {open ? '✕' : (
          <>
            <span className="ca-fab-icon">🤖</span>
            <span className="ca-fab-label">AI Trợ lý</span>
          </>
        )}
      </button>

      {open && (
        <div className={`ca-panel ca-panel-${theme}`} role="dialog" aria-label="Trợ lý nghề nghiệp">
          <div className="ca-header">
            <div>
              <div className="ca-title">Trợ lý nghề nghiệp</div>
              <div className="ca-sub">Gợi ý job theo kỹ năng & hội thoại tự nhiên</div>
            </div>
            <button type="button" className="ca-close" onClick={() => setOpen(false)} aria-label="Đóng">
              ✕
            </button>
          </div>

          <div className="ca-messages" ref={listRef} onScroll={handleScroll}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`ca-bubble ca-bubble-${msg.role}`}>
                <p className="ca-text">{msg.content}</p>
                {msg.careerPaths && msg.careerPaths.length > 0 && (
                  <div className="ca-paths">
                    <span className="ca-label">Lộ trình gợi ý:</span>
                    {msg.careerPaths.map((p) => (
                      <span key={p} className="ca-chip">{p}</span>
                    ))}
                  </div>
                )}
                {msg.jobs && msg.jobs.length > 0 && <JobCards jobs={msg.jobs} />}
              </div>
            ))}
            {loading && (
              <div className="ca-bubble ca-bubble-assistant">
                <p className="ca-text ca-typing">Đang phân tích & tìm job phù hợp...</p>
              </div>
            )}
          </div>

          <div className="ca-quick">
            {quickReplies?.map((q) => (
              <button key={q} type="button" className="ca-quick-btn" onClick={() => sendMessage(q)} disabled={loading}>
                {q}
              </button>
            ))}
          </div>

          <form
            className="ca-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              type="text"
              className="ca-input"
              placeholder="VD: react remote 8 triệu, content part-time..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading || !input.trim()}>
              Gửi
            </button>
          </form>
        </div>
      )}
    </>
  );
}
