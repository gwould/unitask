import { useState } from 'react';

interface SearchSectionProps {
  onQuickSearch: (term: string) => void;
  onSearch: () => void;
  searchValue: string;
  setSearchValue: (v: string) => void;
}

export default function SearchSection({
  onQuickSearch,
  onSearch,
  searchValue,
  setSearchValue,
}: SearchSectionProps) {
  const [category, setCategory] = useState('');
  const [workType, setWorkType] = useState('');

  const quickTags = [
    'React Developer',
    'Thiết kế logo',
    'Viết bài SEO',
    'Dịch thuật EN-VI',
    'Fix bug',
    'Khảo sát thị trường',
  ];

  return (
    <div className="search-section">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 24 }} className="fade-up">
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 26,
              fontWeight: 800,
              color: '#fff',
              marginBottom: 6,
            }}
          >
            Tìm job phù hợp ngay
          </h3>
          <p style={{ fontSize: 14, color: 'var(--t3)' }}>Hơn 1.100 job đang chờ bạn</p>
        </div>
        <div className="search-box fade-up">
          <span style={{ fontSize: 18 }}>🔍</span>
          <input
            type="text"
            placeholder="Tên job, kỹ năng... (VD: React, Thiết kế logo, SEO Content)"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <div className="search-divider" />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Tất cả ngành</option>
            <option>💻 IT / Lập trình</option>
            <option>🎨 Thiết kế</option>
            <option>📢 Marketing</option>
            <option>✍️ Content</option>
            <option>🌐 Ngôn ngữ</option>
          </select>
          <div className="search-divider" />
          <select value={workType} onChange={(e) => setWorkType(e.target.value)}>
            <option>Tất cả hình thức</option>
            <option>Micro-task</option>
            <option>Freelance</option>
            <option>Micro-Internship</option>
          </select>
          <button className="btn btn-primary" onClick={onSearch} style={{ whiteSpace: 'nowrap' }}>
            Tìm kiếm
          </button>
        </div>
        <div className="search-tags fade-up">
          <span className="label">Tìm nhiều:</span>
          {quickTags.map((tag) => (
            <span key={tag} onClick={() => onQuickSearch(tag)}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
