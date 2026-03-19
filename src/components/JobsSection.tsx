import { useState } from 'react';
import { Link } from 'react-router-dom';
import { jobsData } from '../data/mockData';
import type { Job } from '../types';

const TABS = [
  { label: 'Tất cả', cat: 'all' },
  { label: '💻 IT', cat: 'it' },
  { label: '🎨 Thiết kế', cat: 'design' },
  { label: '✍️ Content', cat: 'content' },
  { label: '📢 Marketing', cat: 'marketing' },
];

function JobCard({ job }: { job: Job }) {
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
      <div className="jc-pay">💰 {job.pay}</div>
      <div className="jc-footer">
        <div className="jc-deadline">⏰ {job.deadline}</div>
        <Link to={`/jobs/${job.id}`} className="jc-btn">Xem chi tiết →</Link>
      </div>
    </div>
  );
}

export default function JobsSection() {
  const [activeTab, setActiveTab] = useState('all');

  const filtered = activeTab === 'all'
    ? jobsData
    : jobsData.filter((j) => j.category === activeTab);

  return (
    <section className="jobs-section" id="jobs">
      <div className="container">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 36,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div className="fade-up">
            <div className="section-eyebrow">Việc làm nổi bật</div>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Cơ hội đang chờ bạn</h2>
          </div>
          <div className="jobs-tabs fade-up">
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
        <div className="jobs-grid">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 44 }} className="fade-up">
          <Link to="/jobs" className="btn btn-ghost">Xem tất cả 1.100+ job →</Link>
        </div>
      </div>
    </section>
  );
}
