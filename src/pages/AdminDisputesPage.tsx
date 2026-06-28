import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { disputeService, type AdminDispute } from '../services/disputeService';
import { Toast } from '../components/ui';

const STATUS_LABEL: Record<string, string> = {
  NEGOTIATION: 'Đang thương lượng',
  MEDIATION: 'Chờ hòa giải',
  RESOLVED: 'Đã có quyết định',
  APPEAL: 'Đang kháng cáo',
  CLOSED: 'Đã đóng',
};

const STATUS_COLOR: Record<string, string> = {
  NEGOTIATION: '#F59E0B',
  MEDIATION: '#EF4444',
  RESOLVED: '#10B981',
  APPEAL: '#F97316',
  CLOSED: '#71717A',
};

const DECISION_LABEL: Record<string, string> = {
  RELEASE: 'Giải ngân cho sinh viên (100%)',
  REFUND: 'Hoàn tiền cho doanh nghiệp (0%)',
  SPLIT: 'Chia tỷ lệ',
};

const FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'MEDIATION', label: 'Chờ hòa giải' },
  { key: 'APPEAL', label: 'Kháng cáo' },
  { key: 'NEGOTIATION', label: 'Thương lượng' },
  { key: 'RESOLVED', label: 'Đã xử lý' },
];

const fmtVnd = (n: number) => n.toLocaleString('vi-VN') + '₫';
const fmtDate = (s?: string | null) => (s ? new Date(s).toLocaleString('vi-VN') : '—');

export default function AdminDisputesPage() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState<string | null>(null);
  const [resolving, setResolving] = useState<AdminDispute | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    disputeService
      .listAll(filter)
      .then(setDisputes)
      .catch(() => setToast('Không tải được danh sách tranh chấp.'))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    if (user?.role === 'admin') load();
  }, [user, load]);

  const pendingCount = useMemo(
    () => disputes.filter((d) => d.status === 'MEDIATION' || d.status === 'APPEAL').length,
    [disputes],
  );

  if (!user || user.role !== 'admin') {
    return (
      <section className="container" style={{ padding: '120px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>Không có quyền truy cập</h1>
        <p style={{ color: 'var(--t2)' }}>Trang này chỉ dành cho quản trị viên (hòa giải viên).</p>
      </section>
    );
  }

  return (
    <section className="container" style={{ padding: '40px 20px 80px', maxWidth: 1100 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
          Giải quyết tranh chấp
        </h1>
        <p style={{ color: 'var(--t2)', fontSize: 15 }}>
          Hòa giải viên xem và ra quyết định cho các tranh chấp giữa sinh viên và doanh nghiệp.
          {pendingCount > 0 && (
            <strong style={{ color: '#EF4444' }}> {pendingCount} tranh chấp đang chờ xử lý.</strong>
          )}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`btn btn-sm ${filter === f.key ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" />
        </div>
      ) : disputes.length === 0 ? (
        <div className="glass" style={{ padding: 48, textAlign: 'center', borderRadius: 'var(--r20)' }}>
          <i className="bx bx-check-shield" style={{ fontSize: 48, color: 'var(--teal)' }} />
          <p style={{ marginTop: 12, color: 'var(--t2)' }}>Không có tranh chấp nào.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {disputes.map((d) => (
            <DisputeCard key={d.id} dispute={d} onResolve={() => setResolving(d)} />
          ))}
        </div>
      )}

      {resolving && (
        <ResolveModal
          dispute={resolving}
          onClose={() => setResolving(null)}
          onDone={(msg) => {
            setResolving(null);
            setToast(msg);
            load();
          }}
        />
      )}

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </section>
  );
}

function DisputeCard({ dispute, onResolve }: { dispute: AdminDispute; onResolve: () => void }) {
  const canResolve = dispute.status === 'MEDIATION' || dispute.status === 'APPEAL' || dispute.status === 'NEGOTIATION';
  return (
    <div className="glass" style={{ padding: 24, borderRadius: 'var(--r16)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>
            {dispute.milestoneTitle ?? 'Mốc công việc'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--t2)' }}>
            Dự án: {dispute.jobTitle ?? '—'} · Mở lúc {fmtDate(dispute.createdAt)}
          </div>
        </div>
        <span
          style={{
            alignSelf: 'flex-start',
            fontSize: 12,
            fontWeight: 700,
            padding: '5px 12px',
            borderRadius: 999,
            color: '#fff',
            background: STATUS_COLOR[dispute.status] ?? '#71717A',
          }}
        >
          {STATUS_LABEL[dispute.status] ?? dispute.status}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 14,
          fontSize: 14,
        }}
      >
        <Field label="Sinh viên" value={dispute.studentName ?? '—'} />
        <Field label="Doanh nghiệp" value={dispute.companyName ?? '—'} />
        <Field label="Số tiền ký quỹ" value={fmtVnd(dispute.milestoneAmount)} />
        <Field
          label="Bên mở tranh chấp"
          value={dispute.raisedByRole === 'student' ? 'Sinh viên' : dispute.raisedByRole === 'business' ? 'Doanh nghiệp' : '—'}
        />
      </div>

      <div
        style={{
          background: 'rgba(255,255,255,.04)',
          border: '1px solid var(--bd)',
          borderRadius: 'var(--r10)',
          padding: '12px 16px',
          fontSize: 14,
          color: 'var(--t1)',
          marginBottom: dispute.decision || canResolve ? 14 : 0,
        }}
      >
        <span style={{ color: 'var(--t2)' }}>Lý do: </span>
        {dispute.reason}
        {dispute.decisionNote && (
          <div style={{ marginTop: 8, color: 'var(--t2)', whiteSpace: 'pre-wrap' }}>{dispute.decisionNote}</div>
        )}
      </div>

      {dispute.decision && (
        <div style={{ fontSize: 13, color: 'var(--teal)', marginBottom: canResolve ? 14 : 0 }}>
          Quyết định: <strong>{DECISION_LABEL[dispute.decision] ?? dispute.decision}</strong>
          {dispute.decision === 'SPLIT' ? ` — sinh viên nhận ${dispute.studentPercent ?? 0}%` : ''}
          {dispute.resolvedAt ? ` · ${fmtDate(dispute.resolvedAt)}` : ''}
        </div>
      )}

      {canResolve && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-sm" onClick={onResolve}>
            <i className="bx bx-gavel" /> Ra quyết định
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function ResolveModal({
  dispute,
  onClose,
  onDone,
}: {
  dispute: AdminDispute;
  onClose: () => void;
  onDone: (msg: string) => void;
}) {
  const [decision, setDecision] = useState<'RELEASE' | 'REFUND' | 'SPLIT'>('RELEASE');
  const [percent, setPercent] = useState(50);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await disputeService.resolve(dispute.id, decision, decision === 'SPLIT' ? percent : undefined, note || undefined);
      onDone(`Đã ra quyết định cho tranh chấp "${dispute.milestoneTitle ?? ''}".`);
    } catch {
      setError('Không thể lưu quyết định. Vui lòng thử lại.');
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Ra quyết định hòa giải</h3>
        <p style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 8 }}>
          {dispute.milestoneTitle} · {fmtVnd(dispute.milestoneAmount)}
        </p>

        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Quyết định</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {(['RELEASE', 'REFUND', 'SPLIT'] as const).map((d) => (
            <label
              key={d}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                border: `1.5px solid ${decision === d ? 'var(--p)' : 'var(--bd)'}`,
                borderRadius: 'var(--r10)',
                cursor: 'pointer',
              }}
            >
              <input type="radio" name="decision" checked={decision === d} onChange={() => setDecision(d)} />
              <span style={{ fontSize: 14 }}>{DECISION_LABEL[d]}</span>
            </label>
          ))}
        </div>

        {decision === 'SPLIT' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Sinh viên nhận: {percent}% ({fmtVnd(Math.round((dispute.milestoneAmount * percent) / 100))})
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: 12, color: 'var(--t2)' }}>
              Doanh nghiệp hoàn lại: {fmtVnd(Math.round((dispute.milestoneAmount * (100 - percent)) / 100))}
            </div>
          </div>
        )}

        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Ghi chú (tùy chọn)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Lý do / căn cứ quyết định..."
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 'var(--r10)',
            border: '1px solid var(--bd)',
            background: 'var(--s2)',
            color: 'var(--t1)',
            resize: 'vertical',
            marginBottom: 8,
          }}
        />

        {error && <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 8 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={busy}>
            Hủy
          </button>
          <button className="btn btn-primary btn-sm" onClick={submit} disabled={busy}>
            {busy ? 'Đang lưu...' : 'Xác nhận quyết định'}
          </button>
        </div>
      </div>
    </div>
  );
}
