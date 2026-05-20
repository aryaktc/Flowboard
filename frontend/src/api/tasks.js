import api from './axios';

export const getProjectTasks = (projectId, filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const queryString = params.toString();
  const url = `/tasks/project/${projectId}${queryString ? `?${queryString}` : ''}`;

  return api.get(url);
};

export const createTask = (projectId, data) =>
  api.post(`/tasks/project/${projectId}`, data);

export const updateTask = (id, data) =>
  api.put(`/tasks/${id}`, data);

export const deleteTask = (id) =>
  api.delete(`/tasks/${id}`);

export const getMyTasks = () =>
  api.get('/tasks/my-tasks');

export const getOverdueTasks = () =>
  api.get('/tasks/overdue');
