export interface PortfolioProject {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  tags?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  isHighlighted?: boolean;
  sortOrder: number;
}

export interface Education {
  id: string;
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
  gpa?: number;
  description?: string;
  isCurrent?: boolean;
  sortOrder: number;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization?: string;
  issueDate?: string;
  expirationDate?: string;
  credentialUrl?: string;
  credentialId?: string;
  imageUrl?: string;
  sortOrder: number;
}

export interface PortfolioSkill {
  id: string;
  name: string;
  category?: string;
  proficiency?: string;
  endorsementCount: number;
}

export interface PortfolioReview {
  id: string;
  reviewerName?: string;
  reviewerAvatar?: string;
  rating: number;
  comment?: string;
  jobTitle?: string;
  createdAt?: string;
}

export interface PortfolioPublic {
  userId: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  title?: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  portfolioUrl?: string;
  cvUrl?: string;
  email?: string;
  phone?: string;
  isVerified?: boolean;
  completedJobs: number;
  averageRating: number;
  reviewCount: number;
  skills: PortfolioSkill[];
  projects: PortfolioProject[];
  educations: Education[];
  certifications: Certification[];
  reviews: PortfolioReview[];
}
