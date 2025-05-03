// Exportação de todos os serviços API
import alertsService from './alertsService';
import authService from './authService';
import dashboardService from './dashboardService';
import insightsService from './insightsService';
import logsService from './logsService';
import reportsService from './reportsService';
import usersService from './usersService';

// Exportação de tipos
export * from './types';

// Exportação de serviços
export {
  alertsService,
  authService,
  dashboardService,
  insightsService,
  logsService,
  reportsService,
  usersService
}; 