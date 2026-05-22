import type { CareerChatResponse, CareerUserContext } from '../types/careerAssistant';
import type { User } from '../types';
import { apiRepository } from './apiRepository';

export function buildUserContext(user: User | null): CareerUserContext | undefined {
  if (!user) return undefined;
  return {
    role: user.role,
    major: user.major,
    university: user.university,
    companyName: user.companyName,
    skills: user.skills,
    bio: user.bio,
  };
}

export const careerAssistantService = {
  async chat(
    message: string,
    user: User | null,
    history: { role: 'user' | 'assistant'; content: string }[],
    topK = 5,
  ): Promise<CareerChatResponse> {
    const response = await apiRepository.insights.careerChat({
      message,
      user: buildUserContext(user),
      history,
      topK,
    });

    return {
      ...response,
      jobs: response.jobs.map((job) => ({
        ...job,
        id: job.id,
        logoText: job.logoText,
        logoGradient: job.logoGradient,
        verified: job.verified,
        matchScore: job.matchScore,
        matchReasons: job.matchReasons || [],
      })),
    };
  },
};
