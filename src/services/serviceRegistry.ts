import { jobService } from './jobService';
import { applicationService } from './applicationService';
import { walletService } from './walletService';
import { userService } from './userService';
import { aiMatchingService } from './aiMatchingService';
import { careerAssistantService } from './careerAssistantService';
import { insightsService } from './insightsService';
import { siteService } from './siteService';
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
  usersApi: userApiService,
  buildUsersByDbId,
  normalizeUser,
};