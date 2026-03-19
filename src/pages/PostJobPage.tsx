import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { JOB_CATEGORIES, LOCATIONS, STORAGE_KEYS } from '../constants';

const CATEGORIES = JOB_CATEGORIES;

export default function PostJobPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    category: CATEGORIES[0],
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

  // Redirect if not business user
  useEffect(() => {
    if (!user || user.role !== 'business') navigate('/dashboard');
  }, [user, navigate]);

  if (!user || user.role !== 'business') return null;

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim() || !form.description.trim() || !form.payMin || !form.deadline) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc (*)');
      return;
    }

    const newJob = {
      id: Date.now(),
      title: form.title.trim(),
      company: user.companyName || user.name,
      companyId: user.id,
      logoText: (user.companyName || user.name).substring(0, 2).toUpperCase(),
      logoGradient: 'linear-gradient(135deg,#5B4FFF,#7C72FF)',
      category: form.category,
      location: form.location,
      pay: form.payMax
        ? `${Number(form.payMin).toLocaleString('vi-VN')} – ${Number(form.payMax).toLocaleString('vi-VN')} ₫`
        : `${Number(form.payMin).toLocaleString('vi-VN')} ₫`,
      payMin: Number(form.payMin),
      payMax: Number(form.payMax) || Number(form.payMin),
      deadline: form.deadline,
      duration: form.duration || 'Linh hoạt',
      description: form.description.trim(),
      requirements: form.requirements
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean),
      deliverables: form.deliverables
        .split('\n')
        .map((d) => d.trim())
        .filter(Boolean),
      skills: form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      postedAt: new Date().toISOString().slice(0, 10),
    };

    try {
      const jobs = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_JOBS) || '[]');
      jobs.push(newJob);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_JOBS, JSON.stringify(jobs));
    } catch {
      // Ignore localStorage errors
    }

    setSuccess(true);
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
              <button className="btn btn-primary" onClick={() => { setSuccess(false); setForm({ title: '', category: CATEGORIES[0], location: LOCATIONS[0], payMin: '', payMax: '', deadline: '', duration: '', description: '', requirements: '', deliverables: '', skills: '' }); }}>
                Đăng thêm việc
              </button>
              <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
                Về Dashboard
              </button>
            </div>
          </div>
        </div>
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
          {error && <div className="auth-error">{error}</div>}

          <div className="pj-form-grid">
            {/* title */}
            <div className="pj-field pj-full">
              <label>Tên công việc *</label>
              <input type="text" value={form.title} onChange={set('title')} placeholder="VD: Thiết kế banner quảng cáo cho chiến dịch mùa hè" />
            </div>

            {/* category + location */}
            <div className="pj-field">
              <label>Danh mục *</label>
              <select value={form.category} onChange={set('category')}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="pj-field">
              <label>Địa điểm *</label>
              <select value={form.location} onChange={set('location')}>
                {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>

            {/* pay */}
            <div className="pj-field">
              <label>Mức lương tối thiểu (₫) *</label>
              <input type="number" value={form.payMin} onChange={set('payMin')} placeholder="500000" min={0} />
            </div>
            <div className="pj-field">
              <label>Mức lương tối đa (₫)</label>
              <input type="number" value={form.payMax} onChange={set('payMax')} placeholder="1500000" min={0} />
            </div>

            {/* deadline + duration */}
            <div className="pj-field">
              <label>Hạn nộp *</label>
              <input type="date" value={form.deadline} onChange={set('deadline')} />
            </div>
            <div className="pj-field">
              <label>Thời lượng công việc</label>
              <input type="text" value={form.duration} onChange={set('duration')} placeholder="VD: 3 ngày / 1 tuần" />
            </div>

            {/* description */}
            <div className="pj-field pj-full">
              <label>Mô tả chi tiết *</label>
              <textarea value={form.description} onChange={set('description')} rows={5} placeholder="Mô tả cụ thể công việc, mục tiêu, yêu cầu..." />
            </div>

            {/* requirements */}
            <div className="pj-field pj-full">
              <label>Yêu cầu (mỗi dòng 1 yêu cầu)</label>
              <textarea value={form.requirements} onChange={set('requirements')} rows={3} placeholder="Thành thạo Photoshop&#10;Có từ 1 năm kinh nghiệm..." />
            </div>

            {/* deliverables */}
            <div className="pj-field pj-full">
              <label>Sản phẩm giao (mỗi dòng 1 mục)</label>
              <textarea value={form.deliverables} onChange={set('deliverables')} rows={3} placeholder="5 banner kích thước 1200x628&#10;File PSD nguồn..." />
            </div>

            {/* skills */}
            <div className="pj-field pj-full">
              <label>Kỹ năng cần thiết (phân tách bằng dấu phẩy)</label>
              <input type="text" value={form.skills} onChange={set('skills')} placeholder="Photoshop, Illustrator, Figma" />
            </div>
          </div>

          <div className="pj-actions">
            <button type="submit" className="btn btn-primary">🚀 Đăng việc ngay</button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/dashboard')}>Hủy</button>
          </div>
        </form>
      </div>
    </section>
  );
}
