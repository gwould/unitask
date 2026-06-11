import { useState } from 'react';
import { Link } from 'react-router-dom';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'UniTask có miễn phí cho sinh viên không?',
    answer: 'Có! Sinh viên hoàn toàn miễn phí khi đăng ký, tìm việc và ứng tuyển. UniTask chỉ thu phí từ phía doanh nghiệp khi tuyển dụng thành công.',
  },
  {
    question: 'Làm sao để xác thực tài khoản sinh viên?',
    answer: 'Bạn có thể xác thực bằng email .edu, thẻ sinh viên hoặc giấy xác nhận. Hệ thống sẽ xác minh trong vòng 24 giờ và thông báo qua email.',
  },
  {
    question: 'Hệ thống Escrow hoạt động như thế nào?',
    answer: 'Doanh nghiệp nạp tiền vào tài khoản Escrow trước khi job bắt đầu. Tiền được giữ an toàn và chỉ giải phóng cho sinh viên sau khi doanh nghiệp duyệt sản phẩm. Nếu có tranh chấp, đội ngũ UniTask sẽ hỗ trợ giải quyết.',
  },
  {
    question: 'Tôi chưa có kinh nghiệm, có ứng tuyển được không?',
    answer: 'Hoàn toàn được! Nhiều job trên UniTask được thiết kế cho sinh viên chưa có kinh nghiệm. Hệ thống Smart Matching sẽ gợi ý những job phù hợp với ngành học và kỹ năng của bạn.',
  },
  {
    question: 'Thời gian nhận tiền sau khi hoàn thành job?',
    answer: 'Sau khi doanh nghiệp duyệt sản phẩm, tiền từ Escrow sẽ được chuyển vào ví UniTask ngay lập tức. Bạn có thể rút về tài khoản ngân hàng trong vòng 24 giờ.',
  },
  {
    question: 'Doanh nghiệp đăng tuyển mất phí bao nhiêu?',
    answer: 'UniTask cung cấp nhiều gói dịch vụ phù hợp với quy mô khác nhau: gói Starter miễn phí (3 job/tháng), gói Growth 499K/tháng, và gói Pro 999K/tháng với đầy đủ tính năng nâng cao.',
  },
];

function FAQAccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className={`faq-item${isOpen ? ' open' : ''}`}>
      <button className="faq-question" onClick={onToggle}>
        <span>{item.question}</span>
        <span className="faq-icon">{isOpen ? '−' : '+'}</span>
      </button>
      <div className="faq-answer" style={{ maxHeight: isOpen ? 300 : 0 }}>
        <p>{item.answer}</p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="faq-section" id="faq">
      <div className="container">
        <div className="faq-layout">
          <div className="faq-left fade-up">
            <div className="section-eyebrow">Câu hỏi thường gặp</div>
            <h2 className="section-title">Bạn thắc mắc?<br />Chúng tôi giải đáp</h2>
            <p className="section-sub">
              Tìm câu trả lời nhanh cho những câu hỏi phổ biến nhất. Không tìm thấy? Hãy liên hệ đội ngũ hỗ trợ.
            </p>
            <div style={{ marginTop: 32 }}>
              <Link to="/contact" className="btn btn-primary">💬 Chat với hỗ trợ</Link>
            </div>
          </div>
          <div className="faq-right fade-up">
            {faqData.map((item, i) => (
              <FAQAccordionItem
                key={i}
                item={item}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
