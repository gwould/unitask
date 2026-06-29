import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { portfolioService } from '../services/portfolioService';
import type { PortfolioProject, Education, Certification } from '../types/portfolio';

type EditingProject = Omit<PortfolioProject, 'id'> & { id?: string };
type EditingEducation = Omit<Education, 'id'> & { id?: string };
type EditingCertification = Omit<Certification, 'id'> & { id?: string };

const emptyProject: EditingProject = {
  title: '', description: '', imageUrl: '', projectUrl: '', githubUrl: '',
  tags: '', role: '', startDate: '', endDate: '', isHighlighted: false, sortOrder: 0,
};
const emptyEducation: EditingEducation = {
  institution: '', degree: '', fieldOfStudy: '', startYear: undefined,
  endYear: undefined, gpa: undefined, description: '', isCurrent: false, sortOrder: 0,
};
const emptyCertification: EditingCertification = {
  name: '', issuingOrganization: '', issueDate: '', expirationDate: '',
  credentialUrl: '', credentialId: '', imageUrl: '', sortOrder: 0,
};

export default function PortfolioBuilderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = String(user?.id ?? '');

  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'education' | 'certifications'>('projects');
  const [editingProject, setEditingProject] = useState<EditingProject | null>(null);
  const [editingEducation, setEditingEducation] = useState<EditingEducation | null>(null);
  const [editingCertification, setEditingCertification] = useState<EditingCertification | null>(null);
  const [toast, setToast] = useState('');

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'student') { navigate('/login'); return; }
    loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      const [p, e, c] = await Promise.all([
        portfolioService.getProjects(userId).catch(() => []),
        portfolioService.getEducations(userId).catch(() => []),
        portfolioService.getCertifications(userId).catch(() => []),
      ]);
      // Phòng thủ: API có thể trả object/paged thay vì mảng → tránh crash khi .map().
      setProjects(Array.isArray(p) ? p : []);
      setEducations(Array.isArray(e) ? e : []);
      setCertifications(Array.isArray(c) ? c : []);
    } finally { setLoading(false); }
  }

  // === Project CRUD ===
  async function saveProject() {
    if (!editingProject?.title) return;
    setSaving(true);
    try {
      const data = { ...editingProject, sortOrder: editingProject.sortOrder || projects.length };
      if (editingProject.id) {
        await portfolioService.updateProject(userId, editingProject.id, data);
        showToast('Đã cập nhật dự án');
      } else {
        await portfolioService.createProject(userId, data);
        showToast('Đã thêm dự án');
      }
      setEditingProject(null);
      await loadData();
    } catch { showToast('Lỗi khi lưu dự án'); }
    finally { setSaving(false); }
  }

  async function deleteProject(id: string) {
    if (!confirm('Xóa dự án này?')) return;
    try {
      await portfolioService.deleteProject(userId, id);
      showToast('Đã xóa dự án');
      await loadData();
    } catch { showToast('Lỗi khi xóa dự án'); }
  }

  // === Education CRUD ===
  async function saveEducation() {
    if (!editingEducation?.institution) return;
    setSaving(true);
    try {
      const data = { ...editingEducation, sortOrder: editingEducation.sortOrder || educations.length };
      if (editingEducation.id) {
        await portfolioService.updateEducation(userId, editingEducation.id, data);
        showToast('Đã cập nhật học vấn');
      } else {
        await portfolioService.createEducation(userId, data);
        showToast('Đã thêm học vấn');
      }
      setEditingEducation(null);
      await loadData();
    } catch { showToast('Lỗi khi lưu học vấn'); }
    finally { setSaving(false); }
  }

  async function deleteEducation(id: string) {
    if (!confirm('Xóa mục học vấn này?')) return;
    try {
      await portfolioService.deleteEducation(userId, id);
      showToast('Đã xóa');
      await loadData();
    } catch { showToast('Lỗi khi xóa học vấn'); }
  }

  // === Certification CRUD ===
  async function saveCertification() {
    if (!editingCertification?.name) return;
    setSaving(true);
    try {
      const data = { ...editingCertification, sortOrder: editingCertification.sortOrder || certifications.length };
      if (editingCertification.id) {
        await portfolioService.updateCertification(userId, editingCertification.id, data);
        showToast('Đã cập nhật chứng chỉ');
      } else {
        await portfolioService.createCertification(userId, data);
        showToast('Đã thêm chứng chỉ');
      }
      setEditingCertification(null);
      await loadData();
    } catch { showToast('Lỗi khi lưu chứng chỉ'); }
    finally { setSaving(false); }
  }

  async function deleteCertification(id: string) {
    if (!confirm('Xóa chứng chỉ này?')) return;
    try {
      await portfolioService.deleteCertification(userId, id);
      showToast('Đã xóa');
      await loadData();
    } catch { showToast('Lỗi khi xóa chứng chỉ'); }
  }

  if (!user || user.role !== 'student') return null;

  return (
    <section className="pf-builder">
      <div className="container">
        {toast && <div className="pf-toast">{toast}</div>}

        <div className="pf-builder-header">
          <div>
            <h1>Portfolio Builder</h1>
            <p className="pf-subtitle">Xây dựng hồ sơ chuyên nghiệp để gây ấn tượng với nhà tuyển dụng</p>
          </div>
          <div className="pf-header-actions">
            <button className="btn btn-outline" onClick={() => navigate(`/portfolio/${userId}`)}>
              <span className="pf-icon">👁</span> Xem Portfolio
            </button>
            <button className="btn btn-primary" onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/portfolio/${userId}`);
              showToast('Đã sao chép link portfolio');
            }}>
              <span className="pf-icon">🔗</span> Sao chép link
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="pf-tabs">
          {(['projects', 'education', 'certifications'] as const).map(tab => (
            <button
              key={tab}
              className={`pf-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'projects' ? '🚀 Dự án' : tab === 'education' ? '🎓 Học vấn' : '📜 Chứng chỉ'}
              <span className="pf-tab-count">
                {tab === 'projects' ? projects.length : tab === 'education' ? educations.length : certifications.length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="pf-loading"><div className="spinner" /></div>
        ) : (
          <div className="pf-tab-content">
            {/* === PROJECTS TAB === */}
            {activeTab === 'projects' && (
              <div className="pf-section">
                <div className="pf-section-header">
                  <h2>Dự án & Sản phẩm</h2>
                  <button className="btn btn-primary btn-sm" onClick={() => setEditingProject({ ...emptyProject, sortOrder: projects.length })}>
                    + Thêm dự án
                  </button>
                </div>

                {editingProject && (
                  <div className="pf-form-card">
                    <h3>{editingProject.id ? 'Chỉnh sửa dự án' : 'Thêm dự án mới'}</h3>
                    <div className="pf-form-grid">
                      <div className="pf-field pf-field-full">
                        <label>Tên dự án *</label>
                        <input value={editingProject.title} onChange={e => setEditingProject({ ...editingProject, title: e.target.value })} placeholder="VD: UniTask - Nền tảng việc làm sinh viên" />
                      </div>
                      <div className="pf-field pf-field-full">
                        <label>Mô tả</label>
                        <textarea rows={3} value={editingProject.description || ''} onChange={e => setEditingProject({ ...editingProject, description: e.target.value })} placeholder="Mô tả ngắn gọn về dự án, công nghệ sử dụng, kết quả đạt được..." />
                      </div>
                      <div className="pf-field">
                        <label>Vai trò</label>
                        <input value={editingProject.role || ''} onChange={e => setEditingProject({ ...editingProject, role: e.target.value })} placeholder="VD: Frontend Developer" />
                      </div>
                      <div className="pf-field">
                        <label>Tags (cách nhau bởi dấu phẩy)</label>
                        <input value={editingProject.tags || ''} onChange={e => setEditingProject({ ...editingProject, tags: e.target.value })} placeholder="React, Node.js, MongoDB" />
                      </div>
                      <div className="pf-field">
                        <label>Link hình ảnh</label>
                        <input value={editingProject.imageUrl || ''} onChange={e => setEditingProject({ ...editingProject, imageUrl: e.target.value })} placeholder="https://..." />
                      </div>
                      <div className="pf-field">
                        <label>Link dự án</label>
                        <input value={editingProject.projectUrl || ''} onChange={e => setEditingProject({ ...editingProject, projectUrl: e.target.value })} placeholder="https://..." />
                      </div>
                      <div className="pf-field">
                        <label>GitHub</label>
                        <input value={editingProject.githubUrl || ''} onChange={e => setEditingProject({ ...editingProject, githubUrl: e.target.value })} placeholder="https://github.com/..." />
                      </div>
                      <div className="pf-field pf-field-row">
                        <div>
                          <label>Bắt đầu</label>
                          <input type="date" value={editingProject.startDate?.slice(0, 10) || ''} onChange={e => setEditingProject({ ...editingProject, startDate: e.target.value })} />
                        </div>
                        <div>
                          <label>Kết thúc</label>
                          <input type="date" value={editingProject.endDate?.slice(0, 10) || ''} onChange={e => setEditingProject({ ...editingProject, endDate: e.target.value })} />
                        </div>
                      </div>
                      <div className="pf-field pf-field-full">
                        <label className="pf-checkbox">
                          <input type="checkbox" checked={editingProject.isHighlighted || false} onChange={e => setEditingProject({ ...editingProject, isHighlighted: e.target.checked })} />
                          <span>Đánh dấu nổi bật</span>
                        </label>
                      </div>
                    </div>
                    <div className="pf-form-actions">
                      <button className="btn btn-outline" onClick={() => setEditingProject(null)}>Hủy</button>
                      <button className="btn btn-primary" onClick={saveProject} disabled={saving}>
                        {saving ? 'Đang lưu...' : 'Lưu'}
                      </button>
                    </div>
                  </div>
                )}

                {projects.length === 0 && !editingProject ? (
                  <div className="pf-empty">
                    <div className="pf-empty-icon">🚀</div>
                    <h3>Chưa có dự án nào</h3>
                    <p>Thêm các dự án bạn đã thực hiện để thể hiện năng lực</p>
                  </div>
                ) : (
                  <div className="pf-items-grid">
                    {projects.map(p => (
                      <div key={p.id} className={`pf-project-card ${p.isHighlighted ? 'highlighted' : ''}`}>
                        {p.imageUrl && <div className="pf-project-img"><img src={p.imageUrl} alt={p.title} /></div>}
                        <div className="pf-project-body">
                          <h3>{p.title} {p.isHighlighted && <span className="pf-badge-star">⭐</span>}</h3>
                          {p.role && <span className="pf-role-tag">{p.role}</span>}
                          {p.description && <p className="pf-desc">{p.description}</p>}
                          {p.tags && (
                            <div className="pf-tags">
                              {p.tags.split(',').map((t, i) => <span key={i} className="pf-tag">{t.trim()}</span>)}
                            </div>
                          )}
                          <div className="pf-project-links">
                            {p.projectUrl && <a href={p.projectUrl} target="_blank" rel="noreferrer">🔗 Demo</a>}
                            {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer">💻 GitHub</a>}
                          </div>
                          <div className="pf-card-actions">
                            <button className="btn btn-sm btn-outline" onClick={() => setEditingProject(p)}>Sửa</button>
                            <button className="btn btn-sm btn-danger-outline" onClick={() => deleteProject(p.id)}>Xóa</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* === EDUCATION TAB === */}
            {activeTab === 'education' && (
              <div className="pf-section">
                <div className="pf-section-header">
                  <h2>Học vấn</h2>
                  <button className="btn btn-primary btn-sm" onClick={() => setEditingEducation({ ...emptyEducation, sortOrder: educations.length })}>
                    + Thêm học vấn
                  </button>
                </div>

                {editingEducation && (
                  <div className="pf-form-card">
                    <h3>{editingEducation.id ? 'Chỉnh sửa học vấn' : 'Thêm học vấn mới'}</h3>
                    <div className="pf-form-grid">
                      <div className="pf-field pf-field-full">
                        <label>Trường/Tổ chức *</label>
                        <input value={editingEducation.institution} onChange={e => setEditingEducation({ ...editingEducation, institution: e.target.value })} placeholder="VD: Đại học Bách Khoa TP.HCM" />
                      </div>
                      <div className="pf-field">
                        <label>Bằng cấp</label>
                        <select value={editingEducation.degree || ''} onChange={e => setEditingEducation({ ...editingEducation, degree: e.target.value })}>
                          <option value="">Chọn bằng cấp</option>
                          <option value="Cử nhân">Cử nhân</option>
                          <option value="Kỹ sư">Kỹ sư</option>
                          <option value="Thạc sĩ">Thạc sĩ</option>
                          <option value="Tiến sĩ">Tiến sĩ</option>
                          <option value="Cao đẳng">Cao đẳng</option>
                          <option value="Chứng chỉ">Chứng chỉ</option>
                        </select>
                      </div>
                      <div className="pf-field">
                        <label>Chuyên ngành</label>
                        <input value={editingEducation.fieldOfStudy || ''} onChange={e => setEditingEducation({ ...editingEducation, fieldOfStudy: e.target.value })} placeholder="VD: Khoa học Máy tính" />
                      </div>
                      <div className="pf-field pf-field-row">
                        <div>
                          <label>Năm bắt đầu</label>
                          <input type="number" min={1990} max={2040} value={editingEducation.startYear ?? ''} onChange={e => setEditingEducation({ ...editingEducation, startYear: e.target.value ? Number(e.target.value) : undefined })} />
                        </div>
                        <div>
                          <label>Năm kết thúc</label>
                          <input type="number" min={1990} max={2040} value={editingEducation.endYear ?? ''} onChange={e => setEditingEducation({ ...editingEducation, endYear: e.target.value ? Number(e.target.value) : undefined })} disabled={editingEducation.isCurrent || false} />
                        </div>
                      </div>
                      <div className="pf-field">
                        <label>GPA</label>
                        <input type="number" step="0.01" min={0} max={4} value={editingEducation.gpa ?? ''} onChange={e => setEditingEducation({ ...editingEducation, gpa: e.target.value ? Number(e.target.value) : undefined })} placeholder="VD: 3.5" />
                      </div>
                      <div className="pf-field">
                        <label className="pf-checkbox">
                          <input type="checkbox" checked={editingEducation.isCurrent || false} onChange={e => setEditingEducation({ ...editingEducation, isCurrent: e.target.checked, endYear: e.target.checked ? undefined : editingEducation.endYear })} />
                          <span>Đang học tại đây</span>
                        </label>
                      </div>
                      <div className="pf-field pf-field-full">
                        <label>Mô tả thêm</label>
                        <textarea rows={2} value={editingEducation.description || ''} onChange={e => setEditingEducation({ ...editingEducation, description: e.target.value })} placeholder="Hoạt động ngoại khóa, thành tích, câu lạc bộ..." />
                      </div>
                    </div>
                    <div className="pf-form-actions">
                      <button className="btn btn-outline" onClick={() => setEditingEducation(null)}>Hủy</button>
                      <button className="btn btn-primary" onClick={saveEducation} disabled={saving}>
                        {saving ? 'Đang lưu...' : 'Lưu'}
                      </button>
                    </div>
                  </div>
                )}

                {educations.length === 0 && !editingEducation ? (
                  <div className="pf-empty">
                    <div className="pf-empty-icon">🎓</div>
                    <h3>Chưa có thông tin học vấn</h3>
                    <p>Thêm các trường bạn đã/đang theo học</p>
                  </div>
                ) : (
                  <div className="pf-items-list">
                    {educations.map(e => (
                      <div key={e.id} className="pf-edu-card">
                        <div className="pf-edu-icon">🎓</div>
                        <div className="pf-edu-body">
                          <h3>{e.institution}</h3>
                          <p className="pf-edu-degree">
                            {[e.degree, e.fieldOfStudy].filter(Boolean).join(' - ')}
                          </p>
                          <p className="pf-edu-year">
                            {e.startYear ?? '?'} - {e.isCurrent ? 'Hiện tại' : (e.endYear ?? '?')}
                            {e.gpa != null && <span className="pf-gpa">GPA: {e.gpa}</span>}
                          </p>
                          {e.description && <p className="pf-desc">{e.description}</p>}
                        </div>
                        <div className="pf-card-actions">
                          <button className="btn btn-sm btn-outline" onClick={() => setEditingEducation(e)}>Sửa</button>
                          <button className="btn btn-sm btn-danger-outline" onClick={() => deleteEducation(e.id)}>Xóa</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* === CERTIFICATIONS TAB === */}
            {activeTab === 'certifications' && (
              <div className="pf-section">
                <div className="pf-section-header">
                  <h2>Chứng chỉ</h2>
                  <button className="btn btn-primary btn-sm" onClick={() => setEditingCertification({ ...emptyCertification, sortOrder: certifications.length })}>
                    + Thêm chứng chỉ
                  </button>
                </div>

                {editingCertification && (
                  <div className="pf-form-card">
                    <h3>{editingCertification.id ? 'Chỉnh sửa chứng chỉ' : 'Thêm chứng chỉ mới'}</h3>
                    <div className="pf-form-grid">
                      <div className="pf-field pf-field-full">
                        <label>Tên chứng chỉ *</label>
                        <input value={editingCertification.name} onChange={e => setEditingCertification({ ...editingCertification, name: e.target.value })} placeholder="VD: AWS Certified Cloud Practitioner" />
                      </div>
                      <div className="pf-field">
                        <label>Tổ chức cấp</label>
                        <input value={editingCertification.issuingOrganization || ''} onChange={e => setEditingCertification({ ...editingCertification, issuingOrganization: e.target.value })} placeholder="VD: Amazon Web Services" />
                      </div>
                      <div className="pf-field">
                        <label>Mã chứng chỉ</label>
                        <input value={editingCertification.credentialId || ''} onChange={e => setEditingCertification({ ...editingCertification, credentialId: e.target.value })} placeholder="VD: ABC-123-XYZ" />
                      </div>
                      <div className="pf-field pf-field-row">
                        <div>
                          <label>Ngày cấp</label>
                          <input type="date" value={editingCertification.issueDate?.slice(0, 10) || ''} onChange={e => setEditingCertification({ ...editingCertification, issueDate: e.target.value })} />
                        </div>
                        <div>
                          <label>Ngày hết hạn</label>
                          <input type="date" value={editingCertification.expirationDate?.slice(0, 10) || ''} onChange={e => setEditingCertification({ ...editingCertification, expirationDate: e.target.value })} />
                        </div>
                      </div>
                      <div className="pf-field">
                        <label>Link xác thực</label>
                        <input value={editingCertification.credentialUrl || ''} onChange={e => setEditingCertification({ ...editingCertification, credentialUrl: e.target.value })} placeholder="https://..." />
                      </div>
                      <div className="pf-field">
                        <label>Hình ảnh chứng chỉ</label>
                        <input value={editingCertification.imageUrl || ''} onChange={e => setEditingCertification({ ...editingCertification, imageUrl: e.target.value })} placeholder="https://..." />
                      </div>
                    </div>
                    <div className="pf-form-actions">
                      <button className="btn btn-outline" onClick={() => setEditingCertification(null)}>Hủy</button>
                      <button className="btn btn-primary" onClick={saveCertification} disabled={saving}>
                        {saving ? 'Đang lưu...' : 'Lưu'}
                      </button>
                    </div>
                  </div>
                )}

                {certifications.length === 0 && !editingCertification ? (
                  <div className="pf-empty">
                    <div className="pf-empty-icon">📜</div>
                    <h3>Chưa có chứng chỉ</h3>
                    <p>Thêm các chứng chỉ và khóa học đã hoàn thành</p>
                  </div>
                ) : (
                  <div className="pf-items-list">
                    {certifications.map(c => (
                      <div key={c.id} className="pf-cert-card">
                        {c.imageUrl ? (
                          <div className="pf-cert-img"><img src={c.imageUrl} alt={c.name} /></div>
                        ) : (
                          <div className="pf-cert-icon">📜</div>
                        )}
                        <div className="pf-cert-body">
                          <h3>{c.name}</h3>
                          {c.issuingOrganization && <p className="pf-cert-org">{c.issuingOrganization}</p>}
                          <p className="pf-cert-date">
                            {c.issueDate ? new Date(c.issueDate).toLocaleDateString('vi-VN') : ''}
                            {c.expirationDate && ` - ${new Date(c.expirationDate).toLocaleDateString('vi-VN')}`}
                          </p>
                          {c.credentialId && <p className="pf-cert-id">ID: {c.credentialId}</p>}
                          {c.credentialUrl && <a href={c.credentialUrl} target="_blank" rel="noreferrer" className="pf-cert-link">Xem chứng chỉ →</a>}
                        </div>
                        <div className="pf-card-actions">
                          <button className="btn btn-sm btn-outline" onClick={() => setEditingCertification(c)}>Sửa</button>
                          <button className="btn btn-sm btn-danger-outline" onClick={() => deleteCertification(c.id)}>Xóa</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
