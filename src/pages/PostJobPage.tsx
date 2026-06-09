import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { JOB_CATEGORIES, LOCATIONS } from '../constants';
import { createNotification } from '../services/automationEngine';
import { jobService } from '../services/jobService';
import { siteService } from '../services/siteService';
import type { Category } from '../types';

const FALLBACK_CATEGORIES = JOB_CATEGORIES;

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
    duration: '',
    description: '',
    requirements: '',
    deliverables: '',
    skills: '',
  });
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

  if (!user || user.role !== 'business') return null;

  const categoryOptions = apiCategories.length > 0
    ? apiCategories.map((c) => ({ key: c.id || c.slug, label: c.name, id: c.id }))
    : FALLBACK_CATEGORIES.map((name) => ({ key: name, label: name, id: undefined as string | undefined }));

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim() || !form.description.trim() || !form.payMin || !form.deadline) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc (*)');
      return;
    }

    const selected = categoryOptions.find((c) => c.key === form.categoryKey) || categoryOptions[0];
    const categoryId = selected?.id ?? null;

    setSubmitting(true);
    try {
      // Bước 1: tạo job
      let created;
      try {
        created = await jobService.create({
          title: form.title.trim(),
          logoText: (user.companyName || user.name).substring(0, 2).toUpperCase(),
          logoGradient: 'linear-gradient(135deg,#5B4FFF,#7C72FF)',
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
          duration: form.duration || 'Linh hoạt',
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

      // Bước 2: publish — không block nếu thất bại
      try {
        await jobService.publish(created.id);
      } catch (err) {
        console.warn('[PostJob] publish failed (non-fatal):', err);
        // Job đã tạo nhưng publish thất bại → vẫn coi là thành công
      }

      createNotification({
        recipientId: String(user.id),
        recipientType: 'business',
        title: '📝 Đăng job thành công',
        message: `Job "${created.title}" đã được đăng. Mức lương: ${created.pay} · Hạn: ${created.deadline}.`,
        type: 'system',
        relatedJobId: created.id,
        actionUrl: '/manage-jobs',
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
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
              <button className="btn btn-primary" onClick={() => {
                setSuccess(false);
                setForm({
                  title: '',
                  categoryKey: categoryOptions[0]?.key || '',
                  location: LOCATIONS[0],
                  payMin: '',
                  payMax: '',
                  deadline: '',
                  duration: '',
                  description: '',
                  requirements: '',
                  deliverables: '',
                  skills: '',
                });
              }}>
                Đăng thêm việc
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

        <form className="pj-form fade-up" onSubmit={handleSubmit}>
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
          {error && <div className="auth-error">{error}</div>}

          <div className="pj-form-grid">
            <div className="pj-field pj-full">
              <label>Tên công việc *</label>
              <input type="text" value={form.title} onChange={set('title')} placeholder="VD: Thiết kế banner quảng cáo cho chiến dịch mùa hè" />
            </div>

            <div className="pj-field">
              <label>Danh mục *</label>
              <select
                value={form.categoryKey || categoryOptions[0]?.key || ''}
                onChange={set('categoryKey')}
              >
                {categoryOptions.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="pj-field">
              <label>Địa điểm *</label>
              <select value={form.location} onChange={set('location')}>
                {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>

            <div className="pj-field">
              <label>Mức lương tối thiểu (₫) *</label>
              <input type="number" value={form.payMin} onChange={set('payMin')} placeholder="500000" min={0} />
            </div>
            <div className="pj-field">
              <label>Mức lương tối đa (₫)</label>
              <input type="number" value={form.payMax} onChange={set('payMax')} placeholder="1500000" min={0} />
            </div>

            <div className="pj-field">
              <label>Hạn nộp *</label>
              <input type="date" value={form.deadline} onChange={set('deadline')} />
            </div>
            <div className="pj-field">
              <label>Thời lượng công việc</label>
              <input type="text" value={form.duration} onChange={set('duration')} placeholder="VD: 3 ngày / 1 tuần" />
            </div>

            <div className="pj-field pj-full">
              <label>Mô tả chi tiết *</label>
              <textarea value={form.description} onChange={set('description')} rows={5} placeholder="Mô tả cụ thể công việc, mục tiêu, yêu cầu..." />
            </div>

            <div className="pj-field pj-full">
              <label>Yêu cầu (mỗi dòng 1 yêu cầu)</label>
              <textarea value={form.requirements} onChange={set('requirements')} rows={3} placeholder="Thành thạo Photoshop&#10;Có từ 1 năm kinh nghiệm..." />
            </div>

            <div className="pj-field pj-full">
              <label>Sản phẩm giao (mỗi dòng 1 mục)</label>
              <textarea value={form.deliverables} onChange={set('deliverables')} rows={3} placeholder="5 banner kích thước 1200x628&#10;File PSD nguồn..." />
            </div>

            <div className="pj-field pj-full">
              <label>Kỹ năng cần thiết (phân tách bằng dấu phẩy)</label>
              <input type="text" value={form.skills} onChange={set('skills')} placeholder="Photoshop, Illustrator, Figma" />
            </div>
          </div>

          <div className="pj-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
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
