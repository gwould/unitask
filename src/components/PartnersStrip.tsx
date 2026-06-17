export default function PartnersStrip() {
  const partners = [
    { name: 'FPT Software', abbr: 'FPT', color: '#E8731A', bg: 'rgba(232,115,26,.12)' },
    { name: 'VNG Corporation', abbr: 'VNG', color: '#1877F2', bg: 'rgba(24,119,242,.12)' },
    { name: 'Tiki', abbr: 'TK', color: '#1A94FF', bg: 'rgba(26,148,255,.12)' },
    { name: 'Shopee', abbr: 'SP', color: '#EE4D2D', bg: 'rgba(238,77,45,.12)' },
    { name: 'VinGroup', abbr: 'VIN', color: '#C41230', bg: 'rgba(196,18,48,.12)' },
    { name: 'VNPT Technology', abbr: 'VNP', color: '#0066B3', bg: 'rgba(0,102,179,.12)' },
    { name: 'MoMo', abbr: 'MM', color: '#A50064', bg: 'rgba(165,0,100,.12)' },
    { name: 'Grab Vietnam', abbr: 'GR', color: '#00B14F', bg: 'rgba(0,177,79,.12)' },
    { name: 'Zalo', abbr: 'ZL', color: '#0068FF', bg: 'rgba(0,104,255,.12)' },
    { name: 'Viettel Digital', abbr: 'VTD', color: '#EE1C25', bg: 'rgba(238,28,37,.12)' },
  ];

  const track = [...partners, ...partners];

  return (
    <section className="partners-section">
      <div className="partners-label">
        Đối tác tin cậy
      </div>
      <div className="partners-track-wrap">
        <div className="partners-fade partners-fade-left" />
        <div className="partners-fade partners-fade-right" />
        <div className="partners-track">
          {track.map((p, i) => (
            <div key={i} className="partner-logo" style={{ borderColor: `${p.color}22` }}>
              <div className="partner-abbr" style={{ background: p.bg, color: p.color }}>
                {p.abbr}
              </div>
              <span className="partner-name" style={{ color: p.color }}>{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
