import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import type { Job } from '../types';
import type { Category } from '../types';
import AIMatchingPanel from '../components/AIMatchingPanel';
import { useAuth } from '../contexts/AuthContext';
import { serviceRegistry } from '../services';

const { jobs: jobService, site: siteService, aiMatching: aiMatchingService } = serviceRegistry;

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const initialCat = searchParams.get('cat') || '';

  const [query, setQuery] = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ);
  const [category, setCategory] = useState(initialCat);
  const [location, setLocation] = useState('');
  const [sort, setSort] = useState<'newest' | 'pay-high' | 'pay-low' | 'deadline'>('newest');
  const [payRange, setPayRange] = useState<'all' | '0-1' | '1-3' | '3-5' | '5+'>('all');
  const [availability, setAvailability] = useState<'all' | 'open' | 'full'>('all');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const [matchMap, setMatchMap] = useState<Record<string, number>>({});
  const JOBS_PER_PAGE = 12;
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    jobService.getAll()
      .then((data) => {
        if (!cancelled) setJobs(data);
      })
      .catch(() => {
        if (!cancelled) setJobs([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const trimmed = debouncedQuery.trim();
    setMatchMap({});
    aiMatchingService.getRecommendations(user, trimmed || undefined, 50)
      .then((matches) => {
        if (cancelled) return;
        const map: Record<string, number> = {};
        matches.forEach((m) => { map[m.id] = m.matchScore; });
        setMatchMap(map);
      })
      .catch(() => {
        if (!cancelled) setMatchMap({});
      });

    return () => { cancelled = true; };
  }, [user, debouncedQuery]);

  useEffect(() => {
    let cancelled = false;
    siteService.getCategories()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let list = [...jobs];

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

    // Lọc theo khoảng thù lao (đơn vị: VND) — job khớp nếu [payMin, payMax] giao với [lo, hi].
    if (payRange !== 'all') {
      const M = 1_000_000;
      const bounds: Record<string, [number, number]> = {
        '0-1': [0, 1 * M], '1-3': [1 * M, 3 * M], '3-5': [3 * M, 5 * M], '5+': [5 * M, Number.MAX_SAFE_INTEGER],
      };
      const [lo, hi] = bounds[payRange];
      list = list.filter((j) => j.payMax >= lo && j.payMin <= hi);
    }

    // Lọc theo tình trạng tuyển.
    if (availability === 'open') list = list.filter((j) => j.spotsLeft > 0);
    else if (availability === 'full') list = list.filter((j) => j.spotsLeft <= 0);

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
  }, [jobs, query, category, location, sort, payRange, availability]);

  const displayed = useMemo(() => {
    const list = [...filtered];
    const hasScores = Object.keys(matchMap).length > 0;
    if (!hasScores) return list;

    // Sort by match score when available, preserving other sort preferences
    list.sort((a, b) => (matchMap[b.id] || 0) - (matchMap[a.id] || 0));
    return list;
  }, [filtered, matchMap]);

  // Reset page khi filter/sort thay đổi
  useEffect(() => { setCurrentPage(1); }, [query, category, location, sort, payRange, availability]);

  const totalPages = Math.ceil(displayed.length / JOBS_PER_PAGE);
  const paginatedJobs = displayed.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.querySelector('.pj-filters')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('cat', category);
    setSearchParams(params);
    setCurrentPage(1);
  };

  return (
    <section className="page-jobs">
      <div className="page-jobs-hero">
        <div className="jobs-bg-gradient" aria-hidden />
        <div className="container page-jobs-hero-inner">
          <div className="pj-header fade-up">
            <div className="pj-header-text">
              <span className="pj-eyebrow">🌐 Việc làm</span>
              <h1 className="section-title">Tìm việc làm</h1>
              {(filtered.length > 0 || query) && (
                <p className="section-sub">
                  Tìm thấy <strong>{filtered.length}</strong> việc làm
                  {query && <> cho "<strong>{query}</strong>"</>}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
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
              {categories.map((c) => (
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
            <select value={payRange} onChange={(e) => setPayRange(e.target.value as typeof payRange)}>
              <option value="all">Mọi mức thù lao</option>
              <option value="0-1">Dưới 1 triệu</option>
              <option value="1-3">1 – 3 triệu</option>
              <option value="3-5">3 – 5 triệu</option>
              <option value="5+">Trên 5 triệu</option>
            </select>
            <select value={availability} onChange={(e) => setAvailability(e.target.value as typeof availability)}>
              <option value="all">Mọi trạng thái</option>
              <option value="open">Còn tuyển</option>
              <option value="full">Đã đủ slot</option>
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

        <AIMatchingPanel
          query={query.trim() || undefined}
          topK={6}
          title="Job phù hợp nhất với hồ sơ và truy vấn của bạn"
          subtitle="Hệ thống tự động chấm điểm job theo hồ sơ cá nhân, kỹ năng, ngành học và từ khóa tìm kiếm hiện tại."
        />

        {/* Results */}
        {loading ? (
          <div className="pj-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="pj-card pj-card-skeleton" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="pj-card-top">
                  <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 10 }} />
                  <div className="pj-card-meta">
                    <div className="skeleton" style={{ width: '70%', height: 16, borderRadius: 4, marginBottom: 6 }} />
                    <div className="skeleton" style={{ width: '50%', height: 12, borderRadius: 4 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  <div className="skeleton" style={{ width: 60, height: 22, borderRadius: 20 }} />
                  <div className="skeleton" style={{ width: 50, height: 22, borderRadius: 20 }} />
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                  <div className="skeleton" style={{ width: 70, height: 20, borderRadius: 4 }} />
                  <div className="skeleton" style={{ width: 80, height: 20, borderRadius: 4 }} />
                </div>
                <div className="skeleton" style={{ width: '55%', height: 14, borderRadius: 4, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: '40%', height: 14, borderRadius: 4 }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="pj-empty fade-up">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3>Không tìm thấy job phù hợp</h3>
            <p>Thử thay đổi bộ lọc hoặc tìm với từ khóa khác.</p>
          </div>
        ) : (
          <>
            {/* Kết quả info */}
            <div className="pj-result-info">
              Hiển thị <strong>{(currentPage - 1) * JOBS_PER_PAGE + 1}–{Math.min(currentPage * JOBS_PER_PAGE, displayed.length)}</strong> trong <strong>{displayed.length}</strong> job
            </div>

            <div className="pj-grid">
              {paginatedJobs.map((job) => (
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pj-pagination">
                <button
                  className="pj-page-btn pj-page-nav"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  ← Trước
                </button>

                {/* Smart page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 2
                  )
                  .reduce<(number | '...')[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`dots-${i}`} className="pj-page-dots">…</span>
                    ) : (
                      <button
                        key={p}
                        className={`pj-page-btn${currentPage === p ? ' active' : ''}`}
                        onClick={() => handlePageChange(p as number)}
                      >
                        {p}
                      </button>
                    ),
                  )}

                <button
                  className="pj-page-btn pj-page-nav"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
