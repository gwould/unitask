import { useState } from 'react';

const FAQS = [
  {
    q: 'UniTask co mien phi khong?',
    a: 'Hoan toan mien phi cho sinh vien. Doanh nghiep co the bat dau voi goi Free Starter (0d/thang, 5 job/thang). Chi phi hoa hong chi tinh khi giao dich hoan tat qua Escrow.',
  },
  {
    q: 'Lam sao de dam bao toi duoc tra tien?',
    a: 'Tien luong duoc giu trong he thong Escrow truoc khi sinh vien bat dau lam. Chi giai ngan khi doanh nghiep xac nhan san pham dat yeu cau. Neu co tranh chap, UniTask dong vai tro trung gian xu ly.',
  },
  {
    q: 'Toi chua co kinh nghiem, co ung tuyen duoc khong?',
    a: 'Duoc! Nhieu job tren UniTask la micro-task khong yeu cau kinh nghiem truoc do. He thong goi y job phu hop voi nganh hoc va ky nang cua ban, chi can dang ky va bat dau.',
  },
  {
    q: 'Doanh nghiep co the dang nhung loai job nao?',
    a: 'Tat ca cac loai: thiet ke logo, viet bai SEO, lap trinh web/app, dich thuat, quay video, khao sat, nhap lieu, va nhieu hon. Job co the la micro-task (1-3 ngay), ngan han (1-2 tuan), hoac project (1-3 thang).',
  },
  {
    q: 'Thoi gian rut tien mat bao lau?',
    a: 'Sau khi doanh nghiep duyet san pham, tien tu dong chuyen vao vi UniTask cua ban. Rut ve tai khoan ngan hang hoac vi MoMo trong vong 24h lam viec.',
  },
  {
    q: 'UniTask co xac thuc sinh vien va doanh nghiep khong?',
    a: 'Co. Sinh vien xac thuc bang email .edu hoac the sinh vien. Doanh nghiep xac thuc bang giay phep kinh doanh. Tai khoan da xac thuc se co dau tick xanh.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="faq-section">
      <div className="container">
        <div className="section-header fade-up">
          <div className="section-eyebrow">Cau hoi thuong gap</div>
          <h2 className="section-title">Ban can biet gi?</h2>
          <p className="section-sub">Nhung thac mac pho bien nhat tu sinh vien va doanh nghiep</p>
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
