import { apiRepository } from './apiRepository';

export type AutomationSuggestion = {
  id: string;
  icon: string;
  title: string;
  description: string;
  benefit: string;
  action: string;
  actionLink?: string;
  priority: string;
};

export type AutomationSuggestionResponse = {
  businessId?: string;
  summary: string;
  pendingApplications: number;
  suggestions: AutomationSuggestion[];
};

export const insightsService = {
  async getAutomationSuggestions(userId?: string | number, businessId?: string | number): Promise<AutomationSuggestionResponse> {
    const params = new URLSearchParams();
    if (businessId !== undefined && businessId !== null && businessId !== '') {
      params.set('businessId', String(businessId));
    }
    if (userId !== undefined && userId !== null && userId !== '') {
      params.set('userId', String(userId));
    }

    return apiRepository.insights.automationSuggestions(userId, businessId) as Promise<AutomationSuggestionResponse>;
  },
};