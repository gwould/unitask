import { apiPost } from './apiClient';
import { jobService } from './jobService';
import type { Job, User } from '../types';

export type MatchedJob = Job & {
  matchScore: number;
  matchReasons: string[];
};

type BackendMatchedJob = Omit<Job, 'company'> & {
  company: string;
  companyId: string;
  matchScore: number;
  matchReasons: string[];
};

type BackendMatchResponse = {
  query: string;
  usedSemanticSearch: boolean;
  summary: string;
  matches: BackendMatchedJob[];
};

type MatchRequest = {
  query?: string;
  role?: string;
  major?: string;
  skills?: string[];
  bio?: string;
  companyName?: string;
  university?: string;
  location?: string;
  topK?: number;
};

function stripDiacritics(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function buildRequest(user: User | null, query?: string, topK = 6): MatchRequest {
  const location = user?.role === 'student' ? user?.university : user?.companyName;
  return {
    query: query?.trim(),
    role: user?.role,
    major: user?.major,
    skills: user?.skills || [],
    bio: user?.bio,
    companyName: user?.companyName,
    university: user?.university,
    location,
    topK,
  };
}

function scoreLocally(job: Job, request: MatchRequest): MatchedJob {
  const jobText = stripDiacritics([
    job.title,
    job.company,
    job.category,
    job.location,
    job.description,
    ...job.skills,
    ...job.requirements,
    ...job.tags.map((tag) => tag.label),
  ].join(' '));

  const queryText = stripDiacritics([request.query, request.major, request.bio, request.companyName, ...(request.skills || [])].filter(Boolean).join(' '));
  const queryTokens = queryText.split(/\s+/).filter((token) => token.length > 2);
  const skills = (request.skills || []).map((skill) => stripDiacritics(skill));

  let score = job.featured ? 10 : 0;
  const reasons: string[] = [];

  const matchedSkills = skills.filter((skill) => job.skills.some((jobSkill) => stripDiacritics(jobSkill).includes(skill)));
  if (matchedSkills.length > 0) {
    score += Math.min(40, matchedSkills.length * 12);
    reasons.push(`Khớp kỹ năng: ${matchedSkills.slice(0, 3).join(', ')}`);
  }

  const tokenHits = queryTokens.filter((token) => jobText.includes(token));
  if (tokenHits.length > 0) {
    score += Math.min(20, tokenHits.length * 4);
    reasons.push('Khớp truy vấn tìm kiếm');
  }

  const majorHints = stripDiacritics(request.major || '');
  const inferredCategory = majorHints.includes('cong nghe thong tin') || majorHints.includes('cntt') || skills.some((skill) => /react|typescript|javascript|python|flask|node|api/i.test(skill))
    ? 'it'
    : majorHints.includes('thiet ke') || majorHints.includes('design')
      ? 'design'
      : majorHints.includes('marketing') || majorHints.includes('seo')
        ? 'marketing'
        : majorHints.includes('ngon ngu') || majorHints.includes('translation')
          ? 'language'
          : '';

  if (inferredCategory && inferredCategory === job.category) {
    score += 24;
    reasons.push(`Phù hợp ngành nghề: ${job.category}`);
  }

  if (request.location && stripDiacritics(job.location).includes(stripDiacritics(request.location))) {
    score += 10;
    reasons.push(`Khớp địa điểm: ${job.location}`);
  }

  if (request.companyName && stripDiacritics(job.company).includes(stripDiacritics(request.companyName))) {
    score += 14;
    reasons.push(`Khớp doanh nghiệp: ${job.company}`);
  }

  if (job.verified) score += 4;
  if (job.spotsLeft <= 1) score += 5;

  return {
    ...job,
    matchScore: Math.min(100, score),
    matchReasons: reasons.length > 0 ? reasons.slice(0, 3) : ['Phù hợp hồ sơ và xu hướng tìm kiếm'],
  };
}

function normalizeBackendJob(job: BackendMatchedJob): MatchedJob {
  return {
    ...job,
    company: job.company,
    companyId: job.companyId,
    matchScore: job.matchScore,
    matchReasons: job.matchReasons || [],
  };
}

export const aiMatchingService = {
  async getRecommendations(user: User | null, query?: string, topK = 6): Promise<MatchedJob[]> {
    const request = buildRequest(user, query, topK);

    try {
      const response = await apiPost<BackendMatchResponse>('/api/matching/recommendations', request);
      return response.matches.map(normalizeBackendJob);
    } catch {
      const jobs = await jobService.getAll();
      return jobs
        .map((job) => scoreLocally(job, request))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, topK);
    }
  },
};