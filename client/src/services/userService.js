import api from './api';

export const userService = {
  updateMe: (data) => api.put('/users/me', data).then((r) => r.data),
  listCandidates: () => api.get('/users/candidates').then((r) => r.data),
  getCandidate: (id) =>
    api.get(`/users/candidates/${id}`).then((r) => r.data),
  getById: (id) => api.get(`/users/${id}`).then((r) => r.data),
};