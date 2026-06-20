/**
 * Wrappers around the backend's REST endpoints. Keeps URL strings out of
 * components, and makes it easy to refactor when the API evolves.
 */
import api from './client';

export const auth = {
  register: (payload)         => api.post('/auth/register/', payload),
  login:    (credentials)     => api.post('/auth/login/', credentials),
  refresh:  (refresh)         => api.post('/auth/refresh/',  { refresh }),
  logout:   (refresh)         => api.post('/auth/logout/',   { refresh }),
  me:       ()                => api.get ('/auth/me/'),
  updateMe: (payload)         => api.patch('/auth/me/', payload),
};

export const children = {
  list:    ()           => api.get   ('/auth/children/'),
  create:  (payload)    => api.post  ('/auth/children/', payload),
  update:  (id, payload)=> api.patch (`/auth/children/${id}/`, payload),
  remove:  (id)         => api.delete(`/auth/children/${id}/`),
};

export const icons = {
  list:    (params={})  => api.get   ('/icons/', { params }),
  create:  (formData)   => api.post  ('/icons/', formData,
                            { headers: {'Content-Type': 'multipart/form-data'} }),
  update:  (id, payload)=> api.patch (`/icons/${id}/`, payload),
  remove:  (id)         => api.delete(`/icons/${id}/`),
};

export const boards = {
  list:    ()           => api.get  ('/boards/'),
  detail:  (id)         => api.get  (`/boards/${id}/`),
  create:  (payload)    => api.post ('/boards/', payload),
  update:  (id, payload)=> api.put  (`/boards/${id}/`, payload),
  remove:  (id)         => api.delete(`/boards/${id}/`),
  sync:    (params={})  => api.get  ('/boards/sync/', { params }),
};

export const community = {
  list:     (params={}) => api.get (`/community/templates/`, { params }),
  detail:   (id)        => api.get (`/community/templates/${id}/`),
  download: (id)        => api.post(`/community/templates/${id}/download/`),
};

export const journal = {
  list:   (params) => api.get('/auth/journal/', { params }),
  create: (data)   => api.post('/auth/journal/', data),
  remove: (id)     => api.delete(`/auth/journal/${id}/`),
};

export const medications = {
  list:   (params) => api.get('/auth/medications/', { params }),
  create: (data)   => api.post('/auth/medications/', data),
  update: (id, data)=> api.put(`/auth/medications/${id}/`, data),
  remove: (id)     => api.delete(`/auth/medications/${id}/`),
};

export const medicationLogs = {
  list:   (params) => api.get('/auth/medication-logs/', { params }),
  create: (data)   => api.post('/auth/medication-logs/', data),
  update: (id, data)=> api.put(`/auth/medication-logs/${id}/`, data),
  remove: (id)     => api.delete(`/auth/medication-logs/${id}/`),
};

export const dailyLogs = {
  list:   (params) => api.get('/auth/daily-logs/', { params }),
  create: (data)   => api.post('/auth/daily-logs/', data),
  update: (id, data)=> api.put(`/auth/daily-logs/${id}/`, data),
  remove: (id)     => api.delete(`/auth/daily-logs/${id}/`),
};
