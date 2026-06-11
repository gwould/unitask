import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section className="newsletter-section">
      <div className="container">
        <div className="newsletter-box fade-up">
          <div className="newsletter-content">
            <div className="newsletter-icon">📬</div>
            <h3>Nhận thông báo job mới mỗi tuần</h3>
            <p>
              Đăng ký để nhận những cơ hội việc làm phù hợp nhất, mẹo nghề nghiệp và xu hướng thị trường — trực tiếp vào inbox của bạn.
            </p>
            {submitted ? (
              <div className="newsletter-success">
                <span>✅</span> Đăng ký thành công! Kiểm tra email để xác nhận nhé.
              </div>
            ) : (
              <form className="newsletter-form" onSubmit={handleSubmit}>
                <div className="newsletter-input-wrap">
                  <span className="newsletter-input-icon">✉️</span>
                  <input
                    type="email"
                    placeholder="Email của bạn (VD: name@university.edu.vn)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-accent">
                  Đăng ký ngay
                </button>
              </form>
            )}
            <div className="newsletter-note">
              <span>🔒</span> Không spam. Hủy đăng ký bất cứ lúc nào.
            </div>
          </div>
          <div className="newsletter-visual">
            <div className="nv-card nv-1">
              <span>💼</span>
              <div>
                <strong>3 job mới phù hợp</strong>
                <small>React · Remote · 2-4tr ₫</small>
              </div>
            </div>
            <div className="nv-card nv-2">
              <span>📊</span>
              <div>
                <strong>Báo cáo thị trường IT</strong>
                <small>Xu hướng tuần 09/2026</small>
              </div>
            </div>
            <div className="nv-card nv-3">
              <span>🏆</span>
              <div>
                <strong>Mẹo phỏng vấn online</strong>
                <small>5 phút đọc · Career Tips</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
