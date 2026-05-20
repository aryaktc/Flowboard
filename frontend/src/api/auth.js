import api from './axios';

export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password });

export const registerUser = (name, email, password) =>
  api.post('/auth/register', { name, email, password });

export const getMe = () =>
  api.get('/auth/me');
