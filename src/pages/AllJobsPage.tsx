import { useState } from 'react';
import { Link } from 'react-router-dom';
import { jobsData, type Job } from '../data/siteData';
import { useFadeUpObserver } from '../hooks/useScroll';

const TABS = [
  { label: 'Tất cả', cat: 'all' },
  { label: '💻 IT', cat: 'it' },
  { label: '🎨 Thiết kế', cat: 'design' },
  { label: '✍️ Content', cat: 'content' },
  { label: '📢 Marketing', cat: 'marketing' },
];

function JobCardFull({ job }: { job: Job }) {
  const spotsPct = ((job.spotsTotal - job.spotsLeft) / job.spotsTotal) * 100;
  return (
    <div className={`job-card fade-up${job.featured ? ' featured' : ''}`}>
      <div className="jc-header">
        <div className="jc-logo" style={{ background: job.logoGradient }}>{job.logoText}</div>
        <div className="jc-save">🔖</div>
      </div>
      <div className="jc-title">{job.title}</div>
      <div className="jc-company">
        {job.company} {job.verified && <span className="verified">✅</span>} · {job.location}
      </div>
      <div className="jc-tags">
        {job.tags.map((t, i) => (
          <span key={i} className={`tag tag-${t.variant}`}>{t.label}</span>
        ))}
      </div>
      <div className="jc-spots">
        <span>Còn {job.spotsLeft}/{job.spotsTotal} chỗ</span>
        <div className="spots-bar">
          <div className="spots-fill" style={{ width: `${100 - spotsPct}%` }} />
        </div>
      </div>
      <div className="jc-pay">{job.pay}</div>
      <div className="jc-footer">
        <div className="jc-deadline">{job.deadline}</div>
        <Link to={`/jobs/${job.id}`} className="jc-btn">Xem chi tiết →</Link>
      </div>
    </div>
  );
}

export default function AllJobsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  // Re-trigger fade-up observer when filter/search changes
  useFadeUpObserver([activeTab, search]);

  const filtered = jobsData.filter((j) => {
    const matchCat = activeTab === 'all' || j.category === activeTab;
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div className="page-header fade-up">
          <h1 className="section-title">Tất cả việc làm</h1>
          <p className="section-sub">Hơn 1.100 cơ hội đang chờ bạn. Lọc theo ngành hoặc tìm kiếm nhanh.</p>
        </div>

        <div className="alljobs-toolbar fade-up">
          <div className="search-box" style={{ maxWidth: 500 }}>
            <span style={{ fontSize: 18 }}>🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm job, kỹ năng, công ty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="jobs-tabs">
            {TABS.map((tab) => (
              <div
                key={tab.cat}
                className={`job-tab${activeTab === tab.cat ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.cat)}
              >
                {tab.label}
              </div>
            ))}
          </div>
        </div>

        <div className="jobs-grid" style={{ marginTop: 32 }}>
          {filtered.map((job) => (
            <JobCardFull key={job.id} job={job} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--t3)' }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>🔍</p>
            <p>Không tìm thấy job phù hợp. Hãy thử từ khóa khác.</p>
          </div>
        )}
      </div>
    </div>
  );
}
