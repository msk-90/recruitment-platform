import api from './api';

export const uploadService = {
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api
      .post('/upload/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};