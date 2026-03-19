import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Transaction, BankMethod, TxFilter, WithdrawForm } from '../types';
import { TX_TYPE_CONFIG, TX_STATUS_LABEL, STORAGE_KEYS } from '../constants';
import { formatMoney as formatBalance, formatSignedMoney as formatMoney } from '../utils/format';
import { simulateDelay } from '../utils/async';

/* ─── CONSTANTS ───────────────────────────────────── */

const TYPE_CONFIG = TX_TYPE_CONFIG;
const STATUS_LABEL = TX_STATUS_LABEL;

const TX_FILTER_OPTIONS: { key: TxFilter; label: string }[] = [
  { key: 'all',            label: 'Tất cả' },
  { key: 'income',         label: '💰 Thu nhập' },
  { key: 'withdraw',       label: '🏦 Rút tiền' },
  { key: 'escrow_in',      label: '🔒 Nạp Escrow' },
  { key: 'escrow_release', label: '✅ Giải phóng' },
];

/* ─── HELPERS ─────────────────────────────────────── */

function getSeedTransactions(role: string): Transaction[] {
  if (role === 'student') {
    return [
      { id: 'tx-1', type: 'income',   label: 'Thanh toán job: Frontend Developer',     amount: 3_200_000,  date: '2026-03-01', status: 'completed', jobTitle: 'Frontend Developer (React + Tailwind)' },
      { id: 'tx-2', type: 'income',   label: 'Thanh toán job: Viết 10 bài SEO Blog',   amount: 1_600_000,  date: '2026-02-22', status: 'completed', jobTitle: 'Viết 10 bài SEO Blog (chuẩn EEAT)' },
      { id: 'tx-3', type: 'withdraw', label: 'Rút tiền về Vietcombank ****1234',        amount: -2_000_000, date: '2026-02-15', status: 'completed' },
      { id: 'tx-4', type: 'income',   label: 'Thanh toán job: Dịch thuật tài liệu',    amount: 1_200_000,  date: '2026-02-10', status: 'completed' },
      { id: 'tx-5', type: 'withdraw', label: 'Rút tiền về MoMo',                       amount: -1_500_000, date: '2026-01-28', status: 'completed' },
    ];
  }
  return [
    { id: 'tx-1', type: 'escrow_in',      label: 'Nạp Escrow: Frontend Developer',    amount: -4_000_000, date: '2026-02-25', status: 'completed' },
    { id: 'tx-2', type: 'escrow_release', label: 'Giải phóng Escrow: Viết bài SEO',   amount: -1_800_000, date: '2026-02-20', status: 'completed' },
    { id: 'tx-3', type: 'escrow_in',      label: 'Nạp Escrow: Thiết kế UI/UX',        amount: -3_000_000, date: '2026-02-18', status: 'pending' },
    { id: 'tx-4', type: 'escrow_in',      label: 'Nạp Escrow: Video TikTok',          amount: -5_000_000, date: '2026-02-10', status: 'completed' },
    { id: 'tx-5', type: 'escrow_release', label: 'Giải phóng Escrow: Dịch thuật',     amount: -1_500_000, date: '2026-01-30', status: 'completed' },
  ];
}

function getDefaultBankMethods(): BankMethod[] {
  return [
    { id: 'bm-1', icon: '🏦', name: 'Vietcombank', detail: '****1234 · Nguyễn Minh Anh',  isDefault: true },
    { id: 'bm-2', icon: '📱', name: 'Ví MoMo',     detail: '0912***678',                   isDefault: false },
  ];
}

function loadTransactions(role: string): Transaction[] {
  try {
    const stored: Transaction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    if (stored.length > 0) return stored;
  } catch { /* use seed */ }
  return getSeedTransactions(role);
}

function saveTransactions(txs: Transaction[]) {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
}

function loadBankMethods(): BankMethod[] {
  try {
    const stored: BankMethod[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BANK_METHODS) || '[]');
    if (stored.length > 0) return stored;
  } catch { /* use defaults */ }
  return getDefaultBankMethods();
}

function saveBankMethods(methods: BankMethod[]) {
  localStorage.setItem(STORAGE_KEYS.BANK_METHODS, JSON.stringify(methods));
}

/* ─── SUB-COMPONENTS ──────────────────────────────── */

function TransactionRow({ tx }: { tx: Transaction }) {
  const cfg = TYPE_CONFIG[tx.type];
  const st = STATUS_LABEL[tx.status];
  return (
    <div className="wallet-tx-row">
      <div className="wtx-icon" style={{ color: cfg.color }}>{cfg.icon}</div>
      <div className="wtx-info">
        <div className="wtx-label">{tx.label}</div>
        <div className="wtx-date">{tx.date} · {cfg.label}</div>
      </div>
      <span className={`dash-status ${st.cls}`}>{st.text}</span>
      <div className="wtx-amount" style={{ color: tx.amount >= 0 ? 'var(--t)' : 'var(--text-2)' }}>
        {formatMoney(tx.amount)}
      </div>
    </div>
  );
}

function TxSkeleton() {
  return (
    <div className="wallet-tx-row" style={{ opacity: 0.5 }}>
      <div className="skeleton-circle" style={{ width: 36, height: 36 }} />
      <div className="wtx-info">
        <div className="skeleton-line" style={{ width: 200, height: 14, marginBottom: 4 }} />
        <div className="skeleton-line" style={{ width: 120, height: 10 }} />
      </div>
      <div className="skeleton-line" style={{ width: 70, height: 22, borderRadius: 20 }} />
      <div className="skeleton-line" style={{ width: 100, height: 16 }} />
    </div>
  );
}

/* ─── MAIN PAGE ───────────────────────────────────── */

export default function WalletPage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  // States
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankMethods, setBankMethods] = useState<BankMethod[]>([]);
  const [txFilter, setTxFilter] = useState<TxFilter>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modals
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState<WithdrawForm>({ amount: '', methodId: '' });
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const [newBank, setNewBank] = useState({ name: '', detail: '', icon: '🏦' });
  const [bankError, setBankError] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  // Load data
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    simulateDelay(700).then(() => {
      if (cancelled) return;
      const txs = loadTransactions(user.role);
      const methods = loadBankMethods();
      setTransactions(txs);
      setBankMethods(methods);
      // Set default withdraw method
      const def = methods.find((m) => m.isDefault) || methods[0];
      if (def) setWithdrawForm((f) => f.methodId ? f : { ...f, methodId: def.id });
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [user]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Computed
  const totalEarned = useMemo(
    () => transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const totalWithdrawn = useMemo(
    () => transactions.filter((t) => t.type === 'withdraw').reduce((s, t) => s + Math.abs(t.amount), 0),
    [transactions]
  );
  const escrowHeld = useMemo(
    () => user?.role === 'business'
      ? transactions.filter((t) => t.type === 'escrow_in' && t.status === 'pending').reduce((s, t) => s + Math.abs(t.amount), 0)
      : 0,
    [transactions, user?.role]
  );
  const filteredTxs = useMemo(
    () => txFilter === 'all' ? transactions : transactions.filter((t) => t.type === txFilter),
    [transactions, txFilter]
  );
  const relevantFilters = useMemo(
    () => user?.role === 'student'
      ? TX_FILTER_OPTIONS.filter((f) => ['all', 'income', 'withdraw'].includes(f.key))
      : TX_FILTER_OPTIONS,
    [user?.role]
  );

  // Handlers
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  }, []);

  const handleWithdraw = useCallback(async () => {
    if (!user) return;
    const amount = parseInt(withdrawForm.amount.replace(/\D/g, ''), 10);
    if (!amount || amount < 50_000) {
      setWithdrawError('Số tiền rút tối thiểu là 50,000 ₫');
      return;
    }
    if (amount > (user.balance || 0)) {
      setWithdrawError('Số dư không đủ');
      return;
    }
    const method = bankMethods.find((m) => m.id === withdrawForm.methodId);
    if (!method) {
      setWithdrawError('Vui lòng chọn phương thức rút tiền');
      return;
    }

    setWithdrawError('');
    setWithdrawLoading(true);
    await simulateDelay(1200);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'withdraw',
      label: `Rút tiền về ${method.name} ${method.detail}`,
      amount: -amount,
      date: new Date().toISOString().slice(0, 10),
      status: 'processing',
    };

    setTransactions((prev) => {
      const updated = [newTx, ...prev];
      saveTransactions(updated);
      return updated;
    });

    updateProfile({ balance: (user.balance || 0) - amount });
    setWithdrawLoading(false);
    setShowWithdrawModal(false);
    setWithdrawForm({ amount: '', methodId: bankMethods.find((m) => m.isDefault)?.id || '' });
    showToast(`Đang xử lý rút ${formatBalance(amount)} về ${method.name}`);
  }, [withdrawForm, user, bankMethods, updateProfile, showToast]);

  const handleAddBank = useCallback(() => {
    if (!newBank.name.trim() || !newBank.detail.trim()) {
      setBankError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setBankError('');
    const method: BankMethod = {
      id: `bm-${Date.now()}`,
      icon: newBank.icon,
      name: newBank.name.trim(),
      detail: newBank.detail.trim(),
      isDefault: bankMethods.length === 0,
    };
    setBankMethods((prev) => {
      const updated = [...prev, method];
      saveBankMethods(updated);
      return updated;
    });
    setShowAddBankModal(false);
    setNewBank({ name: '', detail: '', icon: '🏦' });
    showToast(`Đã thêm ${method.name} thành công`);
  }, [newBank, bankMethods.length, showToast]);

  const handleSetDefault = useCallback((id: string) => {
    setBankMethods((prev) => {
      const updated = prev.map((m) => ({ ...m, isDefault: m.id === id }));
      saveBankMethods(updated);
      return updated;
    });
    showToast('Đã cập nhật phương thức mặc định');
  }, [showToast]);

  const handleRemoveBank = useCallback((id: string) => {
    setBankMethods((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      if (updated.length > 0 && !updated.some((m) => m.isDefault)) {
        updated[0].isDefault = true;
      }
      saveBankMethods(updated);
      return updated;
    });
    showToast('Đã xóa phương thức thanh toán');
  }, [showToast]);

  if (!user) return null;

  return (
    <section className="page-wallet">
      <div className="container">
        <div className="wallet-header fade-up">
          <h1>💰 Ví & Giao dịch</h1>
          <p>Quản lý số dư, lịch sử giao dịch và rút tiền</p>
        </div>

        {/* wallet cards */}
        <div className="wallet-cards fade-up">
          <div className="wc-card wc-balance">
            <div className="wc-label">Số dư khả dụng</div>
            <div className="wc-amount">{formatBalance(user.balance || 0)}</div>
            <button
              className="btn btn-primary btn-sm"
              style={{ marginTop: 12 }}
              onClick={() => {
                if (user.role === 'student') {
                  setShowWithdrawModal(true);
                } else {
                  showToast('Tính năng nạp Escrow sẽ sớm hỗ trợ!');
                }
              }}
            >
              {user.role === 'student' ? '🏦 Rút tiền' : '💳 Nạp tiền Escrow'}
            </button>
          </div>
          {user.role === 'student' ? (
            <>
              <div className="wc-card">
                <div className="wc-label">Tổng đã kiếm</div>
                <div className="wc-amount wc-green">{formatBalance(totalEarned)}</div>
                <div className="wc-sub">Từ {transactions.filter((t) => t.type === 'income').length} job</div>
              </div>
              <div className="wc-card">
                <div className="wc-label">Đã rút</div>
                <div className="wc-amount wc-orange">{formatBalance(totalWithdrawn)}</div>
                <div className="wc-sub">{transactions.filter((t) => t.type === 'withdraw').length} lần rút</div>
              </div>
            </>
          ) : (
            <>
              <div className="wc-card">
                <div className="wc-label">Tổng Escrow đã nạp</div>
                <div className="wc-amount wc-purple">{formatBalance(
                  transactions.filter((t) => t.type === 'escrow_in').reduce((s, t) => s + Math.abs(t.amount), 0)
                )}</div>
              </div>
              <div className="wc-card">
                <div className="wc-label">Escrow đang giữ</div>
                <div className="wc-amount wc-orange">{formatBalance(escrowHeld)}</div>
                <div className="wc-sub">Chờ duyệt sản phẩm</div>
              </div>
            </>
          )}
        </div>

        {/* escrow explainer */}
        <div className="wallet-escrow-info fade-up">
          <div className="wei-icon">🛡️</div>
          <div>
            <strong>Hệ thống Escrow bảo vệ bạn</strong>
            <p>
              {user.role === 'student'
                ? 'Tiền được giữ an toàn trong tài khoản Escrow cho đến khi bạn hoàn thành job. Không bao giờ bị bùng tiền.'
                : 'Tiền bạn nạp vào Escrow chỉ được giải phóng cho sinh viên khi bạn duyệt sản phẩm hoàn chỉnh. An toàn 100%.'}
            </p>
          </div>
        </div>

        {/* transactions */}
        <div className="wallet-section fade-up">
          <div className="dash-section-header">
            <h2>Lịch sử giao dịch</h2>
            <span className="wallet-tx-count">{filteredTxs.length} giao dịch</span>
          </div>

          {/* filter tabs */}
          <div className="wallet-tx-filters">
            {relevantFilters.map((f) => (
              <button
                key={f.key}
                className={`apps-filter-btn${txFilter === f.key ? ' active' : ''}`}
                onClick={() => setTxFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="wallet-tx-list">
            {isLoading ? (
              <>
                <TxSkeleton />
                <TxSkeleton />
                <TxSkeleton />
              </>
            ) : filteredTxs.length === 0 ? (
              <div className="wallet-tx-empty">
                <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
                <p>Không có giao dịch nào{txFilter !== 'all' ? ` loại "${TX_FILTER_OPTIONS.find((f) => f.key === txFilter)?.label}"` : ''}.</p>
              </div>
            ) : (
              filteredTxs.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
            )}
          </div>
        </div>

        {/* bank info (student) */}
        {user.role === 'student' && (
          <div className="wallet-section fade-up">
            <div className="dash-section-header">
              <h2>Phương thức rút tiền</h2>
            </div>
            <div className="wallet-banks">
              {isLoading ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-2)', fontSize: 13 }}>Đang tải...</div>
              ) : bankMethods.length === 0 ? (
                <div className="wallet-tx-empty">
                  <p>Chưa có phương thức rút tiền nào. Thêm ngay!</p>
                </div>
              ) : (
                bankMethods.map((m) => (
                  <div key={m.id} className="wallet-bank-card">
                    <div className="wb-icon">{m.icon}</div>
                    <div className="wb-info">
                      <div className="wb-name">{m.name}</div>
                      <div className="wb-num">{m.detail}</div>
                    </div>
                    <div className="wb-actions">
                      {m.isDefault ? (
                        <span className="tag tag-t">Mặc định</span>
                      ) : (
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => handleSetDefault(m.id)}
                        >
                          Đặt mặc định
                        </button>
                      )}
                      {!m.isDefault && (
                        <button
                          className="btn btn-ghost btn-xs wb-remove"
                          onClick={() => handleRemoveBank(m.id)}
                          title="Xóa"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
              <button
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
                onClick={() => setShowAddBankModal(true)}
              >
                + Thêm phương thức
              </button>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link to="/dashboard" className="btn btn-ghost">← Về Dashboard</Link>
        </div>
      </div>

      {/* ─── WITHDRAW MODAL ────────────────────────── */}
      {showWithdrawModal && (
        <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>🏦 Rút tiền</h3>
            <p style={{ marginBottom: 16 }}>Số dư khả dụng: <strong>{formatBalance(user.balance || 0)}</strong></p>

            <div className="pj-field" style={{ marginBottom: 12 }}>
              <label>Số tiền rút (₫)</label>
              <input
                type="text"
                placeholder="VD: 1,000,000"
                value={withdrawForm.amount}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '');
                  setWithdrawForm((f) => ({ ...f, amount: raw ? new Intl.NumberFormat('vi-VN').format(parseInt(raw, 10)) : '' }));
                  setWithdrawError('');
                }}
              />
            </div>

            {/* Quick amount buttons */}
            <div className="wallet-quick-amounts">
              {[500_000, 1_000_000, 2_000_000].map((amt) => (
                <button
                  key={amt}
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    setWithdrawForm((f) => ({ ...f, amount: new Intl.NumberFormat('vi-VN').format(amt) }));
                    setWithdrawError('');
                  }}
                >
                  {formatBalance(amt)}
                </button>
              ))}
            </div>

            <div className="pj-field" style={{ marginBottom: 12 }}>
              <label>Phương thức nhận tiền</label>
              <select
                value={withdrawForm.methodId}
                onChange={(e) => setWithdrawForm((f) => ({ ...f, methodId: e.target.value }))}
              >
                {bankMethods.map((m) => (
                  <option key={m.id} value={m.id}>{m.icon} {m.name} — {m.detail}</option>
                ))}
              </select>
            </div>

            {withdrawError && <p className="wallet-form-error">{withdrawError}</p>}

            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setShowWithdrawModal(false)}>Hủy</button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleWithdraw}
                disabled={withdrawLoading}
              >
                {withdrawLoading ? '⏳ Đang xử lý...' : '💸 Xác nhận rút tiền'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── ADD BANK MODAL ────────────────────────── */}
      {showAddBankModal && (
        <div className="modal-overlay" onClick={() => setShowAddBankModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>➕ Thêm phương thức rút tiền</h3>

            <div className="pj-field" style={{ marginBottom: 12, marginTop: 16 }}>
              <label>Loại</label>
              <div className="wallet-bank-type-btns">
                {[
                  { icon: '🏦', label: 'Ngân hàng' },
                  { icon: '📱', label: 'Ví điện tử' },
                  { icon: '💳', label: 'Thẻ' },
                ].map((opt) => (
                  <button
                    key={opt.icon}
                    className={`btn btn-sm ${newBank.icon === opt.icon ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setNewBank((p) => ({ ...p, icon: opt.icon }))}
                    type="button"
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pj-field" style={{ marginBottom: 12 }}>
              <label>Tên ngân hàng / ví</label>
              <input
                type="text"
                placeholder="VD: Vietcombank, MoMo, ZaloPay..."
                value={newBank.name}
                onChange={(e) => { setNewBank((p) => ({ ...p, name: e.target.value })); setBankError(''); }}
              />
            </div>

            <div className="pj-field" style={{ marginBottom: 12 }}>
              <label>Số tài khoản / SĐT</label>
              <input
                type="text"
                placeholder="VD: ****5678 · Nguyễn Văn A"
                value={newBank.detail}
                onChange={(e) => { setNewBank((p) => ({ ...p, detail: e.target.value })); setBankError(''); }}
              />
            </div>

            {bankError && <p className="wallet-form-error">{bankError}</p>}

            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddBankModal(false)}>Hủy</button>
              <button className="btn btn-primary btn-sm" onClick={handleAddBank}>
                ✓ Thêm phương thức
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`apps-toast apps-toast-${toast.type}`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.message}
          <button className="apps-toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}
    </section>
  );
}
