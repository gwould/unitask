import { jobService } from './jobService';
import { applicationService } from './applicationService';
import { walletService } from './walletService';
import { userService } from './userService';
import { aiMatchingService } from './aiMatchingService';
import { careerAssistantService } from './careerAssistantService';
import { insightsService } from './insightsService';
import { siteService } from './siteService';
import { profileService } from './profileService';
import { notificationService } from './notificationService';
import { conversationService } from './conversationService';
import { paymentService } from './paymentService';
import { dashboardService } from './dashboardService';
import { userApiService, buildUsersByDbId, normalizeUser } from './userApiService';

export const serviceRegistry = {
  jobs: jobService,
  applications: applicationService,
  wallet: walletService,
  user: userService,
  aiMatching: aiMatchingService,
  careerAssistant: careerAssistantService,
  insights: insightsService,
  site: siteService,
  profile: profileService,
  notifications: notificationService,
  conversations: conversationService,
  payments: paymentService,
  dashboard: dashboardService,
  usersApi: userApiService,
  buildUsersByDbId,
  normalizeUser,
};