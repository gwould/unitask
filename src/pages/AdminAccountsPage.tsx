import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  adminUserService,
  type AdminUser,
  type UserSort,
} from '../services/adminUserService';

// ============================================================
// AdminAccountsPage — Quản lý người dùng (CRUD) cho Admin.
//   • Tìm kiếm (tên/email/SĐT) + lọc theo vai trò & trạng thái + sắp xếp
//   • Vô hiệu hóa / kích hoạt tài khoản
//   • Thêm / Sửa / Xóa người dùng
// Search/filter/phân trang chạy server-side qua /api/users.
// ============================================================

const PAGE_SIZE = 12;

const ROLE_LABEL: Record<string, string> = {
  student: 'Sinh viên', business: 'Doanh nghiệp', admin: 'Quản trị',
};
const ROLE_ICON: Record<string, string> = {
  student: 'bx-user', business: 'bx-buildings', admin: 'bx-shield-quarter',
};

type StatusTab = 'all' | 'active' | 'disabled' | 'suspended';
type RoleFilter = 'all' | 'student' | 'business' | 'admin';

type EditState =
  | { mode: 'create' }
  | { mode: 'edit'; user: AdminUser }
  | null;

function initials(name: string) {
  return (name || 'N').trim().charAt(0).toUpperCase();
}

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function statusOf(u: AdminUser): { tab: Exclude<StatusTab, 'all'>; label: string; cls: string; icon: string } {
  if (u.isActive === false) return { tab: 'disabled', label: 'Vô hiệu hóa', cls: 'adm-badge-danger', icon: 'bx-block' };
  if (u.suspendedUntil && new Date(u.suspendedUntil) > new Date())
    return { tab: 'suspended', label: 'Đình chỉ', cls: 'adm-badge-pending', icon: 'bx-time' };
  return { tab: 'active', label: 'Hoạt động', cls: 'adm-badge-success', icon: 'bx-check-circle' };
}

export default function AdminAccountsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bộ lọc
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [role, setRole] = useState<RoleFilter>('all');
  const [status, setStatus] = useState<StatusTab>('all');
  const [sort, setSort] = useState<UserSort>('newest');

  // Hành động & modal
  const [busyId, setBusyId] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditState>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);

  // Tổng quan (lấy từ tổng số mỗi trạng thái — gọi nhẹ count khi cần)
  const [counts, setCounts] = useState({ all: 0, active: 0, disabled: 0, suspended: 0 });

  useEffect(() => {
    if (!user || user.role !== 'admin') navigate('/dashboard');
  }, [user, navigate]);

  // Debounce ô tìm kiếm
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset về trang 1 khi đổi bộ lọc
  useEffect(() => { setPage(1); }, [debounced, role, status, sort]);

  const showToast = useCallback((text: string, ok = true) => {
    setToast({ text, ok });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const reqId = useRef(0);
  const load = useCallback(async () => {
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    try {
      const res = await adminUserService.list({
        q: debounced, role, status, sort, page, limit: PAGE_SIZE,
      });
      if (id !== reqId.current) return; // bỏ qua kết quả cũ
      setUsers(res.data);
      setTotal(res.total);
    } catch (e) {
      if (id !== reqId.current) return;
      setError(e instanceof Error ? e.message : 'Không tải được danh sách người dùng.');
      setUsers([]);
      setTotal(0);
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [debounced, role, status, sort, page]);

  useEffect(() => { load(); }, [load]);

  // Lấy tổng quan theo trạng thái (độc lập với bộ lọc đang chọn)
  const loadCounts = useCallback(async () => {
    try {
      const [all, active, disabled, suspended] = await Promise.all([
        adminUserService.list({ limit: 1 }),
        adminUserService.list({ status: 'active', limit: 1 }),
        adminUserService.list({ status: 'disabled', limit: 1 }),
        adminUserService.list({ status: 'suspended', limit: 1 }),
      ]);
      setCounts({
        all: all.total, active: active.total,
        disabled: disabled.total, suspended: suspended.total,
      });
    } catch { /* không chặn UI */ }
  }, []);

  useEffect(() => { loadCounts(); }, [loadCounts]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleToggleStatus = async (u: AdminUser) => {
    const disabling = u.isActive !== false;
    setBusyId(u.id);
    try {
      await adminUserService.setStatus(u.id, !disabling);
      showToast(disabling ? `Đã vô hiệu hóa "${u.fullName}".` : `Đã kích hoạt "${u.fullName}".`);
      await Promise.all([load(), loadCounts()]);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Thao tác thất bại.', false);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const u = confirmDelete;
    setBusyId(u.id);
    try {
      await adminUserService.remove(u.id);
      showToast(`Đã xóa "${u.fullName}".`);
      setConfirmDelete(null);
      await Promise.all([load(), loadCounts()]);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không thể xóa tài khoản.', false);
    } finally {
      setBusyId(null);
    }
  };

  const stats = useMemo(() => ([
    { key: 'all', num: counts.all, label: 'Tổng người dùng', cls: '', icon: 'bx-group' },
    { key: 'active', num: counts.active, label: 'Đang hoạt động', cls: 'adm-stat-success', icon: 'bx-check-circle' },
    { key: 'suspended', num: counts.suspended, label: 'Bị đình chỉ', cls: 'adm-stat-warning', icon: 'bx-time' },
    { key: 'disabled', num: counts.disabled, label: 'Vô hiệu hóa', cls: 'adm-stat-danger', icon: 'bx-block' },
  ]), [counts]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="adm-page">
      <div className="adm-container adm-container-wide">
        {/* Header */}
        <div className="adm-header adm-header-row">
          <div>
            <h1 className="adm-title"><i className="bx bx-group" /> Quản lý người dùng</h1>
            <p className="adm-subtitle">Tìm kiếm, lọc, chỉnh sửa và vô hiệu hóa tài khoản trên toàn hệ thống</p>
          </div>
          <button className="btn btn-primary" onClick={() => setEdit({ mode: 'create' })}>
            <i className="bx bx-plus" /> Thêm người dùng
          </button>
        </div>

        {/* Stats — bấm để lọc nhanh */}
        <div className="adm-stats adm-stats-4">
          {stats.map((s) => (
            <button
              key={s.key}
              className={`adm-stat-card ${s.cls}${status === s.key ? ' adm-stat-active' : ''}`}
              onClick={() => setStatus(s.key as StatusTab)}
            >
              <div className="adm-stat-num">{s.num}</div>
              <div className="adm-stat-label"><i className={`bx ${s.icon}`} /> {s.label}</div>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="adm-controls">
          <div className="adm-filter-group">
            <div className="adm-tabs">
              {(['all', 'active', 'suspended', 'disabled'] as StatusTab[]).map((t) => (
                <button key={t} className={`adm-tab${status === t ? ' active' : ''}`} onClick={() => setStatus(t)}>
                  {t === 'all' ? 'Tất cả' : t === 'active' ? 'Hoạt động' : t === 'suspended' ? 'Đình chỉ' : 'Vô hiệu hóa'}
                </button>
              ))}
            </div>

            <select className="adm-select" value={role} onChange={(e) => setRole(e.target.value as RoleFilter)}>
              <option value="all">Tất cả vai trò</option>
              <option value="student">Sinh viên</option>
              <option value="business">Doanh nghiệp</option>
              <option value="admin">Quản trị</option>
            </select>

            <select className="adm-select" value={sort} onChange={(e) => setSort(e.target.value as UserSort)}>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name">Tên A–Z</option>
              <option value="rep">Uy tín cao</option>
            </select>
          </div>

          <div className="adm-search">
            <span><i className="bx bx-search" /></span>
            <input
              type="text"
              placeholder="Tìm theo tên, email, số điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="adm-search-clear" onClick={() => setSearch('')} aria-label="Xóa">
                <i className="bx bx-x" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {error ? (
          <div className="adm-empty">
            <div style={{ fontSize: 48, marginBottom: 12 }}><i className="bx bx-error-circle" /></div>
            <h3>Lỗi tải dữ liệu</h3>
            <p>{error}</p>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 14 }} onClick={() => load()}>Thử lại</button>
          </div>
        ) : loading ? (
          <div className="adm-loading">
            <div className="spinner" />
            <p>Đang tải danh sách...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="adm-empty">
            <div style={{ fontSize: 48, marginBottom: 12 }}><i className="bx bx-inbox" /></div>
            <h3>Không tìm thấy người dùng</h3>
            <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Vai trò</th>
                    <th>Uy tín</th>
                    <th>Trạng thái</th>
                    <th>Tham gia</th>
                    <th style={{ textAlign: 'right' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const st = statusOf(u);
                    const isBusy = busyId === u.id;
                    const isSelf = String(user.id) === u.id;
                    const isAdminRow = u.userType === 'admin';
                    return (
                      <tr key={u.id} className={u.isActive === false ? 'adm-row-disabled' : ''}>
                        <td>
                          <div className="adm-biz-name">
                            <div className="adm-biz-avatar">
                              {u.avatarUrl
                                ? <img src={u.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: 10, objectFit: 'cover' }} />
                                : initials(u.fullName)}
                            </div>
                            <div>
                              <strong>{u.fullName}{isSelf && <span className="adm-self-tag">Bạn</span>}</strong>
                              <div className="adm-biz-meta">{u.email}{u.phone ? ` · ${u.phone}` : ''}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`adm-role adm-role-${u.userType}`}>
                            <i className={`bx ${ROLE_ICON[u.userType] ?? 'bx-user'}`} /> {ROLE_LABEL[u.userType] ?? u.userType}
                          </span>
                        </td>
                        <td>
                          <span className="adm-rep">{u.reputationScore ?? 100}</span>
                        </td>
                        <td>
                          <span className={`adm-badge ${st.cls}`}><i className={`bx ${st.icon}`} /> {st.label}</span>
                        </td>
                        <td><span className="adm-no-data">{fmtDate(u.createdAt)}</span></td>
                        <td>
                          <div className="adm-actions">
                            <button
                              className="adm-icon-btn"
                              title="Sửa"
                              onClick={() => setEdit({ mode: 'edit', user: u })}
                              disabled={isBusy}
                            >
                              <i className="bx bx-edit-alt" />
                            </button>
                            <button
                              className={`adm-icon-btn ${u.isActive === false ? 'adm-icon-success' : 'adm-icon-warning'}`}
                              title={u.isActive === false ? 'Kích hoạt' : 'Vô hiệu hóa'}
                              onClick={() => handleToggleStatus(u)}
                              disabled={isBusy || isAdminRow}
                            >
                              <i className={`bx ${u.isActive === false ? 'bx-play-circle' : 'bx-block'}`} />
                            </button>
                            <button
                              className="adm-icon-btn adm-icon-danger"
                              title="Xóa"
                              onClick={() => setConfirmDelete(u)}
                              disabled={isBusy || isAdminRow || isSelf}
                            >
                              <i className="bx bx-trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="adm-pagination">
              <span className="adm-page-info">
                {total} người dùng · Trang {page}/{totalPages}
              </span>
              <div className="adm-page-btns">
                <button className="adm-page-btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <i className="bx bx-chevron-left" /> Trước
                </button>
                <button className="adm-page-btn" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  Sau <i className="bx bx-chevron-right" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal thêm/sửa */}
      {edit && (
        <UserFormModal
          state={edit}
          onClose={() => setEdit(null)}
          onSaved={(msg) => { setEdit(null); showToast(msg); load(); loadCounts(); }}
          onError={(msg) => showToast(msg, false)}
        />
      )}

      {/* Xác nhận xóa */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => !busyId && setConfirmDelete(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 10 }}>Xóa người dùng?</h3>
            <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 20 }}>
              Bạn chắc chắn muốn xóa <strong>{confirmDelete.fullName}</strong> ({confirmDelete.email})?
              Hành động này không thể hoàn tác. Nếu tài khoản còn dữ liệu liên quan, hãy dùng “Vô hiệu hóa”.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(null)} disabled={busyId === confirmDelete.id}>Hủy</button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={busyId === confirmDelete.id}>
                {busyId === confirmDelete.id ? 'Đang xóa…' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`apps-toast ${toast.ok ? 'apps-toast-success' : 'apps-toast-error'}`}>
          <span><i className={`bx ${toast.ok ? 'bx-check-circle' : 'bx-error-circle'}`} /></span> {toast.text}
          <button className="apps-toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}
    </div>
  );
}

// ─── Modal thêm / sửa người dùng ──────────────────────────
function UserFormModal({
  state, onClose, onSaved, onError,
}: {
  state: Exclude<EditState, null>;
  onClose: () => void;
  onSaved: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const isEdit = state.mode === 'edit';
  const u = isEdit ? state.user : null;

  const [fullName, setFullName] = useState(u?.fullName ?? '');
  const [email, setEmail] = useState(u?.email ?? '');
  const [phone, setPhone] = useState(u?.phone ?? '');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState(u?.userType ?? 'student');
  const [isVerified, setIsVerified] = useState(u?.isVerified ?? false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!fullName.trim()) return onError('Vui lòng nhập họ tên.');
    if (!email.trim() || !email.includes('@')) return onError('Email không hợp lệ.');
    if (!isEdit && password.length < 6) return onError('Mật khẩu phải có ít nhất 6 ký tự.');

    setBusy(true);
    try {
      if (isEdit && u) {
        await adminUserService.update(u.id, {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          userType,
          isVerified,
        });
        onSaved(`Đã cập nhật "${fullName.trim()}".`);
      } else {
        await adminUserService.create({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
          userType,
        });
        onSaved(`Đã tạo tài khoản "${fullName.trim()}".`);
      }
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Lưu thất bại.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => !busy && onClose()}>
      <div className="modal-box adm-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="adm-form-head">
          <h3>{isEdit ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</h3>
          <button className="adm-icon-btn" onClick={onClose} disabled={busy}><i className="bx bx-x" /></button>
        </div>

        <div className="adm-form-grid">
          <label className="adm-field">
            <span>Họ và tên</span>
            <input className="ms-form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={busy} placeholder="Nguyễn Văn A" />
          </label>
          <label className="adm-field">
            <span>Email</span>
            <input className="ms-form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} placeholder="email@domain.com" />
          </label>
          <label className="adm-field">
            <span>Số điện thoại</span>
            <input className="ms-form-input" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={busy} placeholder="09xxxxxxxx" />
          </label>
          <label className="adm-field">
            <span>Vai trò</span>
            <select className="ms-form-input" value={userType} onChange={(e) => setUserType(e.target.value)} disabled={busy}>
              <option value="student">Sinh viên</option>
              <option value="business">Doanh nghiệp</option>
              <option value="admin">Quản trị</option>
            </select>
          </label>
          {!isEdit && (
            <label className="adm-field adm-field-full">
              <span>Mật khẩu</span>
              <input className="ms-form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={busy} placeholder="Tối thiểu 6 ký tự" />
            </label>
          )}
          {isEdit && (
            <label className="adm-checkbox adm-field-full">
              <input type="checkbox" checked={isVerified} onChange={(e) => setIsVerified(e.target.checked)} disabled={busy} />
              <span>Đã xác minh tài khoản</span>
            </label>
          )}
        </div>

        <div className="adm-form-actions">
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={busy}>Hủy</button>
          <button className="btn btn-primary btn-sm" onClick={submit} disabled={busy}>
            {busy ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản'}
          </button>
        </div>
      </div>
    </div>
  );
}
