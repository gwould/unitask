import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { validateContactForm, type ContactFormErrors } from '../utils/validation';
import { simulateDelay } from '../utils/async';

/* ─── TYPES ───────────────────────────────────────── */

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type FieldErrors = ContactFormErrors;

interface FaqItem {
  q: string;
  a: string;
}

/* ─── CONSTANTS ───────────────────────────────────── */

const MAX_MESSAGE = 1000;

const FAQ_DATA: FaqItem[] = [
  { q: 'UniTask có miễn phí cho sinh viên không?', a: 'Hoàn toàn miễn phí! Sinh viên chỉ bị trừ phí dịch vụ nhỏ (5%) khi nhận thanh toán.' },
  { q: 'Doanh nghiệp đăng job có mất phí không?', a: 'Đăng 3 job đầu tiên miễn phí. Sau đó bạn chọn gói phù hợp từ 499.000₫/tháng.' },
  { q: 'Escrow hoạt động như thế nào?', a: 'Doanh nghiệp nạp tiền vào Escrow trước. Tiền chỉ được chuyển cho sinh viên khi doanh nghiệp duyệt sản phẩm.' },
  { q: 'Làm sao để rút tiền?', a: 'Vào Ví → Rút tiền, chọn phương thức (ngân hàng/ví điện tử/thẻ) và nhập số tiền. Xử lý từ 1-3 ngày làm việc.' },
  { q: 'Có thể hủy đơn ứng tuyển không?', a: 'Có! Bạn có thể rút đơn ứng tuyển bất cứ lúc nào trước khi doanh nghiệp duyệt, trong phần "Đơn ứng tuyển".' },
];

const EMPTY_FORM: FormState = { name: '', email: '', subject: '', message: '' };

/* ─── HELPERS ─────────────────────────────────────── */

function validate(form: FormState): FieldErrors {
  return validateContactForm(form, MAX_MESSAGE);
}

/* ─── MAIN ────────────────────────────────────────── */

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const update = useCallback((field: keyof FormState, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    // Clear error on change if touched
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  }, []);

  const handleBlur = useCallback((field: keyof FormState) => {
    setTouched((prev) => new Set(prev).add(field));
    // Validate single field
    const errs = validate(form);
    if (errs[field]) {
      setErrors((prev) => ({ ...prev, [field]: errs[field] }));
    }
  }, [form]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setTouched(new Set(['name', 'email', 'subject', 'message']));
      return;
    }
    setSending(true);
    await simulateDelay();
    setSending(false);
    setSent(true);
  }, [form]);

  const handleReset = useCallback(() => {
    setForm(EMPTY_FORM);
    setErrors({});
    setTouched(new Set());
    setSent(false);
    setToast('Sẵn sàng gửi tin nhắn mới!');
  }, []);

  if (sent) {
    return (
      <section className="page-contact">
        <div className="container">
          <div className="contact-success fade-up">
            <div style={{ fontSize: 56, marginBottom: 16 }}>✉️</div>
            <h2>Đã gửi thành công!</h2>
            <p>Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong 24 giờ làm việc.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
              <button className="btn btn-primary" onClick={handleReset}>📩 Gửi tin nhắn khác</button>
              <Link to="/" className="btn btn-ghost">← Về trang chủ</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-contact">
      <div className="container">
        <div className="contact-header fade-up">
          <div className="section-eyebrow">Liên hệ</div>
          <h1>Chúng tôi luôn sẵn sàng hỗ trợ bạn</h1>
          <p className="contact-header-sub">
            Có câu hỏi, góp ý, hoặc cần hỗ trợ? Gửi tin nhắn cho UniTask ngay.
          </p>
        </div>

        <div className="contact-grid">
          {/* form */}
          <form className="contact-form fade-up" onSubmit={handleSubmit} noValidate>
            <div className="contact-form-row">
              <div className="pj-field">
                <label>Họ tên *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder="Nguyễn Văn A"
                  className={touched.has('name') && errors.name ? 'input-error' : ''}
                />
                {touched.has('name') && errors.name && (
                  <span className="field-error">{errors.name}</span>
                )}
              </div>
              <div className="pj-field">
                <label>Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="you@example.com"
                  className={touched.has('email') && errors.email ? 'input-error' : ''}
                />
                {touched.has('email') && errors.email && (
                  <span className="field-error">{errors.email}</span>
                )}
              </div>
            </div>
            <div className="pj-field">
              <label>Chủ đề *</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => update('subject', e.target.value)}
                onBlur={() => handleBlur('subject')}
                placeholder="VD: Hỗ trợ thanh toán, Hợp tác doanh nghiệp..."
                className={touched.has('subject') && errors.subject ? 'input-error' : ''}
              />
              {touched.has('subject') && errors.subject && (
                <span className="field-error">{errors.subject}</span>
              )}
            </div>
            <div className="pj-field">
              <label>Nội dung *</label>
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                onBlur={() => handleBlur('message')}
                placeholder="Mô tả chi tiết vấn đề hoặc yêu cầu của bạn..."
                className={touched.has('message') && errors.message ? 'input-error' : ''}
              />
              <div className="field-meta">
                {touched.has('message') && errors.message && (
                  <span className="field-error">{errors.message}</span>
                )}
                <span className={`char-counter${form.message.length > MAX_MESSAGE ? ' over' : ''}`}>
                  {form.message.length}/{MAX_MESSAGE}
                </span>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={sending}>
              {sending ? '⏳ Đang gửi...' : '📩 Gửi tin nhắn'}
            </button>
          </form>

          {/* info */}
          <div className="contact-info fade-up">
            <div className="contact-info-card">
              <div className="ci-icon">📧</div>
              <div>
                <h4>Email</h4>
                <p>support@unitask.vn</p>
              </div>
            </div>
            <div className="contact-info-card">
              <div className="ci-icon">📱</div>
              <div>
                <h4>Hotline</h4>
                <p>1900-UNITASK (Thứ 2–6, 8h–18h)</p>
              </div>
            </div>
            <div className="contact-info-card">
              <div className="ci-icon">📍</div>
              <div>
                <h4>Văn phòng</h4>
                <p>Tầng 12, Tòa Innovation Hub, Quận 1, TP.HCM</p>
              </div>
            </div>
            <div className="contact-info-card">
              <div className="ci-icon">💬</div>
              <div>
                <h4>Mạng xã hội</h4>
                <p>Facebook · LinkedIn · TikTok · YouTube</p>
              </div>
            </div>

            <div className="contact-faq">
              <h4>❓ Câu hỏi thường gặp</h4>
              {FAQ_DATA.map((faq, i) => (
                <div key={i} className={`contact-faq-item${openFaq === i ? ' open' : ''}`}>
                  <button
                    className="faq-toggle"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    type="button"
                  >
                    <strong>{faq.q}</strong>
                    <span className="faq-arrow">{openFaq === i ? '▲' : '▼'}</span>
                  </button>
                  <div className={`faq-answer${openFaq === i ? ' show' : ''}`}>
                    <p>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="apps-toast apps-toast-success">
          <span>✅</span>
          {toast}
          <button className="apps-toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}
    </section>
  );
}
