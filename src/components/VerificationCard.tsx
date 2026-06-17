import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../services/profileService';

export default function VerificationCard() {
  const { user } = useAuth();
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);

  // student fields
  const [studentEmail, setStudentEmail] = useState('');
  const [studentCardUrl, setStudentCardUrl] = useState('');
  const [citizenId, setCitizenId] = useState('');
  // business fields
  const [taxCode, setTaxCode] = useState('');
  const [licenseUrl, setLicenseUrl] = useState('');

  const isStudent = user?.role === 'student';
  const isBusiness = user?.role === 'business';

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!user) return;
    const id = String(user.id);
    (isStudent ? profileService.getStudentVerification(id) : isBusiness ? profileService.getBusinessVerification(id) : Promise.resolve(null))
      .then((p) => {
        if (!p) return;
        setVerified(Boolean(p.isVerified));
        if ('studentEmail' in p) {
          setStudentEmail(p.studentEmail ?? '');
          setStudentCardUrl(p.studentCardUrl ?? '');
          setCitizenId(p.citizenId ?? '');
        }
        if ('taxCode' in p) {
          setTaxCode(p.taxCode ?? '');
          setLicenseUrl(p.businessLicenseUrl ?? '');
        }
      })
      .finally(() => setLoading(false));
  }, [user, isStudent, isBusiness]);

  if (!user || user.role === 'admin') return null;

  const submit = async () => {
    setBusy(true); setMsg(null);
    try {
      if (isStudent) {
        await profileService.verifyStudentIdentity(String(user.id), {
          studentEmail: studentEmail.trim() || undefined,
          studentCardUrl: studentCardUrl.trim() || undefined,
          citizenId: citizenId.trim(),
        });
      } else {
        await profileService.verifyBusinessIdentity(String(user.id), {
          taxCode: taxCode.trim(),
          businessLicenseUrl: licenseUrl.trim(),
        });
      }
      setVerified(true);
      setMsg({ text: 'Xác thực thành công! Tài khoản của bạn đã được xác minh.', ok: true });
      setToast({ text: '✅ Xác thực thành công! Tài khoản đã được xác minh.', ok: true });
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Xác thực thất bại.';
      setMsg({ text: errMsg, ok: false });
      setToast({ text: `❌ ${errMsg}`, ok: false });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="prof-section fade-up">
      <div className="prof-section-head">
        <h3>🛡️ Xác thực định danh</h3>
        {verified
          ? <span className="ms-badge ms-completed">✓ Đã xác thực</span>
          : <span className="ms-badge ms-pending">Chưa xác thực</span>}
      </div>

      {loading ? (
        <div className="spinner" />
      ) : verified ? (
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
          Tài khoản của bạn đã được xác minh. Có thể cập nhật lại thông tin bên dưới nếu cần.
        </p>
      ) : (
        <p style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 12 }}>
          {isStudent
            ? 'Bắt buộc xác thực để nhận task: email .edu do trường cấp HOẶC ảnh thẻ sinh viên, kèm số CCCD gắn chip.'
            : 'Bắt buộc xác thực để đăng task: Mã số thuế (MST) và Giấy phép kinh doanh hợp pháp.'}
        </p>
      )}

      {isStudent ? (
        <div className="vf-form">
          <input className="ms-form-input" placeholder="Email trường cấp (đuôi .edu)" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} disabled={busy} />
          <input className="ms-form-input" placeholder="Link ảnh thẻ sinh viên (nếu không có email .edu)" value={studentCardUrl} onChange={(e) => setStudentCardUrl(e.target.value)} disabled={busy} />
          <input className="ms-form-input" placeholder="Số CCCD gắn chip (bắt buộc)" value={citizenId} onChange={(e) => setCitizenId(e.target.value)} disabled={busy} />
        </div>
      ) : (
        <div className="vf-form">
          <input className="ms-form-input" placeholder="Mã số thuế (MST)" value={taxCode} onChange={(e) => setTaxCode(e.target.value)} disabled={busy} />
          <input className="ms-form-input" placeholder="Link giấy phép kinh doanh" value={licenseUrl} onChange={(e) => setLicenseUrl(e.target.value)} disabled={busy} />
        </div>
      )}

      {msg && (
        <p style={{ marginTop: 10, fontSize: 13, color: msg.ok ? 'var(--teal)' : 'var(--red)' }}>{msg.text}</p>
      )}

      <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} disabled={busy} onClick={submit}>
        {busy ? 'Đang gửi…' : verified ? 'Cập nhật xác thực' : 'Gửi xác thực'}
      </button>

      {toast && (
        <div
          className={`apps-toast ${toast.ok ? 'apps-toast-success' : 'apps-toast-error'}`}
          style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 10000 }}
        >
          <span>{toast.text}</span>
          <button className="apps-toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}
    </div>
  );
}
