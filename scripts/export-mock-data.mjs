import { build } from 'esbuild';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(process.cwd());
const tmpDir = path.join(root, '.tmp');
const entry = path.join(root, 'src', 'data', 'mockData.ts');
const outfile = path.join(tmpDir, 'mockData.bundle.mjs');
const seedDir = path.join(root, 'backend', 'Unitask.Api', 'Data', 'Seed');
const seedFile = path.join(seedDir, 'seed.json');

mkdirSync(tmpDir, { recursive: true });
mkdirSync(seedDir, { recursive: true });

await build({
  entryPoints: [entry],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile,
  sourcemap: false,
  treeShaking: true,
});

const mod = await import(pathToFileURL(outfile));

const demoStudent = {
  id: 1,
  externalCode: 'stu-1',
  fullName: 'Nguyễn Minh Khoa',
  email: 'student@demo.com',
  role: 'student',
  companyName: null,
  university: 'Đại học Bách Khoa TP.HCM',
  phone: '0901234567',
};

const companies = new Map();
let nextUserId = 2;

for (const job of mod.jobsData) {
  if (!companies.has(job.companyId)) {
    companies.set(job.companyId, {
      id: nextUserId++,
      externalCode: job.companyId,
      fullName: job.company,
      email: `${job.companyId}@demo.com`,
      role: 'business',
      companyName: job.company,
      university: null,
      phone: null,
    });
  }
}

const users = [demoStudent, ...Array.from(companies.values())];

const companyIdMap = new Map();
for (const c of companies.values()) {
  companyIdMap.set(c.externalCode, c.id);
}

const jobs = mod.jobsData.map((job) => ({
  id: job.id,
  title: job.title,
  description: job.description,
  companyName: job.company,
  companyCode: job.companyId,
  companyUserId: companyIdMap.get(job.companyId),
  logoText: job.logoText,
  logoGradient: job.logoGradient,
  verified: job.verified,
  location: job.location,
  tags: job.tags,
  spotsLeft: job.spotsLeft,
  spotsTotal: job.spotsTotal,
  pay: job.pay,
  payMin: job.payMin,
  payMax: job.payMax,
  deadline: job.deadline,
  category: job.category,
  featured: Boolean(job.featured),
  duration: job.duration,
  postedAt: job.postedAt,
  skills: job.skills,
  requirements: job.requirements,
  deliverables: job.deliverables,
}));

const applications = mod.applicationsData.map((app, idx) => ({
  id: idx + 1,
  externalCode: app.id,
  jobId: app.jobId,
  studentUserId: demoStudent.id,
  coverLetter: app.coverLetter,
  status: app.status,
  appliedAt: app.appliedAt,
}));

const seed = {
  users,
  jobs,
  applications,
  categories: mod.categoriesData,
  studentSteps: mod.studentSteps.map((s, i) => ({ id: i + 1, type: 'student', ...s })),
  businessSteps: mod.businessSteps.map((s, i) => ({ id: i + 101, type: 'business', ...s })),
  testimonials: mod.testimonialsData.map((t, i) => ({ id: i + 1, ...t })),
  features: mod.featuresData.map((f, i) => ({ id: i + 1, ...f })),
};

writeFileSync(seedFile, JSON.stringify(seed, null, 2), 'utf-8');
console.log(`Seed data written to ${seedFile}`);
