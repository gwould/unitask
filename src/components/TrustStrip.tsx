export default function TrustStrip() {
  const items = [
    { icon: '🛡️', text: <><strong>Escrow</strong> bảo vệ 100%</> },
    { icon: '✅', text: <>Xác thực <strong>sinh viên &amp; DN</strong></> },
    { icon: '🤖', text: <><strong>Smart Match</strong> theo ngành học</> },
    { icon: '📋', text: <>Tự động tạo <strong>Hồ sơ số</strong></> },
    { icon: '💸', text: <><strong>0%</strong> phí ứng tuyển</> },
  ];

  return (
    <div className="trust-strip">
      <div className="trust-inner">
        {items.map((item, i) => (
          <div className="trust-item" key={i}>
            <span className="icon">{item.icon}</span>
            <div>{item.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
