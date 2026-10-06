import api from './api';

export const userService = {
  updateMe: (data) => api.put('/users/me', data).then((r) => r.data),

  changePassword: (data) =>
    api.put('/users/me/password', data).then((r) => r.data),

  listCandidates: (params) =>
    api.get('/users/candidates', { params }).then((r) => r.data),

  getCandidate: (id) =>
    api.get(`/users/candidates/${id}`).then((r) => r.data),

  getById: (id) => api.get(`/users/${id}`).then((r) => r.data),
};