import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    id: 'data',
    title: 'Dữ liệu thu thập',
    desc: 'Loại thông tin có thể được thu thập khi sử dụng UniTask.',
    items: [
      'Thông tin tài khoản: họ tên, email, số điện thoại (nếu có).',
      'Thông tin sử dụng: lịch sử ứng tuyển, giao dịch, và tương tác trên hệ thống.',
      'Dữ liệu kỹ thuật: địa chỉ IP, trình duyệt, thiết bị truy cập.',
    ],
  },
  {
    id: 'purpose',
    title: 'Mục đích sử dụng',
    desc: 'Cách UniTask sử dụng dữ liệu để vận hành dịch vụ.',
    items: [
      'Hỗ trợ kết nối giữa sinh viên và doanh nghiệp.',
      'Cải thiện trải nghiệm, phát hiện gian lận, và bảo vệ hệ thống.',
      'Gửi thông báo về giao dịch, trạng thái ứng tuyển, hoặc cập nhật quan trọng.',
    ],
  },
  {
    id: 'sharing',
    title: 'Chia sẻ dữ liệu',
    desc: 'Nguyên tắc chia sẻ thông tin với bên thứ ba.',
    items: [
      'Không bán dữ liệu cá nhân cho bên thứ ba.',
      'Chỉ chia sẻ khi có sự đồng ý của người dùng hoặc yêu cầu pháp lý.',
      'Đối tác dịch vụ (email, thanh toán) chỉ được truy cập trong phạm vi cần thiết.',
    ],
  },
  {
    id: 'storage',
    title: 'Lưu trữ và bảo mật',
    desc: 'Biện pháp bảo vệ dữ liệu cá nhân.',
    items: [
      'Dữ liệu được lưu trữ trên hệ thống có kiểm soát truy cập.',
      'Áp dụng các biện pháp bảo mật phù hợp với tiêu chuẩn kỹ thuật hiện hành.',
      'Người dùng cần bảo mật tài khoản và thông báo nếu có nghi ngờ rò rỉ.',
    ],
  },
  {
    id: 'cookies',
    title: 'Cookie và tracking',
    desc: 'Cách sử dụng cookie để cải thiện hiệu suất.',
    items: [
      'Cookie giúp ghi nhớ phiên đăng nhập và ưu tiên người dùng.',
      'Bạn có thể tắt cookie trong trình duyệt, nhưng một số tính năng có thể bị ảnh hưởng.',
      'UniTask có thể sử dụng công cụ phân tích để đo hiệu suất dịch vụ.',
    ],
  },
  {
    id: 'rights',
    title: 'Quyền của người dùng',
    desc: 'Các quyền liên quan đến dữ liệu cá nhân.',
    items: [
      'Yêu cầu cập nhật, chỉnh sửa hoặc xóa dữ liệu cá nhân.',
      'Rút lại sự đồng ý xử lý dữ liệu (nếu có).',
      'Yêu cầu giải thích về cách sử dụng thông tin.',
    ],
  },
  {
    id: 'contact',
    title: 'Liên hệ bảo mật',
    desc: 'Kênh liên hệ khi cần hỗ trợ về bảo mật dữ liệu.',
    items: [
      'Email: privacy@unitask.io.vn',
      'Thời gian xử lý: 1-3 ngày làm việc.',
      'Nếu khẩn cấp, vui lòng cung cấp thông tin chi tiết để được ưu tiên xử lý.',
    ],
  },
  {
    id: 'updates',
    title: 'Cập nhật chính sách',
    desc: 'Cách thông báo khi chính sách bảo mật thay đổi.',
    items: [
      'Chính sách có thể được cập nhật theo quy định mới.',
      'Thông báo sẽ được đăng trên website hoặc gửi qua email (nếu cần).',
      'Tiếp tục sử dụng dịch vụ đồng nghĩa với việc chấp nhận chính sách mới.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <section className="page-policy">
      <div className="container">
        <div className="policy-hero fade-up">
          <div className="section-eyebrow">Bảo mật</div>
          <h1>Chính sách bảo mật UniTask</h1>
          <p>
            Tài liệu mang tính tham khảo, mô tả cách UniTask thu thập, sử dụng và bảo vệ dữ liệu.
          </p>
          <div className="policy-meta">
            <span>Cập nhật lần cuối: 19/05/2026</span>
            <span className="dot">•</span>
            <span>Áp dụng cho toàn bộ người dùng trên UniTask</span>
          </div>
          <div className="policy-actions">
            <Link to="/contact" className="btn btn-primary">Liên hệ hỗ trợ</Link>
            <Link to="/terms" className="btn btn-ghost">Xem điều khoản sử dụng</Link>
          </div>
        </div>

        <div className="policy-layout">
          <aside className="policy-toc fade-up">
            <h3>Mục lục</h3>
            <ul>
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
            </ul>
            <div className="policy-note">
              Nội dung chỉ mang tính tham khảo, không thay thế tư vấn pháp lý chuyên sâu.
            </div>
          </aside>

          <div className="policy-content">
            {SECTIONS.map((section) => (
              <article key={section.id} id={section.id} className="policy-card fade-up">
                <h2>{section.title}</h2>
                <p className="policy-desc">{section.desc}</p>
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
