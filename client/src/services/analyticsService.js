import api from './api';

export const analyticsService = {
  recruiter: (days = 30) =>
    api.get('/analytics/recruiter', { params: { days } }).then((r) => r.data),
  admin: (days = 30) =>
    api.get('/analytics/admin', { params: { days } }).then((r) => r.data),
};