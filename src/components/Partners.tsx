export default function Partners() {
  const partners = [
    { name: 'FPT Software', letter: 'F', gradient: 'linear-gradient(135deg,#E8530E,#FF8C00)' },
    { name: 'Viettel', letter: 'V', gradient: 'linear-gradient(135deg,#E40613,#FF4D6B)' },
    { name: 'VNG Corp', letter: 'VNG', gradient: 'linear-gradient(135deg,#0066FF,#00AAFF)' },
    { name: 'Shopee', letter: 'S', gradient: 'linear-gradient(135deg,#EE4D2D,#FF7849)' },
    { name: 'Tiki', letter: 'T', gradient: 'linear-gradient(135deg,#1A94FF,#5BB7FF)' },
    { name: 'MoMo', letter: 'M', gradient: 'linear-gradient(135deg,#A50064,#D1247C)' },
    { name: 'Grab', letter: 'G', gradient: 'linear-gradient(135deg,#00B14F,#00D464)' },
    { name: 'VNPAY', letter: 'VN', gradient: 'linear-gradient(135deg,#005BAA,#0080E6)' },
  ];

  return (
    <section className="partners-section">
      <div className="container">
        <div className="section-header fade-up">
          <div className="section-eyebrow">Đối tác tin cậy</div>
          <h2 className="section-title">Doanh nghiệp hàng đầu đồng hành</h2>
          <p className="section-sub">
            Hàng trăm startup & doanh nghiệp uy tín đã tin tưởng UniTask để tìm kiếm nhân tài sinh viên
          </p>
        </div>
        <div className="partners-marquee fade-up">
          <div className="marquee-track">
            {[...partners, ...partners].map((p, i) => (
              <div className="partner-card" key={i}>
                <div className="partner-logo" style={{ background: p.gradient }}>
                  {p.letter}
                </div>
                <span className="partner-name">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="partners-note fade-up">
          <span>🤝</span> Và hơn <strong>850+</strong> doanh nghiệp khác đang tuyển dụng trên UniTask
        </div>
      </div>
    </section>
  );
}
