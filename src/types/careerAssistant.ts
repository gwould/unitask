export interface CareerChatMessage {
  role: 'user' | 'assistant';
  content: string;
  jobs?: CareerJobCard[];
  followUpQuestions?: string[];
  careerPaths?: string[];
  refused?: boolean;
}

export interface CareerJobCard {
  id: number;
  title: string;
  company: string;
  location: string;
  pay: string;
  deadline: string;
  logoText: string;
  logoGradient: string;
  verified: boolean;
  matchScore: number;
  matchReasons: string[];
  category: string;
}

export interface CareerUserContext {
  role?: string;
  major?: string;
  university?: string;
  companyName?: string;
  skills?: string[];
  bio?: string;
}

export interface CareerChatResponse {
  reply: string;
  jobs: CareerJobCard[];
  followUpQuestions: string[];
  careerPaths: string[];
  refused: boolean;
  summary?: string;
}
