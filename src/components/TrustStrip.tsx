export default function TrustStrip() {
  const items = [
    { icon: 'bx-shield-quarter', text: <><strong>Escrow</strong> bảo vệ 100%</> },
    { icon: 'bx-check-circle', text: <>Xác thực <strong>sinh viên &amp; DN</strong></> },
    { icon: 'bx-target-lock', text: <><strong>Gợi ý việc</strong> theo ngành học</> },
    { icon: 'bx-file', text: <>Tự động tạo <strong>Hồ sơ số</strong></> },
    { icon: 'bx-dollar-circle', text: <><strong>0%</strong> phí ứng tuyển</> },
  ];

  return (
    <div className="trust-strip">
      <div className="container">
        <div className="trust-inner">
          {items.map((item, i) => (
            <div className="trust-item" key={i}>
              <span className="icon"><i className={`bx ${item.icon}`} /></span>
              <div>{item.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
