export default function PartnersStrip() {
  const partners = [
    { name: 'FPT Software', color: '#E8731A' },
    { name: 'VNG', color: '#1877F2' },
    { name: 'Tiki', color: '#1A94FF' },
    { name: 'Shopee', color: '#EE4D2D' },
    { name: 'VinGroup', color: '#C41230' },
    { name: 'VNPT', color: '#0066B3' },
    { name: 'Momo', color: '#A50064' },
    { name: 'Grab', color: '#00B14F' },
  ];

  return (
    <section className="partners-section">
      <div className="container">
        <div className="section-header fade-up" style={{ marginBottom: 28 }}>
          <p className="section-sub" style={{ fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.5 }}>
            Sinh vien UniTask da lam viec tai
          </p>
        </div>
        <div className="partners-track fade-up">
          {[...partners, ...partners].map((p, i) => (
            <div key={i} className="partner-logo" style={{ borderColor: `${p.color}33` }}>
              <span style={{ color: p.color, fontWeight: 800, fontSize: 13 }}>{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
