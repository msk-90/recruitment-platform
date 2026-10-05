import api from './api';

export const applicationService = {
  apply: (data) => api.post('/applications', data).then((r) => r.data),
  mine: () => api.get('/applications/me').then((r) => r.data),
  forJob: (jobId) =>
    api.get(`/applications/job/${jobId}`).then((r) => r.data),
  updateStatus: (id, status, notes) =>
    api.put(`/applications/${id}/status`, { status, notes }).then((r) => r.data),
  withdraw: (id) => api.delete(`/applications/${id}`).then((r) => r.data),
};