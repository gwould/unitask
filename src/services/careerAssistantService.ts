import type { CareerChatResponse, CareerUserContext } from '../types/careerAssistant';
import type { User } from '../types';
import { apiPost } from './apiClient';

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
    return apiPost<CareerChatResponse>('/api/career-assistant/chat', {
      message,
      user: buildUserContext(user),
      history,
      topK,
    });
  },
};
