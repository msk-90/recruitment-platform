import api from './api';

export const dashboardService = {
  recruiter: () => api.get('/dashboard/recruiter').then((r) => r.data),
  candidate: () => api.get('/dashboard/candidate').then((r) => r.data),
};