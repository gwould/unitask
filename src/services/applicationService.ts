import type { Application, Applicant } from '../types';
import { STORAGE_KEYS } from '../constants';
import { getFromStorage, setToStorage } from '../utils/storage';
import { simulateDelay } from '../utils/async';
import { applicationsData } from '../data/mockData';

export const SEEDED_APPLICATIONS: Application[] = [
  { id: 'app-2', jobId: 3,  userId: 'stu-1', coverLetter: 'Em có kinh nghiệm viết SEO content qua việc viết blog cá nhân từ năm 2. Em đã đạt 50+ bài viết đạt top 10 Google trong vòng 3 tháng. Em rất muốn áp dụng kỹ năng này cho MarketHub.', status: 'completed', appliedAt: '2026-02-20' },
  { id: 'app-3', jobId: 5,  userId: 'stu-1', coverLetter: 'Em muốn ứng tuyển vào vị trí Data Entry. Em cẩn thận, chính xác và có kinh nghiệm xử lý dữ liệu bằng Excel. Em cam kết hoàn thành đúng deadline.', status: 'pending',   appliedAt: '2026-03-04' },
  { id: 'app-4', jobId: 8,  userId: 'stu-1', coverLetter: 'Em có kinh nghiệm dịch thuật EN-VI chuyên ngành kỹ thuật. Em đã dịch hơn 200 trang tài liệu cho các công ty phần mềm. Em tin rằng chất lượng dịch của em sẽ đáp ứng yêu cầu.', status: 'rejected',  appliedAt: '2026-02-10' },
  { id: 'app-5', jobId: 2,  userId: 'stu-1', coverLetter: 'Em là sinh viên Thiết kế Đồ họa năm 3, thành thạo Figma và Illustrator. Portfolio của em: behance.net/example. Em rất muốn thử sức với branding project.', status: 'pending',   appliedAt: '2026-03-03' },
  { id: 'app-6', jobId: 10, userId: 'stu-1', coverLetter: 'Em có kinh nghiệm quay/chỉnh sửa video cho kênh TikTok cá nhân với 15k followers. Em thành thạo CapCut, Premiere Pro và hiểu xu hướng content hiện tại.', status: 'accepted',  appliedAt: '2026-02-28' },
];

const DEFAULT_APPLICANTS: Applicant[] = [
  { id: 'ap-1', jobId: 1, userId: 'stu-1', coverLetter: 'Em rất hứng thú với vị trí Frontend Developer. Em đã có 1 năm kinh nghiệm React + TypeScript qua các dự án cá nhân. Em tin rằng mình có thể đóng góp hiệu quả.', status: 'accepted', appliedAt: '2026-03-01', name: 'Nguyễn Minh Anh', university: 'ĐH Bách Khoa HCM', skills: ['React', 'TypeScript', 'Tailwind'], rating: 4.9 },
  { id: 'ap-2', jobId: 1, userId: 'stu-2', coverLetter: 'Em có 1 năm kinh nghiệm React và đang muốn tham gia dự án thực tế. Em thành thạo HTML/CSS/JS và đã làm 3 project cá nhân.', status: 'pending', appliedAt: '2026-03-02', name: 'Trần Văn Bình', university: 'ĐH KHTN HCM', skills: ['React', 'JavaScript', 'CSS'], rating: 4.5 },
  { id: 'ap-3', jobId: 1, userId: 'stu-3', coverLetter: 'Em muốn học hỏi thêm về React và sản phẩm thực tế. Em đang học năm 3 CNTT, có nền tảng tốt về lập trình và đam mê frontend.', status: 'rejected', appliedAt: '2026-03-03', name: 'Lê Thị Cẩm', university: 'ĐH Công Nghệ HCM', skills: ['HTML', 'CSS', 'JavaScript'], rating: 4.2 },
  { id: 'ap-4', jobId: 4, userId: 'stu-4', coverLetter: 'Em chuyên về video editing, thành thạo Premiere Pro và CapCut. Em có kênh TikTok cá nhân 15K followers. Em rất muốn thử sức với dự án này.', status: 'pending', appliedAt: '2026-03-04', name: 'Phạm Đức Dũng', university: 'ĐH Hoa Sen', skills: ['Premiere Pro', 'CapCut', 'After Effects'], rating: 4.7 },
  { id: 'ap-5', jobId: 1, userId: 'stu-5', coverLetter: 'Em có kinh nghiệm 6 tháng làm intern frontend tại một startup. Em thành thạo React, Redux và có hiểu biết về UI/UX.', status: 'pending', appliedAt: '2026-03-04', name: 'Hoàng Thị Dung', university: 'ĐH FPT HCM', skills: ['React', 'Redux', 'Figma'], rating: 4.6 },
];

export const applicationService = {
  /** Load applications for a student */
  async getByUser(userId: string): Promise<Application[]> {
    await simulateDelay(800);
    const stored = getFromStorage<Application[]>(STORAGE_KEYS.APPLICATIONS, []);
    const seededIds = new Set(stored.map((a) => a.id));
    const merged = [
      ...SEEDED_APPLICATIONS.filter((s) => !seededIds.has(s.id)),
      ...stored,
    ];
    return merged.filter((a) => a.userId === userId);
  },

  /** Get simple applications for dashboard (seeded + stored) */
  async getForDashboard(userId: string): Promise<Application[]> {
    await simulateDelay(450);
    const seeded: Application[] = applicationsData;
    const stored = getFromStorage<Application[]>(STORAGE_KEYS.APPLICATIONS, []);
    return [...seeded, ...stored].filter((a) => a.userId === userId);
  },

  /** Apply to a job */
  async apply(data: { jobId: number; userId: string; coverLetter: string }): Promise<Application> {
    await simulateDelay(500);
    const app: Application = {
      id: `app-${Date.now()}`,
      jobId: data.jobId,
      userId: data.userId,
      coverLetter: data.coverLetter,
      status: 'pending',
      appliedAt: new Date().toISOString().slice(0, 10),
    };
    const stored = getFromStorage<Application[]>(STORAGE_KEYS.APPLICATIONS, []);
    stored.push(app);
    setToStorage(STORAGE_KEYS.APPLICATIONS, stored);
    return app;
  },

  /** Withdraw an application */
  async withdraw(appId: string): Promise<void> {
    await simulateDelay(700);
    const stored = getFromStorage<Application[]>(STORAGE_KEYS.APPLICATIONS, []);
    const updated = stored.filter((a) => a.id !== appId);
    setToStorage(STORAGE_KEYS.APPLICATIONS, updated);
  },

  /** Save all applications */
  save(apps: Application[]): void {
    setToStorage(STORAGE_KEYS.APPLICATIONS, apps);
  },

  // ─── Applicant management (business side) ──────────

  /** Load applicants for business */
  async getApplicants(): Promise<Applicant[]> {
    await simulateDelay(600);
    const stored = getFromStorage<Applicant[]>(STORAGE_KEYS.MANAGE_APPLICANTS, []);
    return stored.length > 0 ? stored : DEFAULT_APPLICANTS;
  },

  /** Update applicant status */
  async updateApplicantStatus(id: string, status: Applicant['status']): Promise<void> {
    await simulateDelay(800);
    const applicants = getFromStorage<Applicant[]>(STORAGE_KEYS.MANAGE_APPLICANTS, DEFAULT_APPLICANTS);
    const updated = applicants.map((a) => a.id === id ? { ...a, status } : a);
    setToStorage(STORAGE_KEYS.MANAGE_APPLICANTS, updated);
  },

  /** Save applicants */
  saveApplicants(apps: Applicant[]): void {
    setToStorage(STORAGE_KEYS.MANAGE_APPLICANTS, apps);
  },
};
