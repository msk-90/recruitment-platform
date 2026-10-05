import api from './api';

export const jobService = {
  list: (params) => api.get('/jobs', { params }).then((r) => r.data),
  getById: (id) => api.get(`/jobs/${id}`).then((r) => r.data),
  myJobs: () => api.get('/jobs/me').then((r) => r.data),
  create: (data) => api.post('/jobs', data).then((r) => r.data),
  update: (id, data) => api.put(`/jobs/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/jobs/${id}`).then((r) => r.data),
  applicants: (id) => api.get(`/jobs/${id}/applicants`).then((r) => r.data),
};