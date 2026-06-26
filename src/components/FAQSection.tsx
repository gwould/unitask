import { useState } from 'react';

const FAQS = [
  {
    q: 'UniTask có miễn phí không?',
    a: 'Hoàn toàn miễn phí cho sinh viên. Doanh nghiệp có thể bắt đầu với gói Free Starter (0đ/tháng, 5 job/tháng). Chi phí hoa hồng chỉ tính khi giao dịch hoàn tất qua Escrow.',
  },
  {
    q: 'Làm sao để đảm bảo tôi được trả tiền?',
    a: 'Tiền lương được giữ trong hệ thống Escrow trước khi sinh viên bắt đầu làm. Chỉ giải ngân khi doanh nghiệp xác nhận sản phẩm đạt yêu cầu. Nếu có tranh chấp, UniTask đóng vai trò trung gian xử lý.',
  },
  {
    q: 'Tôi chưa có kinh nghiệm, có ứng tuyển được không?',
    a: 'Được! Nhiều job trên UniTask là micro-task không yêu cầu kinh nghiệm trước đó. Hệ thống gợi ý job phù hợp với ngành học và kỹ năng của bạn, chỉ cần đăng ký và bắt đầu.',
  },
  {
    q: 'Doanh nghiệp có thể đăng những loại job nào?',
    a: 'Tất cả các loại: thiết kế logo, viết bài SEO, lập trình web/app, dịch thuật, quay video, khảo sát, nhập liệu, và nhiều hơn. Job có thể là micro-task (1-3 ngày), ngắn hạn (1-2 tuần), hoặc project (1-3 tháng).',
  },
  {
    q: 'Thời gian rút tiền mất bao lâu?',
    a: 'Sau khi doanh nghiệp duyệt sản phẩm, tiền tự động chuyển vào ví UniTask của bạn. Rút về tài khoản ngân hàng hoặc ví MoMo trong vòng 24h làm việc.',
  },
  {
    q: 'UniTask có xác thực sinh viên và doanh nghiệp không?',
    a: 'Có. Sinh viên xác thực bằng email .edu hoặc thẻ sinh viên. Doanh nghiệp xác thực bằng giấy phép kinh doanh. Tài khoản đã xác thực sẽ có dấu tick xanh.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="faq-section">
      <div className="container">
        <div className="section-header fade-up">
          <div className="section-eyebrow">Câu hỏi thường gặp</div>
          <h2 className="section-title">Bạn cần biết gì?</h2>
          <p className="section-sub">Những thắc mắc phổ biến nhất từ sinh viên và doanh nghiệp</p>
        </div>
        <div className="faq-list fade-up">
          {FAQS.map((faq, i) => (
            <div key={i} className={`faq-item${openIndex === i ? ' open' : ''}`}>
              <button
                className="faq-question"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span>{faq.q}</span>
                <span className="faq-icon">{openIndex === i ? '-' : '+'}</span>
              </button>
              {openIndex === i && (
                <div className="faq-answer">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
