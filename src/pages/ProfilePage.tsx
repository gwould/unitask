import { useEffect, useState, useMemo, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import VerificationCard from '../components/VerificationCard';

function calcCompletion(user: { name?: string; bio?: string; phone?: string; university?: string; major?: string; skills?: string[]; companyName?: string; role?: string }) {
  const fields: boolean[] = [
    !!user.name,
    !!user.bio,
    !!user.phone,
  ];
  if (user.role === 'student') {
    fields.push(!!user.university, !!user.major, !!(user.skills && user.skills.length > 0));
  } else {
    fields.push(!!user.companyName);
  }
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

const COMPLETION_TIPS: Record<string, string> = {
  bio: 'Thêm giới thiệu bản thân để nhà tuyển dụng biết bạn hơn',
  phone: 'Thêm số điện thoại để doanh nghiệp liên lạc nhanh',
  university: 'Thêm trường đại học để được gợi ý job phù hợp',
  major: 'Thêm ngành học để hệ thống AI match chính xác hơn',
  skills: 'Thêm kỹ năng để nổi bật trong mắt nhà tuyển dụng',
  companyName: 'Thêm tên công ty để sinh viên tin tưởng hơn',
};

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    university: '',
    major: '',
    companyName: '',
    bio: '',
    phone: '',
    skills: '',
  });
  const [saved, setSaved] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    if (user && !initialized) {
      setForm({
        name: user.name,
        email: user.email,
        university: user.university || '',
        major: user.major || '',
        companyName: user.companyName || '',
        bio: user.bio || '',
        phone: user.phone || '',
        skills: (user.skills || []).join(', '),
      });
      setInitialized(true);
    }
  }, [user, initialized]);

  const completion = useMemo(() => {
    if (!user) return 0;
    return calcCompletion({
      ...user,
      bio: form.bio,
      phone: form.phone,
      university: form.university,
      major: form.major,
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      companyName: form.companyName,
    });
  }, [user, form]);

  const missingFields = useMemo(() => {
    if (!user) return [];
    const missing: string[] = [];
    if (!form.bio) missing.push('bio');
    if (!form.phone) missing.push('phone');
    if (user.role === 'student') {
      if (!form.university) missing.push('university');
      if (!form.major) missing.push('major');
      if (!form.skills.trim()) missing.push('skills');
    } else {
      if (!form.companyName) missing.push('companyName');
    }
    return missing;
  }, [user, form]);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: form.name.trim(),
      university: form.university.trim() || undefined,
      major: form.major.trim() || undefined,
      companyName: form.companyName.trim() || undefined,
      bio: form.bio.trim() || undefined,
      phone: form.phone.trim() || undefined,
      skills: form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!user) return null;

  return (
    <section className="page-profile">
      <div className="container">
        <div className="prof-layout">
          {/* profile header */}
          <div className="prof-header fade-up">
            <div className="prof-avatar" style={{
              background: user.role === 'student'
                ? 'linear-gradient(135deg,#7C3AED,#A78BFA)'
                : 'linear-gradient(135deg,#10B981,#059669)',
            }}>
              {user.avatar}
            </div>
            <div className="prof-info">
              <h1>{user.name}</h1>
              <div className="prof-role-badge">
                <i className={`bx ${user.role === 'student' ? 'bxs-graduation' : 'bxs-building-house'}`} /> {user.role === 'student' ? 'Sinh viên' : 'Doanh nghiệp'}
              </div>
              {user.rating !== undefined && user.rating > 0 && (
                <div className="prof-rating"><i className="bx bxs-star" /> {user.rating}/5.0 · <i className="bx bx-trophy" /> {user.completedJobs || 0} job hoàn thành</div>
              )}
              <div className="prof-completion">
                <div className="prof-comp-bar">
                  <div
                    className="prof-comp-fill"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <span className="prof-comp-text">{completion}%</span>
              </div>
            </div>
          </div>

          {/* Quick stats for students */}
          {user.role === 'student' && (
            <div className="prof-stats fade-up">
              <div className="prof-stat-card">
                <div className="prof-stat-icon"><i className="bx bx-trophy" /></div>
                <div className="prof-stat-num">{user.completedJobs || 0}</div>
                <div className="prof-stat-label">Job hoàn thành</div>
              </div>
              <div className="prof-stat-card">
                <div className="prof-stat-icon"><i className="bx bxs-star" /></div>
                <div className="prof-stat-num">{user.rating?.toFixed(1) || '0.0'}</div>
                <div className="prof-stat-label">Đánh giá TB</div>
              </div>
              <div className="prof-stat-card">
                <div className="prof-stat-icon"><i className="bx bx-target-lock" /></div>
                <div className="prof-stat-num">{(user.skills || []).length}</div>
                <div className="prof-stat-label">Kỹ năng</div>
              </div>
              <div className="prof-stat-card">
                <div className="prof-stat-icon"><i className="bx bx-bar-chart-alt-2" /></div>
                <div className="prof-stat-num">{completion}%</div>
                <div className="prof-stat-label">Hoàn thiện</div>
              </div>
            </div>
          )}

          {/* Completion tips */}
          {missingFields.length > 0 && completion < 100 && (
            <div className="prof-tips fade-up">
              <div className="prof-tips-header">
                <span><i className="bx bx-bulb" /></span>
                <strong>Hoàn thiện hồ sơ để tăng cơ hội được nhận</strong>
              </div>
              <div className="prof-tips-list">
                {missingFields.map((field) => (
                  <button
                    key={field}
                    className="prof-tip-item"
                    onClick={() => {
                      setActiveSection(field);
                      document.getElementById(`field-${field}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      (document.getElementById(`field-${field}`)?.querySelector('input,textarea') as HTMLElement)?.focus();
                    }}
                  >
                    <span className="prof-tip-icon">+</span>
                    <span>{COMPLETION_TIPS[field]}</span>
                    <span className="prof-tip-arrow">→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Xác thực định danh */}
          <VerificationCard />

          {/* form */}
          <form className="prof-form fade-up" onSubmit={handleSubmit}>
            {saved && <div className="prof-saved"><i className="bx bx-check-circle" /> Đã lưu thay đổi!</div>}

            <h2>Thông tin cá nhân</h2>

            <div className="prof-grid">
              <div className="prof-field">
                <label>Họ tên</label>
                <input type="text" value={form.name} onChange={set('name')} />
              </div>
              <div className="prof-field">
                <label>Email</label>
                <input type="email" value={form.email} disabled />
              </div>
              <div className="prof-field" id="field-phone">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="0912 345 678"
                  className={activeSection === 'phone' ? 'prof-field-highlight' : ''}
                />
              </div>

              {user.role === 'student' ? (
                <>
                  <div className="prof-field" id="field-university">
                    <label>Trường đại học</label>
                    <input type="text" value={form.university} onChange={set('university')} />
                  </div>
                  <div className="prof-field" id="field-major">
                    <label>Ngành học</label>
                    <input type="text" value={form.major} onChange={set('major')} />
                  </div>
                </>
              ) : (
                <div className="prof-field" id="field-companyName">
                  <label>Tên công ty</label>
                  <input type="text" value={form.companyName} onChange={set('companyName')} />
                </div>
              )}
            </div>

            <h2 style={{ marginTop: 32 }}>Giới thiệu bản thân</h2>
            <div className="prof-field" id="field-bio">
              <textarea
                value={form.bio}
                onChange={set('bio')}
                rows={4}
                placeholder="Viết vài dòng giới thiệu về bạn, kinh nghiệm, mục tiêu nghề nghiệp..."
              />
              <small>{form.bio.length}/500 ký tự</small>
            </div>

            {user.role === 'student' && (
              <>
                <h2 style={{ marginTop: 32 }}>Kỹ năng</h2>
                <div className="prof-field" id="field-skills">
                  <input
                    type="text"
                    value={form.skills}
                    onChange={set('skills')}
                    placeholder="React, Figma, Photoshop, Content Writing..."
                  />
                  <small>Phân tách bằng dấu phẩy · {form.skills.split(',').filter(s => s.trim()).length} kỹ năng</small>
                </div>
                {form.skills && (
                  <div className="prof-skills-preview">
                    {form.skills.split(',').map((s) => s.trim()).filter(Boolean).map((s) => (
                      <span key={s} className="prof-skill-tag">{s}</span>
                    ))}
                  </div>
                )}
              </>
            )}

            <div className="prof-actions">
              <button type="submit" className="btn btn-primary"><i className="bx bx-save" /> Lưu thay đổi</button>
              <Link to="/dashboard" className="btn btn-ghost">← Về Dashboard</Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
