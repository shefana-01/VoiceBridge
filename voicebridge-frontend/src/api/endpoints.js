/**
 * Wrappers around the backend's REST endpoints. Keeps URL strings out of
 * components, and makes it easy to refactor when the API evolves.
 */
import api from './client';

export const auth = {
  register: (payload)         => api.post('/auth/register/', payload),
  login:    (credentials)     => api.post('/auth/mfa/login/', credentials),
  refresh:  (refresh)         => api.post('/auth/refresh/',  { refresh }),
  logout:   (refresh)         => api.post('/auth/logout/',   { refresh }),
  me:       ()                => api.get ('/auth/me/'),
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
  list:     (params={}) => api.get (`/community/`, { params }),
  detail:   (id)        => api.get (`/community/${id}/`),
  download: (id)        => api.post(`/community/${id}/download/`),
};

export const journal = {
  list:   (params) => api.get('/journal/', { params }),
  create: (data)   => api.post('/journal/', data),
  remove: (id)     => api.delete(`/journal/${id}/`),
};
