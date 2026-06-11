import { useRef } from 'react';
import { useCounterObserver } from '../hooks/useScroll';

interface StatItem {
  icon: string;
  value: string;
  suffix: string;
  label: string;
  description: string;
}

const statsData: StatItem[] = [
  {
    icon: '🎓',
    value: '12',
    suffix: 'K+',
    label: 'Sinh viên đăng ký',
    description: 'Từ hơn 50 trường Đại học trên cả nước',
  },
  {
    icon: '🏢',
    value: '850',
    suffix: '+',
    label: 'Doanh nghiệp đối tác',
    description: 'Startup, SME & doanh nghiệp lớn tin cậy',
  },
  {
    icon: '💼',
    value: '5.200',
    suffix: '+',
    label: 'Job đã hoàn thành',
    description: 'Tỷ lệ hoàn thành thành công 94%',
  },
  {
    icon: '💰',
    value: '2.8',
    suffix: 'tỷ ₫',
    label: 'Tổng thu nhập sinh viên',
    description: 'Đã chuyển thành công qua Escrow',
  },
];

export default function StatsSection() {
  const statsRef = useRef<HTMLDivElement>(null);
  useCounterObserver(statsRef);

  return (
    <section className="stats-section">
      <div className="container">
        <div className="section-header fade-up">
          <div className="section-eyebrow">Con số ấn tượng</div>
          <h2 className="section-title">Tăng trưởng không ngừng</h2>
          <p className="section-sub">
            Những con số chứng minh sự tin tưởng của cộng đồng sinh viên và doanh nghiệp
          </p>
        </div>
        <div className="stats-grid" ref={statsRef}>
          {statsData.map((stat, i) => (
            <div key={i} className="stats-card fade-up">
              <div className="stats-icon">{stat.icon}</div>
              <div className="stats-value">
                {stat.value}<span>{stat.suffix}</span>
              </div>
              <div className="stats-label">{stat.label}</div>
              <div className="stats-desc">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
