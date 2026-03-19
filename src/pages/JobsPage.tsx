import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { jobsData, categoriesData } from '../data/mockData';

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const initialCat = searchParams.get('cat') || '';

  const [query, setQuery] = useState(initialQ);
  const [category, setCategory] = useState(initialCat);
  const [location, setLocation] = useState('');
  const [sort, setSort] = useState<'newest' | 'pay-high' | 'pay-low' | 'deadline'>('newest');

  const filtered = useMemo(() => {
    let list = [...jobsData];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.skills.some((s) => s.toLowerCase().includes(q)) ||
          j.tags.some((t) => t.label.toLowerCase().includes(q)),
      );
    }

    if (category) {
      list = list.filter((j) => j.category === category);
    }

    if (location) {
      list = list.filter((j) => j.location.toLowerCase().includes(location.toLowerCase()));
    }

    switch (sort) {
      case 'pay-high':
        list.sort((a, b) => b.payMax - a.payMax);
        break;
      case 'pay-low':
        list.sort((a, b) => a.payMin - b.payMin);
        break;
      case 'deadline':
        list.sort((a, b) => a.spotsLeft - b.spotsLeft);
        break;
      default:
        list.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    }

    return list;
  }, [query, category, location, sort]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('cat', category);
    setSearchParams(params);
  };

  return (
    <section className="page-jobs">
      <div className="container">
        {/* page header */}
        <div className="pj-header fade-up">
          <h1 className="section-title">Tìm việc làm</h1>
          <p className="section-sub">
            {filtered.length} job phù hợp
            {query && <> với "<strong>{query}</strong>"</>}
          </p>
        </div>

        {/* filters bar */}
        <div className="pj-filters fade-up">
          <div className="pj-search-row">
            <div className="pj-input-wrap">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Tìm theo tên job, kỹ năng..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Tất cả ngành</option>
              {categoriesData.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
            <select value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="">Tất cả địa điểm</option>
              <option value="Remote">Remote</option>
              <option value="Hồ Chí Minh">Hồ Chí Minh</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
            </select>
            <button className="btn btn-primary" onClick={handleSearch}>
              Tìm kiếm
            </button>
          </div>
          <div className="pj-sort-row">
            <span>Sắp xếp:</span>
            {([
              ['newest', 'Mới nhất'],
              ['pay-high', 'Lương cao → thấp'],
              ['pay-low', 'Lương thấp → cao'],
              ['deadline', 'Sắp hết hạn'],
            ] as const).map(([val, label]) => (
              <button
                key={val}
                className={`pj-sort-btn${sort === val ? ' active' : ''}`}
                onClick={() => setSort(val)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* results */}
        {filtered.length === 0 ? (
          <div className="pj-empty fade-up">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3>Không tìm thấy job phù hợp</h3>
            <p>Thử thay đổi bộ lọc hoặc tìm với từ khóa khác.</p>
          </div>
        ) : (
          <div className="pj-grid">
            {filtered.map((job) => (
              <Link to={`/jobs/${job.id}`} key={job.id} className="pj-card fade-up">
                <div className="pj-card-top">
                  <div className="jc-logo" style={{ background: job.logoGradient }}>
                    {job.logoText}
                  </div>
                  <div className="pj-card-meta">
                    <div className="pj-card-title">{job.title}</div>
                    <div className="pj-card-company">
                      {job.company} {job.verified && '✅'} · {job.location}
                    </div>
                  </div>
                </div>
                <div className="jc-tags" style={{ marginBottom: 10 }}>
                  {job.tags.map((t, i) => (
                    <span key={i} className={`tag tag-${t.variant}`}>{t.label}</span>
                  ))}
                </div>
                <div className="pj-card-skills">
                  {job.skills.slice(0, 4).map((s) => (
                    <span key={s} className="pj-skill">{s}</span>
                  ))}
                </div>
                <div className="pj-card-bottom">
                  <span className="pj-pay">💰 {job.pay}</span>
                  <span className="pj-deadline">⏰ {job.deadline}</span>
                </div>
                <div className="pj-card-spots">
                  Còn {job.spotsLeft}/{job.spotsTotal} chỗ
                  <div className="spots-bar" style={{ flex: 1 }}>
                    <div
                      className="spots-fill"
                      style={{
                        width: `${((job.spotsTotal - job.spotsLeft) / job.spotsTotal) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
