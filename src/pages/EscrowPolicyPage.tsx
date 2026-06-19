import { Link } from 'react-router-dom';

// ============================================================
// Trang Chính sách UniTask (/policy, /escrow-policy).
// Tổng hợp đầy đủ: Escrow, Hoàn tiền, Xử lý vi phạm, Bồi thường,
// Báo cáo vi phạm, Giải quyết tranh chấp, Tiêu chí phán quyết.
// Mỗi mục: code + nội dung + (ghi chú: mục đích / ví dụ).
// auto = điều khoản đã được hệ thống tự động thực thi.
// ============================================================

interface PolicyItem {
  code: string;
  title?: string;
  rule: string;
  note?: string;
  auto?: boolean;
}
interface PolicyGroup {
  id: string;
  heading: string;
  subtitle?: string;
  items: PolicyItem[];
}

const GROUPS: PolicyGroup[] = [
  {
    id: 'escrow',
    heading: 'Chính sách Escrow — Bảo vệ tiền hai chiều',
    subtitle: 'Áp dụng cho mọi giao dịch trên nền tảng.',
    items: [
      { code: '1.1', rule: 'Doanh nghiệp phải nạp đủ 100% giá trị task vào Escrow trước khi task được hiển thị cho người nhận.', note: 'Mục đích: ngăn doanh nghiệp đăng task "ảo" không có ngân sách.', auto: true },
      { code: '1.2', rule: 'Tiền Escrow được giải phóng cho người thực hiện trong vòng 24 giờ sau khi doanh nghiệp xác nhận nghiệm thu, hoặc sau 72 giờ nếu doanh nghiệp không phản hồi.', note: 'Nguyên tắc "im lặng = chấp thuận" bảo vệ người thực hiện khỏi bị treo tiền vô thời hạn.', auto: true },
      { code: '1.3', rule: 'Nếu doanh nghiệp hủy task sau khi người thực hiện đã bắt đầu làm: hoàn tiền theo tỷ lệ tiến độ đã hoàn thành (do UniTask xác nhận), tối thiểu 30% nếu đã qua 48 giờ kể từ lúc nhận task.', note: 'Bảo vệ công sức người thực hiện, tránh bị hủy tùy tiện khi đã đầu tư thời gian.' },
      { code: '1.4', rule: 'Doanh nghiệp chỉ được từ chối nghiệm thu khi có lý do cụ thể và bằng chứng kèm theo. Từ chối không hợp lệ sau 3 lần sẽ bị khóa tính năng đăng task.', note: 'Ngăn hành vi "nhận hàng rồi từ chối vô lý" để chiếm dụng sản phẩm miễn phí.', auto: true },
      { code: '1.5', rule: 'UniTask không sử dụng tiền Escrow cho bất kỳ mục đích kinh doanh nào của công ty. Tiền được giữ tách biệt trong tài khoản ủy thác chuyên dụng.', note: 'Tuân thủ yêu cầu của NHNN về tách biệt vốn Escrow và vốn hoạt động.' },
    ],
  },
  {
    id: 'refund',
    heading: 'Chính sách hoàn tiền',
    subtitle: 'Các trường hợp được hoàn tiền toàn phần hoặc một phần.',
    items: [
      { code: '2.1', rule: 'Hoàn 100% cho doanh nghiệp nếu người thực hiện không bắt đầu trong 48h sau khi nhận task, hoặc bỏ task giữa chừng không có lý do.' },
      { code: '2.2', rule: 'Hoàn 100% cho người thực hiện nếu doanh nghiệp hủy tài khoản hoặc bị khóa do vi phạm trong khi task đang thực hiện.' },
      { code: '2.3', rule: 'Tranh chấp chất lượng: UniTask xử lý trong 5 ngày làm việc, có thể hoàn một phần (50–80%) tùy mức độ sản phẩm đạt yêu cầu.', note: 'Tiêu chí đánh giá dựa trên mô tả task gốc, không áp dụng tiêu chuẩn ngoài phạm vi đã thỏa thuận.' },
    ],
  },
  {
    id: 'violation',
    heading: 'Khung xử lý vi phạm — 3 mức độ',
    subtitle: 'Minh bạch, nhất quán, có thể kháng cáo.',
    items: [
      { code: 'M1', title: 'Cảnh cáo chính thức', rule: 'Ghi nhận vào hồ sơ, ảnh hưởng điểm uy tín nhẹ (–5 điểm). Áp dụng cho vi phạm lần đầu, mức độ nhẹ.', note: 'Ví dụ: nộp muộn không báo trước, review thiếu khách quan, phản hồi chậm quá 48h.' },
      { code: 'M2', title: 'Đình chỉ có thời hạn 7–30 ngày', rule: 'Không được đăng/nhận task mới. Áp dụng vi phạm lần 2 hoặc vi phạm mức trung.', note: 'Ví dụ: hủy task lần 2 không lý do, vi phạm NDA nhẹ, review trả thù được xác minh.' },
      { code: 'M3', title: 'Khóa tài khoản vĩnh viễn', rule: 'Xóa khỏi hệ thống, không thể đăng ký lại bằng cùng CCCD. Áp dụng vi phạm nghiêm trọng hoặc tái phạm sau đình chỉ.', note: 'Ví dụ: lừa đảo Escrow, giao dịch bypass lần 2, tiết lộ dữ liệu bảo mật doanh nghiệp, nội dung bất hợp pháp.' },
    ],
  },
  {
    id: 'compensation',
    heading: 'Khung bồi thường thiệt hại',
    subtitle: 'Liquidated damages — đồng ý từ trước, không cần chứng minh thiệt hại thực tế.',
    items: [
      { code: 'BT1', rule: 'Bypass giao dịch ngoài nền tảng: bồi thường 20% giá trị giao dịch ước tính, tối thiểu 500.000đ.' },
      { code: 'BT2', rule: 'Vi phạm NDA — tiết lộ thông tin bảo mật: bồi thường tối thiểu 5.000.000đ, có thể cao hơn nếu doanh nghiệp chứng minh thiệt hại thực tế lớn hơn.' },
      { code: 'BT3', rule: 'Giao nộp sản phẩm vi phạm bản quyền gây thiệt hại cho doanh nghiệp: người thực hiện chịu toàn bộ trách nhiệm pháp lý và bồi thường; UniTask không chịu liên đới.' },
      { code: 'BT4', rule: 'Doanh nghiệp từ chối nghiệm thu vô lý sau khi hòa giải viên xác nhận sản phẩm đạt yêu cầu: doanh nghiệp mất toàn bộ tiền Escrow và bị cộng điểm xấu vào lịch sử.' },
    ],
  },
  {
    id: 'report',
    heading: 'Quy trình báo cáo vi phạm',
    subtitle: 'Người dùng có thể báo cáo ẩn danh nếu muốn.',
    items: [
      { code: 'BC1', rule: 'Báo cáo inline: nhấn nút "Báo cáo" trên bất kỳ tin nhắn, task, hoặc profile. Phân loại: Lừa đảo / Vi phạm NDA / Ngôn ngữ xúc phạm / Bypass / Khác.' },
      { code: 'BC2', rule: 'UniTask gửi xác nhận tiếp nhận trong 1 giờ, cập nhật tiến trình sau 24 giờ, và kết luận cuối cùng trong 5 ngày làm việc.' },
      { code: 'BC3', rule: 'Người báo cáo sai sự thật cố ý (vu cáo) cũng bị xử phạt ở mức tương đương vi phạm bị cáo buộc.', note: 'Ngăn chặn lạm dụng hệ thống báo cáo để hại đối thủ cạnh tranh.' },
    ],
  },
  {
    id: 'dispute',
    heading: 'Quy trình giải quyết tranh chấp — 4 bước',
    subtitle: 'Từ thương lượng đến trọng tài chính thức.',
    items: [
      { code: 'B1', rule: 'Thương lượng trực tiếp qua chat UniTask — tối đa 48 giờ. Hai bên tự đàm phán, UniTask không can thiệp.', note: 'Ước tính 70% tranh chấp giải quyết được ở bước này nếu hai bên thiện chí.' },
      { code: 'B2', rule: 'Mở yêu cầu hòa giải: một bên nhấn "Yêu cầu hỗ trợ tranh chấp". UniTask chỉ định hòa giải viên trong 24 giờ.' },
      { code: 'B3', rule: 'Hòa giải viên xem xét bằng chứng từ hai bên (mô tả task gốc, file trao đổi, sản phẩm nộp, lịch sử chat) và ra Quyết định Tạm thời trong 5 ngày làm việc.', note: 'Quyết định Tạm thời có hiệu lực ngay với Escrow — tiền được giải phóng/hoàn theo quyết định trong khi chờ kháng cáo.' },
      { code: 'B4', rule: 'Kháng cáo: bên không đồng ý có 7 ngày để kháng cáo lên Ban phúc thẩm UniTask (3 thành viên cấp cao). Sau đó có thể đưa lên VIAC nếu vẫn không thỏa thuận.' },
    ],
  },
  {
    id: 'criteria',
    heading: 'Tiêu chí phán quyết',
    subtitle: 'Minh bạch để cả hai bên biết trước hòa giải viên đánh giá theo tiêu chí nào.',
    items: [
      { code: 'T1', rule: 'Sản phẩm có đáp ứng các tiêu chí đã ghi trong mô tả task gốc không? Tiêu chí ngoài phạm vi mô tả không được tính.' },
      { code: 'T2', rule: 'Hai bên có trao đổi về yêu cầu thay đổi không? Thay đổi được ghi nhận qua chat UniTask mới có giá trị; yêu cầu miệng bên ngoài không được tính.' },
      { code: 'T3', rule: 'Deadline có được gia hạn chính thức không? Nếu doanh nghiệp tự ý gia hạn mà không ghi trong hệ thống thì người thực hiện không bị phạt khi nộp đúng deadline gốc.' },
      { code: 'T4', rule: 'Ai là người vi phạm trước? Nếu doanh nghiệp chậm cung cấp tài liệu dẫn đến trễ deadline, lỗi thuộc về doanh nghiệp.' },
    ],
  },
];

export default function EscrowPolicyPage() {
  return (
    <section className="page-policy">
      <div className="container">
        <div className="policy-hero fade-up">
          <div className="section-eyebrow">Chính sách</div>
          <h1>Chính sách UniTask</h1>
          <p>
            Bộ quy tắc bảo vệ tiền và quyền lợi hai chiều giữa doanh nghiệp và người thực hiện:
            Escrow, hoàn tiền, xử lý vi phạm, bồi thường, báo cáo và giải quyết tranh chấp.
          </p>
          <div className="policy-meta">
            <span>Áp dụng cho tất cả giao dịch</span>
            <span className="dot">•</span>
            <span>Mục có <i className="bx bx-cog" /> được hệ thống tự động thực thi</span>
          </div>
          <div className="policy-actions">
            <Link to="/contact" className="btn btn-primary">Liên hệ hỗ trợ</Link>
            <Link to="/terms" className="btn btn-ghost">Điều khoản sử dụng</Link>
          </div>
        </div>

        <div className="policy-layout">
          <aside className="policy-toc fade-up">
            <h3>Mục lục</h3>
            <ul>
              {GROUPS.map((g) => (
                <li key={g.id}><a href={`#${g.id}`}>{g.heading}</a></li>
              ))}
            </ul>
            <div className="policy-note">
              <i className="bx bx-cog" /> Đã tự động hoá: 1.1, 1.2, 1.4. Các điều còn lại đang ở dạng quy định/vận hành.
            </div>
          </aside>

          <div className="policy-content">
            {GROUPS.map((g) => (
              <div key={g.id} id={g.id}>
                <article className="policy-card fade-up">
                  <h2>{g.heading}</h2>
                  {g.subtitle && <p className="policy-desc">{g.subtitle}</p>}
                  <ul>
                    {g.items.map((it) => (
                      <li key={it.code} style={{ marginBottom: 10 }}>
                        <strong>{it.code}{it.title ? ` — ${it.title}` : ''}{it.auto ? ' <i className="bx bx-cog" />' : ''}:</strong>{' '}
                        {it.rule}
                        {it.note && (
                          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 3 }}>{it.note}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
