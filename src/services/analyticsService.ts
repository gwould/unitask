import { apiGet } from './apiService';

export interface AnalyticsDailyPoint {
  date: string;
  users: number;
  sessions: number;
  pageViews: number;
}

export interface AnalyticsTopPage {
  path: string;
  views: number;
}

export interface AnalyticsTrafficSource {
  source: string;
  sessions: number;
}

export interface AnalyticsOverview {
  configured: boolean;
  activeUsersNow: number;
  totalUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  avgSessionDurationSeconds: number;
  bounceRate: number;
  dailySeries: AnalyticsDailyPoint[];
  topPages: AnalyticsTopPage[];
  trafficSources: AnalyticsTrafficSource[];
}

type ApiOverview = {
  configured: boolean;
  activeUsersNow: number;
  totalUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  avgSessionDurationSeconds: number;
  bounceRate: number;
  dailySeries: { date: string; users: number; sessions: number; pageViews: number }[];
  topPages: { path: string; views: number }[];
  trafficSources: { source: string; sessions: number }[];
};

export const analyticsService = {
  async getOverview(days = 28): Promise<AnalyticsOverview> {
    const data = await apiGet<ApiOverview>(`/api/admin/analytics/overview?days=${days}`);
    return {
      configured: data.configured,
      activeUsersNow: data.activeUsersNow,
      totalUsers: data.totalUsers,
      newUsers: data.newUsers,
      sessions: data.sessions,
      pageViews: data.pageViews,
      avgSessionDurationSeconds: data.avgSessionDurationSeconds,
      bounceRate: data.bounceRate,
      dailySeries: data.dailySeries ?? [],
      topPages: data.topPages ?? [],
      trafficSources: data.trafficSources ?? [],
    };
  },
};
