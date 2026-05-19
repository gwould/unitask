import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    id: 'account',
    title: 'Tài khoản và đăng ký',
    desc: 'Thông tin cơ bản về việc tạo tài khoản và sử dụng dịch vụ.',
    items: [
      'Người dùng cần cung cấp thông tin chính xác và cập nhật khi có thay đổi.',
      'Mỗi tài khoản gắn với một cá nhân hoặc tổ chức cụ thể; không chia sẻ mật khẩu.',
      'UniTask có thể tạm khóa tài khoản nếu phát hiện hoạt động bất thường hoặc vi phạm.',
    ],
  },
  {
    id: 'responsibility',
    title: 'Quyền và nghĩa vụ người dùng',
    desc: 'Các hành vi được phép và không được phép khi sử dụng nền tảng.',
    items: [
      'Tương tác một cách tôn trọng và bảo mật thông tin của đối tác.',
      'Không đăng tải nội dung giả mạo, lừa đảo, hoặc vi phạm pháp luật.',
      'Tự chịu trách nhiệm về mọi thông tin, bài đăng, và hồ sơ công việc.',
    ],
  },
  {
    id: 'escrow',
    title: 'Giao dịch và Escrow',
    desc: 'Nguyên tắc thanh toán an toàn thông qua cơ chế Escrow.',
    items: [
      'Doanh nghiệp nên nạp tiền vào Escrow trước khi giao việc.',
      'Tiền chỉ được giải ngân khi công việc được xác nhận hoàn thành.',
      'Tranh chấp về thanh toán sẽ được hỗ trợ qua kênh chăm sóc khách hàng.',
    ],
  },
  {
    id: 'transaction-terms',
    title: 'Thỏa thuận giao dịch',
    desc: 'Quy định chi tiết về phí, hoàn tiền, và thời hạn xử lý giao dịch.',
    items: [
      'Mọi giao dịch cần thực hiện qua hệ thống UniTask để được bảo vệ bởi Escrow.',
      'Phí giao dịch: sinh viên được miễn phí 5 giao dịch đầu tiên; job dưới 2.000.000 VNĐ thu 10%, job từ 2.000.000 VNĐ trở lên thu 8%.',
      'Doanh nghiệp cần phản hồi hoặc duyệt sản phẩm trong tối đa 3 ngày làm việc kể từ khi nhận bàn giao (trừ khi có thỏa thuận khác).',
      'Yêu cầu hoàn tiền chỉ được xem xét khi có đủ bằng chứng, tuân thủ quy trình hỗ trợ và các mốc thời gian quy định.',
      'Các trường hợp hoàn tiền phổ biến gồm: không bàn giao sản phẩm, bàn giao sai phạm vi, hoặc vi phạm điều khoản đã thống nhất.',
      'Trong trường hợp có tranh chấp, hai bên cần hợp tác cung cấp thông tin đối chiếu.',
    ],
  },
  {
    id: 'prohibited',
    title: 'Nội dung cấm/vi phạm',
    desc: 'Danh sách hành vi bị nghiêm cấm trên UniTask.',
    items: [
      'Đăng tải nội dung vi phạm pháp luật, phân biệt đối xử, hoặc kích động bạo lực.',
      'Thu thập dữ liệu người dùng khi chưa có sự đồng ý.',
      'Sử dụng nền tảng để phát tán mã độc, spam, hoặc gian lận tài chính.',
    ],
  },
  {
    id: 'ip',
    title: 'Sở hữu trí tuệ',
    desc: 'Quyền đối với nội dung và sản phẩm được tạo ra.',
    items: [
      'Tác giả giữ quyền sở hữu đối với sản phẩm do mình tạo ra, nếu không có thỏa thuận khác.',
      'Bên giao việc được sử dụng sản phẩm theo phạm vi thỏa thuận đã thống nhất.',
      'UniTask có quyền sử dụng logo/thương hiệu khi có sự đồng ý của chủ sở hữu.',
    ],
  },
  {
    id: 'liability',
    title: 'Giới hạn trách nhiệm',
    desc: 'Phạm vi trách nhiệm của UniTask trong quá trình vận hành.',
    items: [
      'UniTask là nền tảng kết nối, không là bên tuyển dụng trực tiếp.',
      'UniTask không chịu trách nhiệm cho thỏa thuận ngoài nền tảng.',
      'Chúng tôi sẽ cố gắng hỗ trợ nhưng không đảm bảo kết quả 100%.',
    ],
  },
  {
    id: 'dispute',
    title: 'Giải quyết tranh chấp',
    desc: 'Quy trình xử lý tranh chấp khi phát sinh vấn đề.',
    items: [
      'Ưu tiên thương lượng thông qua kênh hỗ trợ chính thức của UniTask.',
      'Nếu không thể giải quyết, các bên có thể đưa vụ việc tới cơ quan có thẩm quyền.',
      'Thông tin giao dịch được lưu trữ để hỗ trợ đối chiếu khi cần.',
    ],
  },
  {
    id: 'updates',
    title: 'Cập nhật điều khoản',
    desc: 'Cách thông báo khi điều khoản được điều chỉnh.',
    items: [
      'Điều khoản có thể được cập nhật để phù hợp quy định mới.',
      'Chúng tôi sẽ thông báo trên website hoặc qua email (nếu cần).',
      'Việc tiếp tục sử dụng dịch vụ đồng nghĩa với việc chấp nhận cập nhật.',
    ],
  },
];

export default function TermsPage() {
  return (
    <section className="page-policy">
      <div className="container">
        <div className="policy-hero fade-up">
          <div className="section-eyebrow">Điều khoản</div>
          <h1>Điều khoản sử dụng UniTask</h1>
          <p>
            Tài liệu mang tính tham khảo, nhằm tổng hợp các quy định cơ bản để bảo vệ người dùng.
          </p>
          <div className="policy-meta">
            <span>Cập nhật lần cuối: 19/05/2026</span>
            <span className="dot">•</span>
            <span>Áp dụng cho toàn bộ người dùng trên UniTask</span>
          </div>
          <div className="policy-actions">
            <Link to="/contact" className="btn btn-primary">Liên hệ hỗ trợ</Link>
            <Link to="/privacy" className="btn btn-ghost">Xem chính sách bảo mật</Link>
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
