import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  // Sync form when user loads (only once per user)
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
                ? 'linear-gradient(135deg,#5B4FFF,#7C72FF)'
                : 'linear-gradient(135deg,#00D4AA,#00A882)',
            }}>
              {user.avatar}
            </div>
            <div className="prof-info">
              <h1>{user.name}</h1>
              <div className="prof-role-badge">
                {user.role === 'student' ? '👨‍🎓 Sinh viên' : '🏢 Doanh nghiệp'}
              </div>
              {user.rating !== undefined && user.rating > 0 && (
                <div className="prof-rating">⭐ {user.rating}/5.0 · 🏆 {user.completedJobs || 0} job hoàn thành</div>
              )}
            </div>
          </div>

          {/* form */}
          <form className="prof-form fade-up" onSubmit={handleSubmit}>
            {saved && <div className="prof-saved">✅ Đã lưu thay đổi!</div>}

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
              <div className="prof-field">
                <label>Số điện thoại</label>
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="0912 345 678" />
              </div>

              {user.role === 'student' ? (
                <>
                  <div className="prof-field">
                    <label>Trường đại học</label>
                    <input type="text" value={form.university} onChange={set('university')} />
                  </div>
                  <div className="prof-field">
                    <label>Ngành học</label>
                    <input type="text" value={form.major} onChange={set('major')} />
                  </div>
                </>
              ) : (
                <div className="prof-field">
                  <label>Tên công ty</label>
                  <input type="text" value={form.companyName} onChange={set('companyName')} />
                </div>
              )}
            </div>

            <h2 style={{ marginTop: 32 }}>Giới thiệu bản thân</h2>
            <div className="prof-field">
              <textarea value={form.bio} onChange={set('bio')} rows={4} placeholder="Viết vài dòng giới thiệu về bạn, kinh nghiệm, mục tiêu nghề nghiệp..." />
            </div>

            {user.role === 'student' && (
              <>
                <h2 style={{ marginTop: 32 }}>Kỹ năng</h2>
                <div className="prof-field">
                  <input type="text" value={form.skills} onChange={set('skills')} placeholder="React, Figma, Photoshop, Content Writing..." />
                  <small style={{ color: 'var(--text-2)', marginTop: 4, display: 'block' }}>Phân tách bằng dấu phẩy</small>
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
              <button type="submit" className="btn btn-primary">💾 Lưu thay đổi</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
