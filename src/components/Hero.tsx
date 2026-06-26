import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceRegistry } from '../services';
import type { PlatformStats } from '../services';

const quickTags = [
  'React Developer',
  'Thiết kế logo',
  'Viết bài SEO',
  'Dịch thuật EN-VI',
  'Fix bug',
  'Khảo sát thị trường',
];

export default function Hero() {
  const [searchMode, setSearchMode] = useState<'find' | 'hire'>('find');
  const [searchValue, setSearchValue] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchMode === 'find') {
      const params = new URLSearchParams();
      if (searchValue.trim()) params.set('q', searchValue);
      if (category) params.set('cat', category);
      navigate(`/jobs${params.toString() ? '?' + params.toString() : ''}`);
    } else {
      navigate('/post-job');
    }
  };

  const handleQuickTag = (tag: string) => {
    setSearchValue(tag);
    navigate(`/jobs?q=${encodeURIComponent(tag)}`);
  };

  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="hero-orb orb1" />
        <div className="hero-orb orb2" />
        <div className="hero-grid" />
      </div>
      <div className="container hero-container">
        <div className="hero-content">
          <h1>
            Bạn có kỹ năng?{' '}
            <span className="highlight">Biến nó</span>
            <br />
            thành <span className="highlight">thu nhập</span>
          </h1>
          <p className="hero-sub">
            Nền tảng kết nối sinh viên Việt Nam với hàng trăm doanh nghiệp.
            Micro-job thực tế, thanh toán bảo mật, AI matching thông minh.
          </p>

          <div className="hero-search-tabs">
            <button
              className={`hero-tab${searchMode === 'find' ? ' active' : ''}`}
              onClick={() => setSearchMode('find')}
            >
              <i className="bx bx-search-alt" /> Tìm việc làm
            </button>
            <button
              className={`hero-tab${searchMode === 'hire' ? ' active' : ''}`}
              onClick={() => setSearchMode('hire')}
            >
              <i className="bx bx-briefcase" /> Tuyển sinh viên
            </button>
          </div>

          {searchMode === 'find' ? (
            <div className="hero-search-box">
              <i className="bx bx-search" />
              <input
                type="text"
                placeholder="Tên job, kỹ năng... (VD: React, Logo, SEO)"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <div className="hero-search-divider" />
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Tất cả ngành</option>
                <option value="it">IT / Lập trình</option>
                <option value="design">Thiết kế</option>
                <option value="marketing">Marketing</option>
                <option value="content">Content</option>
                <option value="language">Ngôn ngữ</option>
              </select>
              <button className="btn btn-primary" onClick={handleSearch}>
                Tìm kiếm
              </button>
            </div>
          ) : (
            <div className="hero-search-box hero-search-box--hire">
              <i className="bx bx-edit" />
              <div className="hero-hire-text">
                <strong>Đăng job miễn phí</strong>
                <span>Tiếp cận hàng nghìn sinh viên có kỹ năng phù hợp</span>
              </div>
              <button className="btn btn-primary" onClick={handleSearch}>
                Đăng việc ngay
              </button>
            </div>
          )}

          <div className="hero-quick-tags">
            <span className="hero-tags-label">Tìm nhiều:</span>
            {quickTags.map((tag) => (
              <span key={tag} className="hero-tag" onClick={() => handleQuickTag(tag)}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function SocialProof() {
  const [stats, setStats] = useState<PlatformStats>({ totalJobs: 0, totalBusinesses: 0, totalStudents: 0 });

  useEffect(() => {
    serviceRegistry.site.getPlatformStats().then(setStats);
  }, []);

  const partners = [
    { name: 'FPT', abbr: 'FPT', color: '#E8731A' },
    { name: 'VNG', abbr: 'VNG', color: '#1A73E8' },
    { name: 'Tiki', abbr: 'Tiki', color: '#1A94FF' },
    { name: 'Shopee', abbr: 'SP', color: '#EE4D2D' },
    { name: 'MoMo', abbr: 'MM', color: '#A50064' },
    { name: 'Grab', abbr: 'GR', color: '#00B14F' },
  ];

  return (
    <section className="social-proof">
      <div className="container">
        <div className="sp-inner">
          <div className="sp-stats">
            <div className="sp-stat">
              <strong>{stats.totalJobs > 0 ? stats.totalJobs.toLocaleString('vi-VN') + '+' : '---'}</strong>
              <span>Việc làm</span>
            </div>
            <div className="sp-divider" />
            <div className="sp-stat">
              <strong>{stats.totalBusinesses > 0 ? stats.totalBusinesses.toLocaleString('vi-VN') + '+' : '---'}</strong>
              <span>Doanh nghiệp</span>
            </div>
            <div className="sp-divider" />
            <div className="sp-stat">
              <strong>{stats.totalStudents > 0 ? stats.totalStudents.toLocaleString('vi-VN') + '+' : '---'}</strong>
              <span>Sinh viên</span>
            </div>
          </div>
          <div className="sp-partners">
            <span className="sp-partners-label">Tin tưởng bởi:</span>
            <div className="sp-partners-logos">
              {partners.map((p) => (
                <span key={p.name} className="sp-partner" style={{ color: p.color }}>
                  <span className="sp-partner-abbr" style={{ background: `${p.color}18` }}>{p.abbr}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
