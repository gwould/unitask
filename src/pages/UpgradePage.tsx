import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Transaction, User } from '../types';
import { STORAGE_KEYS, VAT_RATE, getPlan } from '../constants';
import { formatMoney } from '../utils/format';

/* ─── HELPERS (đồng bộ với ManageJobsPage/Wallet) ── */

function appendUserTransaction(userId: string, tx: Transaction) {
  try {
    const map = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_TRANSACTIONS) || '{}') as Record<string, Transaction[]>;
    map[userId] = [tx, ...(map[userId] || [])];
    localStorage.setItem(STORAGE_KEYS.USER_TRANSACTIONS, JSON.stringify(map));
  } catch { /* ignore */ }
}

function appendGlobalTransaction(tx: Transaction) {
  try {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]') as Transaction[];
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([tx, ...current]));
  } catch { /* ignore */ }
}

function updateAccountBalance(userId: string, delta: number) {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNTS) || '[]') as Array<User & { password: string }>;
    const updated = raw.map((acc) => acc.id === userId ? { ...acc, balance: (acc.balance || 0) + delta } : acc);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));
  } catch { /* ignore */ }
}

function buildInvoiceNo(): string {
  const d = new Date();
  return `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(Date.now()).slice(-5)}`;
}

/* ─── PAGE ────────────────────────────────────────── */

type PayMethod = 'wallet' | 'bank';

export default function UpgradePage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { planKey } = useParams<{ planKey: string }>();

  const plan = getPlan(planKey);
  const [payMethod, setPayMethod] = useState<PayMethod>('wallet');
  const [isPaying, setIsPaying] = useState(false);
  const [paidInvoice, setPaidInvoice] = useState<{ no: string; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect guards
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const subtotal = plan?.priceMonthly ?? 0;
  const vat = Math.round(subtotal * VAT_RATE);
  const total = subtotal + vat;
  const balance = user?.balance ?? 0;
  const invoiceNo = useMemo(() => buildInvoiceNo(), []);
  const today = new Date().toLocaleDateString('vi-VN');

  if (!user) return null;

  if (!plan || plan.priceMonthly === 0) {
    return (
      <section className="page-upgrade">
        <div className="container" style={{ maxWidth: 560, textAlign: 'center', paddingTop: 60 }}>
          <div style={{ fontSize: 48 }}><i className="bx bx-help-circle" /></div>
          <h2>Gói không hợp lệ</h2>
          <p style={{ color: 'var(--text-2)' }}>Gói bạn chọn không tồn tại hoặc là gói miễn phí.</p>
          <Link to="/about#pricing" className="btn btn-primary" style={{ marginTop: 16 }}>Xem bảng giá</Link>
        </div>
      </section>
    );
  }

  const isCurrentPlan = user.plan === plan.key;

  const handlePay = async () => {
    setError(null);

    if (payMethod === 'wallet' && balance < total) {
      setError(`Số dư ví không đủ (cần ${formatMoney(total)}, hiện có ${formatMoney(balance)}). Vui lòng nạp thêm hoặc chọn chuyển khoản.`);
      return;
    }

    setIsPaying(true);
    // Mô phỏng xử lý thanh toán
    await new Promise((r) => setTimeout(r, 1200));

    const date = new Date().toISOString().slice(0, 10);
    const tx: Transaction = {
      id: `tx-sub-${Date.now()}`,
      userId: String(user.id),
      type: 'subscription',
      label: `Nâng cấp gói ${plan.name} (${invoiceNo})`,
      amount: -total,
      date,
      status: payMethod === 'wallet' ? 'completed' : 'processing',
      jobTitle: plan.name,
    };

    appendUserTransaction(String(user.id), tx);
    appendGlobalTransaction(tx);

    if (payMethod === 'wallet') {
      updateAccountBalance(String(user.id), -total);
      updateProfile({ balance: balance - total, plan: plan.key, planSince: date });
    } else {
      updateProfile({ plan: plan.key, planSince: date });
    }

    setIsPaying(false);
    setPaidInvoice({ no: invoiceNo, total });
  };

  /* ─── SUCCESS SCREEN ─── */
  if (paidInvoice) {
    return (
      <section className="page-upgrade">
        <div className="container" style={{ maxWidth: 560 }}>
          <div className="upg-success fade-up">
            <div className="upg-success-icon"><i className="bx bx-party" /></div>
            <h2>Thanh toán thành công!</h2>
            <p>Gói <strong>{plan.name}</strong> đã được kích hoạt cho tài khoản của bạn.</p>
            <div className="upg-receipt">
              <div className="upg-receipt-row"><span>Số hóa đơn</span><strong>{paidInvoice.no}</strong></div>
              <div className="upg-receipt-row"><span>Gói dịch vụ</span><strong>{plan.name}</strong></div>
              <div className="upg-receipt-row"><span>Ngày kích hoạt</span><strong>{today}</strong></div>
              <div className="upg-receipt-row"><span>Hình thức</span><strong>{payMethod === 'wallet' ? 'Ví UniTask' : 'Chuyển khoản'}</strong></div>
              <div className="upg-receipt-row upg-receipt-total"><span>Đã thanh toán</span><strong>{formatMoney(paidInvoice.total)}</strong></div>
            </div>
            {payMethod === 'bank' && (
              <p className="upg-bank-note"><i className="bx bx-time-five" /> Giao dịch chuyển khoản sẽ được xác nhận trong vòng 24h làm việc.</p>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
              <Link to="/post-job" className="btn btn-primary"><i className="bx bx-edit" /> Đăng việc ngay</Link>
              <Link to="/wallet" className="btn btn-ghost"><i className="bx bx-wallet" /> Xem giao dịch</Link>
              <Link to="/dashboard" className="btn btn-ghost">Về Dashboard</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ─── CHECKOUT ─── */
  return (
    <section className="page-upgrade">
      <div className="container" style={{ maxWidth: 920 }}>
        <div className="upg-header fade-up">
          <h1><i className="bx bx-credit-card" /> Thanh toán nâng cấp gói</h1>
          <p>Hoàn tất thanh toán để kích hoạt gói <strong>{plan.name}</strong> ngay lập tức.</p>
        </div>

        {isCurrentPlan && (
          <div className="upg-current-notice fade-up">
            <i className="bx bx-info-circle" /> Bạn đang sử dụng gói này. Thanh toán sẽ gia hạn thêm 1 tháng.
          </div>
        )}

        <div className="upg-grid fade-up">
          {/* Left: plan summary + payment method */}
          <div className="upg-left">
            <div className="upg-card">
              <div className="upg-card-title"><i className="bx bx-package" /> Gói đã chọn</div>
              <div className="upg-plan-box">
                <div className="upg-plan-top">
                  <div>
                    <h3>{plan.name}</h3>
                    <span className="upg-plan-badge">{plan.badge}</span>
                  </div>
                  <div className="upg-plan-price">
                    {plan.originalPriceMonthly != null && (
                      <span className="pricing-price-original">{formatMoney(plan.originalPriceMonthly)}</span>
                    )}
                    <strong>{formatMoney(plan.priceMonthly)}</strong>
                    <span>/ tháng</span>
                  </div>
                </div>
                <ul className="upg-plan-features">
                  {plan.trialDays != null && <li><strong>🎁 {plan.trialDays} ngày dùng thử miễn phí</strong></li>}
                  {plan.features.map((f) => <li key={f}>✓ {f}</li>)}
                </ul>
                <Link to="/about#pricing" className="upg-change-plan"><i className="bx bx-transfer" /> Đổi gói khác</Link>
              </div>
            </div>

            <div className="upg-card">
              <div className="upg-card-title"><i className="bx bx-credit-card" /> Hình thức thanh toán</div>
              <label className={`upg-pay-option${payMethod === 'wallet' ? ' active' : ''}`}>
                <input type="radio" name="paym" checked={payMethod === 'wallet'} onChange={() => setPayMethod('wallet')} />
                <div className="upg-pay-info">
                  <strong><i className="bx bx-wallet" /> Ví UniTask</strong>
                  <span>Số dư hiện tại: {formatMoney(balance)}{balance < total && <em className="upg-insufficient">, không đủ</em>}</span>
                </div>
                <span className="upg-pay-tag">Kích hoạt ngay</span>
              </label>
              <label className={`upg-pay-option${payMethod === 'bank' ? ' active' : ''}`}>
                <input type="radio" name="paym" checked={payMethod === 'bank'} onChange={() => setPayMethod('bank')} />
                <div className="upg-pay-info">
                  <strong><i className="bx bx-building-house" /> Chuyển khoản ngân hàng</strong>
                  <span>Xác nhận trong vòng 24h làm việc</span>
                </div>
              </label>
              {payMethod === 'bank' && (
                <div className="upg-bank-detail">
                  <div><span>Ngân hàng</span><strong>Sacombank</strong></div>
                  <div><span>Số tài khoản</span><strong>040111849759</strong></div>
                  <div><span>Chủ tài khoản</span><strong>CONG TY TNHH UNITASK</strong></div>
                  <div><span>Nội dung CK</span><strong>{invoiceNo} {user.email}</strong></div>
                </div>
              )}
            </div>
          </div>

          {/* Right: invoice */}
          <div className="upg-right">
            <div className="upg-card upg-invoice">
              <div className="upg-card-title"><i className="bx bx-receipt" /> Hóa đơn</div>
              <div className="upg-inv-meta">
                <div><span>Số hóa đơn</span><strong>{invoiceNo}</strong></div>
                <div><span>Ngày</span><strong>{today}</strong></div>
                <div><span>Khách hàng</span><strong>{user.companyName || user.name}</strong></div>
                <div><span>Email</span><strong>{user.email}</strong></div>
              </div>
              <div className="upg-inv-lines">
                <div className="upg-inv-line">
                  <span>{plan.name} × 1 tháng</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                <div className="upg-inv-line">
                  <span>VAT ({Math.round(VAT_RATE * 100)}%)</span>
                  <span>{formatMoney(vat)}</span>
                </div>
                <div className="upg-inv-line upg-inv-total">
                  <span>Tổng thanh toán</span>
                  <span>{formatMoney(total)}</span>
                </div>
              </div>

              {error && <div className="upg-error"><i className="bx bx-error" /> {error}</div>}

              <button
                className="btn btn-primary upg-pay-btn"
                onClick={handlePay}
                disabled={isPaying}
              >
                {isPaying ? 'Đang xử lý...' : `Thanh toán ${formatMoney(total)}`}
              </button>
              <p className="upg-secure-note"><i className="bx bx-lock-alt" /> Giao dịch được mã hóa & bảo vệ. Có thể hủy gia hạn bất kỳ lúc nào.</p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/about#pricing" className="btn btn-ghost">← Quay lại bảng giá</Link>
        </div>
      </div>
    </section>
  );
}
