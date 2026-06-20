import API from './api';

const login = async (email, password) => {
  const response = await API.post('/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify({
      id: response.data.id,
      username: response.data.username,
      email: response.data.email
    }));
  }
  return response.data;
};

const register = async (username, email, password) => {
  const response = await API.post('/auth/register', { username, email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify({
      id: response.data.id,
      username: response.data.username,
      email: response.data.email
    }));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  isAuthenticated
};

export default authService;
