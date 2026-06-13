import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { JOB_CATEGORIES, LOCATIONS } from '../constants';
import { createNotification } from '../services/automationEngine';
import { jobService } from '../services/jobService';
import { siteService } from '../services/siteService';
import type { Category } from '../types';

const FALLBACK_CATEGORIES = JOB_CATEGORIES;

const DURATION_OPTIONS = [
  { value: 'micro', label: 'Micro (vài giờ)', desc: 'Task nhỏ hoàn thành trong 1-4 giờ' },
  { value: 'short-term', label: 'Ngắn hạn (vài ngày)', desc: 'Công việc 1-7 ngày' },
  { value: 'project', label: 'Dự án (vài tuần+)', desc: 'Dự án dài hạn từ 2 tuần trở lên' },
];

type FieldErrors = Record<string, string>;

export default function PostJobPage() {
  const { user, isApiAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    title: '',
    categoryKey: '',
    location: LOCATIONS[0],
    payMin: '',
    payMax: '',
    deadline: '',
    duration: 'micro',
    description: '',
    requirements: '',
    deliverables: '',
    skills: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'business') navigate('/dashboard');
  }, [user, navigate]);

  useEffect(() => {
    siteService.getCategories()
      .then((cats) => setApiCategories(cats))
      .catch(() => setApiCategories([]));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Validation ──────────────────────────────────
  const validate = useCallback((f: typeof form): FieldErrors => {
    const e: FieldErrors = {};

    // Title
    if (!f.title.trim()) {
      e.title = 'Vui lòng nhập tên công việc';
    } else if (f.title.trim().length < 10) {
      e.title = 'Tên công việc tối thiểu 10 ký tự';
    } else if (f.title.trim().length > 150) {
      e.title = 'Tên công việc tối đa 150 ký tự';
    }

    // Description
    if (!f.description.trim()) {
      e.description = 'Vui lòng nhập mô tả công việc';
    } else if (f.description.trim().length < 30) {
      e.description = 'Mô tả tối thiểu 30 ký tự để sinh viên hiểu rõ công việc';
    }

    // Pay min
    if (!f.payMin) {
      e.payMin = 'Vui lòng nhập mức lương tối thiểu';
    } else if (Number(f.payMin) < 50000) {
      e.payMin = 'Mức lương tối thiểu 50,000₫';
    } else if (Number(f.payMin) > 100000000) {
      e.payMin = 'Mức lương không hợp lệ (tối đa 100 triệu)';
    }

    // Pay max
    if (f.payMax && Number(f.payMax) < Number(f.payMin)) {
      e.payMax = 'Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu';
    }
    if (f.payMax && Number(f.payMax) > 100000000) {
      e.payMax = 'Mức lương không hợp lệ (tối đa 100 triệu)';
    }

    // Deadline
    if (!f.deadline) {
      e.deadline = 'Vui lòng chọn hạn nộp';
    } else {
      const deadlineDate = new Date(f.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        e.deadline = 'Hạn nộp phải là ngày trong tương lai';
      }
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      if (deadlineDate > maxDate) {
        e.deadline = 'Hạn nộp tối đa 1 năm kể từ hôm nay';
      }
    }

    // Skills
    if (f.skills.trim()) {
      const skills = f.skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skills.some(s => s.length > 50)) {
        e.skills = 'Mỗi kỹ năng tối đa 50 ký tự';
      }
      if (skills.length > 20) {
        e.skills = 'Tối đa 20 kỹ năng';
      }
    }

    return e;
  }, []);

  // Re-validate on form change (only show errors for touched fields)
  useEffect(() => {
    setFieldErrors(validate(form));
  }, [form, validate]);

  if (!user || user.role !== 'business') return null;

  const categoryOptions = apiCategories.length > 0
    ? apiCategories.map((c) => ({ key: c.id || c.slug, label: c.name, id: c.id }))
    : FALLBACK_CATEGORIES.map((name) => ({ key: name, label: name, id: undefined as string | undefined }));

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const markTouched = (key: string) => () => setTouched((p) => ({ ...p, [key]: true }));

  const showError = (key: string) => touched[key] && fieldErrors[key];

  const hasErrors = Object.keys(fieldErrors).length > 0;

  // Character counters
  const titleLen = form.title.trim().length;
  const descLen = form.description.trim().length;
  const skillCount = form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean).length : 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Touch all fields to show errors
    const allTouched: Record<string, boolean> = {};
    Object.keys(form).forEach(k => { allTouched[k] = true; });
    setTouched(allTouched);

    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      const firstErr = Object.values(errors)[0];
      setError(firstErr);
      // Scroll to first error
      const firstKey = Object.keys(errors)[0];
      const el = document.querySelector(`[data-field="${firstKey}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const selected = categoryOptions.find((c) => c.key === form.categoryKey) || categoryOptions[0];
    const categoryId = selected?.id ?? null;

    setSubmitting(true);
    try {
      let created;
      try {
        created = await jobService.create({
          title: form.title.trim(),
          logoText: (user.companyName || user.name).substring(0, 2).toUpperCase(),
          logoGradient: 'linear-gradient(135deg,#7C3AED,#A78BFA)',
          company: user.companyName || user.name,
          companyId: user.id,
          verified: false,
          location: form.location,
          tags: [{ label: selected?.label || 'Job', variant: 'p' }],
          spotsLeft: 1,
          spotsTotal: 1,
          pay: form.payMax
            ? `${Number(form.payMin).toLocaleString('vi-VN')} – ${Number(form.payMax).toLocaleString('vi-VN')} ₫`
            : `${Number(form.payMin).toLocaleString('vi-VN')} ₫`,
          payMin: Number(form.payMin),
          payMax: Number(form.payMax) || Number(form.payMin),
          deadline: form.deadline,
          duration: form.duration,
          description: form.description.trim(),
          requirements: form.requirements.split('\n').map((r) => r.trim()).filter(Boolean),
          deliverables: form.deliverables.split('\n').map((d) => d.trim()).filter(Boolean),
          skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
          postedAt: new Date().toISOString().slice(0, 10),
          category: selected?.label?.toLowerCase() || 'all',
          categoryId,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Lỗi không xác định';
        throw new Error(`Không thể tạo job: ${msg}`);
      }

      try {
        await jobService.publish(created.id);
      } catch (err) {
        console.warn('[PostJob] publish failed (non-fatal):', err);
      }

      createNotification({
        recipientId: String(user.id),
        recipientType: 'business',
        title: '📝 Đăng job thành công',
        message: `Job "${created.title}" đã được đăng. Mức lương: ${created.pay} · Hạn: ${created.deadline}.`,
        type: 'system',
        relatedJobId: created.id,
        actionUrl: `/jobs/${created.id}`,
      });

      setToast('Đã đăng job thành công!');
      setSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể đăng job.';
      setError(msg);
      console.error('[PostJob] submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <section className="page-postjob">
        <div className="container">
          <div className="pj-success fade-up visible">
            <div className="pj-success-icon">🎉</div>
            <h2>Đăng việc thành công!</h2>
            <p>Job của bạn đã được gửi lên hệ thống và sẽ hiển thị cho sinh viên ngay.</p>

            <div className="pd-next-steps" style={{ margin: '24px 0', textAlign: 'left' }}>
              <div className="pd-ns-item pd-ns-done">
                <span className="pd-ns-num">✓</span>
                <div><strong>Đăng job</strong><br/><span style={{fontSize:'.85rem',opacity:.7}}>Mô tả & yêu cầu đã được đăng</span></div>
              </div>
              <div className="pd-ns-item pd-ns-current">
                <span className="pd-ns-num">2</span>
                <div><strong>Chờ ứng viên</strong><br/><span style={{fontSize:'.85rem',opacity:.7}}>Sinh viên sẽ bắt đầu ứng tuyển</span></div>
              </div>
              <div className="pd-ns-item">
                <span className="pd-ns-num">3</span>
                <div><strong>Duyệt & giao task</strong><br/><span style={{fontSize:'.85rem',opacity:.7}}>Xem CV, chấp nhận, tin nhắn tự động</span></div>
              </div>
              <div className="pd-ns-item">
                <span className="pd-ns-num">4</span>
                <div><strong>Review & thanh toán</strong><br/><span style={{fontSize:'.85rem',opacity:.7}}>Duyệt bài nộp, escrow trả tiền</span></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/manage-jobs')}>
                📂 Quản lý job
              </button>
              <button className="btn btn-ghost" onClick={() => {
                setSuccess(false);
                setTouched({});
                setFieldErrors({});
                setForm({
                  title: '',
                  categoryKey: categoryOptions[0]?.key || '',
                  location: LOCATIONS[0],
                  payMin: '',
                  payMax: '',
                  deadline: '',
                  duration: 'micro',
                  description: '',
                  requirements: '',
                  deliverables: '',
                  skills: '',
                });
              }}>
                📝 Đăng thêm việc
              </button>
              <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
                Về Dashboard
              </button>
            </div>
          </div>
        </div>
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

  return (
    <section className="page-postjob">
      <div className="container">
        <div className="pj-header fade-up">
          <h1>📝 Đăng việc mới</h1>
          <p>Tạo job và kết nối với sinh viên tài năng chỉ trong vài phút</p>
        </div>

        <form className="pj-form fade-up" onSubmit={handleSubmit} noValidate>
          {/* Cảnh báo tài khoản demo */}
          {!isApiAuthenticated && (
            <div className="demo-mode-warning">
              <span className="demo-mode-icon">⚠️</span>
              <div>
                <strong>Bạn đang dùng tài khoản demo (chỉ local)</strong>
                <p>
                  Tài khoản <code>{user?.email}</code> không tồn tại trên server thật — chức năng đăng việc sẽ bị lỗi 401/500.
                  Vui lòng <a href="/register">đăng ký tài khoản mới</a> hoặc <a href="/login">đăng nhập</a> bằng tài khoản đã đăng ký trên hệ thống.
                </p>
              </div>
            </div>
          )}
          {error && <div className="pj-error-banner">{error}</div>}

          <div className="pj-form-grid">
            {/* Title */}
            <div className={`pj-field pj-full${showError('title') ? ' pj-field-error' : ''}`} data-field="title">
              <label>Tên công việc <span className="pj-required">*</span></label>
              <input
                type="text"
                value={form.title}
                onChange={set('title')}
                onBlur={markTouched('title')}
                placeholder="VD: Thiết kế banner quảng cáo cho chiến dịch mùa hè"
                maxLength={150}
              />
              <div className="pj-field-footer">
                {showError('title') ? (
                  <span className="pj-field-err-msg">{fieldErrors.title}</span>
                ) : (
                  <span className="pj-field-hint">Tiêu đề rõ ràng, cụ thể giúp thu hút sinh viên phù hợp</span>
                )}
                <span className={`pj-char-count${titleLen > 140 ? ' pj-char-warn' : ''}`}>{titleLen}/150</span>
              </div>
            </div>

            {/* Category */}
            <div className="pj-field" data-field="categoryKey">
              <label>Danh mục <span className="pj-required">*</span></label>
              <select
                value={form.categoryKey || categoryOptions[0]?.key || ''}
                onChange={set('categoryKey')}
              >
                {categoryOptions.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
              <div className="pj-field-footer">
                <span className="pj-field-hint">Chọn danh mục phù hợp nhất với công việc</span>
              </div>
            </div>

            {/* Location */}
            <div className="pj-field" data-field="location">
              <label>Địa điểm <span className="pj-required">*</span></label>
              <select value={form.location} onChange={set('location')}>
                {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
              </select>
              <div className="pj-field-footer">
                <span className="pj-field-hint">Chọn "Remote" nếu làm từ xa</span>
              </div>
            </div>

            {/* Pay Min */}
            <div className={`pj-field${showError('payMin') ? ' pj-field-error' : ''}`} data-field="payMin">
              <label>Mức lương tối thiểu (₫) <span className="pj-required">*</span></label>
              <input
                type="number"
                value={form.payMin}
                onChange={set('payMin')}
                onBlur={markTouched('payMin')}
                placeholder="500000"
                min={50000}
                max={100000000}
              />
              <div className="pj-field-footer">
                {showError('payMin') ? (
                  <span className="pj-field-err-msg">{fieldErrors.payMin}</span>
                ) : form.payMin ? (
                  <span className="pj-field-hint">{Number(form.payMin).toLocaleString('vi-VN')}₫</span>
                ) : (
                  <span className="pj-field-hint">Tối thiểu 50,000₫</span>
                )}
              </div>
            </div>

            {/* Pay Max */}
            <div className={`pj-field${showError('payMax') ? ' pj-field-error' : ''}`} data-field="payMax">
              <label>Mức lương tối đa (₫)</label>
              <input
                type="number"
                value={form.payMax}
                onChange={set('payMax')}
                onBlur={markTouched('payMax')}
                placeholder="1500000"
                min={0}
                max={100000000}
              />
              <div className="pj-field-footer">
                {showError('payMax') ? (
                  <span className="pj-field-err-msg">{fieldErrors.payMax}</span>
                ) : form.payMax ? (
                  <span className="pj-field-hint">{Number(form.payMax).toLocaleString('vi-VN')}₫ — Để trống nếu lương cố định</span>
                ) : (
                  <span className="pj-field-hint">Để trống nếu lương cố định</span>
                )}
              </div>
            </div>

            {/* Deadline */}
            <div className={`pj-field${showError('deadline') ? ' pj-field-error' : ''}`} data-field="deadline">
              <label>Hạn nộp <span className="pj-required">*</span></label>
              <input
                type="date"
                value={form.deadline}
                onChange={set('deadline')}
                onBlur={markTouched('deadline')}
                min={new Date().toISOString().slice(0, 10)}
              />
              <div className="pj-field-footer">
                {showError('deadline') ? (
                  <span className="pj-field-err-msg">{fieldErrors.deadline}</span>
                ) : (
                  <span className="pj-field-hint">Ngày cuối sinh viên có thể nộp đơn</span>
                )}
              </div>
            </div>

            {/* Duration */}
            <div className="pj-field" data-field="duration">
              <label>Thời lượng công việc</label>
              <select value={form.duration} onChange={set('duration')}>
                {DURATION_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <div className="pj-field-footer">
                <span className="pj-field-hint">
                  {DURATION_OPTIONS.find(d => d.value === form.duration)?.desc}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className={`pj-field pj-full${showError('description') ? ' pj-field-error' : ''}`} data-field="description">
              <label>Mô tả chi tiết <span className="pj-required">*</span></label>
              <textarea
                value={form.description}
                onChange={set('description')}
                onBlur={markTouched('description')}
                rows={5}
                placeholder={'Mô tả cụ thể:\n• Mục tiêu công việc\n• Phạm vi & nhiệm vụ chính\n• Đối tượng mong muốn\n• Quy trình làm việc'}
              />
              <div className="pj-field-footer">
                {showError('description') ? (
                  <span className="pj-field-err-msg">{fieldErrors.description}</span>
                ) : (
                  <span className="pj-field-hint">Mô tả càng chi tiết, sinh viên ứng tuyển càng phù hợp</span>
                )}
                <span className={`pj-char-count${descLen > 0 && descLen < 30 ? ' pj-char-warn' : ''}`}>{descLen} ký tự</span>
              </div>
            </div>

            {/* Requirements */}
            <div className="pj-field pj-full" data-field="requirements">
              <label>Yêu cầu ứng viên</label>
              <textarea
                value={form.requirements}
                onChange={set('requirements')}
                rows={3}
                placeholder={'Mỗi dòng 1 yêu cầu, VD:\nThành thạo Photoshop/Illustrator\nCó portfolio thiết kế\nSinh viên năm 3 trở lên'}
              />
              <div className="pj-field-footer">
                <span className="pj-field-hint">Mỗi dòng 1 yêu cầu — không bắt buộc nhưng giúp lọc ứng viên tốt hơn</span>
              </div>
            </div>

            {/* Deliverables */}
            <div className="pj-field pj-full" data-field="deliverables">
              <label>Sản phẩm cần giao</label>
              <textarea
                value={form.deliverables}
                onChange={set('deliverables')}
                rows={3}
                placeholder={'Mỗi dòng 1 sản phẩm, VD:\n5 banner kích thước 1200x628\nFile PSD/AI nguồn\nBáo cáo tiến độ hàng tuần'}
              />
              <div className="pj-field-footer">
                <span className="pj-field-hint">Liệt kê rõ sản phẩm giúp sinh viên biết kỳ vọng</span>
              </div>
            </div>

            {/* Skills */}
            <div className={`pj-field pj-full${showError('skills') ? ' pj-field-error' : ''}`} data-field="skills">
              <label>Kỹ năng cần thiết</label>
              <input
                type="text"
                value={form.skills}
                onChange={set('skills')}
                onBlur={markTouched('skills')}
                placeholder="Photoshop, Illustrator, Figma, React, Node.js"
              />
              <div className="pj-field-footer">
                {showError('skills') ? (
                  <span className="pj-field-err-msg">{fieldErrors.skills}</span>
                ) : (
                  <span className="pj-field-hint">Phân tách bằng dấu phẩy — hiển thị dưới dạng tag trên job</span>
                )}
                {skillCount > 0 && <span className={`pj-char-count${skillCount > 15 ? ' pj-char-warn' : ''}`}>{skillCount} kỹ năng</span>}
              </div>
            </div>
          </div>

          {/* Summary bar */}
          <div className="pj-summary">
            <div className="pj-summary-item">
              <span className="pj-summary-label">Lương:</span>
              <span className="pj-summary-value">
                {form.payMin
                  ? form.payMax
                    ? `${Number(form.payMin).toLocaleString('vi-VN')} – ${Number(form.payMax).toLocaleString('vi-VN')}₫`
                    : `${Number(form.payMin).toLocaleString('vi-VN')}₫`
                  : '—'}
              </span>
            </div>
            <div className="pj-summary-item">
              <span className="pj-summary-label">Hạn:</span>
              <span className="pj-summary-value">{form.deadline || '—'}</span>
            </div>
            <div className="pj-summary-item">
              <span className="pj-summary-label">Loại:</span>
              <span className="pj-summary-value">{DURATION_OPTIONS.find(d => d.value === form.duration)?.label || '—'}</span>
            </div>
          </div>

          <div className="pj-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting || (hasErrors && Object.keys(touched).length > 3)}>
              {submitting ? 'Đang đăng...' : '🚀 Đăng việc ngay'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/dashboard')}>Hủy</button>
          </div>
        </form>
      </div>
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
