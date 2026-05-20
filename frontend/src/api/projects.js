import api from './axios';

export const getProjects = () =>
  api.get('/projects');

export const createProject = (data) =>
  api.post('/projects', data);

export const getProject = (id) =>
  api.get(`/projects/${id}`);

export const updateProject = (id, data) =>
  api.put(`/projects/${id}`, data);

export const deleteProject = (id) =>
  api.delete(`/projects/${id}`);

export const addMember = (id, email) =>
  api.post(`/projects/${id}/members`, { email });

export const removeMember = (id, userId) =>
  api.delete(`/projects/${id}/members/${userId}`);

export const getProjectActivity = (id) =>
  api.get(`/projects/${id}/activity`);
