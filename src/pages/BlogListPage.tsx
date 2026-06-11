import { Link } from 'react-router-dom';

interface BlogPost {
  id: number;
  category: string;
  categoryColor: string;
  title: string;
  excerpt: string;
  author: string;
  avatarLetter: string;
  avatarGradient: string;
  date: string;
  readTime: string;
}

const allBlogPosts: BlogPost[] = [
  {
    id: 1, category: 'Kinh nghiệm', categoryColor: 'rgba(91,79,255,.15)',
    title: '5 mẹo xây dựng Portfolio ấn tượng cho sinh viên IT',
    excerpt: 'Làm sao để Portfolio của bạn nổi bật giữa hàng trăm ứng viên? Bài viết chia sẻ 5 bí quyết đã giúp nhiều sinh viên nhận được offer ngay từ năm 3.',
    author: 'Lê Thanh Hà', avatarLetter: 'H', avatarGradient: 'linear-gradient(135deg,#5B4FFF,#7C72FF)', date: '28/02/2026', readTime: '5 phút đọc',
  },
  {
    id: 2, category: 'Hướng dẫn', categoryColor: 'rgba(0,212,170,.12)',
    title: 'Freelance khi còn đi học — Bắt đầu từ đâu?',
    excerpt: 'Hướng dẫn từng bước cho sinh viên muốn bắt đầu freelance: chọn skill, xây profile, nhận job đầu tiên và quản lý thời gian hiệu quả.',
    author: 'Trần Minh Đức', avatarLetter: 'Đ', avatarGradient: 'linear-gradient(135deg,#00D4AA,#00A882)', date: '22/02/2026', readTime: '7 phút đọc',
  },
  {
    id: 3, category: 'Xu hướng', categoryColor: 'rgba(255,107,53,.12)',
    title: 'Top 10 kỹ năng được trả lương cao nhất 2026',
    excerpt: 'Dựa trên dữ liệu từ hơn 5.000 job trên UniTask, đây là những kỹ năng được doanh nghiệp "săn đón" và trả mức lương cao nhất hiện nay.',
    author: 'Nguyễn Phương Mai', avatarLetter: 'M', avatarGradient: 'linear-gradient(135deg,#FF6B35,#FF4D6B)', date: '15/02/2026', readTime: '6 phút đọc',
  },
  {
    id: 4, category: 'Kỹ năng', categoryColor: 'rgba(255,179,64,.12)',
    title: 'Cách viết CV cho sinh viên chưa có kinh nghiệm',
    excerpt: 'CV không cần dài — chỉ cần đúng. Hướng dẫn biến project, hoạt động ngoại khóa và kỹ năng thành CV chuyên nghiệp.',
    author: 'Lê Thanh Hà', avatarLetter: 'H', avatarGradient: 'linear-gradient(135deg,#5B4FFF,#7C72FF)', date: '10/02/2026', readTime: '4 phút đọc',
  },
  {
    id: 5, category: 'Kinh nghiệm', categoryColor: 'rgba(91,79,255,.15)',
    title: 'Quản lý thời gian hiệu quả: Vừa học vừa làm freelance',
    excerpt: 'Sinh viên chia sẻ phương pháp quản lý thời gian giúp vừa đạt GPA cao vừa hoàn thành project trên UniTask.',
    author: 'Trần Minh Đức', avatarLetter: 'Đ', avatarGradient: 'linear-gradient(135deg,#00D4AA,#00A882)', date: '05/02/2026', readTime: '6 phút đọc',
  },
  {
    id: 6, category: 'Xu hướng', categoryColor: 'rgba(255,107,53,.12)',
    title: 'AI và tương lai việc làm cho sinh viên Việt Nam',
    excerpt: 'AI đang thay đổi thị trường lao động. Tìm hiểu những cơ hội và thách thức cho sinh viên trong kỷ nguyên AI.',
    author: 'Nguyễn Phương Mai', avatarLetter: 'M', avatarGradient: 'linear-gradient(135deg,#FF6B35,#FF4D6B)', date: '01/02/2026', readTime: '8 phút đọc',
  },
];

export default function BlogListPage() {
  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div className="page-header fade-up">
          <div className="section-eyebrow">Blog nghề nghiệp</div>
          <h1 className="section-title">Cẩm nang &amp; Xu hướng</h1>
          <p className="section-sub">Kiến thức, mẹo hay và xu hướng nghề nghiệp giúp bạn phát triển sự nghiệp</p>
        </div>

        <div className="blog-grid" style={{ marginTop: 48 }}>
          {allBlogPosts.map((post) => (
            <article key={post.id} className="blog-card fade-up">
              <div className="blog-card-img">
                <div className="blog-placeholder"><span>📝</span></div>
                <span className="blog-cat" style={{ background: post.categoryColor }}>{post.category}</span>
              </div>
              <div className="blog-card-body">
                <h3 className="blog-card-title">{post.title}</h3>
                <p className="blog-card-excerpt">{post.excerpt}</p>
                <div className="blog-card-footer">
                  <div className="blog-author">
                    <div className="blog-avatar" style={{ background: post.avatarGradient }}>{post.avatarLetter}</div>
                    <div>
                      <div className="blog-author-name">{post.author}</div>
                    </div>
                  </div>
                  <div className="blog-meta">
                    <span>{post.date}</span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 44 }} className="fade-up">
          <Link to="/" className="btn btn-ghost">← Về trang chủ</Link>
        </div>
      </div>
    </div>
  );
}
